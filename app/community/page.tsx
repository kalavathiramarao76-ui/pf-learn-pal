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
      } else if (sortOrder === 'most-liked') {
        return b.likes - a.likes;
      } else if (sortOrder === 'least-liked') {
        return a.likes - b.likes;
      }
    });

    const filteredByCategory = sorted.filter((post) => {
      if (filterBy === 'all') {
        return true;
      } else if (filterBy === post.category) {
        return true;
      } else {
        return false;
      }
    });

    setFilteredPosts(filteredByCategory);
  }, [posts, searchQuery, sortOrder, filterBy]);

  const handleFilterChange = (event, value) => {
    setFilterBy(value);
  };

  const handleSortChange = (event, value) => {
    setSortOrder(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <div>
        <Autocomplete
          options={['all', 'category1', 'category2', 'category3']}
          value={filterBy}
          onChange={handleFilterChange}
          renderInput={(params) => (
            <TextField {...params} label="Filter by category" />
          )}
        />
        <Autocomplete
          options={['newest', 'oldest', 'most-liked', 'least-liked']}
          value={sortOrder}
          onChange={handleSortChange}
          renderInput={(params) => (
            <TextField {...params} label="Sort by" />
          )}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search posts"
        />
      </div>
      <div>
        {filteredPosts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}