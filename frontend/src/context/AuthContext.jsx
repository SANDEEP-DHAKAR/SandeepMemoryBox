import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const register = async (username, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { username, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
