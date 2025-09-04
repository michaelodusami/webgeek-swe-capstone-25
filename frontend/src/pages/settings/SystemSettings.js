import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Alert
} from '@mui/material';
import AdminNav from '../../components/common/AdminNav';
import UserInfoHeader from '../../components/common/UserInfoHeader';
import SettingsNav from '../../components/common/SettingsNav';

export default function SystemSettings() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <UserInfoHeader />
        <AdminNav />
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          System Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            System Configuration
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            System-wide settings and configurations. Manage global preferences and system parameters.
          </Typography>
          
          <Alert severity="info">
            System configuration functionality will be implemented in the next phase.
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
} 