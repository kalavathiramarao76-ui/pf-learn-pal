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
          if (post.text === editingPost.text) {
            return { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
          }
          return post;
        });
        setPosts(updatedPosts);
        setValue('communityPosts', JSON.stringify(updatedPosts));
        setIsEditing(false);
        setIsEditingLoading(false);
      } else {
        const newPost = { text: editorValue, timestamp: new Date().toISOString(), author: user?.username || 'Anonymous' };
        setPosts([newPost, ...posts]);
        setValue('communityPosts', JSON.stringify([newPost, ...posts]));
        setEditorValue('');
        setCharacterCount(0);
      }
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(e.target.value);
  };

  const handlePageChange = (pageNumber: number) => {
    setPageNumber(pageNumber);
  };

  const filteredPosts = posts.filter((post) => {
    if (filterBy === 'all') return true;
    if (filterBy === 'mine' && user) return post.author === user.username;
    return false;
  });

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortOrder === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return 0;
  });

  const paginatedPosts = sortedPosts.slice((pageNumber - 1) * postsPerPage, pageNumber * postsPerPage);

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
        />
        <button type="submit">Post</button>
      </form>
      <div>
        <select value={sortOrder} onChange={handleSortChange}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <select value={filterBy} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="mine">Mine</option>
        </select>
      </div>
      <div>
        {paginatedPosts.map((post, index) => (
          <div key={index}>
            <p>{post.text}</p>
            <p>Author: {post.author}</p>
            <p>Timestamp: {post.timestamp}</p>
          </div>
        ))}
      </div>
      <div>
        {Array(Math.ceil(sortedPosts.length / postsPerPage))
          .fill(null)
          .map((_, index) => (
            <button key={index} onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </button>
          ))}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Example Modal"
      >
        <h2>Report Post</h2>
        <form>
          <label>
            Reason:
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate</option>
            </select>
          </label>
          <label>
            Description:
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
          </label>
          <button type="submit">Report</button>
        </form>
      </Modal>
    </div>
  );
}