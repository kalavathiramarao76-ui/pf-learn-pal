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
            learningStyle: user.learningStyle,
            knowledgeLevel: user.knowledgeLevel,
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
      const getCustomizedPlan = async () => {
        const response = await fetch('/api/customized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            progress: user.progress,
            goals: user.goals,
            learningStyle: user.learningStyle,
            knowledgeLevel: user.knowledgeLevel,
            topics: user.topics,
          }),
        });
        const data = await response.json();
        setCustomizedPlan(data);
      };
      getCustomizedPlan();
    }
  }, [user]);

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
        learningStyle: user.learningStyle,
        knowledgeLevel: user.knowledgeLevel,
      }),
    });
    const data = await response.json();
    setLearningPlanRecommendations(data);
  };

  useEffect(() => {
    if (user) {
      getLearningPlanRecommendations();
    }
  }, [user]);

  const handlePlanRecommendationEngineChange = (event) => {
    setPlanRecommendationEngine({
      ...planRecommendationEngine,
      algorithm: event.target.value,
    });
  };

  const handleCustomizationOptionsChange = (event) => {
    setCustomizationOptions({
      ...customizationOptions,
      [event.target.name]: event.target.value,
    });
  };

  const handleIsCustomizingPlanChange = (event) => {
    setIsCustomizingPlan(event.target.checked);
  };

  return (
    <DashboardLayout>
      <h1>Personalized Learning Companion</h1>
      <StudyPlanCard
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard
        userProgress={userProgress}
        setUserProgress={setUserProgress}
      />
      <CommunityCard />
      <ResourceCard />
      {recommendedPlan && (
        <div>
          <h2>Recommended Plan</h2>
          <p>{recommendedPlan.name}</p>
          <p>{recommendedPlan.description}</p>
        </div>
      )}
      {personalizedPlan && (
        <div>
          <h2>Personalized Plan</h2>
          <p>{personalizedPlan.name}</p>
          <p>{personalizedPlan.description}</p>
        </div>
      )}
      {customizedPlan && (
        <div>
          <h2>Customized Plan</h2>
          <p>{customizedPlan.name}</p>
          <p>{customizedPlan.description}</p>
        </div>
      )}
      <div>
        <h2>Learning Plan Recommendations</h2>
        <ul>
          {learningPlanRecommendations.map((recommendation) => (
            <li key={recommendation.id}>
              <p>{recommendation.name}</p>
              <p>{recommendation.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Plan Recommendation Engine</h2>
        <select value={planRecommendationEngine.algorithm} onChange={handlePlanRecommendationEngineChange}>
          <option value="collaborativeFiltering">Collaborative Filtering</option>
          <option value="contentBasedFiltering">Content-Based Filtering</option>
        </select>
      </div>
      <div>
        <h2>Customization Options</h2>
        <form>
          <label>
            Learning Style:
            <select
              value={customizationOptions.learningStyle}
              onChange={handleCustomizationOptionsChange}
              name="learningStyle"
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
              value={customizationOptions.knowledgeLevel}
              onChange={handleCustomizationOptionsChange}
              name="knowledgeLevel"
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
              value={customizationOptions.goals}
              onChange={handleCustomizationOptionsChange}
              name="goals"
            />
          </label>
          <label>
            Topics:
            <input
              type="text"
              value={customizationOptions.topics.join(', ')}
              onChange={(event) => {
                const topics = event.target.value.split(', ');
                setCustomizationOptions({
                  ...customizationOptions,
                  topics,
                });
              }}
              name="topics"
            />
          </label>
        </form>
      </div>
      <div>
        <h2>Is Customizing Plan</h2>
        <input
          type="checkbox"
          checked={isCustomizingPlan}
          onChange={handleIsCustomizingPlanChange}
        />
      </div>
    </DashboardLayout>
  );
}