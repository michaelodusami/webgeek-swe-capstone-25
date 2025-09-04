Database Schema for Capstone Project Assignment System
Here's a relational database schema for your Capstone Project Team and Project Assignment System, designed with MySQL in mind as requested. This schema addresses the core requirements for managing projects, students, skills, teams, and assignments across multiple semesters.

Entity-Relationship Diagram (Conceptual Overview)
Users (Students, Administrators, Project Managers)
Semesters (To manage data across different academic terms)
Projects (Capstone projects offered each semester)
Skills (Predefined skills students can possess or projects can require)
Teams (Groups of students assigned to a project)

Schema Details
SQL
-- Represents a specific academic semester.
-- This allows for historical data and resetting for new semesters.
CREATE TABLE Semesters (
semester_id INT PRIMARY KEY AUTO_INCREMENT,
semester_name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "Fall 2025", "Spring 2026"
start_date DATE NOT NULL,
end_date DATE NOT NULL,
is_active BOOLEAN DEFAULT TRUE -- Indicates if this is the current active semester
);

-- Stores all registered users of the system (Students, Admins, Project Managers).
-- Utilizes CS CAS for authentication, so no password field is needed here.
CREATE TABLE Users (
user_id INT PRIMARY KEY AUTO_INCREMENT,
cs_id VARCHAR(50) NOT NULL UNIQUE, -- Virginia Tech CS Central Authentication Service ID
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
user_role ENUM('Administrator', 'ProjectManager', 'Student') NOT NULL,
-- Foreign key to link a Project Manager to their current assigned project
-- Can be NULL if the user is not a Project Manager or not assigned yet.
managed_project_id INT NULL,
FOREIGN KEY (managed_project_id) REFERENCES Projects(project_id) ON DELETE SET NULL
);

-- Stores the predefined list of available skills.
CREATE TABLE Skills (
skill_id INT PRIMARY KEY AUTO_INCREMENT,
skill_name VARCHAR(100) NOT NULL UNIQUE
);

-- Represents the Capstone Projects offered each semester.
CREATE TABLE Projects (
project_id INT PRIMARY KEY AUTO_INCREMENT,
semester_id INT NOT NULL,
title VARCHAR(255) NOT NULL,
description TEXT,
max_capacity INT NOT NULL,
FOREIGN KEY (semester_id) REFERENCES Semesters(semester_id) ON DELETE CASCADE
);

-- Junction table for many-to-many relationship between Projects and Skills.
-- Defines which skills are "needed" or "relevant" for a particular project.
CREATE TABLE ProjectSkills (
project_id INT NOT NULL,
skill_id INT NOT NULL,
PRIMARY KEY (project_id, skill_id),
FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

-- Junction table for many-to-many relationship between Students (Users) and Skills.
-- Defines which skills a student "possesses".
CREATE TABLE UserSkills (
user_id INT NOT NULL,
skill_id INT NOT NULL,
PRIMARY KEY (user_id, skill_id),
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

-- Stores a student's preferred projects (top 3 choices).
CREATE TABLE StudentProjectPreferences (
user_id INT NOT NULL,
project_id INT NOT NULL,
preference_order INT NOT NULL, -- 1, 2, or 3
PRIMARY KEY (user_id, project_id),
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
CONSTRAINT chk_preference_order CHECK (preference_order BETWEEN 1 AND 3)
);

-- Stores a student's desired teammates.
CREATE TABLE DesiredTeammates (
user_id INT NOT NULL, -- The student making the request
desired_teammate_id INT NOT NULL, -- The student they wish to work with
PRIMARY KEY (user_id, desired_teammate_id),
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
FOREIGN KEY (desired_teammate_id) REFERENCES Users(user_id) ON DELETE CASCADE,
CONSTRAINT chk_different_users CHECK (user_id != desired_teammate_id)
);

-- Represents the formed teams, linking them to a project.
CREATE TABLE Teams (
team_id INT PRIMARY KEY AUTO_INCREMENT,
project_id INT NOT NULL,
team_name VARCHAR(255), -- Optional, can be auto-generated or left null
-- The user_id of the Project Manager for this team, if applicable.
-- This links back to the Users table where user_role = 'ProjectManager'.
project_manager_id INT NULL,
FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
FOREIGN KEY (project_manager_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Junction table for many-to-many relationship between Teams and Users (Students).
-- Defines which students are part of which team.
CREATE TABLE TeamMembers (
team_id INT NOT NULL,
user_id INT NOT NULL, -- The student member
PRIMARY KEY (team_id, user_id),
FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table to store historical or generated reports.
CREATE TABLE Reports (
report_id INT PRIMARY KEY AUTO_INCREMENT,
semester_id INT NOT NULL,
report_type VARCHAR(100) NOT NULL, -- e.g., 'Team Assignments', 'Project Allocations'
generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
report_data TEXT, -- Can store JSON or a reference to a file path
generated_by_user_id INT NOT NULL,
FOREIGN KEY (semester_id) REFERENCES Semesters(semester_id) ON DELETE CASCADE,
FOREIGN KEY (generated_by_user_id) REFERENCES Users(user_id) ON DELETE RESTRICT
);

Explanation and Design Choices
Semesters Table: This is crucial for handling the "start a new semester" requirement and viewing past semester data. All Projects will be tied to a specific semester_id.
Users Table: This consolidates all system users. The user_role enum dictates their permissions. cs_id is the unique identifier from CS CAS. managed_project_id on the Users table directly links a ProjectManager to the Project they oversee.
Skills Table: A simple lookup table for all possible skills.
Projects Table: Stores the core project information. max_capacity is key for the matching algorithm.
Junction Tables for Many-to-Many Relationships:
ProjectSkills: A project can require multiple skills, and a skill can be required by multiple projects.
UserSkills: A student can possess multiple skills, and a skill can be possessed by multiple students.
StudentProjectPreferences: Captures the student's top 3 choices.
DesiredTeammates: Allows students to indicate preferred collaborators.
TeamMembers: Links students to their assigned teams.
Teams Table: Represents the actual formed teams. Each team is assigned to a single Project. The project_manager_id foreign key explicitly links the team to its designated Project Manager from the Users table.
Reports Table: Provides a place to store generated reports, allowing for historical access and tracking.
ON DELETE CASCADE and ON DELETE SET NULL:
ON DELETE CASCADE is used where deleting a parent record (e.g., a Semester) should automatically delete related child records (e.g., Projects within that semester) to maintain data integrity.
ON DELETE SET NULL is used for managed_project_id and project_manager_id. If a project or user is deleted, the corresponding foreign key can be set to NULL instead of deleting the user or team, allowing for more flexible data management.
UNIQUE Constraints: Ensures data integrity for fields like semester_name, cs_id, and email.
ENUM Type: Used for user_role in the Users table to restrict valid roles and improve data consistency.
