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
  const [filteredPosts, setFilteredPosts] = useState([]);

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
      } else {
        return 0;
      }
    });
    const filteredBy = sorted.filter((post) => {
      if (filterBy === 'all') {
        return true;
      } else if (filterBy === 'mine') {
        return post.author.id === user?.id;
      } else {
        return post.category === filterBy;
      }
    });
    setFilteredPosts(filteredBy);
  }, [posts, searchQuery, sortOrder, filterBy]);

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
      } else {
        const newPost = {
          id: Math.random().toString(36).substr(2, 9),
          title: '',
          content: editorValue,
          author: user,
          createdAt: new Date(),
        };
        setPosts((prevPosts) => [...prevPosts, newPost]);
        setEditorValue('');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(e.target.value);
  };

  const handleLoadMore = () => {
    setLoadingMorePosts(true);
    setPageNumber((prevPage) => prevPage + 1);
    setLoadingMorePosts(false);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search posts"
      />
      <select value={sortOrder} onChange={handleSort}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <select value={filterBy} onChange={handleFilter}>
        <option value="all">All</option>
        <option value="mine">My posts</option>
        <option value="category1">Category 1</option>
        <option value="category2">Category 2</option>
      </select>
      <button onClick={handleLoadMore}>Load more</button>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Author: {post.author.name}</p>
          <p>Created at: {post.createdAt}</p>
        </div>
      ))}
      {loadingMorePosts && <p>Loading more posts...</p>}
      {hasMorePosts && <p>No more posts to load.</p>}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <form onSubmit={handlePostSubmit}>
          <ReactQuill
            value={editorValue}
            onChange={setEditorValue}
            placeholder="Write a post"
          />
          <button type="submit">Submit</button>
        </form>
      </Modal>
    </div>
  );
}