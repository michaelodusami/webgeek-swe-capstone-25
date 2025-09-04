import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip,
  Alert,
  Chip,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const SkillTable = ({
  skills,
  pagination,
  filters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSkillCreate,
  onSkillUpdate,
  onSkillDelete
}) => {
  const [editingSkill, setEditingSkill] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [createForm, setCreateForm] = useState({
    name: ''
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, skill: null });
  const [error, setError] = useState(null);

  const handleEditClick = (skill) => {
    setEditingSkill(skill.id);
    setEditForm({
      name: skill.name || ''
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Validate required fields
      if (!editForm.name.trim()) {
        setError('Skill name is required');
        return;
      }

      // Clean up the data before sending
      const cleanData = {
        name: editForm.name.trim()
      };

      console.log('Updating skill data:', cleanData);
      const result = await onSkillUpdate(editingSkill, cleanData);
      if (result.success) {
        setEditingSkill(null);
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
    setCreateDialog({ open: true });
    setCreateForm({
      name: ''
    });
    setError(null);
  };

  const handleCreateSave = async () => {
    try {
      // Validate required fields
      if (!createForm.name.trim()) {
        setError('Skill name is required');
        return;
      }

      // Clean up the data before sending
      const cleanData = {
        name: createForm.name.trim()
      };

      console.log('Creating skill data:', cleanData);
      const result = await onSkillCreate(cleanData);
      if (result.success) {
        setCreateDialog({ open: false });
        setCreateForm({
          name: ''
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
      name: ''
    });
    setError(null);
  };

  const handleDeleteClick = (skill) => {
    setDeleteDialog({ open: true, skill });
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await onSkillDelete(deleteDialog.skill.id);
      if (result.success) {
        setDeleteDialog({ open: false, skill: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, skill: null });
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      {/* Search and Create Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <TextField
          label="Search Skills"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by skill name"
          sx={{ minWidth: 300 }}
          inputProps={{
            maxLength: 50
          }}
        />
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ minWidth: 150 }}
        >
          Add Skill
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Skill Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Skill Name</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell>
                  {editingSkill === skill.id ? (
                    <TextField
                      size="small"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    <Chip label={skill.name} color="primary" size="small" />
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingSkill === skill.id ? (
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
                      <Tooltip title="Edit Skill">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(skill)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Skill">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(skill)}
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
            Are you sure you want to delete skill "{deleteDialog.skill?.name}"?
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

      {/* Create Skill Dialog */}
      <Dialog open={createDialog.open} onClose={handleCreateCancel} maxWidth="md" fullWidth>
        <DialogTitle>Create New Skill</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Skill Name"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              inputProps={{
                maxLength: 50
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateCancel}>Cancel</Button>
          <Button 
            onClick={handleCreateSave} 
            variant="contained"
            disabled={!createForm.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillTable; 