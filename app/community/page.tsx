import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdPeople } from 'react-icons/md';
import { Link } from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Modal from 'react-modal';
import { FaEdit } from 'react-icons/fa';
import { FiFlag } from 'react-icons/fi';

export default function CommunityPage() {
  const pathname = usePathname();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const { getValue, setValue } = useLocalStorage();
  const characterLimit = 200;
  const [editorValue, setEditorValue] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isReportingLoading, setIsReportingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedPosts = getValue('communityPosts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }
    const storedUser = getValue('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const validatePost = (post: string) => {
    if (post.length > characterLimit) {
      setError('Post exceeds character limit');
      return false;
    }
    if (post.trim() === '') {
      setError('Post cannot be empty');
      return false;
    }
    setError('');
    return true;
  };

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validatePost(editorValue)) {
      if (editingPost) {
        setIsEditingLoading(true);
        const updatedPosts = posts.map((post) => {
          if (post.text === editingPost.text) {
            return { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
          }
          return post;
        });
        setPosts(updatedPosts);
        setValue('communityPosts', JSON.stringify(updatedPosts));
        setEditingPost(null);
        setIsEditing(false);
        setSuccess('Post edited successfully');
        setIsEditingLoading(false);
      } else {
        const newPost = { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
        setPosts([...posts, newPost]);
        setValue('communityPosts', JSON.stringify([...posts, newPost]));
        setEditorValue('');
        setSuccess('Post created successfully');
      }
    }
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportReason && reportDescription) {
      setIsReportingLoading(true);
      // Send report to server
      axios.post('/report', {
        post: reportingPost,
        reason: reportReason,
        description: reportDescription,
      })
      .then((response) => {
        setSuccess('Report sent successfully');
        setIsReportingLoading(false);
        setIsReporting(false);
      })
      .catch((error) => {
        setError('Error sending report');
        setIsReportingLoading(false);
      });
    } else {
      setError('Please fill out all fields');
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setIsEditing(true);
  };

  const handleReportPost = (post: any) => {
    setReportingPost(post);
    setIsReporting(true);
    setModalIsOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPost(null);
    setEditorValue('');
  };

  const handleCancelReport = () => {
    setIsReporting(false);
    setReportingPost(null);
    setReportReason('');
    setReportDescription('');
    setModalIsOpen(false);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <Link href="/"><AiOutlineMessage /> Back to homepage</Link>
      <Link href="/community"><MdPeople /> View all posts</Link>
      {user && (
        <form onSubmit={handlePostSubmit}>
          <ReactQuill
            value={editorValue}
            onChange={(value) => {
              setEditorValue(value);
              setCharacterCount(value.length);
            }}
            placeholder="Write a post..."
          />
          <p>Character count: {characterCount}/{characterLimit}</p>
          <button type="submit">Post</button>
          {isEditing && (
            <button type="button" onClick={handleCancelEdit}>Cancel edit</button>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
      )}
      <ul>
        {posts.map((post) => (
          <li key={post.text}>
            <p>{post.text}</p>
            <p>Author: {post.author}</p>
            <p>Timestamp: {post.timestamp}</p>
            <button onClick={() => handleEditPost(post)}><FaEdit /> Edit</button>
            <button onClick={() => handleReportPost(post)}><FiFlag /> Report</button>
          </li>
        ))}
      </ul>
      {isReporting && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCancelReport}
          contentLabel="Report post"
        >
          <h2>Report post</h2>
          <form onSubmit={handleReportSubmit}>
            <label>Reason:</label>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
            <label>Description:</label>
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
            <button type="submit">Report</button>
            <button type="button" onClick={handleCancelReport}>Cancel</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}