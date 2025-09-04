import apiClient, {
  API_SKILLS,
  API_SKILLS_COUNT,
  API_SKILLS_SEARCH,
  API_SKILLS_BULK,
  API_SKILL_BY_ID,
} from "./api";

/**
 * All methods return: Promise<{ success: boolean, data: any, error: string|null }>
 */
const skillsService = {
  createSkill: (skillData) =>
    apiClient.post(API_SKILLS + "/", skillData).then(res => res.data),
  listSkills: (params) =>
    apiClient.get(API_SKILLS + "/", { params }).then(res => res.data),
  getSkillsCount: () =>
    apiClient.get(API_SKILLS_COUNT).then(res => res.data),
  searchSkills: (q, params = {}) =>
    apiClient.get(API_SKILLS_SEARCH, { params: { q, ...params } }).then(res => res.data),
  getSkillById: (skillId) =>
    apiClient.get(API_SKILL_BY_ID(skillId)).then(res => res.data),
  updateSkill: (skillId, skillData) =>
    apiClient.put(API_SKILL_BY_ID(skillId), skillData).then(res => res.data),
  deleteSkill: (skillId) =>
    apiClient.delete(API_SKILL_BY_ID(skillId)).then(res => res.data),
  createMultipleSkills: (skillsData) =>
    apiClient.post(API_SKILLS_BULK, skillsData).then(res => res.data),
};

export default skillsService; 