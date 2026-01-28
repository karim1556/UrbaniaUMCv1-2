import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, Admin, LoginCredentials, RegisterData } from '../services/auth.service';

interface AuthContextType {
    admin: Admin | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedAdmin = authService.getCurrentAdmin();
                if (storedAdmin) {
                    setAdmin(storedAdmin);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        // Auto-initialize dev admin on localhost for faster development
        const tryDevInit = async () => {
            try {
                const storedAdmin = authService.getCurrentAdmin();
                if (storedAdmin) {
                    setAdmin(storedAdmin);
                } else if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
                    // Ensure token/admin exist for dev so API calls have Authorization header
                    const dummyAdmin: Admin = {
                        id: 'dev-admin',
                        firstName: 'Dev',
                        lastName: 'Admin',
                        mobile: '0000000000',
                        email: 'admin@example.com',
                        isActive: true,
                    };
                    const dummyToken = 'dev-token';
                    localStorage.setItem('token', dummyToken);
                    localStorage.setItem('admin', JSON.stringify(dummyAdmin));
                    setAdmin(dummyAdmin);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
        tryDevInit();
    }, []);

    // Bypassed login for local development — accepts any credentials
    const login = async (credentials: LoginCredentials) => {
        try {
            setError(null);

            // Create a dummy admin and token so the app treats the user as authenticated.
            const dummyAdmin: Admin = {
                id: 'dev-admin',
                firstName: 'Dev',
                lastName: 'Admin',
                mobile: '0000000000',
                email: credentials.email || 'dev@local',
                isActive: true,
            };

            const dummyToken = 'dev-token';
            localStorage.setItem('token', dummyToken);
            localStorage.setItem('admin', JSON.stringify(dummyAdmin));
            setAdmin(dummyAdmin);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // Register via API (use real backend) — store token/admin on success
    const register = async (data: RegisterData) => {
        try {
            setError(null);
            const response = await authService.register(data);
            // response contains token and admin
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            if (response.admin) {
                localStorage.setItem('admin', JSON.stringify(response.admin));
                setAdmin(response.admin);
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        setAdmin(null);
        setError(null);
    };

    const value = {
        admin,
        loading,
        error,
        isAuthenticated: !!admin,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 