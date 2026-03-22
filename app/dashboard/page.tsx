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

        const developPersonalizedPlan = async () => {
          const userGoals = user.goals;
          const userProgress = user.progress;
          const userLearningStyle = user.learningStyle;

          const planRecommendations = await getPlanRecommendations(userGoals, userProgress, userLearningStyle);
          setLearningPlanRecommendations(planRecommendations);

          const personalizedPlan = await createPersonalizedPlan(planRecommendations, userGoals, userProgress, userLearningStyle);
          setPersonalizedPlan(personalizedPlan);
        };

        developPersonalizedPlan();
      };

      getRecommendedPlan();
    }
  }, [user]);

  const getPlanRecommendations = async (userGoals, userProgress, userLearningStyle) => {
    const response = await fetch('/api/plan-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userGoals,
        userProgress,
        userLearningStyle,
      }),
    });
    const data = await response.json();
    return data;
  };

  const createPersonalizedPlan = async (planRecommendations, userGoals, userProgress, userLearningStyle) => {
    const plan = {
      name: 'Personalized Plan',
      description: 'A customized plan based on your goals, progress, and learning style',
      lessons: [],
    };

    planRecommendations.forEach((recommendation) => {
      plan.lessons.push(recommendation.lesson);
    });

    return plan;
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard plan={recommendedPlan} />
            )}
            <h2>Personalized Plan</h2>
            {personalizedPlan && (
              <StudyPlanCard plan={personalizedPlan} />
            )}
          </div>
        )}
        <div className="cards">
          <ProgressCard progress={userProgress} />
          <CommunityCard />
          <ResourceCard />
        </div>
      </div>
    </DashboardLayout>
  );
}