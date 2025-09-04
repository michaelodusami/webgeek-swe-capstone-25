import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';

const UserTable = ({
  users,
  pagination,
  filters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onAffiliationFilter,
  onUserDelete
}) => {
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [error, setError] = useState(null);



  const handleDeleteClick = (user) => {
    if (!user || !user.id) {
      setError('Invalid user selected for deletion');
      return;
    }
    setDeleteDialog({ open: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.user || !deleteDialog.user.id) {
      setError('Invalid user selected for deletion');
      return;
    }
    
    try {
      const result = await onUserDelete(deleteDialog.user.id);
      if (result.success) {
        setDeleteDialog({ open: false, user: null });
        setError(null);
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const getAffiliationColor = (affiliation) => {
    switch (affiliation?.toLowerCase()) {
      case 'student':
        return 'primary';
      case 'faculty':
        return 'secondary';
      case 'staff':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by username, principal name, or UUPID"
          sx={{ minWidth: 300 }}
          inputProps={{
            maxLength: 100
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Affiliation</InputLabel>
          <Select
            value={filters.affiliation}
            label="Affiliation"
            onChange={(e) => onAffiliationFilter(e.target.value)}
          >
            <MenuItem value="all">All Affiliations</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="faculty">Faculty</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* User Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Principal Name</TableCell>
              <TableCell>UUPID</TableCell>
              <TableCell>Affiliation</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.edupersonprincipalname}</TableCell>
                <TableCell>{user.uupid}</TableCell>
                <TableCell>
                  <Chip
                    label={user.edupersonprimaryaffiliation}
                    color={getAffiliationColor(user.edupersonprimaryaffiliation)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>{formatDate(user.updated_at)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page}
        onPageChange={(event, newPage) => onPageChange(newPage)}
        rowsPerPage={pagination.pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{deleteDialog.user?.username}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTable; 