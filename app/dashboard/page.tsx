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

  const getPersonalizedLearningPlanRecommendation = async () => {
    if (user) {
      const response = await fetch('/api/personalized-learning-plan-recommendation', {
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
      return data;
    }
    return null;
  };

  useEffect(() => {
    const getPersonalizedLearningPlanRecommendationAsync = async () => {
      const personalizedLearningPlanRecommendation = await getPersonalizedLearningPlanRecommendation();
      if (personalizedLearningPlanRecommendation) {
        const recommendedPlan = {
          name: 'Personalized Learning Plan',
          description: 'A customized learning plan based on your progress and goals',
          link: '/personalized-learning-plan',
        };
        setRecommendedPlan(recommendedPlan);
      }
    };
    getPersonalizedLearningPlanRecommendationAsync();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Study Plan"
              plan={recommendedPlan}
              options={studyPlanOptions}
              selectedPlan={selectedStudyPlan}
              onSelectPlan={(plan) => setSelectedStudyPlan(plan)}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard title="Your Progress" progress={user?.progress} />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Join Our Community" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <ResourceCard title="Recommended Resources" resources={learningPlanRecommendations} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}