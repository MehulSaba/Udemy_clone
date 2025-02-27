import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Tabs, 
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import CourseCard from '../components/CourseCard';
import { supabase } from '../utils/supabaseClient';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('courses')
        .select('*');
      
      if (category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error: supabaseError } = await query;
      
      if (supabaseError) throw supabaseError;

      console.log('Fetched courses:', data); // Debug log
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Programming', 'Web Development', 'Data Science'];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Learn Without Limits
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Start, switch, or advance your career with thousands of courses
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg">
        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={categories.indexOf(category)}
            onChange={(e, newValue) => setCategory(categories[newValue])}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((cat) => (
              <Tab 
                key={cat} 
                label={cat}
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                mb: 4
              }}
            >
              {category === 'All' ? 'All Courses' : `${category} Courses`}
            </Typography>

            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>

            {/* No Courses Message */}
            {courses.length === 0 && (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No courses found in this category.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default Home; 