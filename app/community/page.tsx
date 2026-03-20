import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdPeople } from 'react-icons/md';
import { Link } from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [editorValue, setEditorValue] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

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
    if (editorValue.length <= characterLimit) {
      const updatedPosts = [...posts, { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }];
      setPosts(updatedPosts);
      setValue('communityPosts', JSON.stringify(updatedPosts));
      setEditorValue('');
      setCharacterCount(0);
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

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    setPostPreview(value.substring(0, characterLimit));
    setCharacterCount(value.length);
  };

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
      {isLoggedIn ? (
        <div className="flex flex-col w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Create a Post</h2>
          <ReactQuill
            value={editorValue}
            onChange={handleEditorChange}
            placeholder="Write your post here..."
          />
          <div className="flex justify-between mb-4">
            <p>Character Count: {characterCount}/{characterLimit}</p>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handlePostSubmit}
            >
              Submit Post
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4">Post Preview</h2>
          <p className="bg-gray-100 p-4">{postPreview}</p>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Login or Register</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="mb-4 p-2 border border-gray-400 rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mb-4 p-2 border border-gray-400 rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          </form>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="mb-4 p-2 border border-gray-400 rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mb-4 p-2 border border-gray-400 rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </button>
          </form>
        </div>
      )}
      {isLoggedIn && (
        <button
          type="button"
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      )}
      <h2 className="text-xl font-bold mt-8">Community Posts</h2>
      <div className="flex flex-col w-full max-w-md">
        {posts.map((post, index) => (
          <div key={index} className="bg-gray-100 p-4 mb-4">
            <p>{post.text}</p>
            <p className="text-gray-600">Posted by {post.author} at {post.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}