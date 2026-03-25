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

  const trainStudyPlanRecommendationEngine = async () => {
    const studyPlanData = await fetch('/api/study-plans');
    const studyPlanJson = await studyPlanData.json();
    const userProgressData = await fetch('/api/user-progress');
    const userProgressJson = await userProgressData.json();
    const userFeedbackData = await fetch('/api/user-feedback');
    const userFeedbackJson = await userFeedbackData.json();

    const trainingData = studyPlanJson.map((studyPlan) => {
      return {
        input: {
          userProgress: userProgressJson.find((progress) => progress.userId === user.id),
          userFeedback: userFeedbackJson.find((feedback) => feedback.userId === user.id),
        },
        output: studyPlan,
      };
    });

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [10] }));
    model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
    model.compile({ optimizer: tf.optimizers.adam(), loss: 'meanSquaredError' });

    await model.fit(tf.data.array(trainingData.map((data) => data.input)), tf.data.array(trainingData.map((data) => data.output)), {
      epochs: 100,
    });

    setAiModel(model);
  };

  const getStudyPlanRecommendations = async () => {
    if (aiModel) {
      const userInput = {
        userProgress: userProgress,
        userFeedback: userFeedback,
      };
      const output = aiModel.predict(tf.tensor2d([userInput]));
      const recommendations = await output.data();
      setLearningPlanRecommendations(recommendations);
    }
  };

  useEffect(() => {
    trainStudyPlanRecommendationEngine();
  }, [userProgress, userFeedback]);

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard studyPlan={recommendedPlan} />
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
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Study Plan Recommendations</h5>
                <ul>
                  {learningPlanRecommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}