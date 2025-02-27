import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Rating,
  Box,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

function CourseCard({ course }) {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  if (!course) return null;

  const addToCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if course is already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single();

      if (existingItem) {
        setSnackbarMessage('Course is already in your cart!');
        setSnackbarSeverity('info');
        setOpenSnackbar(true);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          course_id: course.id
        });

      if (error) throw error;
      
      setSnackbarMessage('Course added to cart!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbarMessage('Failed to add course to cart');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
            transition: 'all 0.3s ease-in-out'
          },
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/course/${course.id}`)}
      >
        <CardMedia
          component="img"
          height="140"
          image={course.image_url || 'https://via.placeholder.com/480x270'}
          alt={course.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div"
            sx={{ 
              fontSize: '1rem',
              fontWeight: 'bold',
              height: '2.4em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {course.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              mb: 1,
              height: '3em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {course.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {course.total_lectures} lectures • {course.duration_hours} hours
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 1
            }}
          >
            ₹{course.price}
          </Typography>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={addToCart}
            sx={{ 
              mt: 'auto',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CourseCard; 