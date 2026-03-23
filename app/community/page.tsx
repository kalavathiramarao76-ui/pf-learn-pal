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
        setCharacterCount(0);
        setSuccess('Post created successfully');
      }
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
    setModalIsOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportReason && reportDescription) {
      setIsReportingLoading(true);
      // Report post logic here
      setReportingPost(null);
      setReportReason('');
      setReportDescription('');
      setIsReporting(false);
      setModalIsOpen(false);
      setSuccess('Post reported successfully');
      setIsReportingLoading(false);
    } else {
      setError('Please fill out all fields');
    }
  };

  return (
    <div>
      <h1>Community Page</h1>
      {user && (
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
              {isEditingLoading ? 'Editing...' : 'Edit Post'}
            </button>
          ) : (
            <button onClick={handlePostSubmit} disabled={isEditingLoading}>
              {isEditingLoading ? 'Creating...' : 'Create Post'}
            </button>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
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
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Report Post Modal"
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
          <button type="submit" disabled={isReportingLoading}>
            {isReportingLoading ? 'Reporting...' : 'Report'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </Modal>
    </div>
  );
}