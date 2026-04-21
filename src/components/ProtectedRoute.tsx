import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { isSessionExpired, getAccessToken } from '../utils/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const expired = await isSessionExpired();
      const token = await getAccessToken();
      setIsAuthenticated(!expired && !!token);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? <>{children}</> : <Redirect to="/login?session=expired" />;
};

export default ProtectedRoute;