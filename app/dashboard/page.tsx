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
      const progressWeight = 0.3;
      const goalsWeight = 0.3;
      const preferencesWeight = 0.4;

      const progressScore = calculateProgressScore(user.progress);
      const goalsScore = calculateGoalsScore(user.goals);
      const preferencesScore = calculatePreferencesScore(user.preferences);

      const totalScore = (progressScore * progressWeight) + (goalsScore * goalsWeight) + (preferencesScore * preferencesWeight);

      const recommendedPlan = studyPlanOptions.find((plan) => plan.name === recommendedPlan?.name);

      if (recommendedPlan) {
        return {
          name: recommendedPlan.name,
          description: recommendedPlan.description,
          link: recommendedPlan.link,
          score: totalScore,
        };
      }
    }
    return null;
  };

  const calculateProgressScore = (progress) => {
    // Calculate progress score based on user's progress
    // For example, if user has completed 50% of the course, return 0.5
    return progress.completed / progress.total;
  };

  const calculateGoalsScore = (goals) => {
    // Calculate goals score based on user's goals
    // For example, if user has set a goal to complete the course in 3 months, return 0.8
    return goals.importance / goals.difficulty;
  };

  const calculatePreferencesScore = (preferences) => {
    // Calculate preferences score based on user's preferences
    // For example, if user prefers video content, return 0.9
    return preferences.importance / preferences.difficulty;
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Learning Plan</h2>
            {getPersonalizedLearningPlanRecommendation() && (
              <StudyPlanCard
                name={getPersonalizedLearningPlanRecommendation().name}
                description={getPersonalizedLearningPlanRecommendation().description}
                link={getPersonalizedLearningPlanRecommendation().link}
              />
            )}
            <h2>Study Plan Options</h2>
            {studyPlanOptions.map((plan) => (
              <StudyPlanCard
                key={plan.name}
                name={plan.name}
                description={plan.description}
                link={plan.link}
              />
            ))}
            <h2>Progress</h2>
            <ProgressCard progress={user.progress} />
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