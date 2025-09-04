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

export default function MatchingSettings() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <UserInfoHeader />
        <AdminNav />
        
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Matching Settings
        </Typography>

        <SettingsNav />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Matching Algorithm Configuration
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Configure and run matching algorithms. Set up algorithm parameters, run matching processes, and view results.
          </Typography>
          
          <Alert severity="info">
            Matching algorithm functionality will be implemented in the next phase.
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
} 