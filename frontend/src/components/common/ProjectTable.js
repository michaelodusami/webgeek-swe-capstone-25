import React, { useState, useEffect } from 'react';
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';

const ProjectTable = ({
  projects,
  users,
  courses,
  skills,
  pagination,
  filters,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onUserAssign,
  onUserRemove,
  onSkillAssign,
  onSkillRemove
}) => {
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, project: null });
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    maxCapacity: 4,
    teamName: '',
    course_id: null
  });
  const [userAssignmentDialog, setUserAssignmentDialog] = useState({ open: false, project: null });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [skillAssignmentDialog, setSkillAssignmentDialog] = useState({ open: false, project: null });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [error, setError] = useState(null);

  const handleEditClick = (project) => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      maxCapacity: project.maxCapacity || 4,
      teamName: project.teamName || '',
      course_id: project.course_id || null
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditForm({});
    setError(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Validate required fields
      if (!editForm.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!editForm.description.trim()) {
        setError('Description is required');
        return;
      }
      if (!editForm.maxCapacity || editForm.maxCapacity < 1) {
        setError('Max capacity must be at least 1');
        return;
      }

      // Clean up the data before sending
      const cleanData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        maxCapacity: parseInt(editForm.maxCapacity) || 4,
        teamName: editForm.teamName?.trim() || null,
        course_id: editForm.course_id
      };

      console.log('Updating project data:', cleanData);
      const result = await onProjectUpdate(editingProject, cleanData);
      if (result.success) {
        setEditingProject(null);
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
      title: '',
      description: '',
      maxCapacity: 4,
      teamName: '',
      course_id: null
    });
    setCreateDialog({ open: true });
    setError(null);
  };

  const handleCreateSave = async () => {
    try {
      // Validate required fields
      if (!createForm.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!createForm.description.trim()) {
        setError('Description is required');
        return;
      }
      if (!createForm.maxCapacity || createForm.maxCapacity < 1) {
        setError('Max capacity must be at least 1');
        return;
      }

      // Clean up the data before sending
      const cleanData = {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        maxCapacity: parseInt(createForm.maxCapacity) || 4,
        teamName: createForm.teamName?.trim() || null,
        course_id: createForm.course_id
      };

      console.log('Sending project data:', cleanData);
      const result = await onProjectCreate(cleanData);
      if (result.success) {
        setCreateDialog({ open: false });
        setCreateForm({
          title: '',
          description: '',
          maxCapacity: 4,
          teamName: '',
          course_id: null
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
      title: '',
      description: '',
      maxCapacity: 4,
      teamName: '',
      course_id: null
    });
    setError(null);
  };

  const handleDeleteClick = (project) => {
    if (!project || !project.id) {
      setError('Invalid project selected for deletion');
      return;
    }
    setDeleteDialog({ open: true, project });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.project || !deleteDialog.project.id) {
      setError('Invalid project selected for deletion');
      return;
    }
    
    try {
      const result = await onProjectDelete(deleteDialog.project.id);
      if (result.success) {
        setDeleteDialog({ open: false, project: null });
        setError(null);
      } else {
        setError(result.error || 'Failed to delete project');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, project: null });
  };

  const handleUserAssignmentClick = async (project) => {
    setUserAssignmentDialog({ open: true, project });
    setSelectedUser('');
    setError(null);
    
    try {
      // Fetch current users for this project
      const result = await onUserAssign(project.id, null, true);
      if (result.success) {
        setAvailableUsers(result.data || []);
      } else {
        setError('Failed to load project users');
      }
    } catch (err) {
      setError('Failed to load project users: ' + err.message);
    }
  };

  const handleUserAssignmentSave = async () => {
    if (!selectedUser) {
      setError('Please select a user to assign');
      return;
    }

    // Check if project is at capacity
    if (availableUsers.length >= (userAssignmentDialog.project?.maxCapacity || 0)) {
      setError('Project is at maximum capacity. Cannot add more users.');
      return;
    }

    try {
      const result = await onUserAssign(userAssignmentDialog.project.id, selectedUser, false);
      if (result.success) {
        // Refresh the available users list
        const refreshResult = await onUserAssign(userAssignmentDialog.project.id, null, true);
        if (refreshResult.success) {
          setAvailableUsers(refreshResult.data || []);
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
    setUserAssignmentDialog({ open: false, project: null });
    setSelectedUser('');
    setError(null);
  };

  const handleUserRemove = async (projectId, userId) => {
    try {
      const result = await onUserRemove(projectId, userId);
      if (result.success) {
        // Update the available users list
        if (result.data) {
          setAvailableUsers(result.data);
        }
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSkillAssignmentClick = async (project) => {
    setSkillAssignmentDialog({ open: true, project });
    setSelectedSkill('');
    setError(null);
    
    try {
      // Fetch current skills for this project
      const result = await onSkillAssign(project.id, null, true);
      if (result.success) {
        setAvailableSkills(result.data || []);
      } else {
        setError('Failed to load project skills');
      }
    } catch (err) {
      setError('Failed to load project skills: ' + err.message);
    }
  };

  const handleSkillAssignmentSave = async () => {
    try {
      if (!selectedSkill) {
        setError('Please select a skill to assign');
        return;
      }

      const result = await onSkillAssign(skillAssignmentDialog.project.id, selectedSkill, false);
      if (result.success) {
        // Refresh the available skills list
        const refreshResult = await onSkillAssign(skillAssignmentDialog.project.id, null, true);
        if (refreshResult.success) {
          setAvailableSkills(refreshResult.data || []);
        }
        setSelectedSkill('');
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSkillAssignmentCancel = () => {
    setSkillAssignmentDialog({ open: false, project: null });
    setSelectedSkill('');
    setError(null);
  };

  const handleSkillRemove = async (projectId, skillId) => {
    try {
      const result = await onSkillRemove(projectId, skillId);
      if (result.success) {
        // Update the available skills list
        if (result.data) {
          setAvailableSkills(result.data);
        }
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getCapacityColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'error';
    if (ratio >= 0.7) return 'warning';
    return 'success';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getCourseName = (courseId) => {
    if (!courseId) return 'No Course';
    const course = courses?.find(c => c.id === courseId);
    return course ? `${course.displayName} (${course.crn})` : 'Unknown Course';
  };

  return (
    <Box>
      {/* Search and Create Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <TextField
          label="Search Projects"
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, description, or team name"
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
          Add Project
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Project Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Team Name</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  {editingProject === project.id ? (
                    <TextField
                      size="small"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    project.title
                  )}
                </TableCell>
                <TableCell>
                  {editingProject === project.id ? (
                    <TextField
                      size="small"
                      multiline
                      rows={2}
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingProject === project.id ? (
                    <TextField
                      size="small"
                      value={editForm.teamName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, teamName: e.target.value }))}
                      fullWidth
                    />
                  ) : (
                    project.teamName || 'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {editingProject === project.id ? (
                    <TextField
                      type="number"
                      size="small"
                      value={editForm.maxCapacity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                      fullWidth
                      inputProps={{ min: 1, max: 20 }}
                    />
                  ) : (
                    <Chip
                      label={`${project.currentUsers || 0}/${project.maxCapacity}`}
                      color={getCapacityColor(project.currentUsers || 0, project.maxCapacity)}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {editingProject === project.id ? (
                    <FormControl size="small" fullWidth>
                      <Select
                        value={editForm.course_id || ''}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          course_id: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                      >
                        <MenuItem value="">No Course</MenuItem>
                        {courses?.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.displayName} ({course.crn})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    getCourseName(project.course_id)
                  )}
                </TableCell>
                <TableCell>{formatDate(project.created_at)}</TableCell>
                <TableCell>{formatDate(project.updated_at)}</TableCell>
                <TableCell align="center">
                  {editingProject === project.id ? (
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
                      <Tooltip title="Edit Project">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(project)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Users">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleUserAssignmentClick(project)}
                        >
                          <PeopleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Skills">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleSkillAssignmentClick(project)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Project">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(project)}
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
            Are you sure you want to delete project "{deleteDialog.project?.title}"?
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

      {/* Create Project Dialog */}
      <Dialog open={createDialog.open} onClose={handleCreateCancel} maxWidth="md" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={createForm.title}
              onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Team Name"
              value={createForm.teamName}
              onChange={(e) => setCreateForm(prev => ({ ...prev, teamName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Max Capacity"
              type="number"
              value={createForm.maxCapacity}
              onChange={(e) => setCreateForm(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
              fullWidth
              required
              inputProps={{ min: 1, max: 20 }}
            />
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={createForm.course_id || ''}
                onChange={(e) => setCreateForm(prev => ({ 
                  ...prev, 
                  course_id: e.target.value ? parseInt(e.target.value) : null 
                }))}
                label="Course"
              >
                <MenuItem value="">No Course</MenuItem>
                {courses?.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.displayName} ({course.crn})
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
            disabled={!createForm.title || !createForm.description || !createForm.maxCapacity}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Assignment Dialog */}
      <Dialog open={userAssignmentDialog.open} onClose={handleUserAssignmentCancel} maxWidth="md" fullWidth>
        <DialogTitle>Manage Project Users - {userAssignmentDialog.project?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Add User Section */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Select User"
                  disabled={availableUsers.length >= (userAssignmentDialog.project?.maxCapacity || 0)}
                >
                  {users?.filter(user => !availableUsers.some(au => au.user_id === user.id)).map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username} ({user.edupersonprimaryaffiliation})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleUserAssignmentSave}
                disabled={!selectedUser || availableUsers.length >= (userAssignmentDialog.project?.maxCapacity || 0)}
              >
                Add User
              </Button>
            </Box>
            
            {/* Capacity Warning */}
            {availableUsers.length >= (userAssignmentDialog.project?.maxCapacity || 0) && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Project is at maximum capacity. Cannot add more users.
              </Alert>
            )}

            {/* Current Users Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Current Users ({availableUsers.length}/{userAssignmentDialog.project?.maxCapacity || 0})
            </Typography>
            <List dense>
              {availableUsers.map((userCourse) => {
                const user = users?.find(u => u.id === userCourse.user_id);
                return user ? (
                  <ListItem key={userCourse.id}>
                    <ListItemText
                      primary={user.username}
                      secondary={`${user.edupersonprimaryaffiliation} - ${user.edupersonprincipalname}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove User">
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleUserRemove(userAssignmentDialog.project.id, userCourse.user_id)}
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : null;
              })}
              {availableUsers.length === 0 && (
                <ListItem>
                  <ListItemText primary="No users assigned to this project" />
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserAssignmentCancel}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Skill Assignment Dialog */}
      <Dialog open={skillAssignmentDialog.open} onClose={handleSkillAssignmentCancel} maxWidth="md" fullWidth>
        <DialogTitle>Manage Project Skills - {skillAssignmentDialog.project?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Add Skill Section */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Skill</InputLabel>
                <Select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  label="Select Skill"
                >
                  {skills?.filter(skill => !availableSkills.some(as => as.skill_id === skill.id)).map((skill) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleSkillAssignmentSave}
                disabled={!selectedSkill}
              >
                Add Skill
              </Button>
            </Box>

            {/* Current Skills Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Current Skills ({availableSkills.length})
            </Typography>
            <List dense>
              {availableSkills.map((projectSkill) => {
                const skill = skills?.find(s => s.id === projectSkill.skill_id);
                return skill ? (
                  <ListItem key={projectSkill.id}>
                    <ListItemText
                      primary={skill.name}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove Skill">
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleSkillRemove(skillAssignmentDialog.project.id, projectSkill.skill_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : null;
              })}
              {availableSkills.length === 0 && (
                <ListItem>
                  <ListItemText primary="No skills assigned to this project" />
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkillAssignmentCancel}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTable; 