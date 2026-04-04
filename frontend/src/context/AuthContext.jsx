import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const checkLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${API_URL}/api/auth/me`, {
                    headers: getAuthHeaders()
                });
                setUser(res.data);
                setError(null);
            } catch (error) {
                console.error('Error checking login:', error);
                localStorage.removeItem('token');
                setUser(null);
                setError('Failed to verify authentication. Please log in again.');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
            throw error; // Re-throw to let component handle
        }
    };

    const register = async (username, password) => {
        try {
            setError(null);
            const res = await axios.post(`${API_URL}/api/auth/register`, { username, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
        } catch (error) {
            console.error('Register error:', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
            throw error; // Re-throw to let component handle
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error, getAuthHeaders }}>
            {children}
        </AuthContext.Provider>
    );
};