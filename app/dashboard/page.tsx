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
            userProgress: userProgress,
            userFeedback: userFeedback,
          }),
        });
        const data = await response.json();
        setRecommendedPlan(data.recommendedPlan);
      };
      getRecommendedPlan();
    }
  }, [user, userProgress, userFeedback]);

  const trainPersonalizedLearningPlanModel = async () => {
    if (user) {
      const userProgressData = userProgress;
      const userFeedbackData = userFeedback;
      const studyPlanOptionsData = studyPlanOptions;

      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }));
      model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      model.compile({ optimizer: tf.optimizers.adam(), loss: 'meanSquaredError' });

      const trainingData = [];
      for (let i = 0; i < studyPlanOptionsData.length; i++) {
        const studyPlanOption = studyPlanOptionsData[i];
        const userProgressFeatures = [
          userProgressData.completedLessons / userProgressData.totalLessons,
          userFeedbackData.ratings.length,
          userFeedbackData.comments.length,
        ];
        const label = studyPlanOption.name === recommendedPlan ? 1 : 0;
        trainingData.push({ features: userProgressFeatures, label });
      }

      const trainingDataset = tf.data.array(trainingData);
      await model.fitDataset(trainingDataset, { epochs: 100 });

      setMachineLearningModel(model);
    }
  };

  useEffect(() => {
    if (user && userProgress && userFeedback) {
      trainPersonalizedLearningPlanModel();
    }
  }, [user, userProgress, userFeedback]);

  const getPersonalizedLearningPlanRecommendation = async () => {
    if (machineLearningModel) {
      const userProgressFeatures = [
        userProgress.completedLessons / userProgress.totalLessons,
        userFeedback.ratings.length,
        userFeedback.comments.length,
      ];
      const input = tf.tensor2d([userProgressFeatures], [1, 3]);
      const prediction = machineLearningModel.predict(input);
      const recommendedPlanIndex = prediction.argMax(1).dataSync()[0];
      const recommendedPlan = studyPlanOptions[recommendedPlanIndex];
      setPersonalizedPlan(recommendedPlan);
    }
  };

  useEffect(() => {
    if (machineLearningModel) {
      getPersonalizedLearningPlanRecommendation();
    }
  }, [machineLearningModel, userProgress, userFeedback]);

  return (
    <DashboardLayout>
      <StudyPlanCard
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard userProgress={userProgress} />
      <CommunityCard />
      <ResourceCard />
      {recommendedPlan && (
        <div>
          <h2>Recommended Plan: {recommendedPlan}</h2>
        </div>
      )}
      {personalizedPlan && (
        <div>
          <h2>Personalized Plan: {personalizedPlan.name}</h2>
          <p>{personalizedPlan.description}</p>
        </div>
      )}
    </DashboardLayout>
  );
}