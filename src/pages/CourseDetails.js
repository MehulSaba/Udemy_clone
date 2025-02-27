import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { supabase } from '../utils/supabaseClient';

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>;
  if (!course) return <Box sx={{ p: 4, textAlign: 'center' }}>Course not found</Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', p: 6, borderRadius: 2, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {course.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} readOnly />
              <Typography sx={{ ml: 1 }}>4.5 Course Rating</Typography>
            </Box>
            <Typography variant="body1">
              Category: {course.category}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box component="img"
                src={course.image_url}
                alt={course.title}
                sx={{ width: '100%', borderRadius: 1, mb: 2 }}
              />
              <Typography variant="h4" gutterBottom>
                ₹{course.price}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ mb: 2 }}
              >
                Add to Cart
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Course Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              What you'll learn
            </Typography>
            <Typography variant="body1" paragraph>
              {course.long_description}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Course Content
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PlayCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`${course.total_lectures} lectures`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={`${course.duration_hours} hours of content`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MenuBookIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Downloadable resources"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseDetails; 