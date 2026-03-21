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
      };
      getRecommendedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const getPersonalizedPlan = async () => {
        const response = await fetch('/api/personalized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            progress: userProgress,
            feedback: userFeedback,
            goals: user.goals,
            learningStyle: user.learningStyle,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data);
      };
      getPersonalizedPlan();
    }
  }, [user, userProgress, userFeedback]);

  const handleUserFeedback = (rating, comment) => {
    const newFeedback = { ...userFeedback };
    newFeedback.ratings.push(rating);
    newFeedback.comments.push(comment);
    setUserFeedback(newFeedback);
  };

  const handleUserProgress = (completedLessons, totalLessons) => {
    const newProgress = { ...userProgress };
    newProgress.completedLessons = completedLessons;
    newProgress.totalLessons = totalLessons;
    newProgress.progressPercentage = (completedLessons / totalLessons) * 100;
    setUserProgress(newProgress);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard
                name={recommendedPlan.name}
                description={recommendedPlan.description}
                link={recommendedPlan.link}
              />
            )}
            <h2>Personalized Plan</h2>
            {personalizedPlan && (
              <StudyPlanCard
                name={personalizedPlan.name}
                description={personalizedPlan.description}
                link={personalizedPlan.link}
              />
            )}
            <h2>Customized Plan</h2>
            {customizedPlan && (
              <StudyPlanCard
                name={customizedPlan.name}
                description={customizedPlan.description}
                link={customizedPlan.link}
              />
            )}
            <h2>Study Plan Options</h2>
            {studyPlanOptions.map((option, index) => (
              <StudyPlanCard
                key={index}
                name={option.name}
                description={option.description}
                link={option.link}
              />
            ))}
            <h2>Progress</h2>
            <ProgressCard
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
              progressPercentage={userProgress.progressPercentage}
            />
            <h2>Community</h2>
            <CommunityCard />
            <h2>Resources</h2>
            <ResourceCard />
            <h2>Feedback</h2>
            <form>
              <label>Rating:</label>
              <input type="number" min="1" max="5" />
              <label>Comment:</label>
              <textarea />
              <button onClick={(e) => {
                e.preventDefault();
                const rating = parseInt(document.querySelector('input[type="number"]').value);
                const comment = document.querySelector('textarea').value;
                handleUserFeedback(rating, comment);
              }}>Submit</button>
            </form>
            <h2>Progress Update</h2>
            <form>
              <label>Completed Lessons:</label>
              <input type="number" />
              <label>Total Lessons:</label>
              <input type="number" />
              <button onClick={(e) => {
                e.preventDefault();
                const completedLessons = parseInt(document.querySelector('input[type="number"]:first-child').value);
                const totalLessons = parseInt(document.querySelector('input[type="number"]:last-child').value);
                handleUserProgress(completedLessons, totalLessons);
              }}>Submit</button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}