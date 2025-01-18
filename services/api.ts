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

export const API_URL = "https://towy-backend-a1nr3ts21-anoops-projects-e49f75e4.vercel.app";

if (!API_URL) {
    throw new Error('API_URL not configured');
}

// Helper function for headers
const getHeaders = () => {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
};

export const authService = {
    signup: async (data: SignupData) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        return response.json();
    },

    login: async (credentials: { email: string; password: string; role?: string }) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
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
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    }
}; 