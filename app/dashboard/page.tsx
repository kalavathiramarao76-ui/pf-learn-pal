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

        // Develop a personalized learning plan recommendation engine
        const personalizedPlanRecommendationEngine = {
          learningStyle: user.learningStyle,
          knowledgeLevel: user.progress,
          goals: user.goals,
          recommendedPlan: data,
        };

        // Calculate a score for each study plan option based on the user's progress, goals, and learning style
        const studyPlanScores = studyPlanOptions.map((option) => {
          let score = 0;
          if (option.name === 'Foundational Plan' && user.progress < 0.3) {
            score += 1;
          } else if (option.name === 'Intermediate Plan' && user.progress >= 0.3 && user.progress < 0.7) {
            score += 1;
          } else if (option.name === 'Advanced Plan' && user.progress >= 0.7) {
            score += 1;
          }
          if (option.description.includes(user.goals)) {
            score += 1;
          }
          if (option.name.includes(user.learningStyle)) {
            score += 1;
          }
          return { ...option, score };
        });

        // Sort the study plan options based on their scores and select the top option
        const sortedStudyPlanOptions = studyPlanScores.sort((a, b) => b.score - a.score);
        const topStudyPlanOption = sortedStudyPlanOptions[0];

        // Update the personalized plan and selected study plan
        setPersonalizedPlan(topStudyPlanOption);
        setSelectedStudyPlan(topStudyPlanOption);
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
              title="Recommended Study Plan"
              description={recommendedPlan ? recommendedPlan.description : ''}
              link={recommendedPlan ? recommendedPlan.link : ''}
            />
          </div>
          <div className="col-md-4">
            <StudyPlanCard
              title="Personalized Study Plan"
              description={personalizedPlan ? personalizedPlan.description : ''}
              link={personalizedPlan ? personalizedPlan.link : ''}
            />
          </div>
          <div className="col-md-4">
            <ProgressCard
              title="User Progress"
              progress={userProgress.progressPercentage}
              completedLessons={userProgress.completedLessons}
              totalLessons={userProgress.totalLessons}
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