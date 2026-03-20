use client;

import { useState } from 'react';
import Link from 'next/link';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { motion } from 'framer-motion';

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', darkMode ? 'false' : 'true');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Hero />
      <Features />
      <Pricing />
      <Faq />
      <Footer />
      <button
        className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
        onClick={handleDarkMode}
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m6 16.368V4m6.354 6.354a9 9 0 017.092 2.546M12 21m0 0l-6.364 8.849m.707 12.293L2 16.076V4m6.354-2.46v14.827m-2.303 0H8.065L2 16.076V4m16 0l-4.01-4.013M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="h-screen bg-gradient-to-r from-blue-500 to-purple-500 flex justify-center items-center"
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white">Learn Pal</h1>
        <p className="text-2xl text-white mt-4">
          AI-powered learning platform for personalized learning
        </p>
        <Link href="/dashboard">
          <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-8">
            Get Started
          </button>
        </Link>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-20">
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature
            title="Customized Study Plans"
            description="Get personalized study plans based on your strengths and weaknesses"
          />
          <Feature
            title="AI-powered Progress Tracking"
            description="Track your progress in real-time with our AI-powered tracking system"
          />
          <Feature
            title="Real-time Feedback"
            description="Get instant feedback on your performance to improve your learning"
          />
          <Feature
            title="Community Forum"
            description="Connect with peers and teachers for support and discussion"
          />
          <Feature
            title="Resource Library"
            description="Access a vast library of learning resources and materials"
          />
          <Feature
            title="Mobile App"
            description="Learn on-the-go with our mobile app, available for iOS and Android"
          />
        </div>
      </div>
    </section>
  );
}

function Feature({ title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-200">{description}</p>
    </div>
  );
}

function Pricing() {
  return (
    <section className="py-20">
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center mb-8">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PricingPlan
            title="Basic"
            price="Free"
            features={[
              'Customized Study Plans',
              'AI-powered Progress Tracking',
              'Real-time Feedback',
            ]}
          />
          <PricingPlan
            title="Premium"
            price="$9.99/month"
            features={[
              'Customized Study Plans',
              'AI-powered Progress Tracking',
              'Real-time Feedback',
              'Community Forum',
              'Resource Library',
            ]}
          />
          <PricingPlan
            title="Pro"
            price="$19.99/month"
            features={[
              'Customized Study Plans',
              'AI-powered Progress Tracking',
              'Real-time Feedback',
              'Community Forum',
              'Resource Library',
              'Mobile App',
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function PricingPlan({ title, price, features }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-4">{price}</p>
      <ul>
        {features.map((feature) => (
          <li key={feature} className="text-gray-600 dark:text-gray-200">
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/dashboard">
        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-4">
          Get Started
        </button>
      </Link>
    </div>
  );
}

function Faq() {
  return (
    <section className="py-20">
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FaqItem
            question="What is Learn Pal?"
            answer="Learn Pal is an AI-powered learning platform that creates customized study plans, tracks progress, and provides real-time feedback to students."
          />
          <FaqItem
            question="How does Learn Pal work?"
            answer="Learn Pal uses AI to analyze your strengths and weaknesses, and creates a personalized study plan based on your needs. You can track your progress in real-time and get instant feedback on your performance."
          />
          <FaqItem
            question="Is Learn Pal available on mobile?"
            answer="Yes, Learn Pal is available on both iOS and Android devices. You can download the app from the App Store or Google Play Store."
          />
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
      <h3 className="text-2xl font-bold mb-2">{question}</h3>
      <p className="text-gray-600 dark:text-gray-200">{answer}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 p-4 text-center">
      <p className="text-gray-600 dark:text-gray-200">
        &copy; 2024 Learn Pal. All rights reserved.
      </p>
    </footer>
  );
}