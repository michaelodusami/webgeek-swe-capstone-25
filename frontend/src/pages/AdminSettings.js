import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_ADMIN_SETTINGS_USERS } from '../utils/routes';

export default function AdminSettings() {
  // Redirect to users settings by default
  return <Navigate to={ROUTE_ADMIN_SETTINGS_USERS} replace />;
} 