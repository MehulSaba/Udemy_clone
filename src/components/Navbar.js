import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Box,
  TextField,
  Autocomplete,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [courses, setCourses] = useState([]);
  const [searchValue, setSearchValue] = useState(null);

  useEffect(() => {
    fetchCourses();
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchCartCount(user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCartCount(session.user.id);
      } else {
        setCartCount(0);
      }
    });

    // Subscribe to cart changes
    const cartSubscription = supabase
      .channel('cart-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cart_items' 
        }, 
        payload => {
          if (user) fetchCartCount(user.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      cartSubscription.unsubscribe();
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, category');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCartCount = async (userId) => {
    try {
      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      if (error) throw error;
      setCartCount(count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSearchChange = (event, newValue) => {
    setSearchValue(newValue);
    if (newValue) {
      navigate(`/courses?search=${encodeURIComponent(newValue.title)}`);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Left side - Brand */}
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            flexGrow: 0,
            mr: 4
          }}
        >
          Knowledge Hub
        </Typography>

        {/* Search Bar */}
        <Autocomplete
          sx={{
            flexGrow: 1,
            maxWidth: 600,
            mx: 2,
            '& .MuiInputBase-root': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
              },
            },
            '& .MuiAutocomplete-popupIndicator': {
              color: 'white',
            },
            '& .MuiAutocomplete-clearIndicator': {
              color: 'white',
            },
          }}
          options={courses}
          getOptionLabel={(option) => option.title || ''}
          renderOption={(props, option) => (
            <Box 
              component="li" 
              {...props}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'action.hover' 
                }
              }}
            >
              <Box>
                <Typography variant="body1">
                  {option.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.8rem' }}
                >
                  {option.category}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search for courses..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <SearchIcon sx={{ color: 'white', mr: 1 }} />
                ),
              }}
            />
          )}
          value={searchValue}
          onChange={handleSearchChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          PaperComponent={({ children, ...props }) => (
            <Paper 
              {...props} 
              sx={{ 
                mt: 1,
                boxShadow: 3,
                '& .MuiAutocomplete-option': {
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }
              }}
            >
              {children}
            </Paper>
          )}
        />

        {/* Right side - Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/courses">
            Courses
          </Button>
          
          {/* Contact Us button - always visible */}
          <Button 
            color="inherit" 
            component={Link} 
            to="/contact"
            sx={{ 
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Contact Us
          </Button>
          
          {user ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/dashboard"
                sx={{ 
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Dashboard
              </Button>
              <Typography sx={{ mx: 2 }}>
                {user.user_metadata.username || 'User'}
              </Typography>
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
              <Button color="inherit" component={Link} to="/chatbot">
                Chatbot
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 