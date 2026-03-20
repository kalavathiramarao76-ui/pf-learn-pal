use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ProgressCircle } from '../components/ProgressCircle';
import { ProgressChart } from '../components/ProgressChart';
import { ProgressTable } from '../components/ProgressTable';

export default function ProgressPage() {
  const pathname = usePathname();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('progressData');
    if (storedData) {
      setProgressData(JSON.parse(storedData));
      setLoading(false);
    } else {
      // Initialize progress data if not stored
      const initData = [
        { subject: 'Math', score: 80, target: 90 },
        { subject: 'Science', score: 70, target: 85 },
        { subject: 'English', score: 90, target: 95 },
      ];
      setProgressData(initData);
      localStorage.setItem('progressData', JSON.stringify(initData));
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Progress</h1>
      <div className="flex flex-wrap justify-center mb-8">
        {progressData.map((subject, index) => (
          <ProgressCircle
            key={index}
            subject={subject.subject}
            score={subject.score}
            target={subject.target}
          />
        ))}
      </div>
      <ProgressChart data={progressData} />
      <ProgressTable data={progressData} />
    </div>
  );
}