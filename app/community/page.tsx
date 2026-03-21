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
        const newPost = { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
        setPosts([...posts, newPost]);
        setValue('communityPosts', JSON.stringify([...posts, newPost]));
        setEditorValue('');
        setCharacterCount(0);
      }
      setIsEditingLoading(false);
    } else {
      setEditError('Post exceeds character limit!');
      setTimeout(() => setEditError(''), 3000);
    }
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportReason && reportDescription) {
      setIsReportingLoading(true);
      const reportedPost = { text: reportingPost.text, reason: reportReason, description: reportDescription };
      axios.post('/api/report-post', reportedPost)
        .then((response) => {
          setReportSuccess('Post reported successfully!');
          setTimeout(() => setReportSuccess(''), 3000);
        })
        .catch((error) => {
          setReportError('Failed to report post!');
          setTimeout(() => setReportError(''), 3000);
        })
        .finally(() => {
          setIsReportingLoading(false);
          setReportingPost(null);
          setReportReason('');
          setReportDescription('');
          setIsReporting(false);
        });
    } else {
      setReportError('Please fill out all fields!');
      setTimeout(() => setReportError(''), 3000);
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
    setEditingPost(null);
    setEditorValue('');
    setIsEditing(false);
  };

  const handleCancelReport = () => {
    setReportingPost(null);
    setReportReason('');
    setReportDescription('');
    setIsReporting(false);
    setModalIsOpen(false);
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
          {isEditing ? (
            <button onClick={handlePostSubmit} disabled={isEditingLoading}>
              {isEditingLoading ? 'Editing...' : 'Save Changes'}
            </button>
          ) : (
            <button onClick={handlePostSubmit} disabled={isEditingLoading}>
              {isEditingLoading ? 'Posting...' : 'Post'}
            </button>
          )}
          {editError && <p style={{ color: 'red' }}>{editError}</p>}
          {editSuccess && <p style={{ color: 'green' }}>{editSuccess}</p>}
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
            {isLoggedIn ? (
              <div>
                <button onClick={() => handleEditPost(post)}>
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleReportPost(post)}>
                  <FiFlag /> Report
                </button>
              </div>
            ) : (
              <p>Please log in to interact with posts.</p>
            )}
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
          <label>Reason:</label>
          <input type="text" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
          <label>Description:</label>
          <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
          {isReportingLoading ? (
            <button disabled>Reporting...</button>
          ) : (
            <button type="submit">Report</button>
          )}
          <button type="button" onClick={handleCancelReport}>
            Cancel
          </button>
        </form>
        {reportError && <p style={{ color: 'red' }}>{reportError}</p>}
        {reportSuccess && <p style={{ color: 'green' }}>{reportSuccess}</p>}
      </Modal>
    </div>
  );
}