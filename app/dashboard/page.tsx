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
import { Tensor } from '@tensorflow/tfjs';
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

        // Integrate machine learning-based recommendation engine
        const userFeatures = tf.tensor2d([
          user.progress,
          user.goals,
          user.learningStyle,
        ]);
        const planFeatures = tf.tensor2d([
          data.progress,
          data.goals,
          data.learningStyle,
        ]);
        const similarity = tf.metrics.cosineSimilarity(userFeatures, planFeatures);
        const recommendationScore = similarity.dataSync()[0];
        setLearningPlanRecommendations((prevRecommendations) => [
          ...prevRecommendations,
          {
            plan: data,
            score: recommendationScore,
          },
        ]);
      };
      getRecommendedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (learningPlanRecommendations.length > 0) {
      const sortedRecommendations = learningPlanRecommendations.sort(
        (a, b) => b.score - a.score
      );
      setPersonalizedPlan(sortedRecommendations[0].plan);
    }
  }, [learningPlanRecommendations]);

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Study Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard plan={recommendedPlan} />
            )}
            <h2>Personalized Study Plan</h2>
            {personalizedPlan && (
              <StudyPlanCard plan={personalizedPlan} />
            )}
          </div>
        )}
        <div className="row">
          <div className="col-md-4">
            <ProgressCard progress={userProgress} />
          </div>
          <div className="col-md-4">
            <CommunityCard />
          </div>
          <div className="col-md-4">
            <ResourceCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}