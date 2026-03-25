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

      const trainMachineLearningModel = async () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [10] }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        model.compile({ optimizer: tf.optimizers.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
        const trainingData = await fetch('/api/training-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const trainingDataJson = await trainingData.json();
        const trainingInputs = trainingDataJson.map((data) => data.inputs);
        const trainingOutputs = trainingDataJson.map((data) => data.outputs);
        model.fit(tf.tensor2d(trainingInputs, [trainingInputs.length, 10]), tf.tensor2d(trainingOutputs, [trainingOutputs.length, 10]), {
          epochs: 100,
        });
        setMachineLearningModel(model);
      };
      trainMachineLearningModel();

      const makePrediction = async () => {
        if (machineLearningModel) {
          const prediction = machineLearningModel.predict(tf.tensor2d([user.learningStyle, user.knowledgeLevel, user.goals], [1, 3]));
          const predictionData = await prediction.data();
          const predictedPlan = studyPlanOptions[predictionData.indexOf(Math.max(...predictionData))];
          setPersonalizedPlan(predictedPlan);
        }
      };
      makePrediction();
    }
  }, [user, machineLearningModel]);

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
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
              description={personalizedPlan ? personalizedPlan.description : 'No plan generated'}
              link={personalizedPlan ? personalizedPlan.link : '#'}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="User Progress"
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={userProgress.progressPercentage}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <CommunityCard title="Community" />
          </div>
          <div className="col-md-4">
            <ResourceCard title="Resources" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}