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
              userFeedback: userFeedback,
            }),
          });
          const personalizedPlanData = await personalizedPlanResponse.json();
          setPersonalizedPlan(personalizedPlanData);
        };

        developPersonalizedPlan();

        const getLearningPlanRecommendations = async () => {
          const recommendationsResponse = await fetch('/api/learning-plan-recommendations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              recommendedPlan: data,
              userFeedback: userFeedback,
            }),
          });
          const recommendationsData = await recommendationsResponse.json();
          setLearningPlanRecommendations(recommendationsData);
        };

        getLearningPlanRecommendations();
      };

      getRecommendedPlan();
    }
  }, [user, userFeedback]);

  const handleUserFeedback = (feedback) => {
    setUserFeedback((prevFeedback) => ({ ...prevFeedback, ratings: [...prevFeedback.ratings, feedback.rating], comments: [...prevFeedback.comments, feedback.comment] }));
  };

  const handleCustomizationOptions = (options) => {
    setCustomizationOptions(options);
  };

  const handlePlanRecommendationEngine = (engine) => {
    setPlanRecommendationEngine(engine);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && <StudyPlanCard plan={recommendedPlan} />}
            <h2>Personalized Plan</h2>
            {personalizedPlan && <StudyPlanCard plan={personalizedPlan} />}
            <h2>Learning Plan Recommendations</h2>
            {learningPlanRecommendations.map((recommendation) => (
              <StudyPlanCard key={recommendation.id} plan={recommendation} />
            ))}
            <h2>Customization Options</h2>
            <form>
              <label>
                Learning Style:
                <select value={customizationOptions.learningStyle} onChange={(e) => handleCustomizationOptions({ ...customizationOptions, learningStyle: e.target.value })}>
                  <option value="">Select a learning style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
              </label>
              <label>
                Knowledge Level:
                <select value={customizationOptions.knowledgeLevel} onChange={(e) => handleCustomizationOptions({ ...customizationOptions, knowledgeLevel: e.target.value })}>
                  <option value="">Select a knowledge level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label>
                Goals:
                <input type="text" value={customizationOptions.goals} onChange={(e) => handleCustomizationOptions({ ...customizationOptions, goals: e.target.value })} />
              </label>
              <label>
                Topics:
                <input type="text" value={customizationOptions.topics.join(', ')} onChange={(e) => handleCustomizationOptions({ ...customizationOptions, topics: e.target.value.split(', ') })} />
              </label>
            </form>
            <h2>Plan Recommendation Engine</h2>
            <form>
              <label>
                Algorithm:
                <select value={planRecommendationEngine.algorithm} onChange={(e) => handlePlanRecommendationEngine({ ...planRecommendationEngine, algorithm: e.target.value })}>
                  <option value="collaborativeFiltering">Collaborative Filtering</option>
                  <option value="contentBasedFiltering">Content-Based Filtering</option>
                </select>
              </label>
              <label>
                Number of Recommendations:
                <input type="number" value={planRecommendationEngine.parameters.numRecommendations} onChange={(e) => handlePlanRecommendationEngine({ ...planRecommendationEngine, parameters: { ...planRecommendationEngine.parameters, numRecommendations: parseInt(e.target.value) } })} />
              </label>
              <label>
                Similarity Threshold:
                <input type="number" value={planRecommendationEngine.parameters.similarityThreshold} onChange={(e) => handlePlanRecommendationEngine({ ...planRecommendationEngine, parameters: { ...planRecommendationEngine.parameters, similarityThreshold: parseFloat(e.target.value) } })} />
              </label>
            </form>
            <h2>User Feedback</h2>
            <form>
              <label>
                Rating:
                <input type="number" value={userFeedback.ratings[userFeedback.ratings.length - 1]} onChange={(e) => handleUserFeedback({ rating: parseInt(e.target.value), comment: '' })} />
              </label>
              <label>
                Comment:
                <input type="text" value={userFeedback.comments[userFeedback.comments.length - 1]} onChange={(e) => handleUserFeedback({ rating: 0, comment: e.target.value })} />
              </label>
            </form>
          </div>
        )}
        <ProgressCard progress={userProgress} />
        <CommunityCard />
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}