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
        setLearningPlanRecommendations(data.recommendations);
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
    setPersonalizedPlan(data);
  };

  const handleGetPersonalizedPlan = () => {
    getPersonalizedPlanRecommendation();
  };

  useEffect(() => {
    if (user) {
      const getUserProgress = async () => {
        const response = await fetch('/api/user-progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setUserProgress(data);
      };
      getUserProgress();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              description="Based on your progress and goals"
              plan={recommendedPlan}
              options={studyPlanOptions}
              selectedPlan={selectedStudyPlan}
              handleSelectPlan={(plan) => setSelectedStudyPlan(plan)}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="Your Progress"
              progress={userProgress}
              handleGetPersonalizedPlan={handleGetPersonalizedPlan}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Join the Community" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard title="Additional Resources" />
          </div>
          <div className="col-md-4">
            {personalizedPlan && (
              <StudyPlanCard
                title="Personalized Plan"
                description="Based on your progress, goals, and learning style"
                plan={personalizedPlan}
              />
            )}
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Upcoming Lessons</h5>
                <ul>
                  {upcomingLessons.map((lesson) => (
                    <li key={lesson.id}>{lesson.name}</li>
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