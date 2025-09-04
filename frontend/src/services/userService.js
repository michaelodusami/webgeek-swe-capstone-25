import apiClient, {
  API_USERS,
  API_USERS_COUNT,
  API_USERS_SEARCH,
  API_USER_BY_ID,
  API_USER_BY_UUPID,
  API_USER_BY_USERNAME,
  API_USER_ME,
} from "./api";

/**
 * All methods return: Promise<{ success: boolean, data: any, error: string|null }>
 */
const userService = {
  createUser: (userData) =>
    apiClient.post(API_USERS + "/", userData).then(res => res.data),
  listUsers: (params) =>
    apiClient.get(API_USERS + "/", { params }).then(res => res.data),
  getUsersCount: () =>
    apiClient.get(API_USERS_COUNT).then(res => res.data),
  searchUsers: (q, params = {}) =>
    apiClient.get(API_USERS_SEARCH, { params: { q, ...params } }).then(res => res.data),
  getUserById: (userId) =>
    apiClient.get(API_USER_BY_ID(userId)).then(res => res.data),
  getUserByUupid: (uupid) =>
    apiClient.get(API_USER_BY_UUPID(uupid)).then(res => res.data),
  getUserByUsername: (username) =>
    apiClient.get(API_USER_BY_USERNAME(username)).then(res => res.data),
  updateUser: (userId, userData) =>
    apiClient.put(API_USER_BY_ID(userId), userData).then(res => res.data),
  deleteUser: (userId) =>
    apiClient.delete(API_USER_BY_ID(userId)).then(res => res.data),
  getCurrentUser: () =>
    apiClient.get(API_USER_ME).then(res => res.data),
};

export default userService; 