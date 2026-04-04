import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Camera, Play, X } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './TripDetails.css'; // Reuse CSS

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PublicTrip = () => {
    const { publicId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const fetchPublicTrip = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/trips/p/${publicId}`);
                setTrip(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching public trip:', err);
                setError('This trip is private or does not exist.');
                setLoading(false);
            }
        };
        fetchPublicTrip();
    }, [publicId]);

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <h2>{error}</h2>
                <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>Go Home</Link>
            </div>
        );
    }

    return (
        <div className="trip-details-container container">
            <div className="trip-header glass" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <h1 className="trip-title">{trip.title}</h1>
                <div className="trip-meta" style={{ justifyContent: 'center' }}>
                    {trip.location && <span className="meta-badge"><MapPin size={16} /> {trip.location}</span>}
                    {trip.date && <span className="meta-badge"><Calendar size={16} /> {new Date(trip.date).toLocaleDateString()}</span>}
                    <span className="meta-badge"><Camera size={16} /> {trip.media?.length || 0} items</span>
                </div>
                {trip.description && <p className="trip-desc" style={{ marginTop: '16px' }}>{trip.description}</p>}
                
                <div style={{ marginTop: '30px', opacity: 0.7, fontSize: '0.9rem' }}>
                    <p>Shared via SandeepMemoryBox</p>
                </div>
            </div>

            <div className="gallery-grid">
                {trip.media?.map((item, index) => (
                    <motion.div 
                        key={index} 
                        className="gallery-item"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedMedia(item)}
                    >
                        {item.resourceType === 'video' ? (
                            <div className="video-thumbnail-wrapper">
                                <LazyLoadImage
                                    alt="Video thumbnail"
                                    effect="blur"
                                    src={item.url.replace(/\.[^/.]+$/, ".jpg")}
                                    className="gallery-image"
                                />
                                <div className="video-play-icon">
                                    <Play size={32} />
                                </div>
                            </div>
                        ) : (
                            <LazyLoadImage
                                alt="Memory"
                                effect="blur"
                                src={item.url}
                                className="gallery-image"
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedMedia && (
                    <div className="fullscreen-modal" onClick={() => setSelectedMedia(null)}>
                        <button className="btn-icon close-fullscreen" onClick={() => setSelectedMedia(null)}>
                            <X size={32} />
                        </button>
                        <motion.div 
                            className="fullscreen-content"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {selectedMedia.resourceType === 'video' ? (
                                <video src={selectedMedia.url} controls autoPlay className="fullscreen-media" />
                            ) : (
                                <img src={selectedMedia.url} alt="Fullscreen Memory" className="fullscreen-media" />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicTrip;
