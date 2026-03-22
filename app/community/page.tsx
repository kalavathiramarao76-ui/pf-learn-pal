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

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editorValue.length <= characterLimit) {
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
        setEditSuccess('Post edited successfully!');
        setTimeout(() => setEditSuccess(''), 3000);
      } else {
        setPosts([...posts, { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }]);
        setValue('communityPosts', JSON.stringify([...posts, { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' }]));
        setEditorValue('');
        setCharacterCount(0);
      }
      setIsEditingLoading(false);
    } else {
      setValidationError('Post exceeds character limit');
      setTimeout(() => setValidationError(''), 3000);
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
      // Send report to server
      axios.post('/api/report', {
        post: reportingPost,
        reason: reportReason,
        description: reportDescription,
      })
      .then((response) => {
        setReportSuccess('Report submitted successfully!');
        setTimeout(() => setReportSuccess(''), 3000);
        setModalIsOpen(false);
        setIsReporting(false);
      })
      .catch((error) => {
        setReportError('Error submitting report');
        setTimeout(() => setReportError(''), 3000);
      })
      .finally(() => {
        setIsReportingLoading(false);
      });
    } else {
      setValidationError('Please fill out all fields');
      setTimeout(() => setValidationError(''), 3000);
    }
  };

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    setCharacterCount(value.length);
    if (value.length > characterLimit) {
      setValidationError('Post exceeds character limit');
    } else {
      setValidationError('');
    }
  };

  return (
    <div>
      <h1>Community Page</h1>
      {isLoggedIn ? (
        <div>
          <ReactQuill
            value={editorValue}
            onChange={handleEditorChange}
            placeholder="Write a post..."
          />
          <p>Character count: {characterCount}/{characterLimit}</p>
          {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
          <button onClick={handlePostSubmit}>Post</button>
          {isEditing && (
            <button onClick={() => setIsEditing(false)}>Cancel</button>
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
            <button onClick={() => handlePostEdit(post)}>
              <FaEdit /> Edit
            </button>
            <button onClick={() => handlePostReport(post)}>
              <FiFlag /> Report
            </button>
          </li>
        ))}
      </ul>
      {modalIsOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
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
          </form>
          {reportError && <p style={{ color: 'red' }}>{reportError}</p>}
          {reportSuccess && <p style={{ color: 'green' }}>{reportSuccess}</p>}
        </Modal>
      )}
    </div>
  );
}