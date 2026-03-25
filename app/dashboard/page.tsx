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
import * as tf from '@tensorflow/tfjs';

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
  const [aiModel, setAiModel] = useState(null);
  const [mlModel, setMlModel] = useState(null);

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
          }),
        });
        const data = await response.json();
        setRecommendedPlan(data);
      };
      getRecommendedPlan();
    }
  }, [user]);

  const handleCustomizePlan = async () => {
    setIsCustomizingPlan(true);
    const response = await fetch('/api/customize-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        customizationOptions: customizationOptions,
      }),
    });
    const data = await response.json();
    setCustomizedPlan(data);
    setIsCustomizingPlan(false);
  };

  const handleUpdateCustomizationOptions = (event) => {
    const { name, value } = event.target;
    setCustomizationOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  };

  const handleUpdateCustomizationTopics = (topic) => {
    setCustomizationOptions((prevOptions) => ({
      ...prevOptions,
      topics: prevOptions.topics.includes(topic) ? prevOptions.topics.filter((t) => t !== topic) : [...prevOptions.topics, topic],
    }));
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && <StudyPlanCard plan={recommendedPlan} />}
            <h2>Customize Your Plan</h2>
            <form>
              <label>
                Learning Style:
                <select name="learningStyle" value={customizationOptions.learningStyle} onChange={handleUpdateCustomizationOptions}>
                  <option value="">Select a learning style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
              </label>
              <label>
                Knowledge Level:
                <select name="knowledgeLevel" value={customizationOptions.knowledgeLevel} onChange={handleUpdateCustomizationOptions}>
                  <option value="">Select a knowledge level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label>
                Goals:
                <input type="text" name="goals" value={customizationOptions.goals} onChange={handleUpdateCustomizationOptions} />
              </label>
              <label>
                Topics:
                {studyPlanOptions.map((option) => (
                  <div key={option.name}>
                    <input
                      type="checkbox"
                      name={option.name}
                      checked={customizationOptions.topics.includes(option.name)}
                      onChange={() => handleUpdateCustomizationTopics(option.name)}
                    />
                    <span>{option.name}</span>
                  </div>
                ))}
              </label>
              <button type="button" onClick={handleCustomizePlan} disabled={isCustomizingPlan}>
                Customize Plan
              </button>
            </form>
            {customizedPlan && <StudyPlanCard plan={customizedPlan} />}
          </div>
        )}
        <ProgressCard progress={userProgress} />
        <CommunityCard />
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}