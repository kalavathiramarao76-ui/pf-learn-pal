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
        progress: userProgress,
        goals: user.goals,
        learningStyle: user.learningStyle,
      }),
    });
    const data = await response.json();
    setPersonalizedPlan(data.personalizedPlan);
  };

  useEffect(() => {
    if (user && userProgress) {
      getPersonalizedPlanRecommendation();
    }
  }, [user, userProgress]);

  const updatePlanRecommendationEngine = async () => {
    const response = await fetch('/api/update-plan-recommendation-engine', {
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
    setPlanRecommendationEngine(data.planRecommendationEngine);
  };

  useEffect(() => {
    if (user) {
      updatePlanRecommendationEngine();
    }
  }, [user, planRecommendationEngine]);

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              description={recommendedPlan ? recommendedPlan.description : 'No plan recommended'}
              link={recommendedPlan ? recommendedPlan.link : '#'}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Plan"
              description={personalizedPlan ? personalizedPlan.description : 'No plan generated'}
              link={personalizedPlan ? personalizedPlan.link : '#'}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="User Progress"
              progressPercentage={userProgress.progressPercentage}
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <CommunityCard title="Community" />
          </div>
          <div className="col-md-4">
            <ResourceCard title="Resources" />
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Plan Recommendation Engine</h5>
                <p className="card-text">Algorithm: {planRecommendationEngine.algorithm}</p>
                <p className="card-text">Parameters: {JSON.stringify(planRecommendationEngine.parameters)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}