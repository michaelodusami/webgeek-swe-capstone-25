import apiClient, { API_LOGIN, API_LOGOUT } from "./api";

/**
 * Login via CAS or dev mode.
 * @param {string} role - Role for dev login (e.g., 'student', 'staff'). Defaults to 'student'.
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
const login = (role = "student") =>
  apiClient.get(API_LOGIN, { params: { role } }).then(res => res.data);

const logout = () =>
  apiClient.get(API_LOGOUT).then(res => res.data);

const authService = {
  login,
  logout,
};

export default authService;