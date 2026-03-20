use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getStudyPlan, saveStudyPlan } from '../utils/localStorage';
import StudyPlanCard from '../components/StudyPlanCard';
import AddStudyPlanForm from '../components/AddStudyPlanForm';

export default function StudyPlanPage() {
  const pathname = usePathname();
  const [studyPlans, setStudyPlans] = useState([]);
  const [newStudyPlan, setNewStudyPlan] = useState({ name: '', description: '' });

  useEffect(() => {
    const storedStudyPlans = getStudyPlan();
    setStudyPlans(storedStudyPlans || []);
  }, []);

  const handleAddStudyPlan = () => {
    const updatedStudyPlans = [...studyPlans, newStudyPlan];
    setStudyPlans(updatedStudyPlans);
    saveStudyPlan(updatedStudyPlans);
    setNewStudyPlan({ name: '', description: '' });
  };

  const handleDeleteStudyPlan = (index: number) => {
    const updatedStudyPlans = studyPlans.filter((_, i) => i !== index);
    setStudyPlans(updatedStudyPlans);
    saveStudyPlan(updatedStudyPlans);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Study Plan</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {studyPlans.map((studyPlan, index) => (
          <StudyPlanCard
            key={index}
            studyPlan={studyPlan}
            onDelete={() => handleDeleteStudyPlan(index)}
          />
        ))}
      </div>
      <AddStudyPlanForm
        newStudyPlan={newStudyPlan}
        onChange={(e) => setNewStudyPlan({ ...newStudyPlan, [e.target.name]: e.target.value })}
        onAdd={handleAddStudyPlan}
      />
    </div>
  );
}