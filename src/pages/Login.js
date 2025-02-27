import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Box, TextField, Button, Typography, Container, Link, Alert } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate('/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Invalid login credentials. Please sign up if you don\'t have an account.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Sign in
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mb: 2 }}
          >
            Sign In
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link 
              component={RouterLink} 
              to="/signup" 
              variant="body1"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Don't have an account? Sign up
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Login; 