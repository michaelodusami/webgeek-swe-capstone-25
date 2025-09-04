import apiClient, {
  API_SEMESTERS,
  API_SEMESTERS_COUNT,
  API_SEMESTERS_SEARCH,
  API_SEMESTER_CURRENT,
  API_SEMESTER_BY_ID,
  API_SEMESTER_BY_DISPLAY_NAME,
} from "./api";

/**
 * All methods return: Promise<{ success: boolean, data: any, error: string|null }>
 */
const semesterService = {
  createSemester: (semesterData) =>
    apiClient.post(API_SEMESTERS + "/", semesterData).then(res => res.data),
  listSemesters: (params) =>
    apiClient.get(API_SEMESTERS + "/", { params }).then(res => res.data),
  getSemestersCount: () =>
    apiClient.get(API_SEMESTERS_COUNT).then(res => res.data),
  searchSemesters: (q, params = {}) =>
    apiClient.get(API_SEMESTERS_SEARCH, { params: { q, ...params } }).then(res => res.data),
  getCurrentSemester: () =>
    apiClient.get(API_SEMESTER_CURRENT).then(res => res.data),
  getSemesterById: (semesterId) =>
    apiClient.get(API_SEMESTER_BY_ID(semesterId)).then(res => res.data),
  getSemesterByDisplayName: (displayName) =>
    apiClient.get(API_SEMESTER_BY_DISPLAY_NAME(displayName)).then(res => res.data),
  updateSemester: (semesterId, semesterData) =>
    apiClient.put(API_SEMESTER_BY_ID(semesterId), semesterData).then(res => res.data),
  deleteSemester: (semesterId) =>
    apiClient.delete(API_SEMESTER_BY_ID(semesterId)).then(res => res.data),
};

export default semesterService; 