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
  };

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
      {isLoggedIn ? (
        <div className="flex flex-col w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <form onSubmit={handlePostSubmit}>
            <ReactQuill
              value={editorValue}
              onChange={handleEditorChange}
              placeholder="Write your post here..."
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ header: 1 }, { header: 2 }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ direction: 'rtl' }],
                  [{ font: [] }],
                  [{ align: [] }],
                  ['clean'],
                ],
              }}
            />
            <div className="mt-4">
              <p>Live Preview:</p>
              <div
                className="p-4 bg-gray-100 border border-gray-300 rounded-lg"
                dangerouslySetInnerHTML={{ __html: postPreview }}
              />
            </div>
            <button
              type="submit"
              className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Post
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <form onSubmit={handleLogin}>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <p className="text-gray-700 text-sm mt-2">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => {
                e.preventDefault();
                const registerForm = (
                  <form onSubmit={handleRegister}>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                      Username
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Password
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                    >
                      Register
                    </button>
                  </form>
                );
                alert(registerForm);
              }}
            >
              Register
            </button>
          </p>
        </div>
      )}
      {posts.map((post, index) => (
        <div key={index} className="w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
          <p className="text-gray-700 text-sm">{post.text}</p>
          <p className="text-gray-500 text-xs">Posted by {post.author} at {post.timestamp}</p>
        </div>
      ))}
    </div>
  );
}