use client;

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="text-5xl font-bold mb-8">Welcome, {user?.name}!</h1>
        {recommendedPlan && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
            <h2 className="text-lg font-bold">Recommended Learning Plan:</h2>
            <p>{recommendedPlan.name}</p>
            <p>{recommendedPlan.description}</p>
            <Link href={recommendedPlan.link}>
              <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Start Plan
              </a>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <Link href="/study-plan">
            <StudyPlanCard />
          </Link>
          <Link href="/progress">
            <ProgressCard />
          </Link>
          <Link href="/community">
            <CommunityCard />
          </Link>
          <Link href="/resources">
            <ResourceCard />
          </Link>
        </div>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-8"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </DashboardLayout>
  );
}