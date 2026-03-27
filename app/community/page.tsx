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
    setModalIsOpen(true);
    setIsEditing(true);
  };

  const handleReportPost = (post) => {
    setReportingPost(post);
    setModalIsOpen(true);
    setIsReporting(true);
  };

  const handleSaveEditedPost = async () => {
    if (isEditingLoading) return;
    setIsEditingLoading(true);
    try {
      const updatedPost = {
        ...editingPost,
        content: editorValue,
      };
      const response = await axios.put(`/api/posts/${editingPost.id}`, updatedPost);
      const updatedPosts = posts.map((post) => (post.id === editingPost.id ? response.data : post));
      setPosts(updatedPosts);
      setSuccess('Post updated successfully');
    } catch (error) {
      setError('Failed to update post');
    } finally {
      setIsEditingLoading(false);
      setModalIsOpen(false);
      setIsEditing(false);
    }
  };

  const handleReportPostSubmit = async () => {
    if (isReportingLoading) return;
    setIsReportingLoading(true);
    try {
      const reportData = {
        postId: reportingPost.id,
        reason: reportReason,
        description: reportDescription,
      };
      const response = await axios.post('/api/reports', reportData);
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
        {filteredPosts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <button onClick={() => handleEditPost(post)}>
              <FaEdit /> Edit
            </button>
            <button onClick={() => handleReportPost(post)}>
              <FiFlag /> Report
            </button>
          </div>
        ))}
      </div>
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
              onChange={(value) => setEditorValue(value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ header: 1 }, { header: 2 }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ direction: 'rtl' }],
                  [{ font: [] }],
                  [{ align: [] }],
                  ['clean'],
                ],
              }}
            />
            <button onClick={handleSaveEditedPost} disabled={isEditingLoading}>
              {isEditingLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : isReporting ? (
          <div>
            <h2>Report Post</h2>
            <Autocomplete
              options={['Spam', 'Inappropriate content', 'Other']}
              value={reportReason}
              onChange={(event, value) => setReportReason(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Reason"
                  fullWidth
                />
              )}
            />
            <TextField
              label="Description"
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <button onClick={handleReportPostSubmit} disabled={isReportingLoading}>
              {isReportingLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}