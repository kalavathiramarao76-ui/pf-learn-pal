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

  const getRecommendedPlanBasedOnProgressAndGoals = (user: any) => {
    const progressPercentage = calculateProgressPercentage(user.progress);
    const goals = user.goals;
    let recommendedPlan;

    if (progressPercentage < 20) {
      recommendedPlan = {
        name: 'Foundational Plan',
        description: 'Build a strong foundation in the basics',
        link: '/foundational-plan',
      };
    } else if (progressPercentage < 50) {
      recommendedPlan = {
        name: 'Intermediate Plan',
        description: 'Build on your foundation and develop intermediate skills',
        link: '/intermediate-plan',
      };
    } else {
      recommendedPlan = {
        name: 'Advanced Plan',
        description: 'Refine your skills and become an expert',
        link: '/advanced-plan',
      };
    }
    return recommendedPlan;
  };

  const handleCustomizePlan = async (event: any) => {
    event.preventDefault();
    const progress = event.target.progress.value;
    const goals = event.target.goals.value;
    const preferences = event.target.preferences.value;

    const response = await fetch('/api/customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        progress: progress,
        goals: goals,
        preferences: preferences,
      }),
    });
    const data = await response.json();
    setCustomizedPlan(data);
  };

  return (
    <DashboardLayout>
      <h1>Personalized Learning Companion</h1>
      {user && (
        <div>
          <h2>Recommended Plan</h2>
          {recommendedPlan && (
            <StudyPlanCard
              name={recommendedPlan.name}
              description={recommendedPlan.description}
              link={recommendedPlan.link}
            />
          )}
          <h2>Personalized Plan</h2>
          {personalizedPlan && (
            <StudyPlanCard
              name={personalizedPlan.name}
              description={personalizedPlan.description}
              link={personalizedPlan.link}
            />
          )}
          <h2>Customize Your Plan</h2>
          <form onSubmit={handleCustomizePlan}>
            <label>
              Progress:
              <select name="progress">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <br />
            <label>
              Goals:
              <select name="goals">
                <option value="short-term">Short-term</option>
                <option value="long-term">Long-term</option>
              </select>
            </label>
            <br />
            <label>
              Preferences:
              <select name="preferences">
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </label>
            <br />
            <button type="submit">Customize Plan</button>
          </form>
          {customizedPlan && (
            <div>
              <h2>Customized Plan</h2>
              <StudyPlanCard
                name={customizedPlan.name}
                description={customizedPlan.description}
                link={customizedPlan.link}
              />
            </div>
          )}
          <ProgressCard progress={user.progress} />
          <CommunityCard />
          <ResourceCard />
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </DashboardLayout>
  );
}