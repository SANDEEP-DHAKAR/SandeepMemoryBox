import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Camera, LogOut, User as UserIcon, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    return (
        <nav className="navbar glass">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
                    <div className="logo-badge">
                        <Camera className="logo-icon" size={22} />
                    </div>
                    <span className="logo-text">Sandeep<span className="gradient-text">MemoryBox</span></span>
                </Link>

                <div className="desktop-menu">
                    {user ? (
                        <>
                            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <div className="user-profile">
                                <div className="user-avatar">
                                    <UserIcon size={16} />
                                </div>
                                <span className="username">{user.username}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-logout" title="Log Out">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                                Log In
                            </Link>
                            <Link to="/register" className="btn-primary">
                                <Sparkles size={16} />
                                <span>Get Started</span>
                            </Link>
                        </>
                    )}
                </div>

                <button className="mobile-toggle btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="mobile-menu glass">
                    {user ? (
                        <>
                            <div className="user-profile-mobile">
                                <div className="user-avatar">
                                    <UserIcon size={20} />
                                </div>
                                <span className="username">{user.username}</span>
                            </div>
                            <Link to="/dashboard" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </Link>
                            <button onClick={handleLogout} className="btn-secondary logout-mobile">
                                <LogOut size={18} />
                                <span>Log Out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link-mobile" onClick={() => setMobileOpen(false)}>
                                Log In
                            </Link>
                            <Link to="/register" className="btn-primary" onClick={() => setMobileOpen(false)}>
                                <Sparkles size={16} />
                                <span>Get Started</span>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
