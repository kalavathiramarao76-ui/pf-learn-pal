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
            progress: user.progress,
            goals: user.goals,
            learningStyle: user.learningStyle,
            userFeedback: userFeedback,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data);
      };
      getPersonalizedPlan();
    }
  }, [user, userFeedback]);

  const trainModel = async () => {
    const response = await fetch('/api/train-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userFeedback: userFeedback,
      }),
    });
    const data = await response.json();
    setPlanRecommendationEngine(data);
  };

  const predictRecommendations = async () => {
    const response = await fetch('/api/predict-recommendations', {
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
    setLearningPlanRecommendations(data);
  };

  const handleUserFeedback = (rating, comment) => {
    setUserFeedback({
      ratings: [...userFeedback.ratings, rating],
      comments: [...userFeedback.comments, comment],
    });
    trainModel();
    predictRecommendations();
  };

  return (
    <DashboardLayout>
      <StudyPlanCard
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard
        userProgress={userProgress}
        setUserProgress={setUserProgress}
      />
      <CommunityCard />
      <ResourceCard />
      {recommendedPlan && (
        <div>
          <h2>Recommended Plan</h2>
          <p>{recommendedPlan.name}</p>
          <p>{recommendedPlan.description}</p>
        </div>
      )}
      {personalizedPlan && (
        <div>
          <h2>Personalized Plan</h2>
          <p>{personalizedPlan.name}</p>
          <p>{personalizedPlan.description}</p>
        </div>
      )}
      {learningPlanRecommendations.length > 0 && (
        <div>
          <h2>Learning Plan Recommendations</h2>
          <ul>
            {learningPlanRecommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <p>{recommendation.name}</p>
                <p>{recommendation.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => handleUserFeedback(5, 'Great plan!')}>
        Provide Feedback
      </button>
    </DashboardLayout>
  );
}