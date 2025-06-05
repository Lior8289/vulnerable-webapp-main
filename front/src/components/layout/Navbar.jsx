import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useLocation, useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import logo from '/src/assets/images/logo.PNG';

/**
 * Navbar component
 * – Persists user ID in localStorage so the menu remains visible
 *   even after refresh or browser-back navigation.
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  /* ---------- persistent userId ---------- */
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));  /* store userId that arrives via navigate(..., { state }) only if user is actually authenticated */
  useEffect(() => {
    // Always sync with localStorage to ensure consistency
    const storedUserId = localStorage.getItem('userId');
    const lastActivity = localStorage.getItem('lastActivity');
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    // Check if the stored session is valid
    const isValidSession = storedUserId && lastActivity && 
      (Date.now() - parseInt(lastActivity) <= SESSION_TIMEOUT);
    
    // If on public routes, clear any authentication state
    if (['/', '/forgot-password'].includes(location.pathname)) {
      if (storedUserId && !isValidSession) {
        localStorage.removeItem('userId');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('passwordResetCompleted');
        setUserId(null);
      } else if (isValidSession) {
        setUserId(storedUserId);
      } else {
        setUserId(null);
      }
    } else if (location.state?.userId && isValidSession) {
      // Only update if user has a valid session and not on public routes
      localStorage.setItem('userId', location.state.userId);
      setUserId(location.state.userId);
    } else if (isValidSession) {
      // Use stored userId if session is valid
      setUserId(storedUserId);
    } else {
      // Clear userId if session is invalid
      localStorage.removeItem('userId');
      localStorage.removeItem('lastActivity');
      setUserId(null);
    }
  }, [location.state, location.pathname]);
  const currentPath = location.pathname;
  const isResetPassword = currentPath === '/reset-password';
  
  // Check if user is actually authenticated (has valid session)
  const isAuthenticated = () => {
    const storedUserId = localStorage.getItem('userId');
    const lastActivity = localStorage.getItem('lastActivity');
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    if (!storedUserId || !lastActivity) return false;

    // Check if session has expired
    if (Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
      localStorage.removeItem('userId');
      localStorage.removeItem('lastActivity');
      setUserId(null);
      return false;
    }

    return true;
  };

  // Only show user menu if user is authenticated and not on public pages
  const shouldShowUserMenu = isAuthenticated() && userId && 
    !['/', '/forgot-password'].includes(currentPath);
  /* ---------- handlers ---------- */
  const handleLogoClick = () => {
    // Only allow navigation if user is authenticated AND has userId AND not on reset password page
    if (shouldShowUserMenu && userId && isAuthenticated() && !isResetPassword) {
      navigate('/home-screen', { state: { userId } });
    }
  };

  /* ---------- render ---------- */
  return (
    <AppBar
      position="fixed"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth={false}>
        <Toolbar
          sx={{
            height: '64px',
            px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 10 }
          }}
        >
          {/* logo + title */}
          <Box            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
              cursor: shouldShowUserMenu ? 'pointer' : 'default',
              pointerEvents: isResetPassword ? 'none' : 'auto'
            }}
            onClick={handleLogoClick}
          >
            <SecurityIcon
              sx={{ fontSize: 32, color: 'primary.main', mr: 1 }}
            />
            <img
              src={logo}
              alt="Secure Coding Logo"
              style={{ width: '100px', height: '50px', objectFit: 'contain' }}
            />
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Secure Coding App
            </Typography>          </Box>          {/* user menu - only show if user is authenticated */}
          {shouldShowUserMenu && <UserMenu userId={userId} />}
        </Toolbar>
      </Container>
    </AppBar>
  );
}