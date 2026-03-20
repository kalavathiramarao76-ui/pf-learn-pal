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
            preferences: user.preferences,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data);
      };
      getPersonalizedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
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
          }),
        });
        const data = await response.json();
        setLearningPlanRecommendations(data);
      };
      getLearningPlanRecommendations();
    }
  }, [user]);

  const getPersonalizedLearningPlanRecommendation = () => {
    if (user && user.progress && user.goals) {
      const progressPercentage = user.progress.completedLessons / user.progress.totalLessons;
      const goalPriority = user.goals.priority;
      const recommendedPlanType = getRecommendedPlanType(progressPercentage, goalPriority);
      return recommendedPlanType;
    }
    return null;
  };

  const getRecommendedPlanType = (progressPercentage, goalPriority) => {
    if (progressPercentage < 0.3 && goalPriority === 'high') {
      return 'Intensive Plan';
    } else if (progressPercentage < 0.6 && goalPriority === 'medium') {
      return 'Balanced Plan';
    } else if (progressPercentage >= 0.6 && goalPriority === 'low') {
      return 'Relaxed Plan';
    } else {
      return 'Standard Plan';
    }
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Study Plan"
              description="Based on your progress and goals"
              plan={getPersonalizedLearningPlanRecommendation()}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="Your Progress"
              description="Track your progress and stay motivated"
              progress={user ? user.progress : null}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard
              title="Join the Community"
              description="Connect with other learners and get support"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard
              title="Recommended Resources"
              description="Get access to relevant resources and materials"
              resources={learningPlanRecommendations}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Study Plan"
              description="Based on your preferences and goals"
              plan={personalizedPlan}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Customized Study Plan"
              description="Create a plan tailored to your needs"
              plan={customizedPlan}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}