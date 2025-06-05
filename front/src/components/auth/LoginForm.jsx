import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  Stack
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * LoginForm component
 * Shows a login form with generic error handling to avoid disclosing which field failed
 */
function LoginForm() {
  /* ---------- state ---------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- constants ---------- */
  const GENERIC_ERROR = 'Invalid username or password. Please try again.';
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // Check for existing lockout
    const storedLockout = localStorage.getItem('loginLockout');
    if (storedLockout) {
      const lockoutEnd = parseInt(storedLockout);
      if (Date.now() < lockoutEnd) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('loginLockout');
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  /* ---------- helpers ---------- */
  const handleClickShowPassword = () =>
    setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 60000);
      setStatusMsg(`Account is locked. Please try again in ${remainingTime} minutes.`);
      return;
    }

    /* client-side format check (still uses generic message) */
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setStatusMsg(GENERIC_ERROR);
      return;
    }

    const data = {
      username: email.split('@')[0],
      password
    };

    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockoutEnd = Date.now() + LOCKOUT_DURATION;
          localStorage.setItem('loginLockout', lockoutEnd.toString());
          setIsLocked(true);
          setLockoutTime(lockoutEnd);
          setStatusMsg(`Too many failed attempts. Account locked for 15 minutes.`);
          return;
        }

        if (res.status === 401) {
          setStatusMsg(GENERIC_ERROR);
        } else if (res.status === 403) {
          setStatusMsg('Your account is locked. Please contact support.');
        } else {
          setStatusMsg('Something went wrong. Please try again later.');
        }
        return;
      }

      const json = await res.json();
      setStatusMsg('Login successful!');
      setEmail('');
      setPassword('');
      
      // Clear login attempts and lockout
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginLockout');
      
      // Store userId and last activity in localStorage
      localStorage.setItem('userId', json.user.user_id);
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Redirect to the attempted URL or home screen
      const from = location.state?.from?.pathname || '/home-screen';
      navigate(from, { state: { userId: json.user.user_id } });
    } catch {
      setStatusMsg('Something went wrong. Please try again later.');
    }
  };

  /* ---------- render ---------- */
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={600}
          color="primary.main"
        >
          Welcome Back
        </Typography>

        {statusMsg && (
          <Alert
            severity={
              statusMsg.startsWith('Login successful') ? 'success' : 'error'
            }
          >
            {statusMsg}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          fullWidth
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem', fontWeight: 500 }}
        >
          Sign In
        </Button>

        <Box display="flex" justifyContent="center" mt={1}>
          <Link
            href="#"
            onClick={() => navigate('/forgot-password')}
            underline="hover"
            color="text.secondary"
          >
            Forgot Password?
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

export default LoginForm;