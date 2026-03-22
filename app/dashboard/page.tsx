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
          const personalizedPlanResponse = await fetch('/api/personalized-plan', {
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
          const personalizedPlanData = await personalizedPlanResponse.json();
          setPersonalizedPlan(personalizedPlanData);

          const learningPlanRecommendationsResponse = await fetch('/api/learning-plan-recommendations', {
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
          const learningPlanRecommendationsData = await learningPlanRecommendationsResponse.json();
          setLearningPlanRecommendations(learningPlanRecommendationsData);
        };
        developPersonalizedPlan();
      };
      getRecommendedPlan();
    }
  }, [user]);

  const handleCustomizePlan = async () => {
    setIsCustomizingPlan(true);
    const customizedPlanResponse = await fetch('/api/customized-plan', {
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
    const customizedPlanData = await customizedPlanResponse.json();
    setCustomizedPlan(customizedPlanData);
    setIsCustomizingPlan(false);
  };

  const handlePlanRecommendation = async () => {
    const planRecommendationResponse = await fetch('/api/plan-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        algorithm: planRecommendationEngine.algorithm,
        parameters: planRecommendationEngine.parameters,
      }),
    });
    const planRecommendationData = await planRecommendationResponse.json();
    setRecommendedPlan(planRecommendationData);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              description={recommendedPlan ? recommendedPlan.description : 'No plan recommended'}
              link={recommendedPlan ? recommendedPlan.link : '#'}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Plan"
              description={personalizedPlan ? personalizedPlan.description : 'No plan available'}
              link={personalizedPlan ? personalizedPlan.link : '#'}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Customized Plan"
              description={customizedPlan ? customizedPlan.description : 'No plan available'}
              link={customizedPlan ? customizedPlan.link : '#'}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ProgressCard
              title="User Progress"
              progress={userProgress.progressPercentage}
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Community" />
          </div>
          <div className="col-md-4">
            <ResourceCard title="Resources" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h2>Learning Plan Recommendations</h2>
            <ul>
              {learningPlanRecommendations.map((recommendation, index) => (
                <li key={index}>{recommendation.name}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <h2>Customize Your Plan</h2>
            <form>
              <div className="form-group">
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
              </div>
              <div className="form-group">
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
              </div>
              <div className="form-group">
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
              </div>
              <div className="form-group">
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
              </div>
              <button type="button" onClick={handleCustomizePlan}>
                Customize Plan
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}