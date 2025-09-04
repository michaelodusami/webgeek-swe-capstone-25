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
import SkillTable from '../../components/common/SkillTable';
import skillService from '../../services/skillService';

export default function SkillsSettings() {
  const [allSkills, setAllSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
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

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await skillService.getSkills(0, 100);
      
      if (response.success) {
        const skillsData = response.data || [];
        setAllSkills(skillsData);
        setFilteredSkills(skillsData);
        setPagination(prev => ({
          ...prev,
          total: skillsData.length
        }));
      } else {
        setError(response.error || 'Failed to fetch skills');
      }
    } catch (err) {
      setError('Failed to fetch skills: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = allSkills;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(skill => 
        skill.name?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSkills(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 0 // Reset to first page when filters change
    }));
  }, [allSkills, filters]);

  // Get paginated skills
  const getPaginatedSkills = () => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredSkills.slice(startIndex, endIndex);
  };

  useEffect(() => {
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

  const handleSkillCreate = async (skillData) => {
    try {
      const response = await skillService.createSkill(skillData);
      if (response.success) {
        // Add new skill to local state
        setAllSkills(prev => [...prev, response.data]);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to create skill' };
      }
    } catch (err) {
      console.error('Skill creation error:', err);
      return { success: false, error: err.message || 'Failed to create skill' };
    }
  };

  const handleSkillUpdate = async (skillId, skillData) => {
    try {
      const response = await skillService.updateSkill(skillId, skillData);
      if (response.success) {
        // Update skill in local state
        setAllSkills(prev => 
          prev.map(skill => 
            skill.id === skillId ? { ...skill, ...response.data } : skill
          )
        );
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update skill' };
      }
    } catch (err) {
      console.error('Skill update error:', err);
      return { success: false, error: err.message || 'Failed to update skill' };
    }
  };

  const handleSkillDelete = async (skillId) => {
    try {
      const response = await skillService.deleteSkill(skillId);
      if (response.success) {
        // Remove skill from local state
        setAllSkills(prev => prev.filter(skill => skill.id !== skillId));
        return { success: true };
      } else {
        return { success: false, error: response.error };
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
          Skill Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Skill Management
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Manage the skills database. Add, edit, and delete skill names that can be assigned to users and projects.
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
            <SkillTable
              skills={getPaginatedSkills()}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearchChange={handleSearchChange}
              onSkillCreate={handleSkillCreate}
              onSkillUpdate={handleSkillUpdate}
              onSkillDelete={handleSkillDelete}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
} 