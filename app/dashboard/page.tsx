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
            learningStyle: recommendedPlanEngine.learningStyle,
            knowledgeLevel: recommendedPlanEngine.knowledgeLevel,
            goals: recommendedPlanEngine.goals,
          }),
        });
        const data = await response.json();
        setRecommendedPlan(data.recommendedPlan);
      };
      getRecommendedPlan();
    }
  }, [user, recommendedPlanEngine]);

  useEffect(() => {
    if (user) {
      const trainMachineLearningModel = async () => {
        const userProgressData = {
          completedLessons: userProgress.completedLessons,
          totalLessons: userProgress.totalLessons,
          progressPercentage: userProgress.progressPercentage,
        };
        const userFeedbackData = {
          ratings: userFeedback.ratings,
          comments: userFeedback.comments,
        };
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        model.compile({ optimizer: tf.optimizers.adam(), loss: 'meanSquaredError' });
        const trainingData = [
          [userProgressData.completedLessons, userProgressData.totalLessons, userProgressData.progressPercentage],
          [userFeedbackData.ratings.length, userFeedbackData.comments.length, userFeedbackData.ratings.reduce((a, b) => a + b, 0) / userFeedbackData.ratings.length],
        ];
        const labels = [
          [1, 0, 0], // recommended plan
          [0, 1, 0], // customized plan
          [0, 0, 1], // personalized plan
        ];
        model.fit(tf.tensor2d(trainingData), tf.tensor2d(labels), { epochs: 100 });
        setMachineLearningModel(model);
      };
      trainMachineLearningModel();
    }
  }, [user, userProgress, userFeedback]);

  useEffect(() => {
    if (machineLearningModel) {
      const predictLearningPlan = async () => {
        const userInput = [
          [userProgress.completedLessons, userProgress.totalLessons, userProgress.progressPercentage],
          [userFeedback.ratings.length, userFeedback.comments.length, userFeedback.ratings.reduce((a, b) => a + b, 0) / userFeedback.ratings.length],
        ];
        const predictions = machineLearningModel.predict(tf.tensor2d(userInput));
        const predictedPlan = predictions.argMax(1).dataSync()[0];
        if (predictedPlan === 0) {
          setPersonalizedPlan(recommendedPlan);
        } else if (predictedPlan === 1) {
          setPersonalizedPlan(customizedPlan);
        } else {
          setPersonalizedPlan('personalized plan');
        }
      };
      predictLearningPlan();
    }
  }, [machineLearningModel, userProgress, userFeedback, recommendedPlan, customizedPlan]);

  return (
    <DashboardLayout>
      <StudyPlanCard
        title="Recommended Plan"
        description={recommendedPlan}
        link="/recommended-plan"
      />
      <ProgressCard
        title="User Progress"
        completedLessons={userProgress.completedLessons}
        totalLessons={userProgress.totalLessons}
        progressPercentage={userProgress.progressPercentage}
      />
      <CommunityCard title="Community" />
      <ResourceCard title="Resources" />
      {personalizedPlan && (
        <StudyPlanCard
          title="Personalized Plan"
          description={personalizedPlan}
          link="/personalized-plan"
        />
      )}
    </DashboardLayout>
  );
}