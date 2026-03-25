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
    if (recommendedPlan) {
      const trainMachineLearningModel = async () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [10] }));
        model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
        model.compile({ optimizer: tf.optimizers.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
        const trainingData = [
          { input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], output: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
          { input: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], output: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
          { input: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30], output: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
        ];
        const inputs = trainingData.map(data => data.input);
        const outputs = trainingData.map(data => data.output);
        const xs = tf.tensor2d(inputs, [inputs.length, 10]);
        const ys = tf.tensor2d(outputs, [outputs.length, 10]);
        await model.fit(xs, ys, { epochs: 100 });
        setMachineLearningModel(model);
      };
      trainMachineLearningModel();
    }
  }, [recommendedPlan]);

  const getPersonalizedPlan = async () => {
    if (machineLearningModel) {
      const userInput = [
        user.learningStyle === 'visual' ? 1 : 0,
        user.knowledgeLevel === 'beginner' ? 1 : 0,
        user.goals === 'improve' ? 1 : 0,
        user.progressPercentage,
        user.completedLessons,
        user.totalLessons,
        user.upcomingLessons.length,
        user.reminders.length,
        user.ratings.length,
        user.comments.length,
      ];
      const xs = tf.tensor2d([userInput], [1, 10]);
      const prediction = await machineLearningModel.predict(xs);
      const personalizedPlan = studyPlanOptions[prediction.argMax(1).dataSync()[0]];
      setPersonalizedPlan(personalizedPlan);
    }
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan: {recommendedPlan.name}</h2>
            <button onClick={getPersonalizedPlan}>Get Personalized Plan</button>
            {personalizedPlan && (
              <div>
                <h2>Personalized Plan: {personalizedPlan.name}</h2>
                <p>{personalizedPlan.description}</p>
                <Link href={personalizedPlan.link}>View Plan</Link>
              </div>
            )}
          </div>
        )}
        <div className="cards">
          <StudyPlanCard />
          <ProgressCard />
          <CommunityCard />
          <ResourceCard />
        </div>
      </div>
    </DashboardLayout>
  );
}