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

        const developPersonalizedPlan = async () => {
          const userProgressData = await fetch('/api/user-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
            }),
          });
          const userProgressResponse = await userProgressData.json();
          setUserProgress(userProgressResponse);

          const userGoalsData = await fetch('/api/user-goals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
            }),
          });
          const userGoalsResponse = await userGoalsData.json();
          const userGoals = userGoalsResponse.goals;

          const userLearningStyleData = await fetch('/api/user-learning-style', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
            }),
          });
          const userLearningStyleResponse = await userLearningStyleData.json();
          const userLearningStyle = userLearningStyleResponse.learningStyle;

          const personalizedPlanData = {
            userId: user.id,
            progress: userProgressResponse,
            goals: userGoals,
            learningStyle: userLearningStyle,
          };

          const responsePersonalizedPlan = await fetch('/api/personalized-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(personalizedPlanData),
          });
          const personalizedPlanResponse = await responsePersonalizedPlan.json();
          setPersonalizedPlan(personalizedPlanResponse);
        };
        developPersonalizedPlan();
      };
      getRecommendedPlan();
    }
  }, [user]);

  const getCustomizedPlan = async () => {
    const customizationData = {
      userId: user.id,
      learningStyle: customizationOptions.learningStyle,
      knowledgeLevel: customizationOptions.knowledgeLevel,
      goals: customizationOptions.goals,
      topics: customizationOptions.topics,
    };

    const responseCustomizedPlan = await fetch('/api/customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customizationData),
    });
    const customizedPlanResponse = await responseCustomizedPlan.json();
    setCustomizedPlan(customizedPlanResponse);
  };

  const handleCustomizationOptionsChange = (event) => {
    const { name, value } = event.target;
    setCustomizationOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
  };

  const handleTopicsChange = (topics) => {
    setCustomizationOptions((prevOptions) => ({ ...prevOptions, topics }));
  };

  const handleCustomizePlan = () => {
    getCustomizedPlan();
    setIsCustomizingPlan(true);
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
          <h2>Customized Plan</h2>
          {customizedPlan && (
            <StudyPlanCard
              name={customizedPlan.name}
              description={customizedPlan.description}
              link={customizedPlan.link}
            />
          )}
          <h2>Progress</h2>
          <ProgressCard
            completedLessons={userProgress.completedLessons}
            totalLessons={userProgress.totalLessons}
            progressPercentage={userProgress.progressPercentage}
          />
          <h2>Community</h2>
          <CommunityCard />
          <h2>Resources</h2>
          <ResourceCard />
          <h2>Customize Your Plan</h2>
          <form>
            <label>
              Learning Style:
              <select
                name="learningStyle"
                value={customizationOptions.learningStyle}
                onChange={handleCustomizationOptionsChange}
              >
                <option value="">Select a learning style</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </label>
            <label>
              Knowledge Level:
              <select
                name="knowledgeLevel"
                value={customizationOptions.knowledgeLevel}
                onChange={handleCustomizationOptionsChange}
              >
                <option value="">Select a knowledge level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label>
              Goals:
              <input
                type="text"
                name="goals"
                value={customizationOptions.goals}
                onChange={handleCustomizationOptionsChange}
              />
            </label>
            <label>
              Topics:
              <select
                multiple
                name="topics"
                value={customizationOptions.topics}
                onChange={(event) => handleTopicsChange(Array.from(event.target.selectedOptions, (option) => option.value))}
              >
                <option value="topic1">Topic 1</option>
                <option value="topic2">Topic 2</option>
                <option value="topic3">Topic 3</option>
              </select>
            </label>
            <button type="button" onClick={handleCustomizePlan}>
              Customize Plan
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}