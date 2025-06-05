import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitHit, setIsSubmitHit] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);
  
  const sendCode = async () => {
    try {
      const response = await fetch('/api/verifications/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to send code.');
        return;
      }
      const responseData = await response.json();
      setMessage('Verification code sent successfully!');
      setUserId(responseData.user_id);
      setIsSubmitHit(true);
      setTimer(300);
      setIsResendDisabled(true);
    } catch (err) {
      setMessage(err.message || 'Failed to send code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSubmitHit) {
      await sendCode();
      return;
    }

    try {
      const response = await fetch('/api/verifications/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          code: code
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        setMessage(responseData.message || 'Invalid verification code.');
        return;
      }

      // Clear any existing messages
      setMessage('');
      
      // Navigate to reset password page
      navigate('/reset-password', { 
        state: { userId: userId },
        replace: true // This will replace the current history entry
      });
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          textAlign: 'center',
          color: '#1976D2',
          fontSize: { xs: '1.75rem', sm: '2rem' },
          fontWeight: 600,
          mb: 1,
          letterSpacing: '-0.5px'
        }}
      >
        Forgot Password
      </Typography>

      <Typography 
        variant="body1" 
        sx={{ 
          textAlign: 'center',
          color: 'text.secondary',
          mb: 0.5
        }}
      >
        {isSubmitHit 
          ? 'Enter the verification code sent to your email' 
          : 'Enter your email address to receive a verification code'
        }
      </Typography>

      {message && (
        <Alert 
          severity={message.includes('successful') ? 'success' : 'error'}
          sx={{ 
            width: '100%',
            borderRadius: 1,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {message}
        </Alert>
      )}

      {isSubmitHit ? (
        <TextField
          label="Verification Code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.09)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.13)'
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.09)'
              }
            }
          }}
        />
      ) : (
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.09)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.13)'
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.09)'
              }
            }
          }}
        />
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          backgroundColor: '#1976D2',
          borderRadius: 1,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
          '&:hover': {
            backgroundColor: '#1565C0',
            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
          }
        }}
      >
        {isSubmitHit ? 'Verify Code' : 'Send Code'}
      </Button>

      {isSubmitHit && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center' 
            }}
          >
            Resend in {Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}
          </Typography>
          <Button
            onClick={sendCode}
            disabled={isResendDisabled}
            sx={{
              color: '#1976D2',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              },
              '&.Mui-disabled': {
                color: 'text.disabled'
              }
            }}
          >
            Send Again
          </Button>
        </Box>
      )}

      <Button
        onClick={() => navigate('/')}
        sx={{
          color: '#1976D2',
          textTransform: 'none',
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline'
          }
        }}
      >
        Back to Login
      </Button>
    </Box>
  );
}

export default ForgotPasswordForm;
