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
  const [editingPost, setEditingPost] = useState(null);
  const [reportingPost, setReportingPost] = useState(null);

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
      if (editingPost) {
        const updatedPosts = posts.map((post) => {
          if (post.text === editingPost.text) {
            return { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
          }
          return post;
        });
        setPosts(updatedPosts);
        setValue('communityPosts', JSON.stringify(updatedPosts));
        setEditorValue('');
        setCharacterCount(0);
        setEditingPost(null);
      } else {
        const updatedPosts = [...posts, { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }];
        setPosts(updatedPosts);
        setValue('communityPosts', JSON.stringify(updatedPosts));
        setEditorValue('');
        setCharacterCount(0);
      }
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

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setCharacterCount(post.text.length);
  };

  const handleDeletePost = (post: any) => {
    const updatedPosts = posts.filter((p) => p.text !== post.text);
    setPosts(updatedPosts);
    setValue('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleReportPost = (post: any) => {
    setReportingPost(post);
    // Add reporting logic here
  };

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">Community Page</h1>
      {isLoggedIn ? (
        <div>
          <form onSubmit={handlePostSubmit}>
            <ReactQuill
              value={editorValue}
              onChange={handleEditorChange}
              placeholder="Write a post..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Character count: {characterCount} / {characterLimit}
            </p>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="py-2 px-4 border border-gray-400 rounded mb-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="py-2 px-4 border border-gray-400 rounded mb-2"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Login
            </button>
          </form>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="py-2 px-4 border border-gray-400 rounded mb-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="py-2 px-4 border border-gray-400 rounded mb-2"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Register
            </button>
          </form>
        </div>
      )}
      <div className="mt-4">
        {posts.map((post, index) => (
          <div key={index} className="bg-white p-4 border border-gray-400 rounded mb-2">
            <p className="text-lg font-bold">{post.author}</p>
            <p className="text-sm text-gray-500">{post.timestamp}</p>
            <p className="text-lg">{post.text}</p>
            {isLoggedIn && (
              <div>
                <button
                  onClick={() => handleEditPost(post)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePost(post)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleReportPost(post)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  Report
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}