// src/pages/LoginPage.js
import React, { useContext } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import authService from '../services/authService';
import ErrorBlock from '../components/common/ErrorBlock';
import { useNavigate } from 'react-router-dom';
import settings from '../config/settings';
import { AuthContext } from '../context/AuthContext';
import { ROUTE_DASHBOARD_STUDENT, ROUTE_DASHBOARD_ADMIN } from '../utils/routes';

export default function LoginPage() {
  const [error, setError] = React.useState("");
  const [devRole, setDevRole] = React.useState('student');
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await authService.login(devRole);
      if (response.success) {
        setError("");  // Clear any previous error
        if (response.data.redirect_url) {
          // Handle prod redirect here to let promise resolve first
          window.location.href = response.data.redirect_url;
          return;  // Exit early; redirect will happen
        }
        console.log('Login success:', response.data);
        authLogin(response.data.user); // Save user info in context
        // Determine role and redirect (for dev mode)
        const role = response.data?.user?.edupersonprimaryaffiliation?.toLowerCase();
        if (role === 'student') {
          navigate(ROUTE_DASHBOARD_STUDENT);
        } else if (['staff', 'admin', 'faculty'].includes(role)) {
          navigate(ROUTE_DASHBOARD_ADMIN);
        }
      } else {
        console.error('Login failed:', response.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container maxWidth="xs" sx={{
        bgcolor: 'rgba(255,255,255,0.95)',
        p: 5,
        borderRadius: 3,
        boxShadow: 4,
        textAlign: 'center',
        backdropFilter: 'blur(2px)',
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#861F41', fontWeight: 'bold' }}>
          Welcome to CS 4704 Capstone
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Please log in with your Virginia Tech credentials to continue.
        </Typography>
        <ErrorBlock message={error} />
        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{
            bgcolor: '#861F41',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            py: 1.5,
            boxShadow: 2,
            '&:hover': {
              bgcolor: '#6d1833',
            },
          }}
          onClick={handleLogin}
        >
          Login with CAS
        </Button>
      </Container>
      {/* Dev-only role selection bar */}
      {settings.isDev && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              boxShadow: 2,
              p: 1,
              mb: 0.5,
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                size="small"
                variant={devRole === 'student' ? 'contained' : 'outlined'}
                sx={{ minWidth: 80, fontSize: '0.85rem' }}
                onClick={() => setDevRole('student')}
              >
                Student
              </Button>
              <Button
                size="small"
                variant={devRole === 'staff' ? 'contained' : 'outlined'}
                sx={{ minWidth: 80, fontSize: '0.85rem' }}
                onClick={() => setDevRole('staff')}
              >
                Staff
              </Button>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, pointerEvents: 'auto' }}>
              Dev Menu: Select role for login (only visible in development mode)
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}