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
            preferences: user.preferences,
          }),
        });
        const data = await response.json();
        setLearningPlanRecommendations(data);
      };
      getLearningPlanRecommendations();
    }
  }, [user]);

  const getPersonalizedLearningPlanRecommendation = () => {
    if (user && user.progress && user.goals && user.preferences) {
      const progressPercentage = calculateProgressPercentage(user.progress);
      const goalPriority = getGoalPriority(user.goals);
      const preferenceWeight = getPreferenceWeight(user.preferences);

      const recommendedPlan = studyPlanOptions.find((plan) => {
        const planProgressPercentage = calculatePlanProgressPercentage(plan, user.progress);
        const planGoalPriority = getPlanGoalPriority(plan, user.goals);
        const planPreferenceWeight = getPlanPreferenceWeight(plan, user.preferences);

        return (
          planProgressPercentage >= progressPercentage &&
          planGoalPriority >= goalPriority &&
          planPreferenceWeight >= preferenceWeight
        );
      });

      return recommendedPlan;
    }
    return null;
  };

  const calculateProgressPercentage = (progress) => {
    const totalLessons = progress.totalLessons;
    const completedLessons = progress.completedLessons;
    return (completedLessons / totalLessons) * 100;
  };

  const getGoalPriority = (goals) => {
    const priority = goals.reduce((acc, goal) => acc + goal.priority, 0);
    return priority / goals.length;
  };

  const getPreferenceWeight = (preferences) => {
    const weight = preferences.reduce((acc, preference) => acc + preference.weight, 0);
    return weight / preferences.length;
  };

  const calculatePlanProgressPercentage = (plan, progress) => {
    const planLessons = plan.lessons;
    const completedPlanLessons = progress.completedLessons.filter((lesson) => planLessons.includes(lesson));
    return (completedPlanLessons.length / planLessons.length) * 100;
  };

  const getPlanGoalPriority = (plan, goals) => {
    const planGoalPriority = goals.reduce((acc, goal) => acc + (plan.goals.includes(goal) ? goal.priority : 0), 0);
    return planGoalPriority / goals.length;
  };

  const getPlanPreferenceWeight = (plan, preferences) => {
    const planPreferenceWeight = preferences.reduce((acc, preference) => acc + (plan.preferences.includes(preference) ? preference.weight : 0), 0);
    return planPreferenceWeight / preferences.length;
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Study Plan"
              description="Based on your progress, goals, and preferences"
              plan={getPersonalizedLearningPlanRecommendation()}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard title="Your Progress" progress={user.progress} />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Join Our Community" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard title="Additional Resources" />
          </div>
          <div className="col-md-4">
            <Link href="/study-plans">
              <a>View All Study Plans</a>
            </Link>
          </div>
          <div className="col-md-4">
            <Link href="/progress">
              <a>View Your Progress</a>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}