import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  LinearProgress,
  Rating,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';

function Dashboard() {
  const [value, setValue] = useState(0);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetchUserCourses();
    fetchPurchases();
  }, []);

  const fetchUserCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_progress')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            long_description,
            image_url,
            total_lectures,
            duration_hours
          ),
          course_reviews (
            rating,
            review_text,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      console.log('Fetched courses:', data); // Debug log
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('purchases')
        .select()
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      console.log('Fetched purchases:', data); // Debug log
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('course_reviews')
        .upsert({
          user_id: user.id,
          course_id: selectedCourse.courses.id,
          rating: review.rating,
          review_text: review.comment
        });

      if (error) throw error;
      fetchUserCourses();
      setOpenDialog(false);
      setReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const updateProgress = async (courseId, newProgress) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('course_progress')
        .update({ 
          progress_percentage: newProgress,
          completed_lectures: Math.floor(newProgress / 100 * courses.find(c => c.course_id === courseId).courses.total_lectures)
        })
        .match({ user_id: user.id, course_id: courseId });

      if (error) throw error;
      fetchUserCourses();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const renderMyCourses = () => (
    <Grid container spacing={4}>
      {courses.map((course) => (
        <Grid item xs={12} md={6} key={course.course_id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={() => handleCourseClick(course)}
          >
            {course.courses?.image_url && (
              <Box 
                component="img"
                src={course.courses.image_url}
                alt={course.courses.title}
                sx={{ 
                  width: '100%',
                  height: 200,
                  objectFit: 'cover'
                }}
              />
            )}
            <CardContent sx={{ flex: 1, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {course.courses?.title}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress: {course.progress_percentage}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={course.progress_percentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {course.completed_lectures} of {course.courses?.total_lectures} lectures completed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Purchased: {new Date(course.purchase_date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              bgcolor: 'primary.main', 
              color: 'white',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome to Your Learning Dashboard
            </Typography>
            <Typography variant="subtitle1">
              Track your progress, manage your courses, and provide feedback
            </Typography>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            mb: 4
          }}>
            <Tabs 
              value={value} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  py: 2
                }
              }}
            >
              <Tab label="My Courses" />
              <Tab label="Progress" />
              <Tab label="Feedback" />
              <Tab label="Purchase History" />
            </Tabs>
          </Box>
        </Grid>

        {/* Content Section */}
        <Grid item xs={12}>
          {value === 0 && renderMyCourses()}

          {value === 1 && (
            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} key={course.course_id}>
                  <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      {course.courses.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={course.progress_percentage} 
                        sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 45 }}>
                        {course.progress_percentage}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      Completed {course.completed_lectures} of {course.courses.total_lectures} lectures
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => updateProgress(course.course_id, Math.min(course.progress_percentage + 10, 100))}
                      sx={{ mt: 2 }}
                    >
                      Mark Next Lecture Complete
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {value === 2 && (
            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} key={course.course_id}>
                  <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      {course.courses.title}
                    </Typography>
                    <Rating 
                      value={course.course_reviews[0]?.rating || 0}
                      onChange={(event, newValue) => {
                        setSelectedCourse(course);
                        setReview(prev => ({ ...prev, rating: newValue }));
                      }}
                      size="large"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Write your review..."
                      value={course.course_reviews[0]?.review_text || ''}
                      onChange={(e) => {
                        setSelectedCourse(course);
                        setReview(prev => ({ ...prev, comment: e.target.value }));
                      }}
                      sx={{ mt: 3, mb: 3 }}
                    />
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => handleReviewSubmit()}
                      sx={{ mt: 2 }}
                    >
                      Submit Review
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {value === 3 && (
            <Grid container spacing={3}>
              {purchases.map((purchase) => (
                <Grid item xs={12} key={purchase.id}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Purchase on {new Date(purchase.purchase_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      Amount: ₹{purchase.amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method: {purchase.payment_method.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {purchase.status}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Course Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              {selectedCourse.courses.title}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Description:
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedCourse.courses.long_description || selectedCourse.courses.description}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Course Progress:
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={selectedCourse.progress_percentage} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" gutterBottom>
                {selectedCourse.completed_lectures} of {selectedCourse.courses.total_lectures} lectures completed
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Duration: {selectedCourse.courses.duration_hours} hours
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Dashboard; 