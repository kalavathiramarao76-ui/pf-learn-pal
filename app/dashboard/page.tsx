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
  const [recommendedPlanEngine, setRecommendedPlanEngine] = useState({
    learningStyle: '',
    knowledgeLevel: '',
    goals: '',
    recommendedPlan: '',
  });

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

  const getRecommendedPlanEngine = async () => {
    if (user) {
      const response = await fetch('/api/recommended-plan-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          learningStyle: user.learningStyle,
          knowledgeLevel: user.knowledgeLevel,
          goals: user.goals,
        }),
      });
      const data = await response.json();
      setRecommendedPlanEngine({
        learningStyle: data.learningStyle,
        knowledgeLevel: data.knowledgeLevel,
        goals: data.goals,
        recommendedPlan: data.recommendedPlan,
      });
    }
  };

  useEffect(() => {
    getRecommendedPlanEngine();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
        <div className="flex flex-wrap justify-center mb-4">
          <StudyPlanCard
            title="Recommended Plan"
            description={recommendedPlan ? recommendedPlan.description : 'No plan recommended'}
            link={recommendedPlan ? recommendedPlan.link : ''}
          />
          <StudyPlanCard
            title="Personalized Plan"
            description={personalizedPlan ? personalizedPlan.description : 'No plan personalized'}
            link={personalizedPlan ? personalizedPlan.link : ''}
          />
          <StudyPlanCard
            title="Customized Plan"
            description={customizedPlan ? customizedPlan.description : 'No plan customized'}
            link={customizedPlan ? customizedPlan.link : ''}
          />
          <StudyPlanCard
            title="Recommended Plan Engine"
            description={recommendedPlanEngine.recommendedPlan}
            link={recommendedPlanEngine.recommendedPlan ? '/recommended-plan-engine' : ''}
          />
        </div>
        <div className="flex flex-wrap justify-center mb-4">
          {studyPlanOptions.map((option, index) => (
            <Link key={index} href={option.link}>
              <a>
                <StudyPlanCard
                  title={option.name}
                  description={option.description}
                  link={option.link}
                />
              </a>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap justify-center mb-4">
          <ProgressCard title="Progress" description="Track your progress" link="/progress" />
          <CommunityCard title="Community" description="Join our community" link="/community" />
          <ResourceCard title="Resources" description="Access our resources" link="/resources" />
        </div>
      </div>
    </DashboardLayout>
  );
}