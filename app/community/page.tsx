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
    });

    const filteredBy = sorted.filter((post) => {
      if (filterBy === 'all') {
        return true;
      } else if (filterBy === 'mine') {
        return post.author.id === user?.id;
      }
    });

    setFilteredPosts(filteredBy);
  }, [posts, searchQuery, sortOrder, filterBy, user]);

  const handleScroll = () => {
    const scrollHeight = document.body.scrollHeight;
    const scrollTop = document.body.scrollTop;
    const clientHeight = document.body.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight * 0.9 && !loadingMorePosts && hasMorePosts) {
      loadMorePosts();
    }
  };

  const loadMorePosts = async () => {
    setLoadingMorePosts(true);
    try {
      const response = await axios.get('/api/posts', {
        params: {
          pageNumber: pageNumber + 1,
          postsPerPage,
          lastPostId,
        },
      });
      const newPosts = response.data;
      setPosts([...posts, ...newPosts]);
      setPageNumber(pageNumber + 1);
      setLastPostId(newPosts[newPosts.length - 1].id);
      if (newPosts.length < postsPerPage) {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMorePosts(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMorePosts, hasMorePosts]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Community</Typography>
        </Grid>
        <Grid item xs={12}>
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
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setModalIsOpen(true)}
          >
            Create Post
          </Button>
        </Grid>
        <Grid item xs={12}>
          {filteredPosts.map((post) => (
            <Box key={post.id} mb={2}>
              <Typography variant="h6">{post.title}</Typography>
              <Typography variant="body1">{post.content}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setEditingPost(post);
                  setModalIsOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setReportingPost(post);
                  setModalIsOpen(true);
                }}
              >
                Report
              </Button>
            </Box>
          ))}
          {loadingMorePosts && (
            <CircularProgress />
          )}
          {!hasMorePosts && (
            <Typography variant="body1">No more posts</Typography>
          )}
        </Grid>
      </Grid>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          content: {
            width: '80%',
            height: '80%',
            margin: '40px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
          },
        }}
      >
        {isEditing ? (
          <Box>
            <Typography variant="h6">Edit Post</Typography>
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
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                setIsEditingLoading(true);
                try {
                  const response = await axios.put(`/api/posts/${editingPost.id}`, {
                    title: editorValue.split('\n')[0],
                    content: editorValue,
                  });
                  setPosts(
                    posts.map((post) =>
                      post.id === editingPost.id ? response.data : post
                    )
                  );
                  setSuccess('Post updated successfully');
                } catch (error) {
                  setError('Error updating post');
                } finally {
                  setIsEditingLoading(false);
                  setModalIsOpen(false);
                }
              }}
            >
              {isEditingLoading ? <CircularProgress /> : 'Update Post'}
            </Button>
          </Box>
        ) : isReporting ? (
          <Box>
            <Typography variant="h6">Report Post</Typography>
            <TextField
              label="Reason"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Description"
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                setIsReportingLoading(true);
                try {
                  const response = await axios.post('/api/reports', {
                    postId: reportingPost.id,
                    reason: reportReason,
                    description: reportDescription,
                  });
                  setSuccess('Post reported successfully');
                } catch (error) {
                  setError('Error reporting post');
                } finally {
                  setIsReportingLoading(false);
                  setModalIsOpen(false);
                }
              }}
            >
              {isReportingLoading ? <CircularProgress /> : 'Report Post'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6">Create Post</Typography>
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
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                try {
                  const response = await axios.post('/api/posts', {
                    title: editorValue.split('\n')[0],
                    content: editorValue,
                  });
                  setPosts([...posts, response.data]);
                  setSuccess('Post created successfully');
                } catch (error) {
                  setError('Error creating post');
                } finally {
                  setModalIsOpen(false);
                }
              }}
            >
              Create Post
            </Button>
          </Box>
        )}
      </Modal>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
      >
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}