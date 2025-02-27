import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Card, CardContent, 
  Rating, TextField, Button, Grid, Box 
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';

function Feedback() {
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_progress')
        .select(`
          courses (*),
          course_reviews (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCourses(data || []);
      
      // Initialize reviews state
      const reviewsState = {};
      data.forEach(course => {
        reviewsState[course.courses.id] = {
          rating: course.course_reviews[0]?.rating || 0,
          review: course.course_reviews[0]?.review_text || ''
        };
      });
      setReviews(reviewsState);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const submitReview = async (courseId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const review = reviews[courseId];

      const { error } = await supabase
        .from('course_reviews')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          rating: review.rating,
          review_text: review.review
        });

      if (error) throw error;
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Course Feedback
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} key={course.courses.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.courses.title}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={reviews[course.courses.id]?.rating || 0}
                    onChange={(event, newValue) => {
                      setReviews(prev => ({
                        ...prev,
                        [course.courses.id]: {
                          ...prev[course.courses.id],
                          rating: newValue
                        }
                      }));
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Review"
                  value={reviews[course.courses.id]?.review || ''}
                  onChange={(e) => {
                    setReviews(prev => ({
                      ...prev,
                      [course.courses.id]: {
                        ...prev[course.courses.id],
                        review: e.target.value
                      }
                    }));
                  }}
                  sx={{ mb: 2 }}
                />

                <Button 
                  variant="contained"
                  onClick={() => submitReview(course.courses.id)}
                >
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Feedback; 