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
        setRecommendedPlan(data.recommendedPlan);
      };
      getRecommendedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const getPersonalizedPlan = async () => {
        const response = await fetch('/api/personalized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            learningStyle: user.learningStyle,
            knowledgeLevel: user.knowledgeLevel,
            goals: user.goals,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data.personalizedPlan);
      };
      getPersonalizedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
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
        setCustomizedPlan(data.customizedPlan);
      };
      getCustomizedPlan();
    }
  }, [user, customizationOptions]);

  const handlePlanRecommendation = async () => {
    const response = await fetch('/api/plan-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        planRecommendationEngine: planRecommendationEngine,
      }),
    });
    const data = await response.json();
    setLearningPlanRecommendations(data.learningPlanRecommendations);
  };

  const handleCustomization = async () => {
    setIsCustomizingPlan(true);
    const response = await fetch('/api/customization', {
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
    setCustomizedPlan(data.customizedPlan);
    setIsCustomizingPlan(false);
  };

  const handleAiModelTraining = async () => {
    const response = await fetch('/api/ai-model-training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        aiModel: aiModel,
      }),
    });
    const data = await response.json();
    setAiModel(data.aiModel);
  };

  const handleMlModelTraining = async () => {
    const response = await fetch('/api/ml-model-training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        mlModel: mlModel,
      }),
    });
    const data = await response.json();
    setMlModel(data.mlModel);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              description={recommendedPlan?.description}
              link={recommendedPlan?.link}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Plan"
              description={personalizedPlan?.description}
              link={personalizedPlan?.link}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Customized Plan"
              description={customizedPlan?.description}
              link={customizedPlan?.link}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ProgressCard
              title="User Progress"
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={userProgress.progressPercentage}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Community" />
          </div>
          <div className="col-md-4">
            <ResourceCard title="Resources" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button onClick={handlePlanRecommendation}>Get Plan Recommendations</button>
            <button onClick={handleCustomization}>Customize Plan</button>
            <button onClick={handleAiModelTraining}>Train AI Model</button>
            <button onClick={handleMlModelTraining}>Train ML Model</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}