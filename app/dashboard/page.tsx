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
      };
      getRecommendedPlan();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:justify-start w-full h-full p-4">
        <div className="w-full md:w-1/3 xl:w-1/4 p-4 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <ProgressCard userProgress={userProgress} />
          <h2 className="text-2xl font-bold mt-4 mb-4">Upcoming Lessons</h2>
          <ul>
            {upcomingLessons.map((lesson, index) => (
              <li key={index} className="bg-gray-100 p-4 mb-2 rounded">
                {lesson.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-1/3 xl:w-1/4 p-4 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold mb-4">Recommended Study Plan</h2>
          {recommendedPlan && (
            <StudyPlanCard
              plan={recommendedPlan}
              setSelectedStudyPlan={setSelectedStudyPlan}
            />
          )}
          <h2 className="text-2xl font-bold mt-4 mb-4">Customize Your Plan</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsCustomizingPlan(true)}
          >
            Customize
          </button>
          {isCustomizingPlan && (
            <div>
              <h2 className="text-2xl font-bold mt-4 mb-4">Customization Options</h2>
              <form>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Learning Style:
                </label>
                <select
                  className="block w-full p-2 mb-4 border border-gray-400 rounded"
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
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Knowledge Level:
                </label>
                <select
                  className="block w-full p-2 mb-4 border border-gray-400 rounded"
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
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Goals:
                </label>
                <textarea
                  className="block w-full p-2 mb-4 border border-gray-400 rounded"
                  value={customizationOptions.goals}
                  onChange={(e) =>
                    setCustomizationOptions({
                      ...customizationOptions,
                      goals: e.target.value,
                    })
                  }
                />
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    // Save customization options
                  }}
                >
                  Save
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/3 xl:w-1/4 p-4 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold mb-4">Community and Resources</h2>
          <CommunityCard />
          <ResourceCard />
        </div>
      </div>
    </DashboardLayout>
  );
}