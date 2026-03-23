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
        setIsEditing(false);
        setIsEditingLoading(false);
      } else {
        const newPost = {
          id: Date.now(),
          content: editorValue,
          author: user,
          createdAt: new Date(),
        };
        setPosts([newPost, ...posts]);
        setEditorValue('');
        setCharacterCount(0);
      }
    }
  };

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateReport()) {
      setIsReportingLoading(true);
      // Report post logic here
      setIsReportingLoading(false);
      setIsReporting(false);
    }
  };

  const handleLoadMorePosts = () => {
    if (hasMorePosts && !loadingMorePosts) {
      setLoadingMorePosts(true);
      axios
        .get('/api/posts', {
          params: {
            page: pageNumber + 1,
            limit: postsPerPage,
            sort: sortOrder,
            filter: filterBy,
          },
        })
        .then((response) => {
          const newPosts = response.data;
          setPosts([...posts, ...newPosts]);
          setPageNumber(pageNumber + 1);
          setHasMorePosts(newPosts.length === postsPerPage);
          setLoadingMorePosts(false);
        })
        .catch((error) => {
          console.error(error);
          setLoadingMorePosts(false);
        });
    }
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.body.offsetHeight;
    if (scrollPosition >= documentHeight * 0.9 && hasMorePosts) {
      handleLoadMorePosts();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMorePosts]);

  return (
    <div>
      <h1>Community Page</h1>
      <div>
        <ReactQuill
          value={editorValue}
          onChange={(value) => {
            setEditorValue(value);
            setCharacterCount(value.length);
          }}
          placeholder="Write a post..."
        />
        <button onClick={handlePostSubmit}>Post</button>
      </div>
      <div>
        {posts.map((post) => (
          <div key={post.id}>
            <p>{post.content}</p>
            <p>Author: {post.author}</p>
            <p>Created At: {post.createdAt}</p>
            <button onClick={() => setEditingPost(post)}>Edit</button>
            <button onClick={() => setReportingPost(post)}>Report</button>
          </div>
        ))}
      </div>
      {isEditing && (
        <Modal
          isOpen={true}
          onRequestClose={() => setIsEditing(false)}
        >
          <h2>Edit Post</h2>
          <ReactQuill
            value={editorValue}
            onChange={(value) => setEditorValue(value)}
          />
          <button onClick={handlePostSubmit}>Save Changes</button>
        </Modal>
      )}
      {isReporting && (
        <Modal
          isOpen={true}
          onRequestClose={() => setIsReporting(false)}
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
                <option value="inappropriate">Inappropriate</option>
              </select>
            </label>
            <label>
              Description:
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </label>
            <button type="submit">Report</button>
          </form>
        </Modal>
      )}
      {loadingMorePosts && <p>Loading more posts...</p>}
    </div>
  );
}