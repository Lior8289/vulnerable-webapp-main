import PropTypes from "prop-types";
import {
    Box,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Typography,
  } from '@mui/material';
  import dayjs from 'dayjs'; 

/**
 * CustomerTable component displays a list of customers in a table format.
 * @param customers - Array of customers objects to display in the table.
 * @returns {JSX.Element} The CustomerTable component rendering a table with customers.
 */
  export default function CustomerTable({ customers }) {
    return (
      <Box sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        width: '100%',
        height: '100%',
        minWidth: '1200px'
      }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            width: '100%',
            minWidth: '1200px',
            maxWidth: '3000px',
            boxShadow: 'none',
            bgcolor: 'background.paper',
            '& .MuiTable-root': {
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
            },
            '& .MuiTableCell-root': {
              padding: '16px 24px',
              whiteSpace: 'nowrap',
              color: 'text.primary'
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  ID
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  First Name
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  Last Name
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  Age
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  Phone Number
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  Email
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    fontSize: '0.95rem',
                    py: 2
                  }}
                >
                  Birthday
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '1rem'
                      }}
                    >
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, index) => (
                  <TableRow 
                    key={customer.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{customer.first_name}</TableCell>
                    <TableCell align="center">{customer.last_name}</TableCell>
                    <TableCell align="center">
                      {Math.floor((Date.now() - new Date(customer.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365))}
                    </TableCell>
                    <TableCell align="center">{customer.phone}</TableCell>
                    <TableCell align="center">{customer.email}</TableCell>
                    <TableCell align="center">{dayjs(customer.birthday).format('DD/MM/YYYY')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

// Adding prop types validation
CustomerTable.propTypes = {
    customers: PropTypes.array.isRequired, // The array of customer objects to display in the table.
};