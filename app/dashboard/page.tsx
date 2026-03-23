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
        setRecommendedPlan(data.recommendedPlan);
        setLearningPlanRecommendations(data.learningPlanRecommendations);
      };
      getRecommendedPlan();
    }
  }, [user]);

  const getPersonalizedPlanRecommendation = async () => {
    if (user) {
      const response = await fetch('/api/personalized-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          progress: userProgress,
          goals: user.goals,
          learningStyle: user.learningStyle,
        }),
      });
      const data = await response.json();
      setPersonalizedPlan(data.personalizedPlan);
    }
  };

  useEffect(() => {
    if (user) {
      getPersonalizedPlanRecommendation();
    }
  }, [user, userProgress]);

  const handleCustomizePlan = async () => {
    if (user) {
      const response = await fetch('/api/customize-plan', {
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
      setIsCustomizingPlan(false);
    }
  };

  const handlePlanRecommendationEngine = async () => {
    if (user) {
      const response = await fetch('/api/plan-recommendation-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          algorithm: planRecommendationEngine.algorithm,
          parameters: planRecommendationEngine.parameters,
        }),
      });
      const data = await response.json();
      setLearningPlanRecommendations(data.learningPlanRecommendations);
    }
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan: {recommendedPlan}</h2>
            <h2>Personalized Plan: {personalizedPlan}</h2>
            <h2>Customized Plan: {customizedPlan}</h2>
            <button onClick={handleCustomizePlan}>Customize Plan</button>
            <button onClick={handlePlanRecommendationEngine}>Get Plan Recommendations</button>
          </div>
        )}
        <div className="cards">
          <StudyPlanCard studyPlanOptions={studyPlanOptions} setSelectedStudyPlan={setSelectedStudyPlan} />
          <ProgressCard userProgress={userProgress} />
          <CommunityCard />
          <ResourceCard />
        </div>
      </div>
    </DashboardLayout>
  );
}