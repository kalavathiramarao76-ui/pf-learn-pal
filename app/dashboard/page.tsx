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
            progress: userProgress,
            goals: user.goals,
            learningStyle: user.learningStyle,
          }),
        });
        const data = await response.json();
        setLearningPlanRecommendations(data);
      };
      getPersonalizedPlanRecommendations();
    }
  }, [user, userProgress]);

  const calculateProgressPercentage = () => {
    if (userProgress.totalLessons > 0) {
      return (userProgress.completedLessons / userProgress.totalLessons) * 100;
    } else {
      return 0;
    }
  };

  const updateProgress = async () => {
    const response = await fetch('/api/update-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        completedLessons: userProgress.completedLessons,
        totalLessons: userProgress.totalLessons,
      }),
    });
    const data = await response.json();
    setUserProgress(data);
  };

  const handleCustomizePlan = async () => {
    setIsCustomizingPlan(true);
    const response = await fetch('/api/customize-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        learningStyle: customizationOptions.learningStyle,
        knowledgeLevel: customizationOptions.knowledgeLevel,
        goals: customizationOptions.goals,
        topics: customizationOptions.topics,
      }),
    });
    const data = await response.json();
    setCustomizedPlan(data);
    setIsCustomizingPlan(false);
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
            {learningPlanRecommendations.map((plan) => (
              <StudyPlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description}
                link={plan.link}
              />
            ))}
            <h2>Progress</h2>
            <ProgressCard
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={calculateProgressPercentage()}
            />
            <h2>Customize Plan</h2>
            {isCustomizingPlan ? (
              <p>Customizing plan...</p>
            ) : (
              <div>
                <select
                  value={customizationOptions.learningStyle}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      learningStyle: e.target.value,
                    })
                  }
                >
                  <option value="">Select learning style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
                <select
                  value={customizationOptions.knowledgeLevel}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      knowledgeLevel: e.target.value,
                    })
                  }
                >
                  <option value="">Select knowledge level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input
                  type="text"
                  value={customizationOptions.goals}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      goals: e.target.value,
                    })
                  }
                  placeholder="Enter goals"
                />
                <button onClick={handleCustomizePlan}>Customize Plan</button>
              </div>
            )}
            {customizedPlan && (
              <StudyPlanCard
                name={customizedPlan.name}
                description={customizedPlan.description}
                link={customizedPlan.link}
              />
            )}
          </div>
        )}
        <h2>Community</h2>
        <CommunityCard />
        <h2>Resources</h2>
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}