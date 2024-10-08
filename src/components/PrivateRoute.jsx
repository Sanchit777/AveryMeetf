import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('id'); // Assuming 'userId' is the key
  return userId ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
