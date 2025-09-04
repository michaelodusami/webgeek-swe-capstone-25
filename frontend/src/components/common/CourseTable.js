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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const CourseTable = ({
  courses,
  semesters,
  users,
  pagination,
  filters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onCourseCreate,
  onCourseUpdate,
  onCourseDelete,
  onUserAssign,
  onUserRemove
}) => {
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [createForm, setCreateForm] = useState({
    crn: '',
    displayName: '',
    semester_id: null
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
  const [userAssignmentDialog, setUserAssignmentDialog] = useState({ open: false, course: null });
  const [selectedUser, setSelectedUser] = useState('');
  const [courseUsers, setCourseUsers] = useState([]);
  const [loadingCourseUsers, setLoadingCourseUsers] = useState(false);
  const [error, setError] = useState(null);

  const handleEditClick = (course) => {
    setEditingCourse(course.id);
    setEditForm({
      crn: course.crn || '',
      displayName: course.displayName || '',
      semester_id: course.semester_id || null
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Validate required fields
      if (!editForm.crn.trim()) {
        setError('CRN is required');
        return;
      }
      if (!editForm.displayName.trim()) {
        setError('Display name is required');
        return;
      }

      // Clean up the data before sending
      const cleanData = {
        crn: editForm.crn.trim(),
        displayName: editForm.displayName.trim(),
        semester_id: editForm.semester_id
      };

      console.log('Updating course data:', cleanData);
      const result = await onCourseUpdate(editingCourse, cleanData);
      if (result.success) {
        setEditingCourse(null);
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
      crn: '',
      displayName: '',
      semester_id: null
    });
    setError(null);
  };

  const handleCreateSave = async () => {
    try {
      // Validate required fields
      if (!createForm.crn.trim()) {
        setError('CRN is required');
        return;
      }
      if (!createForm.displayName.trim()) {
        setError('Display name is required');
        return;
      }

      // Clean up the data before sending
      const cleanData = {
        crn: createForm.crn.trim(),
        displayName: createForm.displayName.trim(),
        semester_id: createForm.semester_id
      };

      console.log('Creating course data:', cleanData);
      const result = await onCourseCreate(cleanData);
      if (result.success) {
        setCreateDialog({ open: false });
        setCreateForm({
          crn: '',
          displayName: '',
          semester_id: null
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
      crn: '',
      displayName: '',
      semester_id: null
    });
    setError(null);
  };

  const handleDeleteClick = (course) => {
    setDeleteDialog({ open: true, course });
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await onCourseDelete(deleteDialog.course.id);
      if (result.success) {
        setDeleteDialog({ open: false, course: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, course: null });
    setError(null);
  };

  const handleUserAssignmentClick = async (course) => {
    setUserAssignmentDialog({ open: true, course });
    setSelectedUser('');
    setError(null);
    setLoadingCourseUsers(true);
    
    try {
      // Fetch users for this course
      const response = await onUserAssign(course.id, null, true); // Use a flag to indicate fetch-only
      if (response.success) {
        setCourseUsers(response.data || []);
      } else {
        setError('Failed to load course users');
      }
    } catch (err) {
      setError('Failed to load course users: ' + err.message);
    } finally {
      setLoadingCourseUsers(false);
    }
  };

  const handleUserAssignmentSave = async () => {
    try {
      if (!selectedUser) {
        setError('Please select a user to assign');
        return;
      }

      const result = await onUserAssign(userAssignmentDialog.course.id, selectedUser, false);
      if (result.success) {
        // Refresh the course users list
        const refreshResponse = await onUserAssign(userAssignmentDialog.course.id, null, true);
        if (refreshResponse.success) {
          setCourseUsers(refreshResponse.data || []);
        }
        setSelectedUser('');
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUserAssignmentCancel = () => {
    setUserAssignmentDialog({ open: false, course: null });
    setSelectedUser('');
    setError(null);
  };

  const handleUserRemove = async (courseId, userId) => {
    try {
      const result = await onUserRemove(courseId, userId);
      if (result.success) {
        // Update the course users list
        if (result.data) {
          setCourseUsers(result.data);
        }
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getSemesterName = (semesterId) => {
    if (!semesterId) return 'No Semester';
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? semester.displayName : 'Unknown Semester';
  };



  return (
    <Box>
      {/* Search and Create Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <TextField
          label="Search Courses"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by CRN or display name"
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
          Add Course
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Course Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CRN</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  {editingCourse === course.id ? (
                    <TextField
                      size="small"
                      value={editForm.crn}
                      onChange={(e) => setEditForm(prev => ({ ...prev, crn: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    <Chip label={course.crn} color="primary" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {editingCourse === course.id ? (
                    <TextField
                      size="small"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    course.displayName
                  )}
                </TableCell>
                <TableCell>
                  {editingCourse === course.id ? (
                    <FormControl size="small" fullWidth>
                      <Select
                        value={editForm.semester_id || ''}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          semester_id: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                      >
                        <MenuItem value="">No Semester</MenuItem>
                        {semesters.map((semester) => (
                          <MenuItem key={semester.id} value={semester.id}>
                            {semester.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    getSemesterName(course.semester_id)
                  )}
                </TableCell>
                <TableCell>{formatDate(course.created_at)}</TableCell>
                <TableCell>{formatDate(course.updated_at)}</TableCell>
                <TableCell align="center">
                  {editingCourse === course.id ? (
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
                      <Tooltip title="Edit Course">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(course)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Users">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleUserAssignmentClick(course)}
                        >
                          <PeopleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Course">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(course)}
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
            Are you sure you want to delete course "{deleteDialog.course?.displayName}" (CRN: {deleteDialog.course?.crn})?
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

      {/* Create Course Dialog */}
      <Dialog open={createDialog.open} onClose={handleCreateCancel} maxWidth="md" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="CRN"
              value={createForm.crn}
              onChange={(e) => setCreateForm(prev => ({ ...prev, crn: e.target.value }))}
              fullWidth
              required
              inputProps={{
                maxLength: 100
              }}
            />
            <TextField
              label="Display Name"
              value={createForm.displayName}
              onChange={(e) => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
              fullWidth
              required
              inputProps={{
                maxLength: 255
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={createForm.semester_id || ''}
                onChange={(e) => setCreateForm(prev => ({ 
                  ...prev, 
                  semester_id: e.target.value ? parseInt(e.target.value) : null 
                }))}
                label="Semester"
              >
                <MenuItem value="">No Semester</MenuItem>
                {semesters.map((semester) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateCancel}>Cancel</Button>
          <Button 
            onClick={handleCreateSave} 
            variant="contained"
            disabled={!createForm.crn || !createForm.displayName}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Assignment Dialog */}
      <Dialog open={userAssignmentDialog.open} onClose={handleUserAssignmentCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Users for Course: {userAssignmentDialog.course?.displayName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Current Users Section */}
            <Typography variant="h6" gutterBottom>
              Current Users ({courseUsers.length})
            </Typography>
            {loadingCourseUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : courseUsers.length > 0 ? (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {courseUsers.map((userCourse) => {
                  const user = users.find(u => u.id === userCourse.user_id);
                  return user ? (
                    <Box key={userCourse.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1
                    }}>
                      <Typography>
                        {user.username} ({user.edupersonprincipalname})
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUserRemove(userAssignmentDialog.course.id, userCourse.user_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : null;
                })}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No users assigned to this course
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Assign New User Section */}
            <Typography variant="h6" gutterBottom>
              Assign New User
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {users?.filter(user => !courseUsers.some(cu => cu.user_id === user.id)).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username} ({user.edupersonprincipalname})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserAssignmentCancel}>Close</Button>
          <Button 
            onClick={handleUserAssignmentSave} 
            variant="contained"
            disabled={!selectedUser}
          >
            Assign User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseTable; 