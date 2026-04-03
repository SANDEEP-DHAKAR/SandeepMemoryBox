import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TripCard from '../components/TripCard';
import './Dashboard.css';

const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const fetchTrips = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/trips', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrips(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load trips');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            if (date) formData.append('date', date);
            formData.append('isPublic', isPublic);

            await axios.post('http://localhost:5000/api/trips', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Trip created successfully!');
            setIsModalOpen(false);
            // Reset form
            setTitle(''); setDescription(''); setLocation(''); setDate(''); setIsPublic(true);
            fetchTrips();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating trip');
        }
    };

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Your Trips</h1>
                    <p className="dashboard-subtitle">Manage and organize your travel memories</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    New Trip
                </button>
            </div>

            {trips.length === 0 ? (
                <div className="empty-state glass">
                    <div className="empty-icon-wrap">
                        <Plus size={40} className="empty-icon" onClick={() => setIsModalOpen(true)} style={{cursor: 'pointer'}}/>
                    </div>
                    <h2>No trips yet</h2>
                    <p>Create your first trip to start preserving memories.</p>
                </div>
            ) : (
                <div className="trips-grid">
                    {trips.map(trip => (
                        <TripCard key={trip._id} trip={trip} />
                    ))}
                </div>
            )}

            {/* Modal for creating trip */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div 
                            className="modal-content glass"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="modal-header">
                                <h2>Create New Trip</h2>
                                <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTrip} className="modal-form">
                                <div className="form-group">
                                    <label>Trip Title *</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Summer in Paris" />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Paris, France" />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="A brief summary of the trip..."></textarea>
                                </div>
                                <div className="form-group-checkbox">
                                    <label>
                                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                                        Make trip public (viewable via exact link)
                                    </label>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create Trip</button>
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
