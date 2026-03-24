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
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [reminders, setReminders] = useState([]);

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
        setLearningPlanRecommendations(data.recommendations);
      };
      getRecommendedPlan();
    }
  }, [user]);

  const getPersonalizedPlan = async () => {
    const response = await fetch('/api/personalized-plan', {
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
    setPersonalizedPlan(data);
  };

  const getCustomizedPlan = async () => {
    const response = await fetch('/api/customized-plan', {
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
  };

  const handleCustomization = () => {
    setIsCustomizingPlan(true);
  };

  const handleSaveCustomization = () => {
    getCustomizedPlan();
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
              <div>
                <p>Recommended Plan: {recommendedPlan.name}</p>
                <p>Description: {recommendedPlan.description}</p>
                <p>Link: {recommendedPlan.link}</p>
              </div>
            )}
            <h2>Personalized Plan</h2>
            <button onClick={getPersonalizedPlan}>Get Personalized Plan</button>
            {personalizedPlan && (
              <div>
                <p>Personalized Plan: {personalizedPlan.name}</p>
                <p>Description: {personalizedPlan.description}</p>
                <p>Link: {personalizedPlan.link}</p>
              </div>
            )}
            <h2>Customized Plan</h2>
            <button onClick={handleCustomization}>Customize Plan</button>
            {isCustomizingPlan && (
              <div>
                <label>Learning Style:</label>
                <input
                  type="text"
                  value={customizationOptions.learningStyle}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      learningStyle: e.target.value,
                    })
                  }
                />
                <label>Knowledge Level:</label>
                <input
                  type="text"
                  value={customizationOptions.knowledgeLevel}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      knowledgeLevel: e.target.value,
                    })
                  }
                />
                <label>Goals:</label>
                <input
                  type="text"
                  value={customizationOptions.goals}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      goals: e.target.value,
                    })
                  }
                />
                <label>Topics:</label>
                <input
                  type="text"
                  value={customizationOptions.topics.join(', ')}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      topics: e.target.value.split(', '),
                    })
                  }
                />
                <button onClick={handleSaveCustomization}>Save Customization</button>
              </div>
            )}
            {customizedPlan && (
              <div>
                <p>Customized Plan: {customizedPlan.name}</p>
                <p>Description: {customizedPlan.description}</p>
                <p>Link: {customizedPlan.link}</p>
              </div>
            )}
          </div>
        )}
        <div className="cards">
          <StudyPlanCard />
          <ProgressCard />
          <CommunityCard />
          <ResourceCard />
        </div>
      </div>
    </DashboardLayout>
  );
}