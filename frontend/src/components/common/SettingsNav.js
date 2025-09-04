import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ROUTE_ADMIN_SETTINGS_USERS,
  ROUTE_ADMIN_SETTINGS_SEMESTERS,
  ROUTE_ADMIN_SETTINGS_COURSES,
  ROUTE_ADMIN_SETTINGS_PROJECTS,
  ROUTE_ADMIN_SETTINGS_SKILLS,
  ROUTE_ADMIN_SETTINGS_SYSTEM,

  ROUTE_ADMIN_SETTINGS_MATCHING
} from '../../utils/routes';

const SettingsNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const settingsItems = [
    { 
      label: 'Users', 
      path: ROUTE_ADMIN_SETTINGS_USERS,
      description: 'Manage users, affiliations, and permissions'
    },
    { 
      label: 'Semesters', 
      path: ROUTE_ADMIN_SETTINGS_SEMESTERS,
      description: 'Configure academic semesters and terms'
    },
    { 
      label: 'Courses', 
      path: ROUTE_ADMIN_SETTINGS_COURSES,
      description: 'Manage course assignments and CRNs'
    },
    { 
      label: 'Projects', 
      path: ROUTE_ADMIN_SETTINGS_PROJECTS,
      description: 'Configure project settings and teams'
    },
    { 
      label: 'Skills', 
      path: ROUTE_ADMIN_SETTINGS_SKILLS,
      description: 'Manage skill database and categories'
    },

    { 
      label: 'Matching Algorithm', 
      path: ROUTE_ADMIN_SETTINGS_MATCHING,
      description: 'Configure and run matching algorithms'
    },
    { 
      label: 'System', 
      path: ROUTE_ADMIN_SETTINGS_SYSTEM,
      description: 'System-wide settings and configurations'
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Settings
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 2
        }}
      >
        {settingsItems.map((item) => (
          <Box
            key={item.path}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: isActive(item.path) ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: isActive(item.path) ? 'primary.50' : 'background.paper',
              '&:hover': {
                backgroundColor: isActive(item.path) ? 'primary.100' : 'action.hover',
                borderColor: 'primary.main'
              },
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleNavClick(item.path)}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                color: isActive(item.path) ? 'primary.main' : 'text.primary',
                mb: 0.5
              }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default SettingsNav; 