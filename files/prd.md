Project Requirements Document: Capstone Project Team and Project Assignment System
1. Introduction
This document outlines the requirements for a web-based system designed to facilitate the assignment of students to capstone projects and teams within the Computer Science department. The primary goal is to create a more efficient and student-preferred method for project and team allocation compared to the current manual process. This system will be used semester after semester.
2. Project Overview
The current method for assigning students to capstone projects involves a "Project Pick Day" where students physically move to project stations, and teams are formed with a cap on student numbers per project. This process, while effective from the instructor's perspective, is disliked by students. This new system aims to automate and optimize this process by leveraging student skill sets, collaboration preferences, and project choices.
3. Stakeholders
Richard Charles (Admin/Instructor): The primary stakeholder, responsible for setting up projects, defining skill sets, initiating the matching process, and making final team adjustments5555555555555555.
Project Managers: Students designated by the instructor to assist in team formation and review initial assignments.
Other Students/Faculty/Staff: Future potential stakeholders if the system expands beyond the initial scope.
4. User Roles and Features
The system will support three primary user roles:
4.1. Administrator (Richard Charles)
The Administrator role will have comprehensive control over the system's data and processes.
Project Management:
Create new projects, including:
Project Title
Brief Description
Maximum student capacity (cap) 
List of necessary skill sets 
CRUD existing project details.
CRUD project teams
Maintain a list of available skill sets that students can choose from. This includes adding new skill sets as needed.


Student and Team Management:
Initiate the automated student-to-project matching process based on student profiles.
Review the pre-assigned student-to-project matches.
Make manual tweaks and changes to student and team assignments.
Assign students as Project Managers.
View all student profiles and their selections (skills, desired teammates, top project choices).
Manage and view team compositions and assigned projects.


System Administration:
Ability to "start a new semester" which implies resetting relevant data for a new academic term.
Ability to see another semester's projects in the past given the application is used for further class sessions.
Generate reports on team assignments and project allocations .

4.3. Student
Students will primarily interact with the system to create their profiles and view their assigned team and project.
Profile Creation:
Create a profile page including:
Name
Contact Information (e.g., email address)
Selection of their possessed skill sets from a predefined list
Indication of other students in the class they wish to work with
Selection of their top 3 preferred projects
View Assignments:
View their assigned team and project.
5. Technical Requirements
Authentication: The system will utilize CS Central Authentication Service (CS CAS) for user authentication. This means users will log in using their standard Virginia Tech CS credentials. No separate login or sign-up screen is required
Hosting: The application will be a standalone web application hosted on the Discovery cluster (launch.cs.vt.edu).
Architecture: The most common configuration is expected to be three containers: a database container, a backend container, and a frontend container
Database: The system will require a relational database (e.g., MySQL) to store project information, student profiles, skill sets, and team assignments
Matching Algorithm: A core component will be the algorithm that processes student preferences (skill sets, desired teammates, project choices) to pre-assign students to projects
Security: Beyond CAS authentication, standard web application security practices should be followed.
Development Stack: React, MySQL, FastAPI, Typescript, Uvicorn, OpenAI API
Containerization: The application must be containerized using tools and processes compatible with the Discovery cluster.
Project Due Date: August 5th.
Grading: The project will be graded based on whether it is delivered on time, according to the defined specifications (objectives in the POS), and within budget. The quality of the delivered product is also implicitly assessed through meeting specifications


7. Future Considerations (Out of Scope for Initial Release)
While the system is intended for long-term use, refinement and additional features may be considered in future iteration9.
The system does not require students to upload documents (e.g., resumes) for skill verification. This could be a future enhancement
