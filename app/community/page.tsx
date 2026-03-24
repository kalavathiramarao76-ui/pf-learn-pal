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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

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
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [lastPostId, setLastPostId] = useState(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  useEffect(() => {
    const filtered = posts.filter((post) => {
      const query = searchQuery.toLowerCase();
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      return (
        title.includes(query) ||
        content.includes(query) ||
        query === ''
      );
    });
    const sorted = filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
    setFilteredPosts(sorted);
  }, [posts, searchQuery, sortOrder]);

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  const handleReportPost = (post) => {
    setReportingPost(post);
    setIsReporting(true);
    setModalIsOpen(true);
  };

  const handleSaveEdit = async () => {
    if (isEditingLoading) return;
    setIsEditingLoading(true);
    try {
      const updatedPost = {
        ...editingPost,
        title: editorValue.substring(0, characterLimit),
        content: editorValue,
      };
      const response = await axios.put(`/api/posts/${editingPost.id}`, updatedPost);
      setPosts(
        posts.map((post) => (post.id === editingPost.id ? response.data : post))
      );
      setSuccess('Post updated successfully');
    } catch (error) {
      setError('Failed to update post');
    } finally {
      setIsEditingLoading(false);
      setModalIsOpen(false);
      setIsEditing(false);
    }
  };

  const handleReport = async () => {
    if (isReportingLoading) return;
    setIsReportingLoading(true);
    try {
      const report = {
        postId: reportingPost.id,
        reason: reportReason,
        description: reportDescription,
      };
      const response = await axios.post('/api/reports', report);
      setSuccess('Report submitted successfully');
    } catch (error) {
      setError('Failed to submit report');
    } finally {
      setIsReportingLoading(false);
      setModalIsOpen(false);
      setIsReporting(false);
    }
  };

  return (
    <div>
      <h1>Community Page</h1>
      <div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts"
        />
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
          <option value="all">All</option>
          <option value="mine">Mine</option>
        </select>
      </div>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <div>
              <button onClick={() => handleEditPost(post)}>
                <FaEdit /> Edit
              </button>
              <button onClick={() => handleReportPost(post)}>
                <FiFlag /> Report
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Edit Post"
      >
        {isEditing ? (
          <div>
            <h2>Edit Post</h2>
            <ReactQuill
              value={editorValue}
              onChange={(value) => {
                setEditorValue(value);
                setCharacterCount(value.length);
              }}
            />
            <p>Character Count: {characterCount}</p>
            <button onClick={handleSaveEdit} disabled={isEditingLoading}>
              {isEditingLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : isReporting ? (
          <div>
            <h2>Report Post</h2>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate</option>
            </select>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe the issue"
            />
            <button onClick={handleReport} disabled={isReportingLoading}>
              {isReportingLoading ? 'Reporting...' : 'Report'}
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}