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
        setValue('communityPosts', JSON.stringify([...JSON.parse(getValue('communityPosts') || '[]'), newPost]));
        setEditorValue('');
        setCharacterCount(0);
      }
    }
  };

  const handlePostEdit = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setIsEditing(true);
  };

  const handlePostReport = (post: any) => {
    setReportingPost(post);
    setIsReporting(true);
    setModalIsOpen(true);
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
      // Send report to server
      axios.post('/api/reports', report)
        .then((response) => {
          setReportSuccess('Report submitted successfully!');
          setTimeout(() => setReportSuccess(''), 3000);
          setModalIsOpen(false);
          setIsReporting(false);
          setReportingPost(null);
          setReportReason('');
          setReportDescription('');
        })
        .catch((error) => {
          setReportError('Error submitting report');
          setTimeout(() => setReportError(''), 3000);
        })
        .finally(() => {
          setIsReportingLoading(false);
        });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredPosts = posts.filter((post) => post.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="community-page">
      <h1>Community Page</h1>
      {isLoggedIn ? (
        <div>
          <h2>Post something new:</h2>
          <form onSubmit={handlePostSubmit}>
            <ReactQuill
              value={editorValue}
              onChange={(value) => {
                setEditorValue(value);
                setCharacterCount(value.length);
              }}
              placeholder="Write something..."
            />
            <p>Characters left: {characterLimit - characterCount}</p>
            <button type="submit" disabled={isEditingLoading || characterCount > characterLimit}>
              {isEditing ? 'Edit Post' : 'Post'}
            </button>
          </form>
        </div>
      ) : (
        <p>Please log in to post.</p>
      )}
      <h2>Community Posts:</h2>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search posts..."
      />
      {filteredPosts.map((post, index) => (
        <div key={index} className="post">
          <p>{post.text}</p>
          <p>Posted by {post.author} on {new Date(post.timestamp).toLocaleString()}</p>
          {isLoggedIn && (
            <div>
              <button onClick={() => handlePostEdit(post)}>
                <FaEdit /> Edit
              </button>
              <button onClick={() => handlePostReport(post)}>
                <FiFlag /> Report
              </button>
            </div>
          )}
        </div>
      ))}
      {modalIsOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Report Post"
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
              {isReportingLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </Modal>
      )}
      {editError && <p style={{ color: 'red' }}>{editError}</p>}
      {editSuccess && <p style={{ color: 'green' }}>{editSuccess}</p>}
      {reportError && <p style={{ color: 'red' }}>{reportError}</p>}
      {reportSuccess && <p style={{ color: 'green' }}>{reportSuccess}</p>}
    </div>
  );
}