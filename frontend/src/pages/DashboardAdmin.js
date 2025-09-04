// src/pages/DashboardAdmin.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_ADMIN_SETTINGS } from '../utils/routes';

export default function DashboardAdmin() {
  // Redirect to settings page since it's now the main admin home
  return <Navigate to={ROUTE_ADMIN_SETTINGS} replace />;
}
