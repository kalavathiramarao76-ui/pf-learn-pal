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
import { Alert, AlertTitle, Box, Button, CircularProgress, Grid, Snackbar, Typography } from '@mui/material';

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
  const [openSnackbar, setOpenSnackbar] = useState(false);

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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        setIsEditingLoading(true);
        const response = await axios.put(`/api/posts/${editingPost.id}`, {
          title: editorValue.split('\n')[0],
          content: editorValue,
        });
        setSuccess('Post updated successfully');
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === editingPost.id ? response.data : post))
        );
      } else {
        const response = await axios.post('/api/posts', {
          title: editorValue.split('\n')[0],
          content: editorValue,
        });
        setSuccess('Post created successfully');
        setPosts((prevPosts) => [response.data, ...prevPosts]);
      }
      setEditorValue('');
      setCharacterCount(0);
      setIsEditing(false);
      setIsEditingLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsReportingLoading(true);
      const response = await axios.post('/api/reports', {
        postId: reportingPost.id,
        reason: reportReason,
        description: reportDescription,
      });
      setSuccess('Report submitted successfully');
      setReportingPost(null);
      setReportReason('');
      setReportDescription('');
      setIsReporting(false);
      setIsReportingLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditorValue(post.content);
    setCharacterCount(post.content.length);
    setIsEditing(true);
  };

  const handleReportPost = (post) => {
    setReportingPost(post);
    setIsReporting(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: 2 }}>
        Community
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box sx={{ marginBottom: 2 }}>
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
            <Box sx={{ marginTop: 1 }}>
              <Typography variant="body2" component="p">
                {characterCount} / {characterLimit}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePostSubmit}
              disabled={isEditingLoading || characterCount > characterLimit}
              startIcon={<AiOutlineMessage />}
            >
              {isEditing ? 'Update Post' : 'Create Post'}
            </Button>
          </Box>
          {filteredPosts.map((post) => (
            <Box key={post.id} sx={{ marginBottom: 2 }}>
              <Typography variant="h6" component="h2">
                {post.title}
              </Typography>
              <Typography variant="body1" component="p">
                {post.content}
              </Typography>
              <Box sx={{ marginTop: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEditPost(post)}
                  startIcon={<FaEdit />}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleReportPost(post)}
                  startIcon={<FiFlag />}
                >
                  Report
                </Button>
              </Box>
            </Box>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ marginBottom: 2 }}>
            <Autocomplete
              options={autocompleteOptions}
              value={searchQuery}
              onChange={(event, value) => setSearchQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSortOrder('newest')}
            >
              Newest
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSortOrder('oldest')}
            >
              Oldest
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Report Post"
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" component="h2">
            Report Post
          </Typography>
          <form onSubmit={handleReportSubmit}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Reason"
                variant="outlined"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                fullWidth
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                label="Description"
                variant="outlined"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isReportingLoading}
              startIcon={<FiFlag />}
            >
              {isReportingLoading ? (
                <CircularProgress size={20} />
              ) : (
                'Submit Report'
              )}
            </Button>
          </form>
        </Box>
      </Modal>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" variant="filled">
          <AlertTitle>Success</AlertTitle>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
      >
        <Alert severity="error" variant="filled">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}