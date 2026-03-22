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
  const [userProgress, setUserProgress] = useState({
    completedLessons: 0,
    totalLessons: 0,
    progressPercentage: 0,
  });
  const [userFeedback, setUserFeedback] = useState({
    ratings: [],
    comments: [],
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
            learningStyle: user.learningStyle,
          }),
        });
        const data = await response.json();
        setRecommendedPlan(data);

        const developPersonalizedPlan = async () => {
          const tf = await import('@tensorflow/tfjs');
          const model = tf.sequential();
          model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [5] }));
          model.add(tf.layers.dense({ units: 5, activation: 'softmax' }));
          model.compile({ optimizer: tf.optimizers.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

          const trainingData = [
            { input: [1, 0, 0, 0, 0], output: [1, 0, 0, 0, 0] },
            { input: [0, 1, 0, 0, 0], output: [0, 1, 0, 0, 0] },
            { input: [0, 0, 1, 0, 0], output: [0, 0, 1, 0, 0] },
            { input: [0, 0, 0, 1, 0], output: [0, 0, 0, 1, 0] },
            { input: [0, 0, 0, 0, 1], output: [0, 0, 0, 0, 1] },
          ];

          const inputs = trainingData.map((data) => data.input);
          const outputs = trainingData.map((data) => data.output);

          const xs = tf.tensor2d(inputs, [inputs.length, 5]);
          const ys = tf.tensor2d(outputs, [outputs.length, 5]);

          await model.fit(xs, ys, { epochs: 100 });

          const userInput = tf.tensor2d([[
            user.learningStyle === 'visual' ? 1 : 0,
            user.learningStyle === 'auditory' ? 1 : 0,
            user.learningStyle === 'kinesthetic' ? 1 : 0,
            user.knowledgeLevel === 'beginner' ? 1 : 0,
            user.knowledgeLevel === 'advanced' ? 1 : 0,
          ]], [1, 5]);

          const prediction = model.predict(userInput);
          const predictedPlan = await prediction.array();
          const recommendedPlanIndex = predictedPlan[0].indexOf(Math.max(...predictedPlan[0]));
          const recommendedPlanName = studyPlanOptions[recommendedPlanIndex].name;
          setPersonalizedPlan(recommendedPlanName);
        };

        developPersonalizedPlan();
      };

      getRecommendedPlan();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              plan={recommendedPlan}
              personalizedPlan={personalizedPlan}
              customizedPlan={customizedPlan}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="Progress"
              progress={userProgress}
            />
          </div>
          <div className="col-md-4">
            <CommunityCard
              title="Community"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard
              title="Resources"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}