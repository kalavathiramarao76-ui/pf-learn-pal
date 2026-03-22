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
      }
    }
  };

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    setCharacterCount(value.length);
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorValue(post.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditorValue('');
    setIsEditing(false);
  };

  return (
    <div>
      <h1>Community Page</h1>
      {isLoggedIn ? (
        <div>
          <form onSubmit={handlePostSubmit}>
            <ReactQuill
              value={editorValue}
              onChange={handleEditorChange}
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
            <p>Character count: {characterCount}/{characterLimit}</p>
            <button type="submit" disabled={isEditingLoading}>
              {isEditingLoading ? 'Editing...' : 'Post'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </form>
          {editError && <p style={{ color: 'red' }}>{editError}</p>}
          {editSuccess && <p style={{ color: 'green' }}>{editSuccess}</p>}
        </div>
      ) : (
        <p>Please log in to post.</p>
      )}
      <h2>Posts</h2>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <p>{post.text}</p>
            <p>Posted by {post.author} at {post.timestamp}</p>
            {isLoggedIn && (
              <button onClick={() => handleEditPost(post)}>
                <FaEdit /> Edit
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}