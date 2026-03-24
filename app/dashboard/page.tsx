import client from '../api/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import StudyPlanCard from '../../components/StudyPlanCard';
import ProgressCard from '../../components/ProgressCard';
import CommunityCard from '../../components/CommunityCard';
import ResourceCard from '../../components/ResourceCard';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [personalizedPlan, setPersonalizedPlan] = useState(null);
  const [customizedPlan, setCustomizedPlan] = useState(null);
  const [studyPlanOptions, setStudyPlanOptions] = useState([
    { name: 'Foundational Plan', description: 'Build a strong foundation in the basics', link: '/foundational-plan' },
    { name: 'Intermediate Plan', description: 'Improve your skills with intermediate-level content', link: '/intermediate-plan' },
    { name: 'Advanced Plan', description: 'Master advanced topics and techniques', link: '/advanced-plan' },
  ]);
  const [selectedStudyPlan, setSelectedStudyPlan] = useState(null);
  const [learningPlanRecommendations, setLearningPlanRecommendations] = useState([]);
  const [recommendedPlanEngine, setRecommendedPlanEngine] = useState({
    learningStyle: '',
    knowledgeLevel: '',
    goals: '',
    recommendedPlan: '',
  });
  const [customizationOptions, setCustomizationOptions] = useState({
    learningStyle: '',
    knowledgeLevel: '',
    goals: '',
    topics: [],
  });
  const [isCustomizingPlan, setIsCustomizingPlan] = useState(false);
  const [planRecommendationEngine, setPlanRecommendationEngine] = useState({
    algorithm: 'collaborativeFiltering',
    parameters: {
      numRecommendations: 5,
      similarityThreshold: 0.5,
    },
  });
  const [userProgress, setUserProgress] = useState({
    completedLessons: 0,
    totalLessons: 0,
    progressPercentage: 0,
  });
  const [userFeedback, setUserFeedback] = useState({
    ratings: [],
    comments: [],
  });
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const getRecommendedPlan = async () => {
        const response = await fetch('/api/recommended-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            progress: user.progress,
            goals: user.goals,
            learningStyle: user.learningStyle,
          }),
        });
        const data = await response.json();
        setRecommendedPlan(data);
      };
      getRecommendedPlan();
    }
  }, [user]);

  const handleCustomizePlan = () => {
    setIsCustomizingPlan(true);
  };

  const handleSaveCustomizedPlan = async () => {
    const response = await fetch('/api/customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        learningStyle: customizationOptions.learningStyle,
        knowledgeLevel: customizationOptions.knowledgeLevel,
        goals: customizationOptions.goals,
        topics: customizationOptions.topics,
      }),
    });
    const data = await response.json();
    setCustomizedPlan(data);
    setIsCustomizingPlan(false);
  };

  const handleLearningStyleChange = (event) => {
    setCustomizationOptions({
      ...customizationOptions,
      learningStyle: event.target.value,
    });
  };

  const handleKnowledgeLevelChange = (event) => {
    setCustomizationOptions({
      ...customizationOptions,
      knowledgeLevel: event.target.value,
    });
  };

  const handleGoalsChange = (event) => {
    setCustomizationOptions({
      ...customizationOptions,
      goals: event.target.value,
    });
  };

  const handleTopicsChange = (event) => {
    setCustomizationOptions({
      ...customizationOptions,
      topics: event.target.value.split(','),
    });
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {isCustomizingPlan ? (
          <div>
            <h2>Customize Your Learning Plan</h2>
            <form>
              <label>
                Learning Style:
                <select value={customizationOptions.learningStyle} onChange={handleLearningStyleChange}>
                  <option value="">Select a learning style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
              </label>
              <label>
                Knowledge Level:
                <select value={customizationOptions.knowledgeLevel} onChange={handleKnowledgeLevelChange}>
                  <option value="">Select a knowledge level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label>
                Goals:
                <input type="text" value={customizationOptions.goals} onChange={handleGoalsChange} />
              </label>
              <label>
                Topics:
                <input type="text" value={customizationOptions.topics.join(',')} onChange={handleTopicsChange} />
              </label>
              <button type="button" onClick={handleSaveCustomizedPlan}>
                Save Customized Plan
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2>Recommended Learning Plan</h2>
            {recommendedPlan && (
              <div>
                <p>Recommended Plan: {recommendedPlan.name}</p>
                <p>Description: {recommendedPlan.description}</p>
              </div>
            )}
            <button type="button" onClick={handleCustomizePlan}>
              Customize Your Learning Plan
            </button>
          </div>
        )}
        <StudyPlanCard studyPlanOptions={studyPlanOptions} setSelectedStudyPlan={setSelectedStudyPlan} />
        <ProgressCard userProgress={userProgress} />
        <CommunityCard />
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}