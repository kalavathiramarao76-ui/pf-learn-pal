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

          const getLearningPlanRecommendations = async () => {
            const recommendationsResponse = await fetch('/api/learning-plan-recommendations', {
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
            const recommendationsData = await recommendationsResponse.json();
            setLearningPlanRecommendations(recommendationsData);
          };
          await getLearningPlanRecommendations();
        };
        await developPersonalizedPlan();
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
            <h2>Learning Plan Recommendations</h2>
            {learningPlanRecommendations.map((recommendation) => (
              <StudyPlanCard
                key={recommendation.id}
                name={recommendation.name}
                description={recommendation.description}
                link={recommendation.link}
              />
            ))}
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
            <button onClick={handleCustomizePlan}>Customize Plan</button>
            {isCustomizingPlan && (
              <div>
                <h2>Customization Options</h2>
                <form>
                  <label>
                    Learning Style:
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
                  </label>
                  <label>
                    Knowledge Level:
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
                  </label>
                  <label>
                    Goals:
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
                  </label>
                  <label>
                    Topics:
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
                  </label>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}