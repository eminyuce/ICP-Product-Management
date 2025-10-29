import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TEST_EMAIL = 'testaccount@gmail.com';
const TEST_PASSWORD = '456789';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const { login: iiLogin, clear: iiClear, identity, isInitializing } = useInternetIdentity();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Check if user is already logged in
        const storedAuth = localStorage.getItem('admin_auth');
        if (storedAuth) {
            try {
                const { email, timestamp } = JSON.parse(storedAuth);
                // Check if session is still valid (24 hours)
                const now = Date.now();
                if (now - timestamp < 24 * 60 * 60 * 1000) {
                    // Check if Internet Identity is also authenticated
                    if (identity) {
                        setIsAuthenticated(true);
                        setUserEmail(email);
                    } else {
                        // Email/password session exists but no II identity - clear it
                        localStorage.removeItem('admin_auth');
                    }
                } else {
                    localStorage.removeItem('admin_auth');
                }
            } catch (error) {
                localStorage.removeItem('admin_auth');
            }
        }
        setIsLoading(isInitializing);
    }, [identity, isInitializing]);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Validate email/password first
        if (email !== TEST_EMAIL || password !== TEST_PASSWORD) {
            return false;
        }

        try {
            // Authenticate with Internet Identity
            await iiLogin();
            
            // If II login successful, store the email/password session
            const authData = {
                email,
                timestamp: Date.now(),
            };
            localStorage.setItem('admin_auth', JSON.stringify(authData));
            setIsAuthenticated(true);
            setUserEmail(email);
            
            return true;
        } catch (error) {
            console.error('Internet Identity login failed:', error);
            return false;
        }
    };

    const logout = async () => {
        localStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
        setUserEmail(null);
        
        // Clear Internet Identity session
        await iiClear();
        
        // Clear all cached queries
        queryClient.clear();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, userEmail }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
