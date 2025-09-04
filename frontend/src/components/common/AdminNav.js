import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ROUTE_DASHBOARD_ADMIN, 
  ROUTE_ADMIN_SETTINGS
} from '../../utils/routes';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Settings', path: ROUTE_ADMIN_SETTINGS }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        py: 2,
        mb: 3,
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      {navItems.map((item) => (
        <Typography
          key={item.path}
          variant="body1"
          sx={{
            cursor: 'pointer',
            fontWeight: isActive(item.path) ? 'bold' : 'normal',
            color: item.isGreen ? '#4caf50' : 'inherit',
            '&:hover': {
              fontWeight: 'bold',
              transition: 'font-weight 0.2s ease'
            }
          }}
          onClick={() => handleNavClick(item.path)}
        >
          {item.label}
        </Typography>
      ))}
    </Box>
  );
};

export default AdminNav; 