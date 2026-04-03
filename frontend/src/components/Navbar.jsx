import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Camera, LogOut, User as UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar glass">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    <Camera className="logo-icon" />
                    <span>MemoryBox</span>
                </Link>

                <div className="navbar-menu">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <div className="user-profile">
                                <UserIcon size={18} />
                                <span>{user.username}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-logout">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Log In</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
