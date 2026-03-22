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
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isReportingLoading, setIsReportingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationError, setValidationError] = useState('');

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

  const validatePost = (post: string) => {
    if (post.length > characterLimit) {
      setValidationError('Post exceeds character limit');
      return false;
    }
    if (post.trim() === '') {
      setValidationError('Post cannot be empty');
      return false;
    }
    setValidationError('');
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
        setEditorValue('');
        setCharacterCount(0);
        setEditingPost(null);
        setIsEditing(false);
        setEditSuccess('Post edited successfully');
        setIsEditingLoading(false);
      } else {
        const newPost = { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
        setPosts([...posts, newPost]);
        setValue('communityPosts', JSON.stringify([...posts, newPost]));
        setEditorValue('');
        setCharacterCount(0);
      }
    }
  };

  const handlePostEdit = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setIsEditing(true);
  };

  const handlePostReport = (post: any) => {
    setReportingPost(post);
    setIsReporting(true);
    setModalIsOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportReason && reportDescription) {
      setIsReportingLoading(true);
      const reportData = { post: reportingPost, reason: reportReason, description: reportDescription };
      axios.post('/api/report', reportData)
        .then((response) => {
          setReportSuccess('Report submitted successfully');
          setIsReportingLoading(false);
          setModalIsOpen(false);
        })
        .catch((error) => {
          setReportError('Error submitting report');
          setIsReportingLoading(false);
        });
    } else {
      setReportError('Please fill out all fields');
    }
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
          <p>Character count: {characterCount}/{characterLimit}</p>
          {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
          <button onClick={handlePostSubmit}>Submit</button>
          {isEditing && (
            <button onClick={() => {
              setEditingPost(null);
              setIsEditing(false);
              setEditorValue('');
              setCharacterCount(0);
            }}>Cancel Edit</button>
          )}
        </div>
      ) : (
        <p>Please log in to post</p>
      )}
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <p>{post.text}</p>
            <p>Author: {post.author}</p>
            <p>Timestamp: {post.timestamp}</p>
            {isLoggedIn && (
              <div>
                <button onClick={() => handlePostEdit(post)}>
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handlePostReport(post)}>
                  <FiFlag /> Report
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Report Post"
      >
        <h2>Report Post</h2>
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
          <button type="submit">Submit Report</button>
          {isReportingLoading && <p>Submitting report...</p>}
          {reportError && <p style={{ color: 'red' }}>{reportError}</p>}
        </form>
      </Modal>
    </div>
  );
}