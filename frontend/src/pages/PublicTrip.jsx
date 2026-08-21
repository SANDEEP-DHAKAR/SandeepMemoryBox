import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    MapPin, Calendar, Camera, Play, X, Share2, 
    Download, ChevronLeft, ChevronRight, Image as ImageIcon, Video, ArrowLeft 
} from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './TripDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PublicTrip = () => {
    const { publicId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [selectedIndex, setSelectedIndex] = useState(null);

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

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Public link copied to clipboard!');
    };

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="glass" style={{ padding: '60px', borderRadius: '28px', maxWidth: '500px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>{error}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Please ask the trip owner for an updated link.</p>
                    <Link to="/" className="btn-primary">Go to Home Page</Link>
                </div>
            </div>
        );
    }

    const filteredMedia = trip?.media ? trip.media.filter(item => {
        if (filterType === 'image') return item.resourceType !== 'video';
        if (filterType === 'video') return item.resourceType === 'video';
        return true;
    }) : [];

    const currentMedia = selectedIndex !== null ? filteredMedia[selectedIndex] : null;

    const handleNextMedia = (e) => {
        if (e) e.stopPropagation();
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex + 1) % filteredMedia.length);
    };

    const handlePrevMedia = (e) => {
        if (e) e.stopPropagation();
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex - 1 + filteredMedia.length) % filteredMedia.length);
    };

    return (
        <div className="trip-details-container container">
            {/* Header Banner */}
            <div className="trip-header glass" style={{ textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '12px', display: 'inline-flex', padding: '6px 14px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                    Shared via SandeepMemoryBox
                </div>
                <h1 className="trip-title">{trip.title}</h1>
                
                <div className="trip-meta" style={{ justifyContent: 'center', marginTop: '12px' }}>
                    {trip.location && <span className="meta-badge"><MapPin size={16} /> {trip.location}</span>}
                    {trip.date && <span className="meta-badge"><Calendar size={16} /> {new Date(trip.date).toLocaleDateString()}</span>}
                    <span className="meta-badge"><Camera size={16} /> {trip.media?.length || 0} items</span>
                </div>

                {trip.description && <p className="trip-desc" style={{ marginTop: '16px', textAlign: 'center' }}>{trip.description}</p>}

                <div style={{ marginTop: '24px' }}>
                    <button className="btn-primary" onClick={handleShare}>
                        <Share2 size={18} />
                        <span>Copy Link</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="gallery-control-bar">
                <div className="filter-tabs glass">
                    <button 
                        className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        <span>All</span>
                        <span className="count-pill">{trip.media?.length || 0}</span>
                    </button>
                    <button 
                        className={`tab-btn ${filterType === 'image' ? 'active' : ''}`}
                        onClick={() => setFilterType('image')}
                    >
                        <ImageIcon size={16} />
                        <span>Photos</span>
                        <span className="count-pill">{trip.media?.filter(m => m.resourceType !== 'video').length || 0}</span>
                    </button>
                    <button 
                        className={`tab-btn ${filterType === 'video' ? 'active' : ''}`}
                        onClick={() => setFilterType('video')}
                    >
                        <Video size={16} />
                        <span>Videos</span>
                        <span className="count-pill">{trip.media?.filter(m => m.resourceType === 'video').length || 0}</span>
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="gallery-grid">
                {filteredMedia.map((item, index) => (
                    <motion.div 
                        key={item._id || index} 
                        className="gallery-item glass"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedIndex(index)}
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
                                    <Play size={28} />
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

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIndex !== null && currentMedia && (
                    <div className="fullscreen-modal" onClick={() => setSelectedIndex(null)}>
                        <div className="lightbox-top-bar" onClick={e => e.stopPropagation()}>
                            <span className="lightbox-counter">
                                {selectedIndex + 1} / {filteredMedia.length}
                            </span>
                            <div className="lightbox-actions">
                                <a 
                                    href={currentMedia.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn-icon" 
                                    title="Open Original"
                                    download
                                >
                                    <Download size={20} />
                                </a>
                                <button className="btn-icon close-fullscreen" onClick={() => setSelectedIndex(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {filteredMedia.length > 1 && (
                            <>
                                <button className="lightbox-nav-btn prev" onClick={handlePrevMedia}>
                                    <ChevronLeft size={36} />
                                </button>
                                <button className="lightbox-nav-btn next" onClick={handleNextMedia}>
                                    <ChevronRight size={36} />
                                </button>
                            </>
                        )}

                        <motion.div 
                            className="fullscreen-content"
                            key={selectedIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {currentMedia.resourceType === 'video' ? (
                                <video src={currentMedia.url} controls autoPlay className="fullscreen-media" />
                            ) : (
                                <img src={currentMedia.url} alt="Fullscreen Memory" className="fullscreen-media" />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicTrip;
