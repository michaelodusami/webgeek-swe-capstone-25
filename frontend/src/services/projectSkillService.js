import apiClient, {
  API_PROJECT_SKILLS,
  API_PROJECT_SKILLS_COUNT,
  API_PROJECT_SKILLS_BY_PROJECT,
  API_PROJECT_SKILLS_BY_SKILL,
  API_PROJECT_SKILLS_COUNT_BY_PROJECT,
  API_PROJECT_SKILLS_COUNT_BY_SKILL,
  API_PROJECT_SKILL_BY_ID,
} from './api';

class ProjectSkillService {
  // Create a new project-skill relationship
  async createProjectSkill(projectSkillData) {
    try {
      const response = await apiClient.post(API_PROJECT_SKILLS, projectSkillData);
      return response.data;
    } catch (error) {
      console.error('Error creating project-skill relationship:', error);
      throw error;
    }
  }

  // Get all project-skill relationships with pagination
  async getProjectSkills(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECT_SKILLS, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationships:', error);
      throw error;
    }
  }

  // Get project-skill relationship by ID
  async getProjectSkillById(projectSkillId) {
    try {
      const response = await apiClient.get(API_PROJECT_SKILL_BY_ID(projectSkillId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationship:', error);
      throw error;
    }
  }

  // Update project-skill relationship
  async updateProjectSkill(projectSkillId, projectSkillData) {
    try {
      const response = await apiClient.put(API_PROJECT_SKILL_BY_ID(projectSkillId), projectSkillData);
      return response.data;
    } catch (error) {
      console.error('Error updating project-skill relationship:', error);
      throw error;
    }
  }

  // Delete project-skill relationship
  async deleteProjectSkill(projectSkillId) {
    try {
      const response = await apiClient.delete(API_PROJECT_SKILL_BY_ID(projectSkillId));
      return response.data;
    } catch (error) {
      console.error('Error deleting project-skill relationship:', error);
      throw error;
    }
  }

  // Get project-skill relationships count
  async getProjectSkillsCount() {
    try {
      const response = await apiClient.get(API_PROJECT_SKILLS_COUNT);
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationships count:', error);
      throw error;
    }
  }

  // Get project-skill relationships by project
  async getProjectSkillsByProject(projectId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECT_SKILLS_BY_PROJECT(projectId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationships by project:', error);
      throw error;
    }
  }

  // Get project-skill relationships by skill
  async getProjectSkillsBySkill(skillId, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_PROJECT_SKILLS_BY_SKILL(skillId), {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationships by skill:', error);
      throw error;
    }
  }

  // Get project-skill relationships count by project
  async getProjectSkillsCountByProject(projectId) {
    try {
      const response = await apiClient.get(API_PROJECT_SKILLS_COUNT_BY_PROJECT(projectId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationships count by project:', error);
      throw error;
    }
  }

  // Get project-skill relationships count by skill
  async getProjectSkillsCountBySkill(skillId) {
    try {
      const response = await apiClient.get(API_PROJECT_SKILLS_COUNT_BY_SKILL(skillId));
      return response.data;
    } catch (error) {
      console.error('Error fetching project-skill relationships count by skill:', error);
      throw error;
    }
  }
}

export default new ProjectSkillService(); 