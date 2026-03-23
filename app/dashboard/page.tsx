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
          const machineLearningModel = await fetch('/api/machine-learning-model', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              progress: user.progress,
              goals: user.goals,
              learningStyle: user.learningStyle,
              userFeedback: userFeedback,
            }),
          });
          const personalizedPlanData = await machineLearningModel.json();
          setPersonalizedPlan(personalizedPlanData);

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
                learningStyle: user.learningStyle,
                personalizedPlan: personalizedPlanData,
              }),
            });
            const recommendationsData = await response.json();
            setLearningPlanRecommendations(recommendationsData);
          };
          await getLearningPlanRecommendations();
        };
        await developPersonalizedPlan();
      };
      getRecommendedPlan();
    }
  }, [user, userFeedback]);

  const handleUserFeedback = async (feedback) => {
    const updatedUserFeedback = { ...userFeedback, ratings: [...userFeedback.ratings, feedback.rating], comments: [...userFeedback.comments, feedback.comment] };
    setUserFeedback(updatedUserFeedback);
    const response = await fetch('/api/update-user-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        feedback: updatedUserFeedback,
      }),
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <DashboardLayout>
      <div className="container">
        <h1>Personalized Learning Companion</h1>
        {user && (
          <div>
            <h2>Recommended Plan</h2>
            {recommendedPlan && (
              <StudyPlanCard plan={recommendedPlan} />
            )}
            <h2>Personalized Plan</h2>
            {personalizedPlan && (
              <StudyPlanCard plan={personalizedPlan} />
            )}
            <h2>Learning Plan Recommendations</h2>
            {learningPlanRecommendations.map((recommendation) => (
              <StudyPlanCard key={recommendation.id} plan={recommendation} />
            ))}
            <h2>Customize Your Plan</h2>
            <button onClick={() => setIsCustomizingPlan(true)}>Customize</button>
            {isCustomizingPlan && (
              <div>
                <h3>Customization Options</h3>
                <form>
                  <label>Learning Style:</label>
                  <select value={customizationOptions.learningStyle} onChange={(e) => setCustomizationOptions({ ...customizationOptions, learningStyle: e.target.value })}>
                    <option value="">Select a learning style</option>
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                  </select>
                  <label>Knowledge Level:</label>
                  <select value={customizationOptions.knowledgeLevel} onChange={(e) => setCustomizationOptions({ ...customizationOptions, knowledgeLevel: e.target.value })}>
                    <option value="">Select a knowledge level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <label>Goals:</label>
                  <input type="text" value={customizationOptions.goals} onChange={(e) => setCustomizationOptions({ ...customizationOptions, goals: e.target.value })} />
                  <label>Topics:</label>
                  <input type="text" value={customizationOptions.topics.join(', ')} onChange={(e) => setCustomizationOptions({ ...customizationOptions, topics: e.target.value.split(', ') })} />
                  <button onClick={async () => {
                    const response = await fetch('/api/customize-plan', {
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
                  }}>Save Changes</button>
                </form>
              </div>
            )}
            <h2>Progress</h2>
            <ProgressCard progress={userProgress} />
            <h2>Community</h2>
            <CommunityCard />
            <h2>Resources</h2>
            <ResourceCard />
            <h2>Provide Feedback</h2>
            <form>
              <label>Rating:</label>
              <select>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <label>Comment:</label>
              <textarea />
              <button onClick={(e) => {
                e.preventDefault();
                const feedback = {
                  rating: parseInt(e.target.parentNode.querySelector('select').value, 10),
                  comment: e.target.parentNode.querySelector('textarea').value,
                };
                handleUserFeedback(feedback);
              }}>Submit Feedback</button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}