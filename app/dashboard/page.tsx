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

  const handleCustomizePlan = () => {
    setIsCustomizingPlan(true);
  };

  const handleSaveCustomizedPlan = (customizedPlan) => {
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
    setCustomizationOptions({
      ...customizationOptions,
      topics: event.target.value.split(','),
    });
  };

  const getCustomizedPlan = async () => {
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
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              description="Based on your progress and goals"
              plan={recommendedPlan}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Customized Plan"
              description="Based on your learning style, knowledge level, and goals"
              plan={customizedPlan}
            />
            {isCustomizingPlan ? (
              <div>
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
                <button onClick={getCustomizedPlan}>Get Customized Plan</button>
              </div>
            ) : (
              <button onClick={handleCustomizePlan}>Customize Plan</button>
            )}
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="Your Progress"
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={userProgress.progressPercentage}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <CommunityCard title="Join Our Community" />
          </div>
          <div className="col-md-4">
            <ResourceCard title="Additional Resources" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}