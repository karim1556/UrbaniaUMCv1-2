import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', {
                state: {
                    from: window.location.pathname,
                    message: 'Please login to access this page'
                }
            });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading || !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 