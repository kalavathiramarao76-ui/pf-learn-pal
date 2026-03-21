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
      const getPersonalizedPlan = async () => {
        const response = await fetch('/api/personalized-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            progress: user.progress,
            goals: user.goals,
            preferences: user.preferences,
          }),
        });
        const data = await response.json();
        setPersonalizedPlan(data);
      };
      getPersonalizedPlan();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const getLearningPlanRecommendations = async () => {
        const response = await fetch('/api/learning-plan-recommendations', {
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
        setLearningPlanRecommendations(data);
      };
      getLearningPlanRecommendations();
    }
  }, [user]);

  const handleCustomizePlan = () => {
    setIsCustomizingPlan(true);
  };

  const handleSaveCustomizedPlan = async () => {
    const response = await fetch('/api/customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        customizationOptions: customizationOptions,
      }),
    });
    const data = await response.json();
    setCustomizedPlan(data);
    setIsCustomizingPlan(false);
  };

  const handleUpdateCustomizationOptions = (key, value) => {
    setCustomizationOptions({ ...customizationOptions, [key]: value });
  };

  const handleAddTopic = (topic) => {
    setCustomizationOptions({ ...customizationOptions, topics: [...customizationOptions.topics, topic] });
  };

  const handleRemoveTopic = (topic) => {
    setCustomizationOptions({ ...customizationOptions, topics: customizationOptions.topics.filter((t) => t !== topic) });
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && <StudyPlanCard plan={recommendedPlan} />}
            <h2>Personalized Plan</h2>
            {personalizedPlan && <StudyPlanCard plan={personalizedPlan} />}
            <h2>Customize Your Plan</h2>
            <button onClick={handleCustomizePlan}>Customize Plan</button>
            {isCustomizingPlan && (
              <div>
                <label>Learning Style:</label>
                <select
                  value={customizationOptions.learningStyle}
                  onChange={(e) => handleUpdateCustomizationOptions('learningStyle', e.target.value)}
                >
                  <option value="">Select a learning style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
                <label>Knowledge Level:</label>
                <select
                  value={customizationOptions.knowledgeLevel}
                  onChange={(e) => handleUpdateCustomizationOptions('knowledgeLevel', e.target.value)}
                >
                  <option value="">Select a knowledge level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <label>Goals:</label>
                <input
                  type="text"
                  value={customizationOptions.goals}
                  onChange={(e) => handleUpdateCustomizationOptions('goals', e.target.value)}
                />
                <label>Topics:</label>
                <ul>
                  {customizationOptions.topics.map((topic) => (
                    <li key={topic}>
                      {topic}
                      <button onClick={() => handleRemoveTopic(topic)}>Remove</button>
                    </li>
                  ))}
                </ul>
                <input
                  type="text"
                  placeholder="Add a topic"
                  onChange={(e) => handleAddTopic(e.target.value)}
                />
                <button onClick={handleSaveCustomizedPlan}>Save Customized Plan</button>
              </div>
            )}
            {customizedPlan && (
              <div>
                <h2>Customized Plan</h2>
                <StudyPlanCard plan={customizedPlan} />
              </div>
            )}
          </div>
        )}
        <ProgressCard />
        <CommunityCard />
        <ResourceCard />
      </div>
    </DashboardLayout>
  );
}