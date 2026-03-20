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

  useEffect(() => {
    if (user && learningPlanRecommendations.length > 0) {
      const getCustomizedPlan = async () => {
        const mlModel = await import('../../ml-model');
        const customizedPlan = mlModel.predict(user, learningPlanRecommendations);
        setCustomizedPlan(customizedPlan);
      };
      getCustomizedPlan();
    }
  }, [user, learningPlanRecommendations]);

  const handleStudyPlanSelection = (plan) => {
    setSelectedStudyPlan(plan);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard plan={recommendedPlan} />
            )}
            <h2>Personalized Plan</h2>
            {personalizedPlan && (
              <StudyPlanCard plan={personalizedPlan} />
            )}
            <h2>Customized Plan</h2>
            {customizedPlan && (
              <StudyPlanCard plan={customizedPlan} />
            )}
            <h2>Study Plan Options</h2>
            <div className="study-plan-options">
              {studyPlanOptions.map((plan) => (
                <div key={plan.name}>
                  <Link href={plan.link}>
                    <a onClick={() => handleStudyPlanSelection(plan)}>
                      {plan.name}
                    </a>
                  </Link>
                  <p>{plan.description}</p>
                </div>
              ))}
            </div>
            <h2>Progress</h2>
            <ProgressCard user={user} />
            <h2>Community</h2>
            <CommunityCard />
            <h2>Resources</h2>
            <ResourceCard />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}