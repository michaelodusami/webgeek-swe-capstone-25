# Capstone Assignment System

## TL;DR (Overview)
The Capstone Assignment System is a full-stack web application designed to manage capstone projects at Virginia Tech, integrating with the university's Central Authentication Service (CAS) for secure user authentication. Built for a Software Engineering Capstone class (CS 4704) in Summer 2025, it facilitates project assignment, team formation, and skill-based matching for students, administrators, and project managers. The system uses a **React frontend** with Material-UI for a responsive interface, a **FastAPI backend** for robust API services, and a **MySQL database** for data persistence. The project was developed using Agile methodologies, with project management conducted via Trello sprints and daily standups, emphasizing iterative development and collaboration.

### Key Skills Demonstrated
- **Frontend Development**: React, JavaScript, TypeScript, Material-UI, Axios, React Router, Context API
- **Backend Development**: Python, FastAPI, SQLAlchemy, MySQL, API security (API keys, CAS authentication)
- **Database Management**: MySQL schema design, relational database concepts (junction tables, foreign keys, CASCADE/SET NULL constraints)
- **DevOps**: Docker, Kubernetes (deployments, services, ingress), CI/CD pipeline setup
- **Project Management**: Agile methodology, Trello sprints, daily standups
- **Authentication**: Virginia Tech CAS integration, session management with cookies
- **Testing**: Jest for frontend unit tests, Pytest for backend tests, API testing interface
- **Other Tools**: Bash scripting, environment variable management, Git for version control

---

## Introduction
The Capstone Assignment System is a web-based platform developed to streamline the management of capstone projects at Virginia Tech. It supports administrators in creating and managing semesters, projects, and skills, while enabling students to specify project preferences, desired teammates, and skills. The system ensures secure access through Virginia Tech’s CAS and provides role-based dashboards for students and administrators. Built as part of a Software Engineering Capstone course (CS 4704, Summer 2025), the project emphasizes Agile practices, with development organized in Trello sprints and daily standups to ensure iterative progress and team collaboration.

---

## Features
- **CAS Authentication**: Secure login/logout via Virginia Tech’s Central Authentication Service.
- **Role-Based Access**: Distinct dashboards for students (view projects, submit preferences) and administrators (manage users, projects, semesters, and skills).
- **Project Management**: Admins can create, update, and delete projects tied to specific semesters, with support for skill requirements and team assignments.
- **Skill-Based Matching**: Students can list their skills, and projects can specify required skills, enabling automated team formation.
- **Responsive UI**: Built with Material-UI for a modern, mobile-friendly interface.
- **API Testing Interface**: A dedicated dashboard for testing all GET endpoints, providing real-time response validation.
- **Database-Driven**: MySQL backend with a well-defined schema for managing semesters, users, projects, skills, teams, and preferences.
- **Deployment**: Containerized with Docker and deployed via Kubernetes, with separate services for frontend, backend, and database.

---

## Prerequisites
- **Node.js**: v16 or higher (for frontend)
- **Python**: v3.8+ (for backend)
- **MySQL**: v8.0+ (for database)
- **Docker**: For containerization
- **Kubernetes**: For deployment (optional for local development)
- **Virginia Tech CAS**: Access to CAS for authentication
- **npm/yarn**: For frontend dependency management
- **pip**: For backend dependency management

---

## Setup and Installation

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables in `.env`:
   ```env
   ENVIRONMENT=development
   DATABASE_URL=mysql+mysqlclient://user:password@localhost:3306/capstone_db
   API_KEY=your-api-key-here
   CAS_LOGIN_URL=https://login.vt.edu
   CAS_LOGOUT_URL=https://login.vt.edu/logout
   ```
4. Run the backend:
   ```bash
   fastapi dev main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3001
   REACT_APP_API_KEY=your-api-key-here
   REACT_APP_CAS_LOGIN_URL=http://localhost:3001/api/login
   REACT_APP_CAS_LOGOUT_URL=http://localhost:3001/api/logout
   REACT_APP_CAS_STATUS_URL=http://localhost:3001/api/auth/status
   REACT_APP_ENVIRONMENT=development
   ```
4. Start the frontend:
   ```bash
   npm start
   ```
5. Access the app at `http://localhost:3000`.

### Running Both Services
Use the `start-both.sh` script to launch both frontend and backend:
```bash
cd frontend
./start-both.sh
```
This script starts the FastAPI backend (port 3001) and React frontend (port 3000), logging PIDs to `pids.txt` for cleanup.

### Docker Deployment
1. Build and push Docker images:
   ```bash
   ./fakemake.sh
   ```
2. Deploy using Kubernetes (see `deployments/` for YAML files):
   - `react-deployment.yml`: Frontend deployment and service
   - `node-deployment.yml`: Backend deployment and service
   - `mongo-deployment.yml`: MongoDB service (if used instead of MySQL)
   - `ingress-deployment.yml`: Ingress routing for API and frontend

---

## Usage
1. **Login**: Access the app at `http://localhost:3000` and click "Login with CAS" to authenticate via Virginia Tech’s CAS.
2. **Student Dashboard**: View available projects, submit top 3 project preferences, list skills, and indicate desired teammates.
3. **Admin Dashboard**: Manage users, semesters, projects, skills, and team assignments. Generate reports for historical data.
4. **API Testing**: Use the "API Testing" button in the navbar to test GET endpoints and view responses.
5. **Logout**: Click "Logout" in the navbar to end the session.

---

## Database Schema
The MySQL database is structured to support the application’s core functionality. Key tables include:
- **Semesters**: Tracks academic terms (e.g., "Fall 2025") with start/end dates and active status.
- **Users**: Stores user data (students, admins, project managers) with CS CAS IDs and roles.
- **Skills**: Lists predefined skills (e.g., Python, React, Embedded Systems).
- **Projects**: Contains project details, linked to semesters, with titles, descriptions, and max team capacities.
- **ProjectSkills**: Junction table linking projects to required skills.
- **UserSkills**: Junction table linking users to their skills.
- **StudentProjectPreferences**: Stores students’ top 3 project choices.
- **DesiredTeammates**: Tracks students’ preferred collaborators.
- **Teams**: Represents formed teams, linked to projects and project managers.
- **TeamMembers**: Junction table linking students to teams.
- **Reports**: Stores generated reports for historical tracking.

See `files/database-schema-description.md` for the full SQL schema and design choices.

---

## Development

### Adding API Endpoints
1. Backend: Add routes in `backend/src/routes/` (e.g., `projects.py`) and corresponding services in `backend/src/services/`.
2. Frontend: Update the relevant service in `frontend/src/services/` (e.g., `projectService.js`) and integrate into components.
3. Test endpoints using the API testing interface (`ApiTestingPage.js`).

Example:
```javascript
// frontend/src/services/projectService.js
async getProjectById(id) {
  return await apiClient.get(`/projects/${id}`);
}

// In a component
const project = await projectService.getProjectById(123);
```

### Styling
- Uses Material-UI for consistent, responsive styling.
- Add custom styles via the `sx` prop or in CSS files (e.g., `src/App.css`).
- Follow the existing maroon and orange theme inspired by Virginia Tech’s branding.

### Testing
- **Frontend**: Run Jest tests with `npm test` (see `frontend/src/App.test.js`).
- **Backend**: Run Pytest tests with `pytest` in the `backend` directory (see `backend/src/tests/test_user.py`).
- **API Testing**: Use the built-in API testing dashboard to validate endpoints.

---

## Troubleshooting
- **CORS Errors**: Ensure the backend is running on `http://localhost:3001` and CORS is configured in `backend/src/core/settings.py`.
- **Authentication Issues**: Verify CAS URLs in both frontend and backend `.env` files.
- **Database Connection**: Check `DATABASE_URL` in the backend `.env` and ensure MySQL is running.
- **Docker Issues**: Confirm images are built and pushed correctly using `fakemake.sh`.

Enable debug mode by setting `REACT_APP_ENVIRONMENT=development` (frontend) and `ENVIRONMENT=development` (backend) for detailed logs.

---

## Future Enhancements
- **Automated Team Matching**: Implement an algorithm to match students to projects based on skills, preferences, and desired teammates, optimizing team composition.
- **Report Generation**: Enhance the `Reports` table functionality to generate detailed team assignment and project allocation reports, exportable as PDFs.
- **Skill Level Tracking**: Add a skill proficiency level (e.g., beginner, intermediate, advanced) to `UserSkills` and `ProjectSkills` for more granular matching.
- **Notification System**: Introduce email or in-app notifications for assignment updates, deadlines, or team changes.
- **Advanced Admin Features**: Add bulk user/project import via CSV, project status tracking, and audit logs for admin actions.
- **Mobile App**: Develop a companion mobile app using React Native, integrating with the same backend APIs.
- **Cloud Integration**: Explore AWS/GCP for scalable hosting, incorporating cloud-based services like RDS for MySQL or Lambda for serverless APIs.
- **Accessibility Improvements**: Enhance UI with ARIA compliance and better keyboard navigation for inclusivity.
- **Analytics Dashboard**: Build a dashboard for admins to visualize project allocation trends, student participation, and skill distribution.

---

## Contributing
1. Follow Agile practices: create Trello cards for tasks, assign them to sprints, and update during daily standups.
2. Adhere to the existing code structure (e.g., service-based architecture, Material-UI styling).
3. Add error handling for all API calls and include loading states for better UX.
4. Write unit tests for new features (Jest for frontend, Pytest for backend).
5. Validate changes using the API testing interface before submitting pull requests.

---

## License
This project is for educational purposes as part of CS 4704 at Virginia Tech. Contact the project team for licensing inquiries.

---

## Acknowledgments
Developed by the Dockerworkers team for the CS 4704 Software Engineering Capstone at Virginia Tech, Summer 2025. Special thanks to the instructors and Virginia Tech’s CS department for providing CAS authentication infrastructure and project guidance.
