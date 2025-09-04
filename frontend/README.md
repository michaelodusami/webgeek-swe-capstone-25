# Frontend - Capstone Assignment System

This is the React frontend for the CS 4704 Capstone Assignment System. It provides a modern, responsive interface for managing capstone projects with CAS authentication.

## Features

- **CAS Authentication**: Integrated with Virginia Tech's Central Authentication Service
- **Modular API Client**: Object-oriented design with separate services for each resource
- **API Testing Interface**: Comprehensive testing dashboard for all GET endpoints
- **Responsive Design**: Built with Material-UI for modern, mobile-friendly interface
- **Role-based Access**: Different dashboards for students and administrators

## Project Structure

```
src/
├── components/
│   └── common/
│       ├── Navbar.js          # Main navigation with CAS auth
│       └── Layout.js          # Page layout wrapper
├── pages/
│   ├── LoginPage.js           # CAS login page
│   ├── DashboardStudent.js    # Student dashboard
│   ├── DashboardAdmin.js      # Admin dashboard
│   └── ApiTestingPage.js      # API testing interface
├── services/
│   ├── apiClient.js           # Base API client with axios
│   ├── authService.js         # CAS authentication service
│   ├── userService.js         # User API operations
│   ├── courseService.js       # Course API operations
│   ├── semesterService.js     # Semester API operations
│   ├── skillService.js        # Skill API operations
│   ├── projectService.js      # Project API operations
│   └── index.js               # Service exports
└── utils/
    └── (utility functions)
```

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 3001

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Copy the .env file and update with your configuration
cp .env.example .env
```

3. Update the `.env` file with your backend configuration:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_API_KEY=your-api-key-here

# CAS Configuration
REACT_APP_CAS_LOGIN_URL=http://localhost:3001/api/login
REACT_APP_CAS_LOGOUT_URL=http://localhost:3001/api/logout
REACT_APP_CAS_STATUS_URL=http://localhost:3001/api/auth/status

# Development Configuration
REACT_APP_ENVIRONMENT=development
```

### Running the Application

1. Start the development server:
```bash
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Services

The frontend uses a modular service architecture with the following services:

### Base API Client (`apiClient.js`)
- Handles HTTP requests with axios
- Includes request/response interceptors for logging
- Manages authentication headers
- Provides error handling

### Authentication Service (`authService.js`)
- CAS login/logout functionality
- Authentication status checking
- User information retrieval

### Resource Services
Each resource has its own service class:
- `userService.js` - User management
- `courseService.js` - Course operations
- `semesterService.js` - Semester management
- `skillService.js` - Skill operations
- `projectService.js` - Project management

## API Testing

The application includes a comprehensive API testing interface accessible via the "API Testing" button in the navbar. This interface allows you to:

- Test all GET endpoints
- View real-time responses
- See success/error status
- Test individual endpoints or run all tests

## Authentication Flow

1. **Login**: Users click "Login with CAS" to authenticate via Virginia Tech's CAS
2. **Redirect**: CAS redirects back to the application with authentication tokens
3. **Session**: The application maintains the session using cookies
4. **Dashboard**: Users are redirected to appropriate dashboard based on role
5. **Logout**: Users can logout via the navbar menu

## Development

### Adding New API Endpoints

1. Add the endpoint to the appropriate service class
2. Update the API testing page if needed
3. Use the service in your components

Example:
```javascript
// In userService.js
async getUserById(id) {
  return await apiClient.get(`${this.basePath}/${id}`);
}

// In your component
const user = await userService.getUserById(123);
```

### Styling

The application uses Material-UI (MUI) for styling. Custom styles can be added using the `sx` prop or styled components.

### State Management

The application uses React hooks for state management. For complex state, consider using Context API or Redux.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running and CORS is properly configured
2. **Authentication Issues**: Check that CAS URLs are correct in the environment file
3. **API Connection**: Verify the backend is running on the correct port

### Debug Mode

Enable debug mode by setting `REACT_APP_ENVIRONMENT=development` in your `.env` file. This will show additional logging information.

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Contributing

1. Follow the existing code structure and patterns
2. Add proper error handling to API calls
3. Include loading states for better UX
4. Test your changes using the API testing interface
