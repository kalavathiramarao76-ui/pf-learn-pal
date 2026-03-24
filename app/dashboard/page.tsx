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
    if (user && user.progress && user.goals) {
      const trainAiModel = async () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        model.compile({ optimizer: tf.optimizers.adam(), loss: 'meanSquaredError' });
        const trainingData = [
          [user.progress.completedLessons, user.progress.totalLessons, user.progress.progressPercentage],
          [user.goals.learningStyle, user.goals.knowledgeLevel, user.goals.goals],
        ];
        const labels = [1, 0];
        const tensorData = tf.tensor2d(trainingData, [trainingData.length, 3]);
        const tensorLabels = tf.tensor1d(labels);
        await model.fit(tensorData, tensorLabels, { epochs: 100 });
        setAiModel(model);
      };
      trainAiModel();
    }
  }, [user]);

  useEffect(() => {
    if (aiModel) {
      const predictLearningPlan = async () => {
        const inputData = tf.tensor2d([[user.progress.completedLessons, user.progress.totalLessons, user.progress.progressPercentage]]);
        const prediction = aiModel.predict(inputData);
        const predictedPlan = await prediction.data();
        setPersonalizedPlan(predictedPlan);
      };
      predictLearningPlan();
    }
  }, [aiModel, user]);

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan: {recommendedPlan}</h2>
            <h2>Personalized Plan: {personalizedPlan}</h2>
            <StudyPlanCard
              studyPlanOptions={studyPlanOptions}
              selectedStudyPlan={selectedStudyPlan}
              setSelectedStudyPlan={setSelectedStudyPlan}
            />
            <ProgressCard userProgress={userProgress} />
            <CommunityCard />
            <ResourceCard />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}