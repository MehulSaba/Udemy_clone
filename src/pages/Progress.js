import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Card, CardContent, 
  LinearProgress, Grid, Box, Button 
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';

function Progress() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_progress')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const updateProgress = async (courseId, newProgress) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('course_progress')
        .update({ 
          progress_percentage: newProgress,
          completed_lectures: Math.floor(newProgress / 100 * courses.find(c => c.course_id === courseId).courses.total_lectures),
          last_accessed: new Date()
        })
        .match({ user_id: user.id, course_id: courseId });

      if (error) throw error;
      fetchProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Learning
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} key={course.course_id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.courses.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress_percentage} 
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <Typography variant="body2">
                    {course.progress_percentage}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Completed {course.completed_lectures} of {course.courses.total_lectures} lectures
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => updateProgress(course.course_id, Math.min(course.progress_percentage + 10, 100))}
                >
                  Mark Next Lecture Complete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Progress; 