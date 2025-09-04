import apiClient, {
  API_USER_COURSES,
  API_USER_COURSES_COUNT,
  API_USER_COURSES_BY_USER,
  API_USER_COURSES_BY_COURSE,
  API_USER_COURSES_COUNT_BY_USER,
  API_USER_COURSES_COUNT_BY_COURSE,
  API_USER_COURSE_BY_ID,
} from './api';

class UserCourseService {
  // Create a new user-course relationship
  async createUserCourse(userCourseData) {
    try {
      console.log('UserCourseService: Creating user-course with data:', userCourseData);
      const response = await apiClient.post(API_USER_COURSES, userCourseData);
      console.log('UserCourseService: Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user-course relationship:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Get all user-course relationships with pagination
  async getUserCourses(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_USER_COURSES, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationships:', error);
      throw error;
    }
  }

  // Get user-course relationship by ID
  async getUserCourseById(userCourseId) {
    try {
      const response = await apiClient.get(API_USER_COURSE_BY_ID(userCourseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationship:', error);
      throw error;
    }
  }

  // Update user-course relationship
  async updateUserCourse(userCourseId, userCourseData) {
    try {
      console.log('UserCourseService: Updating user-course', userCourseId, 'with data:', userCourseData);
      const response = await apiClient.put(API_USER_COURSE_BY_ID(userCourseId), userCourseData);
      console.log('UserCourseService: Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user-course relationship:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Delete user-course relationship
  async deleteUserCourse(userCourseId) {
    try {
      const response = await apiClient.delete(API_USER_COURSE_BY_ID(userCourseId));
      return response.data;
    } catch (error) {
      console.error('Error deleting user-course relationship:', error);
      throw error;
    }
  }

  // Get user-course relationships count
  async getUserCoursesCount() {
    try {
      const response = await apiClient.get(API_USER_COURSES_COUNT);
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationships count:', error);
      throw error;
    }
  }

  // Get user-course relationships by user
  async getUserCoursesByUser(userId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_USER_COURSES_BY_USER(userId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationships by user:', error);
      throw error;
    }
  }

  // Get user-course relationships by course
  async getUserCoursesByCourse(courseId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_USER_COURSES_BY_COURSE(courseId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationships by course:', error);
      throw error;
    }
  }

  // Get user-course relationships count by user
  async getUserCoursesCountByUser(userId) {
    try {
      const response = await apiClient.get(API_USER_COURSES_COUNT_BY_USER(userId));
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationships count by user:', error);
      throw error;
    }
  }

  // Get user-course relationships count by course
  async getUserCoursesCountByCourse(courseId) {
    try {
      const response = await apiClient.get(API_USER_COURSES_COUNT_BY_COURSE(courseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching user-course relationships count by course:', error);
      throw error;
    }
  }
}

export default new UserCourseService(); 