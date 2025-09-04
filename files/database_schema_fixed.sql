-- MySQL Database Schema for Capstone Project Assignment System
-- This file contains all the necessary tables, constraints, and sample data
-- for the WebGeek Backend Summer 2025 project.
-- FIXED VERSION - Removed problematic triggers and functional indexes

-- Drop database if exists and create new one
-- DROP DATABASE IF EXISTS capstone_assignment_system;
-- CREATE DATABASE capstone_assignment_system;
-- USE capstone_assignment_system;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Represents a specific academic semester
-- This allows for historical data and resetting for new semesters
CREATE TABLE semesters (
    semester_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., "Fall 2025", "Spring 2026"',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Indicates if this is the current active semester',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_semester_active (is_active),
    INDEX idx_semester_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores all registered users of the system (Students, Admins, Project Managers)
-- Utilizes CS CAS for authentication, so no password field is needed here
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    cs_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Virginia Tech CS Central Authentication Service ID',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_role ENUM('Administrator', 'ProjectManager', 'Student') NOT NULL,
    crn VARCHAR(10) NULL COMMENT 'Course Registration Number - identifies which class section the student belongs to',
    managed_project_id INT NULL COMMENT 'Foreign key to link a Project Manager to their current assigned project',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (user_role),
    INDEX idx_user_cs_id (cs_id),
    INDEX idx_user_email (email),
    INDEX idx_user_names (first_name, last_name),
    INDEX idx_user_crn (crn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores the predefined list of available skills
CREATE TABLE skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_skill_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Represents the Capstone Projects offered each semester
CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    max_capacity INT NOT NULL,
    crn VARCHAR(10) NOT NULL COMMENT 'Course Registration Number - identifies which class section this project belongs to',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_semester (semester_id),
    INDEX idx_project_title (title),
    INDEX idx_project_capacity (max_capacity),
    INDEX idx_project_crn (crn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- JUNCTION TABLES (Many-to-Many Relationships)
-- ============================================================================

-- Junction table for many-to-many relationship between Projects and Skills
-- Defines which skills are "needed" or "relevant" for a particular project
CREATE TABLE project_skills (
    project_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, skill_id),
    INDEX idx_project_skill_project (project_id),
    INDEX idx_project_skill_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Junction table for many-to-many relationship between Students (Users) and Skills
-- Defines which skills a student "possesses"
CREATE TABLE user_skills (
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, skill_id),
    INDEX idx_user_skill_user (user_id),
    INDEX idx_user_skill_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores a student's preferred projects (top 3 choices)
CREATE TABLE student_project_preferences (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    preference_order INT NOT NULL COMMENT '1, 2, or 3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id),
    UNIQUE KEY uq_user_preference_order (user_id, preference_order),
    INDEX idx_preference_user (user_id),
    INDEX idx_preference_project (project_id),
    INDEX idx_preference_order (preference_order),
    CONSTRAINT chk_preference_order CHECK (preference_order BETWEEN 1 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores a student's desired teammates
CREATE TABLE desired_teammates (
    user_id INT NOT NULL COMMENT 'The student making the request',
    desired_teammate_id INT NOT NULL COMMENT 'The student they wish to work with',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, desired_teammate_id),
    INDEX idx_desired_user (user_id),
    INDEX idx_desired_teammate (desired_teammate_id),
    CONSTRAINT chk_different_users CHECK (user_id != desired_teammate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Represents the formed teams, linking them to a project
CREATE TABLE teams (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    team_name VARCHAR(255) COMMENT 'Optional, can be auto-generated or left null',
    project_manager_id INT NULL COMMENT 'The user_id of the Project Manager for this team, if applicable',
    crn VARCHAR(10) NOT NULL COMMENT 'Course Registration Number - identifies which class section this team belongs to',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_project (project_id),
    INDEX idx_team_manager (project_manager_id),
    INDEX idx_team_name (team_name),
    INDEX idx_team_crn (crn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Junction table for many-to-many relationship between Teams and Users (Students)
-- Defines which students are part of which team
CREATE TABLE team_members (
    team_id INT NOT NULL,
    user_id INT NOT NULL COMMENT 'The student member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    INDEX idx_team_member_team (team_id),
    INDEX idx_team_member_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store historical or generated reports
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    semester_id INT NOT NULL,
    report_type VARCHAR(100) NOT NULL COMMENT 'e.g., "Team Assignments", "Project Allocations"',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    report_data TEXT COMMENT 'Can store JSON or a reference to a file path',
    generated_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_semester (semester_id),
    INDEX idx_report_type (report_type),
    INDEX idx_report_generated_by (generated_by_user_id),
    INDEX idx_report_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key constraints after all tables are created
ALTER TABLE users
ADD CONSTRAINT fk_users_managed_project
FOREIGN KEY (managed_project_id) REFERENCES projects(project_id) ON DELETE SET NULL;

ALTER TABLE projects
ADD CONSTRAINT fk_projects_semester
FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE;

ALTER TABLE project_skills
ADD CONSTRAINT fk_project_skills_project
FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_project_skills_skill
FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE;

ALTER TABLE user_skills
ADD CONSTRAINT fk_user_skills_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_skills_skill
FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE;

ALTER TABLE student_project_preferences
ADD CONSTRAINT fk_preferences_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_preferences_project
FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

ALTER TABLE desired_teammates
ADD CONSTRAINT fk_desired_teammates_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_desired_teammates_teammate
FOREIGN KEY (desired_teammate_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE teams
ADD CONSTRAINT fk_teams_project
FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_teams_project_manager
FOREIGN KEY (project_manager_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_team
FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team_members_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE reports
ADD CONSTRAINT fk_reports_semester
FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reports_generated_by
FOREIGN KEY (generated_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample semesters
INSERT INTO semesters (semester_name, start_date, end_date, is_active) VALUES
('Fall 2024', '2024-08-26', '2024-12-20', FALSE),
('Spring 2025', '2025-01-13', '2025-05-09', FALSE),
('Summer 2025', '2025-05-19', '2025-08-08', TRUE);

-- Insert sample skills
INSERT INTO skills (skill_name) VALUES
('Python'),
('JavaScript'),
('React'),
('Node.js'),
('SQL'),
('MongoDB'),
('Docker'),
('AWS'),
('Machine Learning'),
('Data Analysis'),
('UI/UX Design'),
('Mobile Development'),
('DevOps'),
('Cybersecurity'),
('Cloud Computing');

-- Insert sample users
INSERT INTO users (cs_id, first_name, last_name, email, user_role, crn) VALUES
-- Administrators
('admin001', 'John', 'Admin', 'admin001@vt.edu', 'Administrator', NULL),
('admin002', 'Sarah', 'Manager', 'admin002@vt.edu', 'Administrator', NULL),

-- Project Managers
('pm001', 'Michael', 'Johnson', 'pm001@vt.edu', 'ProjectManager', '12345'),
('pm002', 'Emily', 'Davis', 'pm002@vt.edu', 'ProjectManager', '12345'),
('pm003', 'David', 'Wilson', 'pm003@vt.edu', 'ProjectManager', '12346'),

-- Students - Section 1 (CRN: 12345)
('student001', 'Alice', 'Smith', 'student001@vt.edu', 'Student', '12345'),
('student002', 'Bob', 'Jones', 'student002@vt.edu', 'Student', '12345'),
('student003', 'Carol', 'Brown', 'student003@vt.edu', 'Student', '12345'),
('student004', 'David', 'Miller', 'student004@vt.edu', 'Student', '12345'),
('student005', 'Eva', 'Garcia', 'student005@vt.edu', 'Student', '12345'),

-- Students - Section 2 (CRN: 12346)
('student006', 'Frank', 'Martinez', 'student006@vt.edu', 'Student', '12346'),
('student007', 'Grace', 'Anderson', 'student007@vt.edu', 'Student', '12346'),
('student008', 'Henry', 'Taylor', 'student008@vt.edu', 'Student', '12346'),
('student009', 'Ivy', 'Thomas', 'student009@vt.edu', 'Student', '12346'),
('student010', 'Jack', 'Hernandez', 'student010@vt.edu', 'Student', '12346');

-- Insert sample projects for Summer 2025
INSERT INTO projects (semester_id, title, description, max_capacity, crn) VALUES
(3, 'E-commerce Platform Development', 'Build a full-stack e-commerce platform with modern web technologies including React frontend and Node.js backend with MongoDB database.', 4, '12345'),
(3, 'Machine Learning Data Analysis Tool', 'Develop a comprehensive data analysis tool using Python, scikit-learn, and visualization libraries for business intelligence applications.', 3, '12345'),
(3, 'Mobile App for Campus Navigation', 'Create a React Native mobile application to help students navigate Virginia Tech campus with real-time location services.', 4, '12345'),
(3, 'Cybersecurity Threat Detection System', 'Build an AI-powered system for detecting and analyzing cybersecurity threats using Python and machine learning algorithms.', 3, '12345'),
(3, 'Cloud-Based Task Management System', 'Develop a scalable task management system using AWS services, Docker containers, and microservices architecture.', 4, '12345'),
(3, 'Real-time Chat Application', 'Create a real-time messaging application using WebSocket technology, Node.js backend, and React frontend.', 3, '12345');

-- Insert sample user skills
INSERT INTO user_skills (user_id, skill_id) VALUES
-- Alice Smith's skills
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5),
-- Bob Jones's skills
(7, 1), (7, 9), (7, 10), (7, 5),
-- Carol Brown's skills
(8, 2), (8, 3), (8, 4), (8, 12),
-- David Miller's skills
(9, 1), (9, 5), (9, 6), (9, 8),
-- Eva Garcia's skills
(10, 2), (10, 3), (10, 11), (10, 12),
-- Frank Martinez's skills
(11, 1), (11, 9), (11, 10), (11, 13),
-- Grace Anderson's skills
(12, 2), (12, 3), (12, 4), (12, 11),
-- Henry Taylor's skills
(13, 1), (13, 5), (13, 8), (13, 14),
-- Ivy Thomas's skills
(14, 2), (14, 3), (14, 4), (14, 12),
-- Jack Hernandez's skills
(15, 1), (15, 9), (15, 10), (15, 13);

-- Insert sample project skills
INSERT INTO project_skills (project_id, skill_id) VALUES
-- E-commerce Platform Development
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
-- Machine Learning Data Analysis Tool
(2, 1), (2, 9), (2, 10), (2, 5),
-- Mobile App for Campus Navigation
(3, 2), (3, 3), (3, 12), (3, 8),
-- Cybersecurity Threat Detection System
(4, 1), (4, 9), (4, 14), (4, 10),
-- Cloud-Based Task Management System
(5, 1), (5, 4), (5, 7), (5, 8), (5, 13),
-- Real-time Chat Application
(6, 2), (6, 3), (6, 4), (6, 5);

-- Insert sample student project preferences
INSERT INTO student_project_preferences (user_id, project_id, preference_order) VALUES
-- Alice Smith's preferences
(6, 1, 1), (6, 3, 2), (6, 6, 3),
-- Bob Jones's preferences
(7, 2, 1), (7, 4, 2), (7, 5, 3),
-- Carol Brown's preferences
(8, 3, 1), (8, 1, 2), (8, 6, 3),
-- David Miller's preferences
(9, 5, 1), (9, 1, 2), (9, 4, 3),
-- Eva Garcia's preferences
(10, 3, 1), (10, 6, 2), (10, 1, 3),
-- Frank Martinez's preferences
(11, 2, 1), (11, 4, 2), (11, 5, 3),
-- Grace Anderson's preferences
(12, 1, 1), (12, 3, 2), (12, 6, 3),
-- Henry Taylor's preferences
(13, 4, 1), (13, 5, 2), (13, 2, 3),
-- Ivy Thomas's preferences
(14, 3, 1), (14, 6, 2), (14, 1, 3),
-- Jack Hernandez's preferences
(15, 2, 1), (15, 4, 2), (15, 5, 3);

-- Insert sample desired teammates
INSERT INTO desired_teammates (user_id, desired_teammate_id) VALUES
(6, 8), (6, 10), (6, 12), -- Alice wants to work with Carol, Eva, Grace
(7, 11), (7, 13), (7, 15), -- Bob wants to work with Frank, Henry, Jack
(8, 6), (8, 10), (8, 14), -- Carol wants to work with Alice, Eva, Ivy
(9, 13), (9, 15), -- David wants to work with Henry, Jack
(10, 6), (10, 8), (10, 12), -- Eva wants to work with Alice, Carol, Grace
(11, 7), (11, 13), (11, 15), -- Frank wants to work with Bob, Henry, Jack
(12, 6), (12, 8), (12, 10), -- Grace wants to work with Alice, Carol, Eva
(13, 7), (13, 9), (13, 11), -- Henry wants to work with Bob, David, Frank
(14, 8), (14, 10), (14, 12), -- Ivy wants to work with Carol, Eva, Grace
(15, 7), (15, 9), (15, 11); -- Jack wants to work with Bob, David, Frank

-- Update project managers to be assigned to projects
UPDATE users SET managed_project_id = 1 WHERE cs_id = 'pm001';
UPDATE users SET managed_project_id = 2 WHERE cs_id = 'pm002';
UPDATE users SET managed_project_id = 3 WHERE cs_id = 'pm003';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active semester projects with their required skills
CREATE VIEW v_active_projects_with_skills AS
SELECT 
    p.project_id,
    p.title,
    p.description,
    p.max_capacity,
    GROUP_CONCAT(s.skill_name ORDER BY s.skill_name SEPARATOR ', ') as required_skills,
    COUNT(ps.skill_id) as skill_count
FROM projects p
JOIN semesters sem ON p.semester_id = sem.semester_id
LEFT JOIN project_skills ps ON p.project_id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.skill_id
WHERE sem.is_active = TRUE
GROUP BY p.project_id, p.title, p.description, p.max_capacity;

-- View for students with their skills and preferences
CREATE VIEW v_students_with_skills AS
SELECT 
    u.user_id,
    u.cs_id,
    u.first_name,
    u.last_name,
    u.email,
    GROUP_CONCAT(s.skill_name ORDER BY s.skill_name SEPARATOR ', ') as skills,
    COUNT(us.skill_id) as skill_count
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN skills s ON us.skill_id = s.skill_id
WHERE u.user_role = 'Student'
GROUP BY u.user_id, u.cs_id, u.first_name, u.last_name, u.email;

-- View for project preferences with student and project details
CREATE VIEW v_project_preferences AS
SELECT 
    spp.user_id,
    u.first_name,
    u.last_name,
    spp.project_id,
    p.title as project_title,
    spp.preference_order,
    p.max_capacity
FROM student_project_preferences spp
JOIN users u ON spp.user_id = u.user_id
JOIN projects p ON spp.project_id = p.project_id
ORDER BY spp.user_id, spp.preference_order;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Procedure to get students for a specific project with their skills
CREATE PROCEDURE GetProjectCandidates(IN project_id_param INT)
BEGIN
    SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        GROUP_CONCAT(s.skill_name ORDER BY s.skill_name SEPARATOR ', ') as skills,
        spp.preference_order
    FROM users u
    LEFT JOIN user_skills us ON u.user_id = us.user_id
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    LEFT JOIN student_project_preferences spp ON u.user_id = spp.user_id AND spp.project_id = project_id_param
    WHERE u.user_role = 'Student'
    GROUP BY u.user_id, u.first_name, u.last_name, u.email, spp.preference_order
    ORDER BY spp.preference_order ASC, u.last_name, u.first_name;
END //

-- Procedure to get project requirements with skills
CREATE PROCEDURE GetProjectRequirements(IN project_id_param INT)
BEGIN
    SELECT 
        p.project_id,
        p.title,
        p.description,
        p.max_capacity,
        GROUP_CONCAT(s.skill_name ORDER BY s.skill_name SEPARATOR ', ') as required_skills
    FROM projects p
    LEFT JOIN project_skills ps ON p.project_id = ps.project_id
    LEFT JOIN skills s ON ps.skill_id = s.skill_id
    WHERE p.project_id = project_id_param
    GROUP BY p.project_id, p.title, p.description, p.max_capacity;
END //

-- Procedure to get team assignments for a project
CREATE PROCEDURE GetTeamAssignments(IN project_id_param INT)
BEGIN
    SELECT 
        t.team_id,
        t.team_name,
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        GROUP_CONCAT(s.skill_name ORDER BY s.skill_name SEPARATOR ', ') as skills
    FROM teams t
    JOIN team_members tm ON t.team_id = tm.team_id
    JOIN users u ON tm.user_id = u.user_id
    LEFT JOIN user_skills us ON u.user_id = us.user_id
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    WHERE t.project_id = project_id_param
    GROUP BY t.team_id, t.team_name, u.user_id, u.first_name, u.last_name, u.email
    ORDER BY t.team_id, u.last_name, u.first_name;
END //

-- Procedure to manually ensure only one active semester (alternative to triggers)
CREATE PROCEDURE SetActiveSemester(IN semester_id_param INT)
BEGIN
    -- First, set all semesters to inactive
    UPDATE semesters SET is_active = FALSE;
    -- Then, set the specified semester to active
    UPDATE semesters SET is_active = TRUE WHERE semester_id = semester_id_param;
END //

DELIMITER ;

-- ============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for better query performance (simplified version)
CREATE INDEX idx_user_skills_skill_user ON user_skills(skill_id, user_id);
CREATE INDEX idx_project_skills_skill_project ON project_skills(skill_id, project_id);
CREATE INDEX idx_preferences_project_order ON student_project_preferences(project_id, preference_order);
CREATE INDEX idx_teams_project_manager ON teams(project_id, project_manager_id);

-- ============================================================================
-- FINAL COMMENTS
-- ============================================================================

/*
This database schema provides a complete foundation for the Capstone Project Assignment System.

Key Features:
1. Multi-semester support with active semester management
2. Comprehensive user management with role-based access
3. Skill-based matching between students and projects
4. Preference-based project selection
5. Team formation and management
6. Reporting and audit capabilities
7. Data integrity through constraints
8. Performance optimization through strategic indexing

Usage Notes:
- The schema supports the complete workflow from project creation to team assignment
- All foreign key relationships are properly defined with appropriate CASCADE/SET NULL behaviors
- Sample data is provided to test the system functionality
- Views and stored procedures are included for common operations
- Manual semester activation is handled via stored procedure instead of triggers

To use this schema:
1. Run this SQL file to create the database and all objects
2. Update the connection string in your application to point to this MySQL database
3. Test the sample data and procedures to ensure everything works as expected
4. Use the SetActiveSemester procedure to manage active semesters manually

Note: This version removes problematic triggers and functional indexes that require SUPER privileges.
*/ 