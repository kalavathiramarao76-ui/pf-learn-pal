use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdPeople } from 'react-icons/md';
import { Link } from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function CommunityPage() {
  const pathname = usePathname();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const { getValue, setValue } = useLocalStorage();

  useEffect(() => {
    const storedPosts = getValue('communityPosts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }
  }, []);

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedPosts = [...posts, { text: newPost, timestamp: new Date().toISOString() }];
    setPosts(updatedPosts);
    setValue('communityPosts', JSON.stringify(updatedPosts));
    setNewPost('');
  };

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
      <div className="flex flex-col w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <form onSubmit={handlePostSubmit} className="flex flex-col mb-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Post
          </button>
        </form>
        <ul>
          {posts.map((post, index) => (
            <li key={index} className="py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <MdPeople size={24} className="mr-2" />
                <span>Anonymous</span>
              </div>
              <p>{post.text}</p>
              <span className="text-gray-500 dark:text-gray-400">{new Date(post.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href="/resources"
        className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
      >
        Explore Resources
      </Link>
    </div>
  );
}