import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, X, Search, MapPin, Calendar, Globe, Lock, Image as ImageIcon, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TripCard from '../components/TripCard';
import { AuthContext } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { getAuthHeaders, user } = useContext(AuthContext);
    const { trips, loading, error, fetchPrivateTrips } = useTrips();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPrivateTrips();
    }, []);

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Trip title is required');
            return;
        }

        setSubmitting(true);
        try {
            const tripData = {
                title,
                description,
                location,
                date: date || undefined,
                isPublic
            };

            await axios.post(`${API_URL}/api/trips`, tripData, {
                headers: { 
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Trip created successfully!');
            setIsModalOpen(false);
            // Reset form
            setTitle(''); setDescription(''); setLocation(''); setDate(''); setIsPublic(true);
            fetchPrivateTrips();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating trip');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter trips based on search query
    const filteredTrips = trips.filter(t => {
        const query = searchQuery.toLowerCase();
        return (
            t.title?.toLowerCase().includes(query) ||
            t.location?.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query)
        );
    });

    // Calculate total media count
    const totalMediaCount = trips.reduce((acc, t) => acc + (t.media?.length || 0), 0);
    const publicTripsCount = trips.filter(t => t.isPublic).length;

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

    return (
        <div className="dashboard-container container">
            {/* Stats Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">
                        Welcome back, <span className="gradient-text">{user?.username}</span> 👋
                    </h1>
                    <p className="dashboard-subtitle">Manage and relive your travel adventures</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span>Create New Trip</span>
                </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="metrics-row">
                <div className="metric-card glass">
                    <div className="metric-icon blue">
                        <Layers size={22} />
                    </div>
                    <div>
                        <span className="metric-value">{trips.length}</span>
                        <span className="metric-label">Total Trips</span>
                    </div>
                </div>

                <div className="metric-card glass">
                    <div className="metric-icon purple">
                        <ImageIcon size={22} />
                    </div>
                    <div>
                        <span className="metric-value">{totalMediaCount}</span>
                        <span className="metric-label">Total Photos & Videos</span>
                    </div>
                </div>

                <div className="metric-card glass">
                    <div className="metric-icon cyan">
                        <Globe size={22} />
                    </div>
                    <div>
                        <span className="metric-value">{publicTripsCount}</span>
                        <span className="metric-label">Public Shared Trips</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar-wrap glass">
                <Search size={20} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search trips by destination, title, or details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Trips Grid or Empty State */}
            {filteredTrips.length === 0 ? (
                <div className="empty-state glass">
                    <div className="empty-icon-wrap" onClick={() => setIsModalOpen(true)}>
                        <Sparkles size={44} className="empty-icon" />
                    </div>
                    <h2>{searchQuery ? 'No matching trips found' : 'No trips added yet'}</h2>
                    <p>{searchQuery ? 'Try adjusting your search criteria.' : 'Click below to create your very first trip memory!'}</p>
                    {!searchQuery && (
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '16px' }}>
                            <Plus size={18} />
                            <span>Add Your First Trip</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="trips-grid">
                    {filteredTrips.map(trip => (
                        <TripCard key={trip._id} trip={trip} onTripDeleted={fetchPrivateTrips} />
                    ))}
                </div>
            )}

            {/* Create Trip Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div 
                            className="modal-content glass"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Create New Trip Memory</h2>
                                <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTrip} className="modal-form">
                                <div className="form-group">
                                    <label>Trip Title *</label>
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                        placeholder="e.g. Summer Vacation in Bali" 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input 
                                            type="text" 
                                            value={location} 
                                            onChange={(e) => setLocation(e.target.value)} 
                                            placeholder="e.g. Bali, Indonesia" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input 
                                            type="date" 
                                            value={date} 
                                            onChange={(e) => setDate(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description & Memories</label>
                                    <textarea 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        rows="3" 
                                        placeholder="Write a brief story or note about this journey..."
                                    ></textarea>
                                </div>
                                <div className="form-group-checkbox">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={isPublic} 
                                            onChange={(e) => setIsPublic(e.target.checked)} 
                                        />
                                        <span>Make trip public (generates shareable link)</span>
                                    </label>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Trip'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
