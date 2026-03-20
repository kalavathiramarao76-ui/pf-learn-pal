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
        description: 'Improve your skills with intermediate-level content',
        link: '/intermediate-plan',
      };
    } else {
      recommendedPlan = {
        name: 'Advanced Plan',
        description: 'Master advanced topics and techniques',
        link: '/advanced-plan',
      };
    }
    return recommendedPlan;
  };

  const handleCustomizeStudyPlan = (studyPlan: any) => {
    setSelectedStudyPlan(studyPlan);
    const customizedPlan = {
      name: studyPlan.name,
      description: studyPlan.description,
      link: studyPlan.link,
    };
    setCustomizedPlan(customizedPlan);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Study Plan"
              studyPlan={recommendedPlan || getRecommendedPlanBasedOnProgressAndGoals(user)}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Study Plan"
              studyPlan={personalizedPlan}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Customized Study Plan"
              studyPlan={customizedPlan}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h2>Customize Your Study Plan</h2>
            <div className="study-plan-options">
              {studyPlanOptions.map((studyPlan, index) => (
                <div key={index} className="study-plan-option">
                  <h3>{studyPlan.name}</h3>
                  <p>{studyPlan.description}</p>
                  <button onClick={() => handleCustomizeStudyPlan(studyPlan)}>Select</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ProgressCard
              title="Progress"
              progress={user.progress}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard
              title="Community"
            />
          </div>
          <div className="col-md-4">
            <ResourceCard
              title="Resources"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}