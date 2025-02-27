import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, List, ListItem, ListItemText, 
  Button, Box, Card, CardMedia, IconButton, Divider,
  CircularProgress, Radio, RadioGroup, FormControlLabel,
  TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, FormLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    name: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
      calculateTotal(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Update cart items after removal
      fetchCartItems();
      
      // Show success message
      alert('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item from cart');
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.courses?.price || 0), 0);
    setTotal(sum);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
      name: ''
    });
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'card') {
      return (
        paymentDetails.cardNumber.length === 16 &&
        paymentDetails.expiryDate.length === 5 &&
        paymentDetails.cvv.length === 3 &&
        paymentDetails.name
      );
    } else if (paymentMethod === 'upi') {
      return paymentDetails.upiId.includes('@');
    }
    return false;
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    setOpenPaymentDialog(true);
  };

  const processPayment = async () => {
    try {
      if (!validatePaymentDetails()) {
        alert('Please fill in all required payment details correctly');
        return;
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Add courses to progress tracking
      const progressItems = cartItems.map(item => ({
        user_id: user.id,
        course_id: item.courses.id,
        completed_lectures: 0,
        progress_percentage: 0,
        last_accessed: new Date().toISOString(),
        purchase_date: new Date().toISOString()
      }));

      // Store purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          amount: total,
          payment_method: paymentMethod,
          status: 'completed',
          purchase_date: new Date().toISOString()
        });

      if (purchaseError) throw purchaseError;

      // Insert into course_progress
      const { error: progressError } = await supabase
        .from('course_progress')
        .insert(progressItems);

      if (progressError) throw progressError;

      // Clear cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      setOpenPaymentDialog(false);
      alert('Purchase successful! Your courses are now available in your dashboard.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Cardholder Name"
              value={paymentDetails.name}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Card Number"
              value={paymentDetails.cardNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Expiry Date (MM/YY)"
                value={paymentDetails.expiryDate}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                sx={{ width: '50%' }}
              />
              <TextField
                label="CVV"
                type="password"
                value={paymentDetails.cvv}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                sx={{ width: '50%' }}
              />
            </Box>
          </Box>
        );
      case 'upi':
        return (
          <TextField
            fullWidth
            label="UPI ID"
            value={paymentDetails.upiId}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
            helperText="Enter your UPI ID (e.g., username@upi)"
            sx={{ mt: 2 }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>
      
      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Browse Courses
          </Button>
        </Box>
      ) : (
        <>
          <List>
            {cartItems.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <ListItem
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    py: 2
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 150, height: 85, objectFit: 'cover', mr: 2 }}
                    image={item.courses?.image_url}
                    alt={item.courses?.title}
                  />
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                          {item.courses?.title}
                        </Typography>
                      }
                      secondary={item.courses?.description}
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mt: 1,
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      ₹{item.courses?.price}
                    </Typography>
                  </Box>
                  <IconButton 
                    edge="end" 
                    onClick={() => removeFromCart(item.id)}
                    color="error"
                    sx={{ ml: 2 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              </Card>
            ))}
          </List>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Payment Method</FormLabel>
              <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="upi" control={<Radio />} label="UPI" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Box>
              <Typography variant="h6" color="text.secondary">
                Total:
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ₹{total.toFixed(2)}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleCheckout}
              disabled={!paymentMethod}
              sx={{ minWidth: 200 }}
            >
              Proceed to Pay
            </Button>
          </Box>
        </>
      )}

      <Dialog 
        open={openPaymentDialog} 
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Total Amount: ₹{total.toFixed(2)}
          </Typography>
          {renderPaymentForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button 
            onClick={processPayment} 
            variant="contained"
            disabled={!validatePaymentDetails()}
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Cart; 