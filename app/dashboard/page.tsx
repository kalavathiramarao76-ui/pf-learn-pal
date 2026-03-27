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
        setLearningPlanRecommendations(data.learningPlanRecommendations);
      };
      getRecommendedPlan();
    }
  }, [user, userProgress, userFeedback]);

  useEffect(() => {
    if (recommendedPlan) {
      const trainAiModel = async () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [10] }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        model.compile({ optimizer: tf.optimizers.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
        const trainingData = [
          { input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], output: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
          { input: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], output: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
          { input: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30], output: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
        ];
        const inputs = trainingData.map((data) => data.input);
        const outputs = trainingData.map((data) => data.output);
        await model.fit(tf.tensor2d(inputs, [inputs.length, 10]), tf.tensor2d(outputs, [outputs.length, 10]), {
          epochs: 100,
        });
        setAiModel(model);
      };
      trainAiModel();
    }
  }, [recommendedPlan]);

  useEffect(() => {
    if (aiModel) {
      const makePrediction = async () => {
        const input = tf.tensor2d([userProgress.completedLessons, userProgress.totalLessons, userFeedback.ratings.length], [1, 3]);
        const output = aiModel.predict(input);
        const prediction = await output.data();
        setPersonalizedPlan(prediction);
      };
      makePrediction();
    }
  }, [aiModel, userProgress, userFeedback]);

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
            <ProgressCard
              title="User Progress"
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={userProgress.progressPercentage}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Community" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard title="Resources" />
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Personalized Plan</h5>
                <p className="card-text">{personalizedPlan ? personalizedPlan.toString() : 'No plan generated'}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Learning Plan Recommendations</h5>
                <ul>
                  {learningPlanRecommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation.name}</li>
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