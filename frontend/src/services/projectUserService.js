import apiClient, {
  API_PROJECT_USERS,
  API_PROJECT_USERS_COUNT,
  API_PROJECT_USERS_BY_PROJECT,
  API_PROJECT_USERS_BY_USER,
  API_PROJECT_USERS_COUNT_BY_PROJECT,
  API_PROJECT_USERS_COUNT_BY_USER,
  API_PROJECT_USER_BY_ID,
} from './api';

class ProjectUserService {
  // Create a new project-user relationship
  async createProjectUser(projectUserData) {
    try {
      const response = await apiClient.post(API_PROJECT_USERS, projectUserData);
      return response.data;
    } catch (error) {
      console.error('Error creating project-user relationship:', error);
      throw error;
    }
  }

  // Get all project-user relationships with pagination
  async getProjectUsers(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECT_USERS, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationships:', error);
      throw error;
    }
  }

  // Get project-user relationship by ID
  async getProjectUserById(projectUserId) {
    try {
      const response = await apiClient.get(API_PROJECT_USER_BY_ID(projectUserId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationship:', error);
      throw error;
    }
  }

  // Update project-user relationship
  async updateProjectUser(projectUserId, projectUserData) {
    try {
      const response = await apiClient.put(API_PROJECT_USER_BY_ID(projectUserId), projectUserData);
      return response.data;
    } catch (error) {
      console.error('Error updating project-user relationship:', error);
      throw error;
    }
  }

  // Delete project-user relationship
  async deleteProjectUser(projectUserId) {
    try {
      const response = await apiClient.delete(API_PROJECT_USER_BY_ID(projectUserId));
      return response.data;
    } catch (error) {
      console.error('Error deleting project-user relationship:', error);
      throw error;
    }
  }

  // Get project-user relationships count
  async getProjectUsersCount() {
    try {
      const response = await apiClient.get(API_PROJECT_USERS_COUNT);
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationships count:', error);
      throw error;
    }
  }

  // Get project-user relationships by project
  async getProjectUsersByProject(projectId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECT_USERS_BY_PROJECT(projectId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationships by project:', error);
      throw error;
    }
  }

  // Get project-user relationships by user
  async getProjectUsersByUser(userId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECT_USERS_BY_USER(userId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationships by user:', error);
      throw error;
    }
  }

  // Get project-user relationships count by project
  async getProjectUsersCountByProject(projectId) {
    try {
      const response = await apiClient.get(API_PROJECT_USERS_COUNT_BY_PROJECT(projectId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationships count by project:', error);
      throw error;
    }
  }

  // Get project-user relationships count by user
  async getProjectUsersCountByUser(userId) {
    try {
      const response = await apiClient.get(API_PROJECT_USERS_COUNT_BY_USER(userId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project-user relationships count by user:', error);
      throw error;
    }
  }
}

export default new ProjectUserService(); 