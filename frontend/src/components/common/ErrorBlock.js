import React from 'react';
import { Box, Typography } from '@mui/material';

function ErrorBlock({ message }) {
  if (!message) return null;
  return (
    <Box
      sx={{
        bgcolor: '#fdecea',
        color: '#b71c1c',
        border: '1px solid #f5c6cb',
        borderRadius: 2,
        p: 2,
        mb: 2,
        textAlign: 'center',
      }}
      role="alert"
    >
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}

export default ErrorBlock; 