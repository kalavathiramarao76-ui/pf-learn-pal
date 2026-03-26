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
import * as tf from '@tensorflow/tfjs';

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
  const [aiModel, setAiModel] = useState(null);
  const [mlModel, setMlModel] = useState(null);
  const [machineLearningModel, setMachineLearningModel] = useState(null);

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
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();
        setRecommendedPlan(data);
      };
      getRecommendedPlan();
    }
  }, [user]);

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
  };

  const handleSaveCustomizedPlan = async () => {
    const response = await fetch('/api/save-customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        customizedPlan: customizedPlan,
      }),
    });
    const data = await response.json();
    setPersonalizedPlan(data);
    setIsCustomizingPlan(false);
  };

  const handleCancelCustomization = () => {
    setIsCustomizingPlan(false);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {isCustomizingPlan ? (
          <div>
            <h2>Customize Your Learning Plan</h2>
            <form>
              <label>Learning Style:</label>
              <select
                value={customizationOptions.learningStyle}
                onChange={(e) =>
                  setCustomizationOptions({
                    ...customizationOptions,
                    learningStyle: e.target.value,
                  })
                }
              >
                <option value="">Select a learning style</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
              <br />
              <label>Knowledge Level:</label>
              <select
                value={customizationOptions.knowledgeLevel}
                onChange={(e) =>
                  setCustomizationOptions({
                    ...customizationOptions,
                    knowledgeLevel: e.target.value,
                  })
                }
              >
                <option value="">Select a knowledge level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <br />
              <label>Goals:</label>
              <textarea
                value={customizationOptions.goals}
                onChange={(e) =>
                  setCustomizationOptions({
                    ...customizationOptions,
                    goals: e.target.value,
                  })
                }
              />
              <br />
              <label>Topics:</label>
              <select
                multiple
                value={customizationOptions.topics}
                onChange={(e) =>
                  setCustomizationOptions({
                    ...customizationOptions,
                    topics: Array.from(e.target.selectedOptions, (option) => option.value),
                  })
                }
              >
                <option value="math">Math</option>
                <option value="science">Science</option>
                <option value="history">History</option>
              </select>
              <br />
              <button type="button" onClick={handleSaveCustomizedPlan}>
                Save Customized Plan
              </button>
              <button type="button" onClick={handleCancelCustomization}>
                Cancel
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2>Recommended Learning Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard plan={recommendedPlan} />
            )}
            <button type="button" onClick={handleCustomizePlan}>
              Customize Plan
            </button>
          </div>
        )}
        <ProgressCard progress={userProgress} />
        <CommunityCard />
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}