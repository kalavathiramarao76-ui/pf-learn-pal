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
        setRecommendedPlan(data);
        const learningPlanRecommendations = await getLearningPlanRecommendations(user);
        setLearningPlanRecommendations(learningPlanRecommendations);
      };
      getRecommendedPlan();
    }
  }, [user]);

  const getLearningPlanRecommendations = async (user: any) => {
    const response = await fetch('/api/learning-plan-recommendations', {
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
    return data;
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
    setPersonalizedPlan(data);
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
    setCustomizedPlan(data);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              studyPlanOptions={studyPlanOptions}
              selectedStudyPlan={selectedStudyPlan}
              setSelectedStudyPlan={setSelectedStudyPlan}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard userProgress={userProgress} />
          </div>
          <div className="col-md-4">
            <CommunityCard />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard />
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Recommended Plan</h5>
                <p className="card-text">{recommendedPlan && recommendedPlan.name}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Personalized Plan</h5>
                <p className="card-text">{personalizedPlan && personalizedPlan.name}</p>
                <button className="btn btn-primary" onClick={handlePlanRecommendationEngine}>
                  Get Personalized Plan
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Customized Plan</h5>
                <p className="card-text">{customizedPlan && customizedPlan.name}</p>
                <button className="btn btn-primary" onClick={handleCustomizationOptions}>
                  Get Customized Plan
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Learning Plan Recommendations</h5>
                <ul>
                  {learningPlanRecommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}