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
          author: user?.name,
          timestamp: new Date().toISOString(),
        };
        setPosts((prevPosts) => [newPost, ...prevPosts]);
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
    setCharacterCount(0);
  };

  const handleCancelReport = () => {
    setIsReporting(false);
    setReportingPost(null);
    setReportReason('');
    setReportDescription('');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filteredPosts = posts.filter((post) => {
      return post.content.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setPosts(filteredPosts);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOrder = e.target.value;
    setSortOrder(sortOrder);
    const sortedPosts = posts.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else {
        return 0;
      }
    });
    setPosts(sortedPosts);
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterBy = e.target.value;
    setFilterBy(filterBy);
    const filteredPosts = posts.filter((post) => {
      if (filterBy === 'all') {
        return true;
      } else if (filterBy === 'myPosts') {
        return post.author === user?.name;
      } else {
        return false;
      }
    });
    setPosts(filteredPosts);
  };

  const handleLoadMore = () => {
    setLoadingMorePosts(true);
    axios.get('/api/posts', {
      params: {
        pageNumber: pageNumber + 1,
        postsPerPage: postsPerPage,
      },
    })
      .then((response) => {
        const newPosts = response.data;
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setPageNumber(pageNumber + 1);
        setLoadingMorePosts(false);
        if (newPosts.length < postsPerPage) {
          setHasMorePosts(false);
        }
      })
      .catch((error) => {
        setLoadingMorePosts(false);
        setError('Error loading more posts');
      });
  };

  return (
    <div>
      <h1>Community Page</h1>
      <form onSubmit={handlePostSubmit}>
        <ReactQuill
          value={editorValue}
          onChange={(value) => {
            setEditorValue(value);
            setCharacterCount(value.length);
          }}
          placeholder="Write a post..."
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
        <p>Character count: {characterCount} / {characterLimit}</p>
        <button type="submit" disabled={isEditingLoading}>
          {isEditing ? 'Update Post' : 'Create Post'}
        </button>
        {isEditing && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <h2>Posts</h2>
      <form onSubmit={handleSearch}>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts..."
        />
        <button type="submit">Search</button>
      </form>
      <select value={sortOrder} onChange={handleSort}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <select value={filterBy} onChange={handleFilter}>
        <option value="all">All Posts</option>
        <option value="myPosts">My Posts</option>
      </select>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <p>{post.content}</p>
            <p>Author: {post.author}</p>
            <p>Timestamp: {new Date(post.timestamp).toLocaleString()}</p>
            <button onClick={() => handleEditPost(post)}>
              <FaEdit /> Edit
            </button>
            <button onClick={() => handleReportPost(post)}>
              <FiFlag /> Report
            </button>
          </li>
        ))}
      </ul>
      {hasMorePosts && (
        <button onClick={handleLoadMore} disabled={loadingMorePosts}>
          {loadingMorePosts ? 'Loading...' : 'Load More'}
        </button>
      )}
      {isReporting && (
        <Modal
          isOpen={true}
          onRequestClose={handleCancelReport}
          contentLabel="Report Post"
        >
          <h2>Report Post</h2>
          <form onSubmit={handleReportSubmit}>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe the issue..."
            />
            <button type="submit" disabled={isReportingLoading}>
              {isReportingLoading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button type="button" onClick={handleCancelReport}>
              Cancel
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}