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
            preferences: user.preferences,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data);
      };
      getPersonalizedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user && planRecommendationEngine) {
      const getLearningPlanRecommendations = async () => {
        const response = await fetch('/api/learning-plan-recommendations', {
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
        const data = await response.json();
        setLearningPlanRecommendations(data);
      };
      getLearningPlanRecommendations();
    }
  }, [user, planRecommendationEngine]);

  const handlePlanRecommendationEngineChange = (event) => {
    const { name, value } = event.target;
    setPlanRecommendationEngine((prevEngine) => ({ ...prevEngine, [name]: value }));
  };

  const handlePlanRecommendationEngineParameterChange = (event) => {
    const { name, value } = event.target;
    setPlanRecommendationEngine((prevEngine) => ({
      ...prevEngine,
      parameters: { ...prevEngine.parameters, [name]: value },
    }));
  };

  return (
    <DashboardLayout>
      <h1>Personalized Learning Companion</h1>
      <StudyPlanCard
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard user={user} />
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
      {learningPlanRecommendations.length > 0 && (
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
      )}
      <div>
        <h2>Plan Recommendation Engine</h2>
        <form>
          <label>
            Algorithm:
            <select
              name="algorithm"
              value={planRecommendationEngine.algorithm}
              onChange={handlePlanRecommendationEngineChange}
            >
              <option value="collaborativeFiltering">Collaborative Filtering</option>
              <option value="contentBasedFiltering">Content-Based Filtering</option>
            </select>
          </label>
          <label>
            Number of Recommendations:
            <input
              type="number"
              name="numRecommendations"
              value={planRecommendationEngine.parameters.numRecommendations}
              onChange={handlePlanRecommendationEngineParameterChange}
            />
          </label>
          <label>
            Similarity Threshold:
            <input
              type="number"
              name="similarityThreshold"
              value={planRecommendationEngine.parameters.similarityThreshold}
              onChange={handlePlanRecommendationEngineParameterChange}
            />
          </label>
        </form>
      </div>
    </DashboardLayout>
  );
}