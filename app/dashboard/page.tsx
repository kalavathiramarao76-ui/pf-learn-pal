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

  const handlePlanRecommendationEngine = async () => {
    const response = await fetch('/api/plan-recommendation-engine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        algorithm: planRecommendationEngine.algorithm,
        parameters: planRecommendationEngine.parameters,
        userId: user.id,
      }),
    });
    const data = await response.json();
    setLearningPlanRecommendations(data.learningPlanRecommendations);
  };

  const handleCustomizationOptions = async () => {
    const response = await fetch('/api/customization-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learningStyle: customizationOptions.learningStyle,
        knowledgeLevel: customizationOptions.knowledgeLevel,
        goals: customizationOptions.goals,
        topics: customizationOptions.topics,
        userId: user.id,
      }),
    });
    const data = await response.json();
    setCustomizedPlan(data.customizedPlan);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              plan={recommendedPlan}
              learningPlanRecommendations={learningPlanRecommendations}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Plan"
              plan={personalizedPlan}
              onClick={getPersonalizedPlanRecommendation}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Customized Plan"
              plan={customizedPlan}
              onClick={handleCustomizationOptions}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ProgressCard
              title="User Progress"
              progress={userProgress}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard
              title="Community"
            />
          </div>
          <div className="col-md-4">
            <ResourceCard
              title="Resources"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}