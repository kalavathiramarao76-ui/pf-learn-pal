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
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

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
      setError('Post exceeds character limit of 200 characters');
      return false;
    }
    if (post.trim() === '') {
      setError('Post cannot be empty');
      return false;
    }
    setError('');
    return true;
  };

  const validateReport = () => {
    if (reportReason.trim() === '') {
      setError('Please select a report reason');
      return false;
    }
    if (reportDescription.trim() === '') {
      setError('Please provide a report description');
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
          if (post.id === editingPost.id) {
            return { ...post, content: editorValue };
          }
          return post;
        });
        setPosts(updatedPosts);
        setIsEditingLoading(false);
        setIsEditing(false);
        setSuccess('Post updated successfully');
      } else {
        const newPost = {
          id: Date.now(),
          content: editorValue,
          author: user,
        };
        setPosts([newPost, ...posts]);
        setEditorValue('');
        setCharacterCount(0);
        setSuccess('Post created successfully');
      }
    }
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateReport()) {
      setIsReportingLoading(true);
      const reportData = {
        postId: reportingPost.id,
        reason: reportReason,
        description: reportDescription,
      };
      axios.post('/api/reports', reportData)
        .then((response) => {
          setIsReportingLoading(false);
          setIsReporting(false);
          setSuccess('Report submitted successfully');
        })
        .catch((error) => {
          setIsReportingLoading(false);
          setError('Error submitting report');
        });
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.content);
    setIsEditing(true);
  };

  const handleReportPost = (post: any) => {
    setReportingPost(post);
    setIsReporting(true);
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
  };

  return (
    <div>
      <h1>Community Page</h1>
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
          <p>Character count: {characterCount} / {characterLimit}</p>
          <button type="submit" disabled={isEditingLoading}>
            {isEditingLoading ? 'Posting...' : 'Post'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </form>
      )}
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.content}</p>
          <p>Author: {post.author}</p>
          <button onClick={() => handleEditPost(post)}>
            <FaEdit /> Edit
          </button>
          <button onClick={() => handleReportPost(post)}>
            <FiFlag /> Report
          </button>
        </div>
      ))}
      {isEditing && (
        <Modal
          isOpen={true}
          onRequestClose={handleCancelEdit}
          contentLabel="Edit Post"
        >
          <h2>Edit Post</h2>
          <form onSubmit={handlePostSubmit}>
            <ReactQuill
              value={editorValue}
              onChange={(value) => {
                setEditorValue(value);
                setCharacterCount(value.length);
              }}
              placeholder="Write a post..."
            />
            <p>Character count: {characterCount} / {characterLimit}</p>
            <button type="submit" disabled={isEditingLoading}>
              {isEditingLoading ? 'Updating...' : 'Update'}
            </button>
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </form>
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
            <label>
              Reason:
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Description:
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </label>
            <button type="submit" disabled={isReportingLoading}>
              {isReportingLoading ? 'Reporting...' : 'Report'}
            </button>
            <button type="button" onClick={handleCancelReport}>
              Cancel
            </button>
          </form>
        </Modal>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}