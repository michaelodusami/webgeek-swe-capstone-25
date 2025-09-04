import React, { useContext } from 'react';
import { Box, Button } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTE_HOME } from '../../utils/routes';

const UserInfoHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTE_HOME);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {user && (
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <strong>Logged in as:</strong> {user.username} ({user.edupersonprincipalname})<br />
              <span style={{ color: '#861F41', fontWeight: 500 }}>Role:</span> {user.edupersonprimaryaffiliation}
            </Box>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="small" 
              onClick={handleLogout}
              sx={{ minWidth: 'fit-content' }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserInfoHeader; 