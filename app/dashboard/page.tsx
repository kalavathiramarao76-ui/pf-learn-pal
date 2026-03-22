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
          const machineLearningModel = await import('../../models/personalizedLearningModel');
          const model = machineLearningModel.default;
          const userInput = {
            userId: user.id,
            progress: user.progress,
            goals: user.goals,
            learningStyle: user.learningStyle,
          };
          const prediction = await model.predict(userInput);
          const personalizedPlan = {
            plan: prediction.plan,
            confidence: prediction.confidence,
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
  }, [user]);

  const handleCustomizePlan = async () => {
    const machineLearningModel = await import('../../models/customizedLearningModel');
    const model = machineLearningModel.default;
    const userInput = {
      userId: user.id,
      learningStyle: customizationOptions.learningStyle,
      knowledgeLevel: customizationOptions.knowledgeLevel,
      goals: customizationOptions.goals,
      topics: customizationOptions.topics,
    };
    const prediction = await model.predict(userInput);
    const customizedPlan = {
      plan: prediction.plan,
      confidence: prediction.confidence,
    };
    setCustomizedPlan(customizedPlan);
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
          <p>Confidence: {customizedPlan.confidence}</p>
        </div>
      )}
      <button onClick={handleCustomizePlan}>Customize Plan</button>
    </DashboardLayout>
  );
}