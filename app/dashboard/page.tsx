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
          const personalizedPlanResponse = await fetch('/api/personalized-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              learningStyle: user.learningStyle,
              knowledgeLevel: user.knowledgeLevel,
              goals: user.goals,
              topics: user.topics,
            }),
          });
          const personalizedPlanData = await personalizedPlanResponse.json();
          setPersonalizedPlan(personalizedPlanData);
        };
        developPersonalizedPlan();
      };
      getRecommendedPlan();
    }
  }, [user]);

  const handleCustomization = async () => {
    setIsCustomizingPlan(true);
    const customizedPlanResponse = await fetch('/api/customized-plan', {
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
    const customizedPlanData = await customizedPlanResponse.json();
    setCustomizedPlan(customizedPlanData);
    setIsCustomizingPlan(false);
  };

  const handlePlanRecommendation = async () => {
    const planRecommendationResponse = await fetch('/api/plan-recommendation', {
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
    const planRecommendationData = await planRecommendationResponse.json();
    setLearningPlanRecommendations(planRecommendationData);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard
                name={recommendedPlan.name}
                description={recommendedPlan.description}
                link={recommendedPlan.link}
              />
            )}
            <h2>Personalized Plan</h2>
            {personalizedPlan && (
              <StudyPlanCard
                name={personalizedPlan.name}
                description={personalizedPlan.description}
                link={personalizedPlan.link}
              />
            )}
            <h2>Customized Plan</h2>
            {customizedPlan && (
              <StudyPlanCard
                name={customizedPlan.name}
                description={customizedPlan.description}
                link={customizedPlan.link}
              />
            )}
            <button onClick={handleCustomization}>Customize Plan</button>
            <button onClick={handlePlanRecommendation}>Get Plan Recommendations</button>
            <h2>Learning Plan Recommendations</h2>
            {learningPlanRecommendations.map((recommendation) => (
              <StudyPlanCard
                key={recommendation.id}
                name={recommendation.name}
                description={recommendation.description}
                link={recommendation.link}
              />
            ))}
          </div>
        )}
        <h2>Study Plan Options</h2>
        {studyPlanOptions.map((option) => (
          <StudyPlanCard
            key={option.name}
            name={option.name}
            description={option.description}
            link={option.link}
          />
        ))}
        <h2>Progress</h2>
        <ProgressCard
          completedLessons={userProgress.completedLessons}
          totalLessons={userProgress.totalLessons}
          progressPercentage={userProgress.progressPercentage}
        />
        <h2>Community</h2>
        <CommunityCard />
        <h2>Resources</h2>
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}