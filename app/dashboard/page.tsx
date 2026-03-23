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

        const developPersonalizedPlan = async () => {
          const response = await fetch('/api/personalized-plan', {
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
          setPersonalizedPlan(data);
        };
        developPersonalizedPlan();
      };
      getRecommendedPlan();

      const getUpcomingLessons = async () => {
        const response = await fetch('/api/upcoming-lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });
        const data = await response.json();
        setUpcomingLessons(data);
      };
      getUpcomingLessons();
    }
  }, [user]);

  const handleSetReminder = async (lessonId: string, reminderDate: string) => {
    const response = await fetch('/api/set-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        lessonId: lessonId,
        reminderDate: reminderDate,
      }),
    });
    const data = await response.json();
    setReminders([...reminders, data]);
  };

  const handleTrackProgress = async (lessonId: string, isCompleted: boolean) => {
    const response = await fetch('/api/track-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        lessonId: lessonId,
        isCompleted: isCompleted,
      }),
    });
    const data = await response.json();
    setUserProgress(data);
  };

  return (
    <DashboardLayout>
      <StudyPlanCard
        studyPlanOptions={studyPlanOptions}
        selectedStudyPlan={selectedStudyPlan}
        setSelectedStudyPlan={setSelectedStudyPlan}
      />
      <ProgressCard
        userProgress={userProgress}
        handleTrackProgress={handleTrackProgress}
      />
      <CommunityCard />
      <ResourceCard />
      {upcomingLessons.map((lesson) => (
        <div key={lesson.id}>
          <h2>{lesson.name}</h2>
          <p>{lesson.description}</p>
          <button onClick={() => handleSetReminder(lesson.id, lesson.date)}>Set Reminder</button>
        </div>
      ))}
      {reminders.map((reminder) => (
        <div key={reminder.id}>
          <h2>{reminder.lessonName}</h2>
          <p>Reminder set for: {reminder.reminderDate}</p>
        </div>
      ))}
    </DashboardLayout>
  );
}