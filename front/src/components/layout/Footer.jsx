import React from 'react';
import { Box, Container, Typography } from '@mui/material';


/**
 * @description
 * This component displays the footer of the application.
 * @returns Footer component to display the footer of the application.
 */
export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.05)',
        zIndex: 1300,
        backdropFilter: 'blur(8px)',
        bgcolor: 'background.paper',
        transition: 'background-color 0.3s ease-in-out'
      }}
    >
      <Container 
        maxWidth={false}
        sx={{
          height: { xs: '40px', sm: '48px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 10 }
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            opacity: 0.7,
            fontSize: '0.875rem'
          }}
        >
          © {new Date().getFullYear()} Secure Coding App
        </Typography>
      </Container>
    </Box>
  );
}