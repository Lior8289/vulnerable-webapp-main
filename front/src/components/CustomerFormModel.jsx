import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

// MUI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material';


// date pickers
import dayjs from 'dayjs';


/**
 * Main component of the Add/Edit customers view.
 * This modal allows the user to add or edit an customer based on whether the `initialData` is provided.
 * @param {object} props - The properties passed to the component.
 * @param {boolean} props.open -  Boolean indicating if the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSubmit - Function to submit the form.
 * @param {object} props.initialData - Initial data to fill the form.
 * @returns {JSX.Element} -  The JSX representing the customer Form Modal.
 */
export default function CustomerFormModal({
  open,
  onClose,
  onSubmit,
  initialData, // If null => Add mode, else => Edit mode
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date: ''
  });

  const [invalidFields, setInvalidFields] = useState({ // State for error bold fields
    first_name: false,
    last_name: false,
    phone: false,
    email: false,
    date: false,
  });

  const todayISO = new Date().toISOString().split('T')[0];

  const addCustomer = async (customerDetails) => {
    try {
      console.log('Adding customer:', customerDetails);
      const response = await fetch('/api/customers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerDetails),
      });
      if (!response.ok) {
        throw new Error('Failed to add customer');
      }
      const data = await response.json();
      console.log('Customer added successfully:', data);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        date: ''
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInvalidFields({
      first_name: false,
      last_name: false,
      phone: false,
      email: false,
      date: false,
    });

    const empties = {
      first_name: !formData.first_name.trim(),
      last_name: !formData.last_name.trim(),
      phone: !formData.phone.trim(),
      email: !formData.email.trim(),
      date: !formData.date,
    };

    const namePattern = /^[A-Za-z\u0590-\u05FF\s'-]{2,50}$/;    // letters/spaces/'–, length 2–50
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;          // basic email
    const phonePattern = /^\+?[0-9]{7,15}$/;            // 7-15 digits,'+' at the start   

    const formats = {
      first_name: !empties.first_name && !namePattern.test(formData.first_name),
      last_name: !empties.last_name && !namePattern.test(formData.last_name),
      email: !empties.email && !emailPattern.test(formData.email),
      phone: !empties.phone && !phonePattern.test(formData.phone),
    };

    const newInvalid = {
      first_name: empties.first_name || formats.first_name,
      last_name: empties.last_name || formats.last_name,
      phone: empties.phone || formats.phone,
      email: empties.email || formats.email,
      date: empties.date,
    };
    setInvalidFields(newInvalid);

    if (Object.values(newInvalid).some(Boolean)) {
      return;
    }

    const id = initialData ? initialData.id : uuidv4(); // Generate a new ID for the customer

    const formattedDate = dayjs(formData.date).format('YYYY-MM-DD');

    const customerDetails = {
      id: id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      email: formData.email,
      birthday: formattedDate,
    };

    onSubmit(customerDetails, Boolean(initialData));
    if (!initialData) {
      await addCustomer(customerDetails);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      date: ''
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          m: 2,
          maxHeight: 'calc(100% - 64px)',
          maxWidth: { sm: 600 },
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant="h5" 
          component="span"
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            fontSize: '1.5rem'
          }}
        >
          {initialData ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 0,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'background.default'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'text.secondary',
            borderRadius: '4px',
            opacity: 0.5
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'text.primary'
          }
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3
          }}
        >
          <TextField
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            error={invalidFields.first_name}
            helperText={invalidFields.first_name ? 'First name is required' : ''}
            required
            fullWidth
            sx={{ gridColumn: { xs: '1', sm: '1' } }}
          />
          <TextField
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            error={invalidFields.last_name}
            helperText={invalidFields.last_name ? 'Last name is required' : ''}
            required
            fullWidth
            sx={{ gridColumn: { xs: '1', sm: '2' } }}
          />
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={invalidFields.phone}
            helperText={invalidFields.phone ? 'Phone number is required' : ''}
            required
            fullWidth
            sx={{ gridColumn: { xs: '1', sm: '1' } }}
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={invalidFields.email}
            helperText={invalidFields.email ? 'Valid email is required' : ''}
            required
            fullWidth
            sx={{ gridColumn: { xs: '1', sm: '2' } }}
          />
          <TextField
            label="Date of Birth"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={invalidFields.date}
            helperText={invalidFields.date ? 'Date is required' : ''}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayISO }}
            sx={{ gridColumn: { xs: '1', sm: '1 / 3' } }}
          />
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}
      >
        <Button 
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: 'none',
            px: 3
          }}
        >
          {initialData ? 'Save Changes' : 'Add Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// PropTypes validation
CustomerFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object, // or null
};

