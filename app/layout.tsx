use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', String(!darkMode));
  };

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Head>
        <title>Learn Pal - Personalized Learning Companion</title>
        <meta name="description" content="AI-powered learning platform for customized study plans, progress tracking, and real-time feedback" />
        <meta name="keywords" content="online learning platforms, personalized learning, study plan software, learning management system, education technology" />
        <meta name="author" content="Learn Pal" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">
          Learn Pal
        </Link>
        <button className="lg:hidden" onClick={toggleNav}>
          {navOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
        <ul className={`lg:flex lg:items-center lg:justify-end ${navOpen ? 'block' : 'hidden'} lg:block`}>
          <li className="lg:ml-6">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="lg:ml-6">
            <Link href="/study-plan">Study Plan</Link>
          </li>
          <li className="lg:ml-6">
            <Link href="/progress">Progress</Link>
          </li>
          <li className="lg:ml-6">
            <Link href="/community">Community</Link>
          </li>
          <li className="lg:ml-6">
            <Link href="/resources">Resources</Link>
          </li>
          <li className="lg:ml-6">
            <Link href="/settings">Settings</Link>
          </li>
          <li className="lg:ml-6">
            <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </li>
        </ul>
      </nav>
      <main className="pt-16">{children}</main>
      <footer className="bg-gray-200 dark:bg-gray-900 py-4 px-6 text-center text-gray-600 dark:text-gray-400">
        &copy; 2024 Learn Pal. All rights reserved.
      </footer>
    </div>
  );
}