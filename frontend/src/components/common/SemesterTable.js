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
  Box,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Tooltip,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';


const SemesterTable = ({
  semesters,
  pagination,
  filters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSemesterCreate,
  onSemesterUpdate,
  onSemesterDelete
}) => {
  const [editingSemester, setEditingSemester] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, semester: null });
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [createForm, setCreateForm] = useState({
    displayName: '',
    semesterStartDate: null,
    semesterEndDate: null
  });
  const [error, setError] = useState(null);

  const handleEditClick = (semester) => {
    setEditingSemester(semester.id);
    setEditForm({
      displayName: semester.displayName,
      semesterStartDate: new Date(semester.semesterStartDate),
      semesterEndDate: new Date(semester.semesterEndDate)
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingSemester(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async () => {
    try {
      const result = await onSemesterUpdate(editingSemester, editForm);
      if (result.success) {
        setEditingSemester(null);
        setEditForm({});
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateClick = () => {
    setCreateForm({
      displayName: '',
      semesterStartDate: null,
      semesterEndDate: null
    });
    setCreateDialog({ open: true });
    setError(null);
  };

  const handleCreateSave = async () => {
    try {
      const result = await onSemesterCreate(createForm);
      if (result.success) {
        setCreateDialog({ open: false });
        setCreateForm({
          displayName: '',
          semesterStartDate: null,
          semesterEndDate: null
        });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCancel = () => {
    setCreateDialog({ open: false });
    setCreateForm({
      displayName: '',
      semesterStartDate: null,
      semesterEndDate: null
    });
    setError(null);
  };

  const handleDeleteClick = (semester) => {
    if (!semester || !semester.id) {
      setError('Invalid semester selected for deletion');
      return;
    }
    setDeleteDialog({ open: true, semester });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.semester || !deleteDialog.semester.id) {
      setError('Invalid semester selected for deletion');
      return;
    }
    
    try {
      const result = await onSemesterDelete(deleteDialog.semester.id);
      if (result.success) {
        setDeleteDialog({ open: false, semester: null });
        setError(null);
      } else {
        setError(result.error || 'Failed to delete semester');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete semester');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, semester: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'warning'; // Future
    if (now >= start && now <= end) return 'success'; // Current
    return 'default'; // Past
  };

  const getStatusText = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'Future';
    if (now >= start && now <= end) return 'Current';
    return 'Past';
  };

  return (
    <Box>
        {/* Search and Create Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <TextField
            label="Search Semesters"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by display name"
            sx={{ minWidth: 300 }}
            inputProps={{
              maxLength: 100
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{ minWidth: 150 }}
          >
            Add Semester
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Semester Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Display Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {semesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell>
                    {editingSemester === semester.id ? (
                      <TextField
                        size="small"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        fullWidth
                      />
                    ) : (
                      semester.displayName
                    )}
                  </TableCell>
                  <TableCell>
                    {editingSemester === semester.id ? (
                      <TextField
                        type="date"
                        size="small"
                        value={editForm.semesterStartDate ? editForm.semesterStartDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, semesterStartDate: new Date(e.target.value) }))}
                        fullWidth
                      />
                    ) : (
                      formatDate(semester.semesterStartDate)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingSemester === semester.id ? (
                      <TextField
                        type="date"
                        size="small"
                        value={editForm.semesterEndDate ? editForm.semesterEndDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, semesterEndDate: new Date(e.target.value) }))}
                        fullWidth
                      />
                    ) : (
                      formatDate(semester.semesterEndDate)
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(semester.semesterStartDate, semester.semesterEndDate)}
                      color={getStatusColor(semester.semesterStartDate, semester.semesterEndDate)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(semester.created_at)}</TableCell>
                  <TableCell>{formatDate(semester.updated_at)}</TableCell>
                  <TableCell align="center">
                    {editingSemester === semester.id ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSaveEdit}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleCancelEdit}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Edit Semester">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(semester)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Semester">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(semester)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
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
              Are you sure you want to delete semester "{deleteDialog.semester?.displayName}"?
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

        {/* Create Semester Dialog */}
        <Dialog open={createDialog.open} onClose={handleCreateCancel} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Semester</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Display Name"
                value={createForm.displayName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Start Date"
                type="date"
                value={createForm.semesterStartDate ? createForm.semesterStartDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setCreateForm(prev => ({ ...prev, semesterStartDate: new Date(e.target.value) }))}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={createForm.semesterEndDate ? createForm.semesterEndDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setCreateForm(prev => ({ ...prev, semesterEndDate: new Date(e.target.value) }))}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateCancel}>Cancel</Button>
            <Button 
              onClick={handleCreateSave} 
              variant="contained"
              disabled={!createForm.displayName || !createForm.semesterStartDate || !createForm.semesterEndDate}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default SemesterTable; 