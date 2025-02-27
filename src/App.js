import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Chatbot from './pages/Chatbot'
import Progress from './pages/Progress';
import Feedback from './pages/Feedback';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import Contact from './pages/Contact';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
