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
      const trainMlModel = async () => {
        const userFeatures = [
          user.learningStyle,
          user.knowledgeLevel,
          user.goals,
        ];
        const studyPlanFeatures = studyPlanOptions.map((plan) => [
          plan.name,
          plan.description,
          plan.link,
        ]);
        const mlModel = tf.sequential();
        mlModel.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }));
        mlModel.add(tf.layers.dense({ units: 10, activation: 'relu' }));
        mlModel.add(tf.layers.dense({ units: studyPlanFeatures.length, activation: 'softmax' }));
        mlModel.compile({ optimizer: tf.optimizers.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
        const xs = tf.tensor2d(userFeatures, [1, 3]);
        const ys = tf.tensor2d(studyPlanFeatures.map((_, index) => [index]), [1, studyPlanFeatures.length]);
        await mlModel.fit(xs, ys, { epochs: 100 });
        setMlModel(mlModel);
      };
      trainMlModel();
    }
  }, [user, studyPlanOptions]);

  useEffect(() => {
    if (mlModel) {
      const predictRecommendedPlan = async () => {
        const userFeatures = [
          user.learningStyle,
          user.knowledgeLevel,
          user.goals,
        ];
        const xs = tf.tensor2d(userFeatures, [1, 3]);
        const predictions = mlModel.predict(xs);
        const recommendedPlanIndex = predictions.argMax(1).dataSync()[0];
        setRecommendedPlan(studyPlanOptions[recommendedPlanIndex]);
      };
      predictRecommendedPlan();
    }
  }, [mlModel, user, studyPlanOptions]);

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Study Plan"
              plan={recommendedPlan}
              link={recommendedPlan ? recommendedPlan.link : ''}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="Your Progress"
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={userProgress.progressPercentage}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard title="Join Our Community" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard title="Additional Resources" />
          </div>
          <div className="col-md-4">
            <Link href="/customize-plan">
              <a>Customize Your Study Plan</a>
            </Link>
          </div>
          <div className="col-md-4">
            <Link href="/view-progress">
              <a>View Your Progress</a>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}