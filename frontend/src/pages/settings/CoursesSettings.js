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
import CourseTable from '../../components/common/CourseTable';
import courseService from '../../services/courseService';
import semesterService from '../../services/semesterService';
import userService from '../../services/userService';
import userCourseService from '../../services/userCourseService';

export default function CoursesSettings() {
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [users, setUsers] = useState([]);
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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getCourses(0, 100);
      
      if (response.success) {
        const coursesData = response.data || [];
        setAllCourses(coursesData);
        setFilteredCourses(coursesData);
        setPagination(prev => ({
          ...prev,
          total: coursesData.length
        }));
      } else {
        setError(response.error || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('Failed to fetch courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await semesterService.listSemesters({ skip: 0, limit: 100 });
      if (response.success) {
        setSemesters(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch semesters:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.listUsers({ skip: 0, limit: 100 });
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = allCourses;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(course => 
        course.crn?.toLowerCase().includes(searchTerm) ||
        course.displayName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredCourses(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 0 // Reset to first page when filters change
    }));
  }, [allCourses, filters]);

  // Get paginated courses
  const getPaginatedCourses = () => {
    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredCourses.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchCourses();
    fetchSemesters();
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

  const handleCourseCreate = async (courseData) => {
    try {
      const response = await courseService.createCourse(courseData);
      if (response.success) {
        // Add new course to local state
        setAllCourses(prev => [...prev, response.data]);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to create course' };
      }
    } catch (err) {
      console.error('Course creation error:', err);
      return { success: false, error: err.message || 'Failed to create course' };
    }
  };

  const handleCourseUpdate = async (courseId, courseData) => {
    try {
      const response = await courseService.updateCourse(courseId, courseData);
      if (response.success) {
        // Update course in local state
        setAllCourses(prev => 
          prev.map(course => 
            course.id === courseId ? { ...course, ...response.data } : course
          )
        );
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update course' };
      }
    } catch (err) {
      console.error('Course update error:', err);
      return { success: false, error: err.message || 'Failed to update course' };
    }
  };

  const handleCourseDelete = async (courseId) => {
    try {
      const response = await courseService.deleteCourse(courseId);
      if (response.success) {
        // Remove course from local state
        setAllCourses(prev => prev.filter(course => course.id !== courseId));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleUserAssign = async (courseId, userId, fetchOnly = false) => {
    try {
      if (fetchOnly) {
        // Fetch users for the course
        const response = await userCourseService.getUserCoursesByCourse(courseId, 0, 100);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          return { success: false, error: response.error || 'Failed to fetch course users' };
        }
      } else {
        // Assign user to course
        const response = await userCourseService.createUserCourse({
          course_id: courseId,
          user_id: userId
        });
        if (response.success) {
          return { success: true };
        } else {
          return { success: false, error: response.error || 'Failed to assign user to course' };
        }
      }
    } catch (err) {
      console.error('User assignment error:', err);
      return { success: false, error: err.message || 'Failed to assign user to course' };
    }
  };

  const handleUserRemove = async (courseId, userId) => {
    try {
      // First get the user-course relationship to find the ID
      const userCoursesResponse = await userCourseService.getUserCoursesByCourse(courseId, 0, 100);
      if (userCoursesResponse.success) {
        const userCourse = userCoursesResponse.data.find(uc => uc.user_id === userId);
        if (userCourse) {
          const response = await userCourseService.deleteUserCourse(userCourse.id);
          if (response.success) {
            // Return updated user list
            const updatedResponse = await userCourseService.getUserCoursesByCourse(courseId, 0, 100);
            if (updatedResponse.success) {
              return { success: true, data: updatedResponse.data };
            } else {
              return { success: true };
            }
          } else {
            return { success: false, error: response.error || 'Failed to remove user from course' };
          }
        } else {
          return { success: false, error: 'User-course relationship not found' };
        }
      } else {
        return { success: false, error: 'Failed to find user-course relationships' };
      }
    } catch (err) {
      console.error('User removal error:', err);
      return { success: false, error: err.message || 'Failed to remove user from course' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <UserInfoHeader />
        <AdminNav />
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Course Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Course Management
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Create, edit, and delete courses. Manage courses by semester, including CRN and display name assignments. Assign and remove users from courses.
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
            <CourseTable
              courses={getPaginatedCourses()}
              semesters={semesters}
              users={users}
              pagination={pagination}
              filters={filters}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSearchChange={handleSearchChange}
              onCourseCreate={handleCourseCreate}
              onCourseUpdate={handleCourseUpdate}
              onCourseDelete={handleCourseDelete}
              onUserAssign={handleUserAssign}
              onUserRemove={handleUserRemove}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
} 