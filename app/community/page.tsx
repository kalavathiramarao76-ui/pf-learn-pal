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
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [editError, setEditError] = useState('');
  const [reportError, setReportError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

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
        setEditSuccess('Post edited successfully!');
        setTimeout(() => setEditSuccess(''), 3000);
      } else {
        const updatedPosts = [...posts, { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }];
        setPosts(updatedPosts);
        setValue('communityPosts', JSON.stringify(updatedPosts));
        setEditorValue('');
        setCharacterCount(0);
      }
    } else {
      setEditError('Post exceeds character limit. Please shorten your post.');
      setTimeout(() => setEditError(''), 3000);
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

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setCharacterCount(post.text.length);
  };

  const handleReportPost = (post: any) => {
    setReportingPost(post);
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportReason && reportDescription) {
      try {
        const response = await axios.post('/api/report', { postId: reportingPost._id, reason: reportReason, description: reportDescription });
        if (response.status === 200) {
          setReportSuccess('Post reported successfully!');
          setTimeout(() => setReportSuccess(''), 3000);
          setReportingPost(null);
          setReportReason('');
          setReportDescription('');
        }
      } catch (error) {
        setReportError('Failed to report post. Please try again.');
        setTimeout(() => setReportError(''), 3000);
      }
    } else {
      setReportError('Please fill out all fields.');
      setTimeout(() => setReportError(''), 3000);
    }
  };

  return (
    <div>
      <h1>Community Page</h1>
      {isLoggedIn ? (
        <div>
          <h2>Create a new post:</h2>
          <ReactQuill
            value={editorValue}
            onChange={(value) => {
              setEditorValue(value);
              setCharacterCount(value.length);
            }}
            placeholder="Write your post here..."
          />
          <p>Character count: {characterCount}/{characterLimit}</p>
          {editError && <p style={{ color: 'red' }}>{editError}</p>}
          {editSuccess && <p style={{ color: 'green' }}>{editSuccess}</p>}
          <button onClick={handlePostSubmit}>Submit</button>
        </div>
      ) : (
        <div>
          <h2>Login to create a post:</h2>
          <form onSubmit={handleLogin}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Login</button>
          </form>
          <p>Don't have an account? <Link href="/register">Register here</Link></p>
        </div>
      )}
      <h2>Posts:</h2>
      {posts.map((post) => (
        <div key={post.text}>
          <p>{post.text}</p>
          <p>Author: {post.author}</p>
          <p>Timestamp: {post.timestamp}</p>
          {isLoggedIn && (
            <div>
              <button onClick={() => handleEditPost(post)}>Edit</button>
              <button onClick={() => handleReportPost(post)}>Report</button>
            </div>
          )}
        </div>
      ))}
      {reportingPost && (
        <div>
          <h2>Report post:</h2>
          <form onSubmit={handleReportSubmit}>
            <input type="text" value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Reason" />
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Description" />
            {reportError && <p style={{ color: 'red' }}>{reportError}</p>}
            {reportSuccess && <p style={{ color: 'green' }}>{reportSuccess}</p>}
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}