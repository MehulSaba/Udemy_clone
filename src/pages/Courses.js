import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import CourseCard from '../components/CourseCard';
import { supabase } from '../utils/supabaseClient';

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Courses
      </Typography>
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Courses; 