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
  const [machineLearningModel, setMachineLearningModel] = useState(null);

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

  const handleSaveCustomizedPlan = () => {
    const customizedPlan = {
      learningStyle: customizationOptions.learningStyle,
      knowledgeLevel: customizationOptions.knowledgeLevel,
      goals: customizationOptions.goals,
      topics: customizationOptions.topics,
    };
    setCustomizedPlan(customizedPlan);
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
    const topics = event.target.value.split(',');
    setCustomizationOptions({
      ...customizationOptions,
      topics: topics,
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
              <label>Learning Style:</label>
              <select value={customizationOptions.learningStyle} onChange={handleLearningStyleChange}>
                <option value="">Select a learning style</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
              <br />
              <label>Knowledge Level:</label>
              <select value={customizationOptions.knowledgeLevel} onChange={handleKnowledgeLevelChange}>
                <option value="">Select a knowledge level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <br />
              <label>Goals:</label>
              <input type="text" value={customizationOptions.goals} onChange={handleGoalsChange} />
              <br />
              <label>Topics:</label>
              <input type="text" value={customizationOptions.topics.join(',')} onChange={handleTopicsChange} />
              <br />
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
                <p>Learning Style: {recommendedPlan.learningStyle}</p>
                <p>Knowledge Level: {recommendedPlan.knowledgeLevel}</p>
                <p>Goals: {recommendedPlan.goals}</p>
                <p>Topics: {recommendedPlan.topics.join(', ')}</p>
              </div>
            )}
            <button type="button" onClick={handleCustomizePlan}>
              Customize Plan
            </button>
          </div>
        )}
        <StudyPlanCard studyPlanOptions={studyPlanOptions} />
        <ProgressCard userProgress={userProgress} />
        <CommunityCard />
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}