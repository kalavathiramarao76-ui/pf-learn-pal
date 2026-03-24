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
        setRecommendedPlan(data.recommendedPlan);
        setLearningPlanRecommendations(data.learningPlanRecommendations);
      };
      getRecommendedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (recommendedPlan) {
      const getPersonalizedPlan = async () => {
        const response = await fetch('/api/personalized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            recommendedPlan: recommendedPlan,
            userProgress: userProgress,
            userFeedback: userFeedback,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data.personalizedPlan);
      };
      getPersonalizedPlan();
    }
  }, [recommendedPlan, userProgress, userFeedback]);

  useEffect(() => {
    if (personalizedPlan) {
      const getCustomizedPlan = async () => {
        const response = await fetch('/api/customized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            personalizedPlan: personalizedPlan,
            customizationOptions: customizationOptions,
          }),
        });
        const data = await response.json();
        setCustomizedPlan(data.customizedPlan);
      };
      getCustomizedPlan();
    }
  }, [personalizedPlan, customizationOptions]);

  useEffect(() => {
    if (user) {
      const getUserProgress = async () => {
        const response = await fetch('/api/user-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });
        const data = await response.json();
        setUserProgress(data.userProgress);
      };
      getUserProgress();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const getUserFeedback = async () => {
        const response = await fetch('/api/user-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });
        const data = await response.json();
        setUserFeedback(data.userFeedback);
      };
      getUserFeedback();
    }
  }, [user]);

  const handleCustomization = async () => {
    setIsCustomizingPlan(true);
    const response = await fetch('/api/customization-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });
    const data = await response.json();
    setCustomizationOptions(data.customizationOptions);
  };

  const handlePlanSelection = async (plan) => {
    setSelectedStudyPlan(plan);
    const response = await fetch('/api/selected-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        selectedPlan: plan,
      }),
    });
    const data = await response.json();
    setRecommendedPlan(data.recommendedPlan);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              studyPlanOptions={studyPlanOptions}
              selectedStudyPlan={selectedStudyPlan}
              handlePlanSelection={handlePlanSelection}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard userProgress={userProgress} />
          </div>
          <div className="col-md-4">
            <CommunityCard />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard />
          </div>
          <div className="col-md-4">
            {isCustomizingPlan && (
              <div>
                <h2>Customization Options</h2>
                <form>
                  <div className="form-group">
                    <label>Learning Style</label>
                    <select
                      className="form-control"
                      value={customizationOptions.learningStyle}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          learningStyle: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Learning Style</option>
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Knowledge Level</label>
                    <select
                      className="form-control"
                      value={customizationOptions.knowledgeLevel}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          knowledgeLevel: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Knowledge Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Goals</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customizationOptions.goals}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          goals: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Topics</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customizationOptions.topics.join(', ')}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          topics: e.target.value.split(', '),
                        })
                      }
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleCustomization}>
                    Save Customization
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}