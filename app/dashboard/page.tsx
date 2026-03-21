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

        // Develop a personalized learning plan recommendation engine using machine learning algorithms
        const mlModel = await fetch('/api/ml-model', {
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
        const mlData = await mlModel.json();
        const personalizedPlanRecommendations = mlData.recommendations;

        // Use a collaborative filtering algorithm to recommend learning plans
        const collaborativeFiltering = async () => {
          const cfResponse = await fetch('/api/collaborative-filtering', {
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
          const cfData = await cfResponse.json();
          const cfRecommendations = cfData.recommendations;
          setLearningPlanRecommendations(cfRecommendations);
        };
        collaborativeFiltering();

        // Use a content-based filtering algorithm to recommend learning plans
        const contentBasedFiltering = async () => {
          const cbfResponse = await fetch('/api/content-based-filtering', {
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
          const cbfData = await cbfResponse.json();
          const cbfRecommendations = cbfData.recommendations;
          setLearningPlanRecommendations((prevRecommendations) => [...prevRecommendations, ...cbfRecommendations]);
        };
        contentBasedFiltering();

        // Use a hybrid approach to recommend learning plans
        const hybridApproach = async () => {
          const hybridResponse = await fetch('/api/hybrid-approach', {
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
          const hybridData = await hybridResponse.json();
          const hybridRecommendations = hybridData.recommendations;
          setLearningPlanRecommendations((prevRecommendations) => [...prevRecommendations, ...hybridRecommendations]);
        };
        hybridApproach();
      };
      getRecommendedPlan();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <StudyPlanCard
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard userProgress={userProgress} />
      <CommunityCard />
      <ResourceCard />
    </DashboardLayout>
  );
}