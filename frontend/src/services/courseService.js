import apiClient, {
  API_COURSES,
  API_COURSES_COUNT,
  API_COURSES_SEARCH,
  API_COURSES_BY_SEMESTER,
  API_COURSES_WITHOUT_SEMESTER,
  API_COURSE_BY_ID,
  API_COURSE_BY_CRN,
} from './api';

class CourseService {
  // Create a new course
  async createCourse(courseData) {
    try {
      console.log('CourseService: Creating course with data:', courseData);
      const response = await apiClient.post(API_COURSES, courseData);
      console.log('CourseService: Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Get all courses with pagination
  async getCourses(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_COURSES, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const response = await apiClient.get(API_COURSE_BY_ID(courseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Get course by CRN
  async getCourseByCRN(crn) {
    try {
      const response = await apiClient.get(API_COURSE_BY_CRN(crn));
      return response.data;
    } catch (error) {
      console.error('Error fetching course by CRN:', error);
      throw error;
    }
  }

  // Update course
  async updateCourse(courseId, courseData) {
    try {
      console.log('CourseService: Updating course', courseId, 'with data:', courseData);
      const response = await apiClient.put(API_COURSE_BY_ID(courseId), courseData);
      console.log('CourseService: Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Delete course
  async deleteCourse(courseId) {
    try {
      const response = await apiClient.delete(API_COURSE_BY_ID(courseId));
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Get courses count
  async getCoursesCount() {
    try {
      const response = await apiClient.get(API_COURSES_COUNT);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses count:', error);
      throw error;
    }
  }

  // Search courses
  async searchCourses(searchTerm, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_COURSES_SEARCH, {
        params: { q: searchTerm, skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  // Get courses by semester
  async getCoursesBySemester(semesterId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_COURSES_BY_SEMESTER(semesterId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by semester:', error);
      throw error;
    }
  }

  // Get courses without semester
  async getCoursesWithoutSemester(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_COURSES_WITHOUT_SEMESTER, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses without semester:', error);
      throw error;
    }
  }
}

export default new CourseService(); 