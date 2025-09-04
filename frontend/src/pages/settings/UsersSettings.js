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
import UserTable from '../../components/common/UserTable';
import userService from '../../services/userService';

export default function UsersSettings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0
  });
  const [allUsers, setAllUsers] = useState([]); // Store all users
  const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered users
  const [filters, setFilters] = useState({
    search: '',
    affiliation: 'all'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1, // Get all users
        page_size: 1000, // Large number to get all users
      };

      const response = await userService.listUsers(params);
      
      if (response.success) {
        const usersData = response.data.items || response.data || [];
        setAllUsers(usersData);
        setFilteredUsers(usersData);
        setPagination(prev => ({
          ...prev,
          total: usersData.length
        }));
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and pagination
  useEffect(() => {
    let filtered = allUsers;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm) ||
        user.edupersonprincipalname?.toLowerCase().includes(searchTerm) ||
        user.uupid?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply affiliation filter
    if (filters.affiliation !== 'all') {
      filtered = filtered.filter(user => 
        user.edupersonprimaryaffiliation?.toLowerCase() === filters.affiliation.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 0 // Reset to first page when filters change
    }));
  }, [allUsers, filters]);

  // Get paginated users
  const getPaginatedUsers = () => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchUsers();
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

  const handleAffiliationFilter = (affiliation) => {
    setFilters(prev => ({ ...prev, affiliation }));
  };



  const handleUserDelete = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        // Remove user from local state
        setAllUsers(prev => prev.filter(user => user.id !== userId));
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
          User Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            User Management
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Manage all users in the system including students, faculty, and staff. 
            You can search, filter, and delete user accounts.
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
            <UserTable
              users={getPaginatedUsers()}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearchChange={handleSearchChange}
              onAffiliationFilter={handleAffiliationFilter}
              onUserDelete={handleUserDelete}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
} 