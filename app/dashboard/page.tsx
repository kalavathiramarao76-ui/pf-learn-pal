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
  const [customizationOptions, setCustomizationOptions] = useState({
    learningStyle: '',
    knowledgeLevel: '',
    goals: '',
    topics: [],
  });
  const [isCustomizingPlan, setIsCustomizingPlan] = useState(false);
  const [planRecommendationEngine, setPlanRecommendationEngine] = useState({
    algorithm: 'collaborativeFiltering',
    parameters: {
      numRecommendations: 5,
      similarityThreshold: 0.5,
    },
  });
  const [userProgress, setUserProgress] = useState({
    completedLessons: 0,
    totalLessons: 0,
    progressPercentage: 0,
  });
  const [userFeedback, setUserFeedback] = useState({
    ratings: [],
    comments: [],
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
            learningStyle: user.learningStyle,
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
      const getPersonalizedPlanRecommendations = async () => {
        const response = await fetch('/api/personalized-plan-recommendations', {
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
        setLearningPlanRecommendations(data);
      };
      getPersonalizedPlanRecommendations();
    }
  }, [user]);

  const getPersonalizedPlanRecommendation = (learningStyle: string, knowledgeLevel: string, goals: string) => {
    const recommendationEngine = {
      learningStyle,
      knowledgeLevel,
      goals,
      recommendedPlan: '',
    };
    setRecommendedPlanEngine(recommendationEngine);
    const getRecommendation = async () => {
      const response = await fetch('/api/personalized-plan-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recommendationEngine),
      });
      const data = await response.json();
      setPersonalizedPlan(data);
    };
    getRecommendation();
  };

  return (
    <DashboardLayout>
      <div className="container">
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
            <h2>Personalized Plan Recommendations</h2>
            {learningPlanRecommendations.length > 0 && (
              <div>
                {learningPlanRecommendations.map((recommendation, index) => (
                  <StudyPlanCard
                    key={index}
                    name={recommendation.name}
                    description={recommendation.description}
                    link={recommendation.link}
                  />
                ))}
              </div>
            )}
            <button onClick={() => getPersonalizedPlanRecommendation(user.learningStyle, user.knowledgeLevel, user.goals)}>
              Get Personalized Plan Recommendation
            </button>
            {personalizedPlan && (
              <div>
                <h2>Personalized Plan</h2>
                <StudyPlanCard
                  name={personalizedPlan.name}
                  description={personalizedPlan.description}
                  link={personalizedPlan.link}
                />
              </div>
            )}
          </div>
        )}
        <div>
          <h2>Study Plan Options</h2>
          {studyPlanOptions.map((option, index) => (
            <StudyPlanCard
              key={index}
              name={option.name}
              description={option.description}
              link={option.link}
            />
          ))}
        </div>
        <div>
          <h2>Progress</h2>
          <ProgressCard
            completedLessons={userProgress.completedLessons}
            totalLessons={userProgress.totalLessons}
            progressPercentage={userProgress.progressPercentage}
          />
        </div>
        <div>
          <h2>Community</h2>
          <CommunityCard />
        </div>
        <div>
          <h2>Resources</h2>
          <ResourceCard />
        </div>
      </div>
    </DashboardLayout>
  );
}