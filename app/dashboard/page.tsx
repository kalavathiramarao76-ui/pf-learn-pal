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

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const calculateProgressPercentage = (progress: any) => {
    let totalProgress = 0;
    let completedProgress = 0;
    Object.keys(progress).forEach((key) => {
      totalProgress += progress[key].total;
      completedProgress += progress[key].completed;
    });
    return (completedProgress / totalProgress) * 100;
  };

  const renderLearningPlanRecommendations = () => {
    if (learningPlanRecommendations.length > 0) {
      return (
        <div>
          <h2>Personalized Learning Plan Recommendations</h2>
          {learningPlanRecommendations.map((recommendation, index) => (
            <StudyPlanCard key={index} plan={recommendation} />
          ))}
        </div>
      );
    } else {
      return <p>No recommendations available.</p>;
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1>Dashboard</h1>
        {renderLearningPlanRecommendations()}
        <ProgressCard progress={user?.progress} />
        <CommunityCard />
        <ResourceCard />
        <button onClick={handleLogout}>Logout</button>
      </div>
    </DashboardLayout>
  );
}