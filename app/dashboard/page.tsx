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

  const trainRecommendationModel = async () => {
    const learningData = await fetch('/api/learning-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const learningDataJson = await learningData.json();
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }));
    model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
    model.compile({ optimizer: tf.optimizers.adam(), loss: 'meanSquaredError' });
    const xs = learningDataJson.map((data) => [
      data.learningStyle === 'visual' ? 1 : 0,
      data.knowledgeLevel === 'beginner' ? 1 : 0,
      data.goals === 'improve' ? 1 : 0,
    ]);
    const ys = learningDataJson.map((data) => data.recommendedPlan);
    const xsTensor = tf.tensor2d(xs, [xs.length, 3]);
    const ysTensor = tf.tensor1d(ys);
    await model.fit(xsTensor, ysTensor, { epochs: 100 });
    setAiModel(model);
  };

  useEffect(() => {
    trainRecommendationModel();
  }, []);

  const makeRecommendation = async () => {
    if (aiModel) {
      const input = tf.tensor2d([
        recommendedPlanEngine.learningStyle === 'visual' ? 1 : 0,
        recommendedPlanEngine.knowledgeLevel === 'beginner' ? 1 : 0,
        recommendedPlanEngine.goals === 'improve' ? 1 : 0,
      ]);
      const output = aiModel.predict(input);
      const recommendation = await output.data();
      setRecommendedPlan(recommendation);
    }
  };

  useEffect(() => {
    makeRecommendation();
  }, [recommendedPlanEngine, aiModel]);

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        <div className="row">
          <div className="col-md-4">
            <StudyPlanCard
              title="Recommended Plan"
              description={recommendedPlan}
              link="/recommended-plan"
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
            <CommunityCard title="Community" description="Join our community to connect with other learners" link="/community" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <ResourceCard title="Resources" description="Access additional resources to support your learning" link="/resources" />
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Customize Your Plan</h5>
                <form>
                  <div className="form-group">
                    <label>Learning Style</label>
                    <select
                      className="form-control"
                      value={customizationOptions.learningStyle}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          learningStyle: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a learning style</option>
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Knowledge Level</label>
                    <select
                      className="form-control"
                      value={customizationOptions.knowledgeLevel}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          knowledgeLevel: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a knowledge level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Goals</label>
                    <select
                      className="form-control"
                      value={customizationOptions.goals}
                      onChange={(e) =>
                        setCustomizationOptions({
                          ...customizationOptions,
                          goals: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a goal</option>
                      <option value="improve">Improve</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setRecommendedPlanEngine({
                        learningStyle: customizationOptions.learningStyle,
                        knowledgeLevel: customizationOptions.knowledgeLevel,
                        goals: customizationOptions.goals,
                        recommendedPlan: '',
                      });
                    }}
                  >
                    Get Recommended Plan
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}