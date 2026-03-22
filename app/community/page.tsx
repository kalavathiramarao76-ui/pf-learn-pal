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
        const newPost = {
          text: editorValue,
          timestamp: new Date().toISOString(),
          author: user?.username || 'Anonymous',
        };
        setPosts((prevPosts) => [...prevPosts, newPost]);
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
      const report = {
        post: reportingPost,
        reason: reportReason,
        description: reportDescription,
      };
      axios.post('/api/reports', report)
        .then((response) => {
          setReportSuccess('Report submitted successfully!');
          setTimeout(() => setReportSuccess(''), 3000);
          setReportingPost(null);
          setReportReason('');
          setReportDescription('');
          setIsReporting(false);
        })
        .catch((error) => {
          setReportError('Error submitting report!');
          setTimeout(() => setReportError(''), 3000);
        })
        .finally(() => {
          setIsReportingLoading(false);
        });
    } else {
      setReportError('Please fill out all fields!');
      setTimeout(() => setReportError(''), 3000);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setCharacterCount(post.text.length);
    setIsEditing(true);
  };

  const handleReportPost = (post: any) => {
    setReportingPost(post);
    setIsReporting(true);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditorValue('');
    setCharacterCount(0);
    setIsEditing(false);
  };

  const handleCancelReport = () => {
    setReportingPost(null);
    setReportReason('');
    setReportDescription('');
    setIsReporting(false);
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
          {isEditing ? (
            <button onClick={handlePostSubmit}>Edit Post</button>
          ) : (
            <button onClick={handlePostSubmit}>Create Post</button>
          )}
          {editError && <p style={{ color: 'red' }}>{editError}</p>}
          {editSuccess && <p style={{ color: 'green' }}>{editSuccess}</p>}
        </div>
      ) : (
        <p>Please log in to create a post.</p>
      )}
      <h2>Posts:</h2>
      {posts.map((post) => (
        <div key={post.text}>
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
            <p>Please log in to edit or report posts.</p>
          )}
        </div>
      ))}
      {isEditing && (
        <Modal
          isOpen={true}
          onRequestClose={handleCancelEdit}
          contentLabel="Edit Post"
        >
          <h2>Edit Post</h2>
          <ReactQuill
            value={editorValue}
            onChange={(value) => {
              setEditorValue(value);
              setCharacterCount(value.length);
            }}
            placeholder="Write your post here..."
          />
          <p>Character count: {characterCount}/{characterLimit}</p>
          <button onClick={handlePostSubmit}>Edit Post</button>
          <button onClick={handleCancelEdit}>Cancel</button>
          {editError && <p style={{ color: 'red' }}>{editError}</p>}
          {editSuccess && <p style={{ color: 'green' }}>{editSuccess}</p>}
        </Modal>
      )}
      {isReporting && (
        <Modal
          isOpen={true}
          onRequestClose={handleCancelReport}
          contentLabel="Report Post"
        >
          <h2>Report Post</h2>
          <form onSubmit={handleReportSubmit}>
            <label>Reason for reporting:</label>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
            <label>Description:</label>
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
            <button type="submit">Report Post</button>
            <button onClick={handleCancelReport}>Cancel</button>
            {reportError && <p style={{ color: 'red' }}>{reportError}</p>}
            {reportSuccess && <p style={{ color: 'green' }}>{reportSuccess}</p>}
          </form>
        </Modal>
      )}
    </div>
  );
}