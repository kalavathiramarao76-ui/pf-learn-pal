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
          const mlModel = await fetch('/api/ml-model', {
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
          const mlData = await mlModel.json();
          const personalizedPlan = {
            plan: mlData.plan,
            confidence: mlData.confidence,
          };
          setPersonalizedPlan(personalizedPlan);
        };
        developPersonalizedPlan();

        const getLearningPlanRecommendations = async () => {
          const response = await fetch('/api/learning-plan-recommendations', {
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
          setLearningPlanRecommendations(data);
        };
        getLearningPlanRecommendations();
      };
      getRecommendedPlan();
    }
  }, [user, userFeedback]);

  const handleCustomizePlan = async () => {
    const customizedPlanResponse = await fetch('/api/customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        customizationOptions: customizationOptions,
      }),
    });
    const customizedPlanData = await customizedPlanResponse.json();
    setCustomizedPlan(customizedPlanData);
  };

  const handleUserFeedback = async (feedback) => {
    const response = await fetch('/api/user-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        feedback: feedback,
      }),
    });
    const data = await response.json();
    setUserFeedback(data);
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
          <p>{recommendedPlan.plan}</p>
        </div>
      )}
      {personalizedPlan && (
        <div>
          <h2>Personalized Plan</h2>
          <p>{personalizedPlan.plan}</p>
          <p>Confidence: {personalizedPlan.confidence}</p>
        </div>
      )}
      {customizedPlan && (
        <div>
          <h2>Customized Plan</h2>
          <p>{customizedPlan.plan}</p>
        </div>
      )}
      <button onClick={handleCustomizePlan}>Customize Plan</button>
      <button onClick={() => handleUserFeedback({ rating: 5, comment: 'Great plan!' })}>
        Provide Feedback
      </button>
    </DashboardLayout>
  );
}