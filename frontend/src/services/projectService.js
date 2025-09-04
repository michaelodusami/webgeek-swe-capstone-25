import apiClient, {
  API_PROJECTS,
  API_PROJECTS_COUNT,
  API_PROJECTS_SEARCH,
  API_PROJECTS_BY_COURSE,
  API_PROJECTS_BY_TEAM,
  API_PROJECTS_BY_CAPACITY,
  API_PROJECTS_WITHOUT_COURSE,
  API_PROJECTS_COUNT_BY_COURSE,
  API_PROJECT_BY_ID,
} from './api';

class ProjectService {
  // Create a new project
  async createProject(projectData) {
    try {
      console.log('ProjectService: Creating project with data:', projectData);
      const response = await apiClient.post(API_PROJECTS, projectData);
      console.log('ProjectService: Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Get all projects with pagination
  async getProjects(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECTS, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get project by ID
  async getProjectById(projectId) {
    try {
      const response = await apiClient.get(API_PROJECT_BY_ID(projectId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId, projectData) {
    try {
      console.log('ProjectService: Updating project', projectId, 'with data:', projectData);
      const response = await apiClient.put(API_PROJECT_BY_ID(projectId), projectData);
      console.log('ProjectService: Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await apiClient.delete(API_PROJECT_BY_ID(projectId));
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Get projects count
  async getProjectsCount() {
    try {
      const response = await apiClient.get(API_PROJECTS_COUNT);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects count:', error);
      throw error;
    }
  }

  // Search projects
  async searchProjects(searchTerm, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECTS_SEARCH, {
        params: { q: searchTerm, skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }

  // Get projects by course
  async getProjectsByCourse(courseId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECTS_BY_COURSE(courseId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects by course:', error);
      throw error;
    }
  }

  // Get projects by team name
  async getProjectsByTeam(teamName, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECTS_BY_TEAM(teamName), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects by team:', error);
      throw error;
    }
  }

  // Get projects by capacity range
  async getProjectsByCapacity(minCapacity = null, maxCapacity = null, skip = 0, limit = 10) {
    try {
      const params = { skip, limit };
      if (minCapacity !== null) params.min_capacity = minCapacity;
      if (maxCapacity !== null) params.max_capacity = maxCapacity;
      
      const response = await apiClient.get(API_PROJECTS_BY_CAPACITY, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects by capacity:', error);
      throw error;
    }
  }

  // Get projects without course
  async getProjectsWithoutCourse(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECTS_WITHOUT_COURSE, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching projects without course:', error);
      throw error;
    }
  }

  // Get projects count by course
  async getProjectsCountByCourse(courseId) {
    try {
      const response = await apiClient.get(API_PROJECTS_COUNT_BY_COURSE(courseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching projects count by course:', error);
      throw error;
    }
  }
}

export default new ProjectService(); 