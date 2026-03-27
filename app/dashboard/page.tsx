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

const cache = {
  user: null,
  recommendedPlan: null,
  personalizedPlan: null,
  customizedPlan: null,
  studyPlanOptions: null,
  learningPlanRecommendations: null,
  userProgress: null,
  userFeedback: null,
  upcomingLessons: null,
  reminders: null,
  aiModel: null,
  mlModel: null,
  machineLearningModel: null,
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(cache.user);
  const [recommendedPlan, setRecommendedPlan] = useState(cache.recommendedPlan);
  const [personalizedPlan, setPersonalizedPlan] = useState(cache.personalizedPlan);
  const [customizedPlan, setCustomizedPlan] = useState(cache.customizedPlan);
  const [studyPlanOptions, setStudyPlanOptions] = useState(cache.studyPlanOptions || [
    { name: 'Foundational Plan', description: 'Build a strong foundation in the basics', link: '/foundational-plan' },
    { name: 'Intermediate Plan', description: 'Improve your skills with intermediate-level content', link: '/intermediate-plan' },
    { name: 'Advanced Plan', description: 'Master advanced topics and techniques', link: '/advanced-plan' },
  ]);
  const [selectedStudyPlan, setSelectedStudyPlan] = useState(null);
  const [learningPlanRecommendations, setLearningPlanRecommendations] = useState(cache.learningPlanRecommendations || []);
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
  const [userProgress, setUserProgress] = useState(cache.userProgress || {
    completedLessons: 0,
    totalLessons: 0,
    progressPercentage: 0,
  });
  const [userFeedback, setUserFeedback] = useState(cache.userFeedback || {
    ratings: [],
    comments: [],
  });
  const [upcomingLessons, setUpcomingLessons] = useState(cache.upcomingLessons || []);
  const [reminders, setReminders] = useState(cache.reminders || []);
  const [aiModel, setAiModel] = useState(cache.aiModel);
  const [mlModel, setMlModel] = useState(cache.mlModel);
  const [machineLearningModel, setMachineLearningModel] = useState(cache.machineLearningModel);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      cache.user = JSON.parse(storedUser);
    }
  }, []);

  useEffect(() => {
    if (user && !cache.recommendedPlan) {
      const getRecommendedPlan = async () => {
        const response = await fetch('/api/recommended-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setRecommendedPlan(data);
        cache.recommendedPlan = data;
      };
      getRecommendedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.personalizedPlan) {
      const getPersonalizedPlan = async () => {
        const response = await fetch('/api/personalized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setPersonalizedPlan(data);
        cache.personalizedPlan = data;
      };
      getPersonalizedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.customizedPlan) {
      const getCustomizedPlan = async () => {
        const response = await fetch('/api/customized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setCustomizedPlan(data);
        cache.customizedPlan = data;
      };
      getCustomizedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.learningPlanRecommendations) {
      const getLearningPlanRecommendations = async () => {
        const response = await fetch('/api/learning-plan-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setLearningPlanRecommendations(data);
        cache.learningPlanRecommendations = data;
      };
      getLearningPlanRecommendations();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.userProgress) {
      const getUserProgress = async () => {
        const response = await fetch('/api/user-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setUserProgress(data);
        cache.userProgress = data;
      };
      getUserProgress();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.userFeedback) {
      const getUserFeedback = async () => {
        const response = await fetch('/api/user-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setUserFeedback(data);
        cache.userFeedback = data;
      };
      getUserFeedback();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.upcomingLessons) {
      const getUpcomingLessons = async () => {
        const response = await fetch('/api/upcoming-lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setUpcomingLessons(data);
        cache.upcomingLessons = data;
      };
      getUpcomingLessons();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.reminders) {
      const getReminders = async () => {
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setReminders(data);
        cache.reminders = data;
      };
      getReminders();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.aiModel) {
      const getAiModel = async () => {
        const response = await fetch('/api/ai-model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setAiModel(data);
        cache.aiModel = data;
      };
      getAiModel();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.mlModel) {
      const getMlModel = async () => {
        const response = await fetch('/api/ml-model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setMlModel(data);
        cache.mlModel = data;
      };
      getMlModel();
    }
  }, [user]);

  useEffect(() => {
    if (user && !cache.machineLearningModel) {
      const getMachineLearningModel = async () => {
        const response = await fetch('/api/machine-learning-model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setMachineLearningModel(data);
        cache.machineLearningModel = data;
      };
      getMachineLearningModel();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <StudyPlanCard
        recommendedPlan={recommendedPlan}
        personalizedPlan={personalizedPlan}
        customizedPlan={customizedPlan}
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard
        userProgress={userProgress}
        learningPlanRecommendations={learningPlanRecommendations}
      />
      <CommunityCard />
      <ResourceCard />
    </DashboardLayout>
  );
}