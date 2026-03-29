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
      }
      return false;
    });

    setFilteredPosts(filteredByCategory);
  }, [posts, searchQuery, sortOrder, filterBy]);

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleFilterByChange = (event) => {
    setFilterBy(event.target.value);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              onClick={() => setSortOrder('newest')}
              sx={{ marginRight: 1 }}
            >
              Newest
            </Button>
            <Button
              variant="contained"
              onClick={() => setSortOrder('oldest')}
              sx={{ marginRight: 1 }}
            >
              Oldest
            </Button>
            <Button
              variant="contained"
              onClick={() => setSortOrder('most-liked')}
              sx={{ marginRight: 1 }}
            >
              Most Liked
            </Button>
            <Button
              variant="contained"
              onClick={() => setSortOrder('least-liked')}
              sx={{ marginRight: 1 }}
            >
              Least Liked
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
            <Button
              variant="contained"
              onClick={() => setFilterBy('all')}
              sx={{ marginRight: 1 }}
            >
              All
            </Button>
            <Button
              variant="contained"
              onClick={() => setFilterBy('category1')}
              sx={{ marginRight: 1 }}
            >
              Category 1
            </Button>
            <Button
              variant="contained"
              onClick={() => setFilterBy('category2')}
              sx={{ marginRight: 1 }}
            >
              Category 2
            </Button>
          </Box>
        </Grid>
      </Grid>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <Typography variant="h6">{post.title}</Typography>
          <Typography variant="body1">{post.content}</Typography>
        </div>
      ))}
      {loadingMorePosts && <CircularProgress />}
      {hasMorePosts && (
        <Button
          variant="contained"
          onClick={() => {
            setPageNumber(pageNumber + 1);
            setLoadingMorePosts(true);
          }}
        >
          Load More
        </Button>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          <AlertTitle>Success</AlertTitle>
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
}