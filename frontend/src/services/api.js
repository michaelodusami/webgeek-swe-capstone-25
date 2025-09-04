import axios from "axios";
import settings from "../config/settings";

// API ROUTE CONSTANTS
export const API_LOGIN = "/api/login";
export const API_LOGOUT = "/api/logout";
export const API_USERS = "/api/users";
export const API_USERS_COUNT = "/api/users/count";
export const API_USERS_SEARCH = "/api/users/search";
export const API_USER_BY_ID = (userId) => `/api/users/${userId}`;
export const API_USER_BY_UUPID = (uupid) => `/api/users/by-uupid/${uupid}`;
export const API_USER_BY_USERNAME = (username) => `/api/users/by-username/${username}`;
export const API_USER_ME = '/api/me';

// Skills API Routes
export const API_SKILLS = "/api/skills";
export const API_SKILLS_COUNT = "/api/skills/count";
export const API_SKILLS_SEARCH = "/api/skills/search";
export const API_SKILLS_BULK = "/api/skills/bulk";
export const API_SKILL_BY_ID = (skillId) => `/api/skills/${skillId}`;

// Semesters API Routes
export const API_SEMESTERS = "/api/semesters";
export const API_SEMESTERS_COUNT = "/api/semesters/count";
export const API_SEMESTERS_SEARCH = "/api/semesters/search";
export const API_SEMESTER_CURRENT = "/api/semesters/current";
export const API_SEMESTER_BY_ID = (semesterId) => `/api/semesters/${semesterId}`;
export const API_SEMESTER_BY_DISPLAY_NAME = (displayName) => `/api/semesters/by-display-name/${displayName}`;

// Courses API Routes
export const API_COURSES = "/api/courses";
export const API_COURSES_COUNT = "/api/courses/count";
export const API_COURSES_SEARCH = "/api/courses/search";
export const API_COURSES_BY_SEMESTER = (semesterId) => `/api/courses/by-semester/${semesterId}`;
export const API_COURSES_BY_SEMESTER_COUNT = (semesterId) => `/api/courses/by-semester/${semesterId}/count`;
export const API_COURSES_WITHOUT_SEMESTER = "/api/courses/without-semester";
export const API_COURSE_BY_ID = (courseId) => `/api/courses/${courseId}`;
export const API_COURSE_BY_CRN = (crn) => `/api/courses/by-crn/${crn}`;

// Projects API Routes
export const API_PROJECTS = "/api/projects";
export const API_PROJECTS_COUNT = "/api/projects/count";
export const API_PROJECTS_SEARCH = "/api/projects/search";
export const API_PROJECTS_BY_COURSE = (courseId) => `/api/projects/by-course/${courseId}`;
export const API_PROJECTS_BY_TEAM = (teamName) => `/api/projects/by-team/${teamName}`;
export const API_PROJECTS_BY_CAPACITY = "/api/projects/by-capacity";
export const API_PROJECTS_WITHOUT_COURSE = "/api/projects/without-course";
export const API_PROJECTS_COUNT_BY_COURSE = (courseId) => `/api/projects/count/by-course/${courseId}`;
export const API_PROJECT_BY_ID = (projectId) => `/api/projects/${projectId}`;

// Project-Users API Routes
export const API_PROJECT_USERS = "/api/project-users";
export const API_PROJECT_USERS_COUNT = "/api/project-users/count";
export const API_PROJECT_USERS_BY_PROJECT = (projectId) => `/api/project-users/by-project/${projectId}`;
export const API_PROJECT_USERS_BY_USER = (userId) => `/api/project-users/by-user/${userId}`;
export const API_PROJECT_USERS_COUNT_BY_PROJECT = (projectId) => `/api/project-users/count/by-project/${projectId}`;
export const API_PROJECT_USERS_COUNT_BY_USER = (userId) => `/api/project-users/count/by-user/${userId}`;
export const API_PROJECT_USER_BY_ID = (projectUserId) => `/api/project-users/${projectUserId}`;

// Project-Skills API Routes
export const API_PROJECT_SKILLS = "/api/project-skills";
export const API_PROJECT_SKILLS_COUNT = "/api/project-skills/count";
export const API_PROJECT_SKILLS_BY_PROJECT = (projectId) => `/api/project-skills/by-project/${projectId}`;
export const API_PROJECT_SKILLS_BY_SKILL = (skillId) => `/api/project-skills/by-skill/${skillId}`;
export const API_PROJECT_SKILLS_COUNT_BY_PROJECT = (projectId) => `/api/project-skills/count/by-project/${projectId}`;
export const API_PROJECT_SKILLS_COUNT_BY_SKILL = (skillId) => `/api/project-skills/count/by-skill/${skillId}`;
export const API_PROJECT_SKILL_BY_ID = (projectSkillId) => `/api/project-skills/${projectSkillId}`;

// User-Courses API Routes
export const API_USER_COURSES = "/api/user-courses";
export const API_USER_COURSES_COUNT = "/api/user-courses/count";
export const API_USER_COURSES_BY_USER = (userId) => `/api/user-courses/by-user/${userId}`;
export const API_USER_COURSES_BY_COURSE = (courseId) => `/api/user-courses/by-course/${courseId}`;
export const API_USER_COURSES_COUNT_BY_USER = (userId) => `/api/user-courses/count/by-user/${userId}`;
export const API_USER_COURSES_COUNT_BY_COURSE = (courseId) => `/api/user-courses/count/by-course/${courseId}`;
export const API_USER_COURSE_BY_ID = (userCourseId) => `/api/user-courses/${userCourseId}`;

// Create an axios instance with base URL and default headers
axios.defaults.withCredentials = true;
const apiClient = axios.create({
  baseURL: settings.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": settings.apiKey,
  },
  maxRedirects: 0,
});

export default apiClient; 