import axios from 'axios';

// Types
interface SignupData {
    name: string;
    email: string;
    password: string;
    role: string;
    businessName?: string;
    phoneNumber?: string;
    services?: string[];
}

// API URL configuration
export const API_URL = process.env.NODE_ENV === 'production' 
    ? "https://towy-backend.vercel.app"
    : "http://localhost:4000";

if (!API_URL) {
    throw new Error('API_URL not configured');
}
if (!API_URL || !API_URL.startsWith('http')) {
    throw new Error('Invalid API_URL configuration. URL must be a valid HTTP/HTTPS endpoint');
}

// Helper function for headers
const getHeaders = () => {
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
};

export const authService = {
    signup: async (data: SignupData) => {
        try {
            if (!API_URL) {
                throw new Error('API URL is not configured');
            }

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Server response:', responseData);
                
                if (responseData.error && responseData.error.code === '42P01') {
                    throw new Error('Database setup incomplete. Please contact support.');
                }
                
                const errorMessage = typeof responseData.error === 'object' 
                    ? responseData.error.message || 'Server error occurred'
                    : responseData.error || responseData.message || `Signup failed with status: ${response.status}`;
                
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error: any) {
            console.error('Signup error details:', {
                originalError: error,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            throw new Error(
                error.message.includes('Database setup incomplete') 
                    ? error.message 
                    : 'Unable to complete signup. Please try again later.'
            );
        }
    },

    login: async (credentials: { email: string; password: string; role?: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userRole', data.user.role);
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    },

    loginProvider: async (credentials: { email: string; password: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/provider/login`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (error) {
            console.error('Provider login error:', error);
            throw error;
        }
    },
}; 