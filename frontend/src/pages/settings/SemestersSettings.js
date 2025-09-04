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
import SemesterTable from '../../components/common/SemesterTable';
import semesterService from '../../services/semesterService';

export default function SemestersSettings() {
  const [allSemesters, setAllSemesters] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);
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

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        page_size: 1000, // Get all semesters
      };

      const response = await semesterService.listSemesters(params);
      
      if (response.success) {
        const semestersData = response.data.items || response.data || [];
        setAllSemesters(semestersData);
        setFilteredSemesters(semestersData);
        setPagination(prev => ({
          ...prev,
          total: semestersData.length
        }));
      } else {
        setError(response.error || 'Failed to fetch semesters');
      }
    } catch (err) {
      setError('Failed to fetch semesters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = allSemesters;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(semester => 
        semester.displayName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSemesters(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 0 // Reset to first page when filters change
    }));
  }, [allSemesters, filters]);

  // Get paginated semesters
  const getPaginatedSemesters = () => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredSemesters.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchSemesters();
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

  const handleSemesterCreate = async (semesterData) => {
    try {
      const response = await semesterService.createSemester(semesterData);
      if (response.success) {
        // Add new semester to local state
        setAllSemesters(prev => [...prev, response.data]);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSemesterUpdate = async (semesterId, semesterData) => {
    try {
      const response = await semesterService.updateSemester(semesterId, semesterData);
      if (response.success) {
        // Update semester in local state
        setAllSemesters(prev => 
          prev.map(semester => 
            semester.id === semesterId ? { ...semester, ...response.data } : semester
          )
        );
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSemesterDelete = async (semesterId) => {
    try {
      const response = await semesterService.deleteSemester(semesterId);
      if (response.success) {
        // Remove semester from local state
        setAllSemesters(prev => prev.filter(semester => semester.id !== semesterId));
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
          Semester Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Semester Management
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Configure academic semesters and terms. Manage semester start/end dates and display names.
            You can create, edit, and delete semesters with their respective date ranges.
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
            <SemesterTable
              semesters={getPaginatedSemesters()}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearchChange={handleSearchChange}
              onSemesterCreate={handleSemesterCreate}
              onSemesterUpdate={handleSemesterUpdate}
              onSemesterDelete={handleSemesterDelete}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
} 