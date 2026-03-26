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
          body: JSON.stringify({
            userId: user.id,
            learningStyle: user.learningStyle,
            knowledgeLevel: user.knowledgeLevel,
            goals: user.goals,
          }),
        });
        const data = await response.json();
        setRecommendedPlan(data.recommendedPlan);
      };
      getRecommendedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const trainMachineLearningModel = async () => {
        const learningData = await fetch('/api/learning-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const learningDataJson = await learningData.json();
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [10] }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        model.compile({ optimizer: tf.optimizers.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
        const xs = tf.tensor2d(learningDataJson.map((data) => data.features), [learningDataJson.length, 10]);
        const ys = tf.tensor2d(learningDataJson.map((data) => data.label), [learningDataJson.length, 10]);
        await model.fit(xs, ys, { epochs: 100 });
        setMachineLearningModel(model);
      };
      trainMachineLearningModel();
    }
  }, [user]);

  useEffect(() => {
    if (machineLearningModel) {
      const makeRecommendations = async () => {
        const userFeatures = tf.tensor2d([[
          user.learningStyle === 'visual' ? 1 : 0,
          user.learningStyle === 'auditory' ? 1 : 0,
          user.learningStyle === 'kinesthetic' ? 1 : 0,
          user.knowledgeLevel === 'beginner' ? 1 : 0,
          user.knowledgeLevel === 'intermediate' ? 1 : 0,
          user.knowledgeLevel === 'advanced' ? 1 : 0,
          user.goals === 'improveSkills' ? 1 : 0,
          user.goals === 'masterTopics' ? 1 : 0,
          user.goals === 'exploreNewTopics' ? 1 : 0,
          user.progressPercentage,
        ]]);
        const predictions = machineLearningModel.predict(userFeatures);
        const recommendations = await predictions.array();
        setLearningPlanRecommendations(recommendations);
      };
      makeRecommendations();
    }
  }, [machineLearningModel, user]);

  return (
    <DashboardLayout>
      <h1>Personalized Learning Companion</h1>
      <p>Welcome, {user.name}!</p>
      <h2>Recommended Plan</h2>
      {recommendedPlan && <p>{recommendedPlan}</p>}
      <h2>Learning Plan Recommendations</h2>
      {learningPlanRecommendations.length > 0 && (
        <ul>
          {learningPlanRecommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      )}
      <h2>Study Plan Options</h2>
      <ul>
        {studyPlanOptions.map((option, index) => (
          <li key={index}>
            <Link href={option.link}>
              <a>{option.name}</a>
            </Link>
            <p>{option.description}</p>
          </li>
        ))}
      </ul>
      <h2>Progress</h2>
      <ProgressCard progress={userProgress.progressPercentage} />
      <h2>Community</h2>
      <CommunityCard />
      <h2>Resources</h2>
      <ResourceCard />
    </DashboardLayout>
  );
}