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
        description: 'Develop intermediate skills and knowledge',
        link: '/intermediate-plan',
      };
    } else if (progressPercentage < 80) {
      recommendedPlan = {
        name: 'Advanced Plan',
        description: 'Refine advanced skills and knowledge',
        link: '/advanced-plan',
      };
    } else {
      recommendedPlan = {
        name: 'Mastery Plan',
        description: 'Achieve mastery in the subject',
        link: '/mastery-plan',
      };
    }

    if (goals.includes('career-advancement')) {
      recommendedPlan = {
        name: 'Career Advancement Plan',
        description: 'Develop skills for career advancement',
        link: '/career-advancement-plan',
      };
    }

    return recommendedPlan;
  };

  const getPersonalizedPlanBasedOnProgressGoalsAndPreferences = (user: any) => {
    const progressPercentage = calculateProgressPercentage(user.progress);
    const goals = user.goals;
    const preferences = user.preferences;
    let personalizedPlan;

    if (progressPercentage < 20) {
      if (preferences.includes('video-lessons')) {
        personalizedPlan = {
          name: 'Foundational Video Plan',
          description: 'Build a strong foundation with video lessons',
          link: '/foundational-video-plan',
        };
      } else if (preferences.includes('text-based-lessons')) {
        personalizedPlan = {
          name: 'Foundational Text Plan',
          description: 'Build a strong foundation with text-based lessons',
          link: '/foundational-text-plan',
        };
      } else {
        personalizedPlan = {
          name: 'Foundational Plan',
          description: 'Build a strong foundation in the basics',
          link: '/foundational-plan',
        };
      }
    } else if (progressPercentage < 50) {
      if (preferences.includes('interactive-exercises')) {
        personalizedPlan = {
          name: 'Intermediate Interactive Plan',
          description: 'Develop intermediate skills with interactive exercises',
          link: '/intermediate-interactive-plan',
        };
      } else if (preferences.includes('quizzes')) {
        personalizedPlan = {
          name: 'Intermediate Quiz Plan',
          description: 'Develop intermediate skills with quizzes',
          link: '/intermediate-quiz-plan',
        };
      } else {
        personalizedPlan = {
          name: 'Intermediate Plan',
          description: 'Develop intermediate skills and knowledge',
          link: '/intermediate-plan',
        };
      }
    } else if (progressPercentage < 80) {
      if (preferences.includes('project-based-learning')) {
        personalizedPlan = {
          name: 'Advanced Project Plan',
          description: 'Refine advanced skills with project-based learning',
          link: '/advanced-project-plan',
        };
      } else if (preferences.includes('real-world-applications')) {
        personalizedPlan = {
          name: 'Advanced Real-World Plan',
          description: 'Refine advanced skills with real-world applications',
          link: '/advanced-real-world-plan',
        };
      } else {
        personalizedPlan = {
          name: 'Advanced Plan',
          description: 'Refine advanced skills and knowledge',
          link: '/advanced-plan',
        };
      }
    } else {
      if (preferences.includes('expert-mentorship')) {
        personalizedPlan = {
          name: 'Mastery Mentorship Plan',
          description: 'Achieve mastery with expert mentorship',
          link: '/mastery-mentorship-plan',
        };
      } else if (preferences.includes('peer-review')) {
        personalizedPlan = {
          name: 'Mastery Peer Review Plan',
          description: 'Achieve mastery with peer review',
          link: '/mastery-peer-review-plan',
        };
      } else {
        personalizedPlan = {
          name: 'Mastery Plan',
          description: 'Achieve mastery in the subject',
          link: '/mastery-plan',
        };
      }
    }

    if (goals.includes('career-advancement')) {
      personalizedPlan = {
        name: 'Career Advancement Plan',
        description: 'Develop skills for career advancement',
        link: '/career-advancement-plan',
      };
    }

    return personalizedPlan;
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              plan={recommendedPlan}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Plan"
              plan={personalizedPlan || getPersonalizedPlanBasedOnProgressGoalsAndPreferences(user)}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="Progress"
              progress={user?.progress}
              percentage={calculateProgressPercentage(user?.progress)}
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
        </div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </DashboardLayout>
  );
}