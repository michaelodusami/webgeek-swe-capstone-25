import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import AdminNav from '../../components/common/AdminNav';
import UserInfoHeader from '../../components/common/UserInfoHeader';
import SettingsNav from '../../components/common/SettingsNav';
import ProjectTable from '../../components/common/ProjectTable';
import projectService from '../../services/projectService';
import projectUserService from '../../services/projectUserService';
import projectSkillService from '../../services/projectSkillService';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import skillService from '../../services/skillService';

export default function ProjectsSettings() {
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      

      const response = await projectService.getProjects(0, 100);
      
      if (response.success) {
        const projectsData = response.data.items || response.data || [];
        
        // Fetch current user count for each project
        const projectsWithUserCount = await Promise.all(
          projectsData.map(async (project) => {
            try {
              const userResponse = await projectUserService.getProjectUsersByProject(project.id, 0, 100);
              const currentUsers = userResponse.success ? (userResponse.data || []).length : 0;
              return {
                ...project,
                currentUsers
              };
            } catch (err) {
              console.error(`Failed to fetch users for project ${project.id}:`, err);
              return {
                ...project,
                currentUsers: 0
              };
            }
          })
        );
        
        setAllProjects(projectsWithUserCount);
        setFilteredProjects(projectsWithUserCount);
        setPagination(prev => ({
          ...prev,
          total: projectsWithUserCount.length
        }));
      } else {
        setError(response.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('Failed to fetch projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.listUsers({ skip: 0, limit: 100 });
      if (response.success) {
        setAllUsers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses(0, 100);
      if (response.success) {
        setAllCourses(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await skillService.getSkills(0, 100);
      if (response.success) {
        setAllSkills(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = allProjects;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(project => 
        project.title?.toLowerCase().includes(searchTerm) ||
        project.description?.toLowerCase().includes(searchTerm) ||
        project.teamName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredProjects(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 0 // Reset to first page when filters change
    }));
  }, [allProjects, filters]);

  // Get paginated projects
  const getPaginatedProjects = () => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredProjects.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchCourses();
    fetchSkills();
  }, []); // Only fetch on component mount

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 0 }));
  };

  const handleSearchChange = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  const handleProjectCreate = async (projectData) => {
    try {
      const response = await projectService.createProject(projectData);
      if (response.success) {
        // Add new project to local state with initial user count of 0
        const newProject = { ...response.data, currentUsers: 0 };
        setAllProjects(prev => [...prev, newProject]);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to create project' };
      }
    } catch (err) {
      console.error('Project creation error:', err);
      return { success: false, error: err.message || 'Failed to create project' };
    }
  };

  const handleProjectUpdate = async (projectId, projectData) => {
    try {
      const response = await projectService.updateProject(projectId, projectData);
      if (response.success) {
        // Get current user count for the updated project
        let currentUsers = 0;
        try {
          const userResponse = await projectUserService.getProjectUsersByProject(projectId, 0, 100);
          currentUsers = userResponse.success ? (userResponse.data || []).length : 0;
        } catch (err) {
          console.error(`Failed to fetch users for project ${projectId}:`, err);
        }
        
        // Update project in local state with current user count
        setAllProjects(prev => 
          prev.map(project => 
            project.id === projectId ? { ...project, ...response.data, currentUsers } : project
          )
        );
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update project' };
      }
    } catch (err) {
      console.error('Project update error:', err);
      return { success: false, error: err.message || 'Failed to update project' };
    }
  };

  const handleProjectDelete = async (projectId) => {
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        // Remove project from local state
        setAllProjects(prev => prev.filter(project => project.id !== projectId));
        setFilteredProjects(prev => prev.filter(project => project.id !== projectId));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleUserAssign = async (projectId, userId, fetchOnly = false) => {
    try {
      if (fetchOnly) {
        // Fetch users for the project
        const response = await projectUserService.getProjectUsersByProject(projectId, 0, 100);
        if (response.success) {
          return { success: true, data: response.data || [] };
        } else {
          return { success: false, error: response.error || 'Failed to fetch project users' };
        }
      } else {
        // Check if project is at capacity
        const project = allProjects.find(p => p.id === projectId);
        if (project && project.currentUsers >= project.maxCapacity) {
          return { success: false, error: 'Project is at maximum capacity' };
        }
        
        // Assign user to project
        const response = await projectUserService.createProjectUser({
          project_id: parseInt(projectId),
          user_id: parseInt(userId)
        });
        if (response.success) {
          // Update the project's current user count
          setAllProjects(prev => 
            prev.map(project => 
              project.id === projectId 
                ? { ...project, currentUsers: project.currentUsers + 1 }
                : project
            )
          );
          return { success: true };
        } else {
          return { success: false, error: response.error || 'Failed to assign user to project' };
        }
      }
    } catch (err) {
      console.error('User assignment error:', err);
      return { success: false, error: err.message || 'Failed to assign user to project' };
    }
  };

  const handleUserRemove = async (projectId, userId) => {
    try {
      // First, get the project-user relationship ID
      const projectUsersResponse = await projectUserService.getProjectUsersByProject(projectId, 0, 100);
      if (projectUsersResponse.success) {
        const projectUser = projectUsersResponse.data.find(pu => pu.user_id === userId);
        if (projectUser) {
          const response = await projectUserService.deleteProjectUser(projectUser.id);
          if (response.success) {
            // Update the project's current user count
            setAllProjects(prev => 
              prev.map(project => 
                project.id === projectId 
                  ? { ...project, currentUsers: Math.max(0, project.currentUsers - 1) }
                  : project
              )
            );
            
            // Return updated user list
            const updatedResponse = await projectUserService.getProjectUsersByProject(projectId, 0, 100);
            if (updatedResponse.success) {
              return { success: true, data: updatedResponse.data };
            } else {
              return { success: true };
            }
          } else {
            return { success: false, error: response.error };
          }
        } else {
          return { success: false, error: 'User not found in project' };
        }
      } else {
        return { success: false, error: projectUsersResponse.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSkillAssign = async (projectId, skillId, fetchOnly = false) => {
    try {
      if (fetchOnly) {
        // Fetch skills for the project
        const response = await projectSkillService.getProjectSkillsByProject(projectId, 0, 100);
        if (response.success) {
          return { success: true, data: response.data || [] };
        } else {
          return { success: false, error: response.error || 'Failed to fetch project skills' };
        }
      } else {
        // Assign skill to project
        const response = await projectSkillService.createProjectSkill({
          project_id: parseInt(projectId),
          skill_id: parseInt(skillId)
        });
        if (response.success) {
          return { success: true };
        } else {
          return { success: false, error: response.error || 'Failed to assign skill to project' };
        }
      }
    } catch (err) {
      console.error('Skill assignment error:', err);
      return { success: false, error: err.message || 'Failed to assign skill to project' };
    }
  };

  const handleSkillRemove = async (projectId, skillId) => {
    try {
      // First, get the project-skill relationship ID
      const projectSkillsResponse = await projectSkillService.getProjectSkillsByProject(projectId, 0, 100);
      if (projectSkillsResponse.success) {
        const projectSkill = projectSkillsResponse.data.find(ps => ps.skill_id === skillId);
        if (projectSkill) {
          const response = await projectSkillService.deleteProjectSkill(projectSkill.id);
          if (response.success) {
            // Return updated skill list
            const updatedResponse = await projectSkillService.getProjectSkillsByProject(projectId, 0, 100);
            if (updatedResponse.success) {
              return { success: true, data: updatedResponse.data };
            } else {
              return { success: true };
            }
          } else {
            return { success: false, error: response.error };
          }
        } else {
          return { success: false, error: 'Skill not found in project' };
        }
      } else {
        return { success: false, error: projectSkillsResponse.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <UserInfoHeader />
        <AdminNav />
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Project Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Project Management
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Configure project settings and teams. Manage project assignments, capacities, and team compositions.
            You can create, edit, delete projects and assign/remove users from projects.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ProjectTable
              projects={getPaginatedProjects()}
              users={allUsers}
              courses={allCourses}
              skills={allSkills}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearchChange={handleSearchChange}
              onProjectCreate={handleProjectCreate}
              onProjectUpdate={handleProjectUpdate}
              onProjectDelete={handleProjectDelete}
              onUserAssign={handleUserAssign}
              onUserRemove={handleUserRemove}
              onSkillAssign={handleSkillAssign}
              onSkillRemove={handleSkillRemove}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
} 