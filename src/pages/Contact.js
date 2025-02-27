import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { supabase } from '../utils/supabaseClient';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setSnackbarMessage('Message sent successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbarMessage('Failed to send message. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            Have questions? We'd love to hear from you. Send us a message
            and we'll respond as soon as possible.
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography>
                123 Education Street, Learning City, 12345
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography>
                support@udemyclone.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography>
                +1 234 567 8900
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                sx={{ mb: 3 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                fullWidth
              >
                Send Message
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Contact; 