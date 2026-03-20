import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdPeople } from 'react-icons/md';
import { Link } from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from 'axios';

export default function CommunityPage() {
  const pathname = usePathname();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { getValue, setValue } = useLocalStorage();
  const characterLimit = 200;
  const [postPreview, setPostPreview] = useState('');

  useEffect(() => {
    const storedPosts = getValue('communityPosts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }
    const storedUser = getValue('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPost.length <= characterLimit) {
      const updatedPosts = [...posts, { text: newPost, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }];
      setPosts(updatedPosts);
      setValue('communityPosts', JSON.stringify(updatedPosts));
      setNewPost('');
    } else {
      alert('Post exceeds character limit. Please shorten your post.');
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { username, password });
      if (response.status === 200) {
        setUser(response.data);
        setValue('user', JSON.stringify(response.data));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/register', { username, password });
      if (response.status === 200) {
        setUser(response.data);
        setValue('user', JSON.stringify(response.data));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setValue('user', null);
    setIsLoggedIn(false);
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPost(e.target.value);
    setPostPreview(e.target.value.substring(0, characterLimit));
  };

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
      {isLoggedIn ? (
        <div className="flex flex-col w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <form onSubmit={handlePostSubmit} className="flex flex-col mb-4">
            <textarea
              value={newPost}
              onChange={handlePostChange}
              placeholder="Share your thoughts..."
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">Character limit: {characterLimit}</p>
            <p className="text-sm text-gray-500">Preview: {postPreview} {newPost.length > characterLimit ? '...' : ''}</p>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Post
            </button>
          </form>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <form onSubmit={handleLogin} className="flex flex-col mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <form onSubmit={handleRegister} className="flex flex-col mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        </div>
      )}
      <ul className="flex flex-col w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {posts.map((post, index) => (
          <li key={index} className="py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{post.author}</p>
            <p className="text-sm text-gray-500">{post.text}</p>
            <p className="text-xs text-gray-500">{post.timestamp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}