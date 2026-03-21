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
  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
        setIsEditing(false);
        setEditSuccess('Post edited successfully!');
        setTimeout(() => setEditSuccess(''), 3000);
      } else {
        const updatedPosts = [...posts, { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }];
        setPosts(updatedPosts);
        setValue('communityPosts', JSON.stringify(updatedPosts));
        setEditorValue('');
        setCharacterCount(0);
      }
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

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportReason && reportDescription) {
      const reportData = {
        postId: reportingPost.text,
        reason: reportReason,
        description: reportDescription,
      };
      axios.post('/api/reports', reportData)
        .then((response) => {
          setReportSuccess('Report submitted successfully!');
          setTimeout(() => setReportSuccess(''), 3000);
          setModalIsOpen(false);
          setReportingPost(null);
          setReportReason('');
          setReportDescription('');
        })
        .catch((error) => {
          setReportError('Error submitting report. Please try again.');
          setTimeout(() => setReportError(''), 3000);
        });
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setIsEditing(false);
    setEditorValue('');
    setCharacterCount(0);
  };

  const handleCancelReport = () => {
    setReportingPost(null);
    setIsReporting(false);
    setModalIsOpen(false);
    setReportReason('');
    setReportDescription('');
  };

  return (
    <div>
      <h1>Community Page</h1>
      {isLoggedIn ? (
        <div>
          <ReactQuill
            value={editorValue}
            onChange={(value) => {
              setEditorValue(value);
              setCharacterCount(value.length);
            }}
            placeholder="Write a post..."
          />
          <p>Character count: {characterCount}</p>
          {isEditing ? (
            <button onClick={handlePostSubmit}>Save Changes</button>
          ) : (
            <button onClick={handlePostSubmit}>Post</button>
          )}
          {isEditing ? (
            <button onClick={handleCancelEdit}>Cancel Edit</button>
          ) : null}
        </div>
      ) : (
        <p>Please log in to post.</p>
      )}
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <p>{post.text}</p>
            <p>Author: {post.author}</p>
            <p>Timestamp: {post.timestamp}</p>
            <button onClick={() => handleEditPost(post)}>
              <FaEdit /> Edit
            </button>
            <button onClick={() => handleReportPost(post)}>
              <FiFlag /> Report
            </button>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCancelReport}
        contentLabel="Report Post"
      >
        <h2>Report Post</h2>
        <form onSubmit={handleReportSubmit}>
          <label>
            Reason:
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Description:
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
          </label>
          <button type="submit">Submit Report</button>
          <button type="button" onClick={handleCancelReport}>Cancel</button>
        </form>
      </Modal>
      {editSuccess ? <p style={{ color: 'green' }}>{editSuccess}</p> : null}
      {reportSuccess ? <p style={{ color: 'green' }}>{reportSuccess}</p> : null}
      {editError ? <p style={{ color: 'red' }}>{editError}</p> : null}
      {reportError ? <p style={{ color: 'red' }}>{reportError}</p> : null}
    </div>
  );
}