import apiClient, {
  API_SKILLS,
  API_SKILLS_COUNT,
  API_SKILLS_SEARCH,
  API_SKILLS_BULK,
  API_SKILL_BY_ID,
} from './api';

class SkillService {
  // Create a new skill
  async createSkill(skillData) {
    try {
      console.log('SkillService: Creating skill with data:', skillData);
      const response = await apiClient.post(API_SKILLS, skillData);
      console.log('SkillService: Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Create multiple skills at once
  async createMultipleSkills(skillsData) {
    try {
      console.log('SkillService: Creating multiple skills with data:', skillsData);
      const response = await apiClient.post(API_SKILLS_BULK, skillsData);
      console.log('SkillService: Bulk create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating multiple skills:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Get all skills with pagination
  async getSkills(skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_SKILLS, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  }

  // Get skill by ID
  async getSkillById(skillId) {
    try {
      const response = await apiClient.get(API_SKILL_BY_ID(skillId));
      return response.data;
    } catch (error) {
      console.error('Error fetching skill:', error);
      throw error;
    }
  }

  // Update skill
  async updateSkill(skillId, skillData) {
    try {
      console.log('SkillService: Updating skill', skillId, 'with data:', skillData);
      const response = await apiClient.put(API_SKILL_BY_ID(skillId), skillData);
      console.log('SkillService: Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating skill:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Delete skill
  async deleteSkill(skillId) {
    try {
      const response = await apiClient.delete(API_SKILL_BY_ID(skillId));
      return response.data;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }

  // Get skills count
  async getSkillsCount() {
    try {
      const response = await apiClient.get(API_SKILLS_COUNT);
      return response.data;
    } catch (error) {
      console.error('Error fetching skills count:', error);
      throw error;
    }
  }

  // Search skills
  async searchSkills(searchTerm, skip = 0, limit = 10) {
    try {
      const response = await apiClient.get(API_SKILLS_SEARCH, {
        params: { q: searchTerm, skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching skills:', error);
      throw error;
    }
  }

  // Get skills for multi-select (formatted for dropdowns)
  async getSkillsForMultiSelect() {
    try {
      const response = await apiClient.get(`${API_SKILLS}/multi-select`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skills for multi-select:', error);
      throw error;
    }
  }
}

export default new SkillService(); 