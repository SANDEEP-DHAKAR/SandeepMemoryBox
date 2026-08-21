import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { 
    MapPin, Calendar, Share2, Trash2, UploadCloud, X, Play, 
    Globe, Lock, ArrowLeft, ChevronLeft, ChevronRight, Download, 
    Image as ImageIcon, Video, Filter, CheckCircle2 
} from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { AuthContext } from '../context/AuthContext';
import './TripDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TripDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getAuthHeaders } = useContext(AuthContext);
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentUploadingIndex, setCurrentUploadingIndex] = useState(0);
    const [totalUploadingFiles, setTotalUploadingFiles] = useState(0);

    // Filter tab: 'all' | 'image' | 'video'
    const [filterType, setFilterType] = useState('all');

    // Lightbox modal index (null if closed)
    const [selectedIndex, setSelectedIndex] = useState(null);

    const fetchTrip = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/trips/${id}`, {
                headers: getAuthHeaders()
            });
            setTrip(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching trip:', error);
            toast.error('Failed to load trip');
            navigate('/dashboard');
        }
    };

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        
        setUploading(true);
        setUploadProgress(0);
        setTotalUploadingFiles(acceptedFiles.length);

        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                setCurrentUploadingIndex(i + 1);
                const file = acceptedFiles[i];
                
                const formData = new FormData();
                formData.append('file', file);
                
                // 1. Upload file to Cloudinary via backend
                const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, {
                    headers: { 
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const filePercent = (progressEvent.loaded * 100) / progressEvent.total;
                        const overallPercent = Math.round(((i * 100) + filePercent) / acceptedFiles.length);
                        setUploadProgress(overallPercent);
                    }
                });
                
                // 2. Attach media item to trip
                const mediaItem = {
                    url: uploadRes.data.url,
                    resourceType: uploadRes.data.type,
                    publicId: uploadRes.data.publicId
                };
                
                const attachRes = await axios.post(`${API_URL}/api/trips/${id}/media`, { mediaItem }, {
                    headers: { 
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json'
                    }
                });
                
                setTrip(attachRes.data); // Update UI live after each file
            }
            toast.success(`Uploaded ${acceptedFiles.length} file(s) successfully!`);
        } catch (error) {
            console.error("Upload error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error uploading media');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setTotalUploadingFiles(0);
        }
    }, [id, getAuthHeaders]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif'],
            'video/*': ['.mp4', '.webm', '.mov', '.m4v']
        }
    });

    const handleTogglePublic = async () => {
        try {
            const res = await axios.patch(`${API_URL}/api/trips/${id}/toggle-public`, {}, {
                headers: getAuthHeaders()
            });
            setTrip(res.data);
            toast.info(`Trip is now ${res.data.isPublic ? 'Public' : 'Private'}`);
        } catch (err) {
            toast.error('Failed to update privacy');
        }
    };

    const handleDeleteTrip = async () => {
        if (!window.confirm('Are you sure you want to delete this trip and all its media?')) return;
        
        try {
            await axios.delete(`${API_URL}/api/trips/${id}`, {
                headers: getAuthHeaders()
            });
            toast.success('Trip deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete trip');
        }
    };

    const handleDeleteMediaItem = async (e, mediaId) => {
        e.stopPropagation(); // Don't trigger lightbox click
        if (!window.confirm('Delete this media item permanently?')) return;

        try {
            const res = await axios.delete(`${API_URL}/api/trips/${id}/media/${mediaId}`, {
                headers: getAuthHeaders()
            });
            setTrip(res.data.trip);
            if (selectedIndex !== null) setSelectedIndex(null);
            toast.success('Media item deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete media item');
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/p/${trip.publicId}`;
        navigator.clipboard.writeText(url);
        toast.success('Public share link copied to clipboard!');
    };

    // Filter media items
    const filteredMedia = trip?.media ? trip.media.filter(item => {
        if (filterType === 'image') return item.resourceType !== 'video';
        if (filterType === 'video') return item.resourceType === 'video';
        return true;
    }) : [];

    // Lightbox navigation
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

    // Keyboard navigation listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedIndex === null) return;
            if (e.key === 'ArrowRight') handleNextMedia();
            if (e.key === 'ArrowLeft') handlePrevMedia();
            if (e.key === 'Escape') setSelectedIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, filteredMedia]);

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

    const currentMedia = selectedIndex !== null ? filteredMedia[selectedIndex] : null;

    return (
        <div className="trip-details-container container">
            {/* Back to Dashboard Link */}
            <button className="btn-secondary back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
            </button>

            {/* Header Card */}
            <div className="trip-header glass">
                <div className="trip-info">
                    <div className="title-row">
                        <h1 className="trip-title">{trip.title}</h1>
                        <button className={`privacy-toggle-btn ${trip.isPublic ? 'public' : 'private'}`} onClick={handleTogglePublic}>
                            {trip.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                            <span>{trip.isPublic ? 'Public' : 'Private'} (Click to toggle)</span>
                        </button>
                    </div>

                    <div className="trip-meta">
                        {trip.location && (
                            <span className="meta-badge"><MapPin size={16} /> {trip.location}</span>
                        )}
                        {trip.date && (
                            <span className="meta-badge"><Calendar size={16} /> {new Date(trip.date).toLocaleDateString()}</span>
                        )}
                        <span className="meta-badge"><ImageIcon size={16} /> {trip.media?.length || 0} items</span>
                    </div>

                    {trip.description && <p className="trip-desc">{trip.description}</p>}
                </div>

                <div className="trip-actions">
                    {trip.isPublic && (
                        <button className="btn-primary share-btn" onClick={handleShare}>
                            <Share2 size={18} /> <span>Share Link</span>
                        </button>
                    )}
                    <button className="btn-icon delete-btn" onClick={handleDeleteTrip} title="Delete Trip">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Dropzone File Uploader */}
            <div 
                {...getRootProps()} 
                className={`upload-zone glass ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            >
                <input {...getInputProps()} disabled={uploading} />
                {uploading ? (
                    <div className="upload-progress">
                        <p className="progress-text">Uploading file {currentUploadingIndex} of {totalUploadingFiles} ({uploadProgress}%)</p>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <UploadCloud size={48} className="upload-icon" />
                        <h3>{isDragActive ? 'Drop your photos & videos here' : 'Drag & drop photos or videos here'}</h3>
                        <p>Supports JPG, PNG, WEBP, MP4, MOV. Select multiple files at once.</p>
                    </div>
                )}
            </div>

            {/* Gallery Control Bar: Filter Tabs */}
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
            {filteredMedia.length === 0 ? (
                <div className="empty-gallery glass">
                    <ImageIcon size={40} className="empty-gallery-icon" />
                    <p>No media files found in this category.</p>
                </div>
            ) : (
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

                            {/* Delete Item Overlay Button */}
                            <button 
                                className="item-delete-btn"
                                onClick={(e) => handleDeleteMediaItem(e, item._id)}
                                title="Delete media item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Fullscreen Lightbox Modal */}
            <AnimatePresence>
                {selectedIndex !== null && currentMedia && (
                    <div className="fullscreen-modal" onClick={() => setSelectedIndex(null)}>
                        {/* Top Control Bar */}
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
                                <button 
                                    className="btn-icon delete-lightbox" 
                                    onClick={(e) => handleDeleteMediaItem(e, currentMedia._id)} 
                                    title="Delete Item"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button className="btn-icon close-fullscreen" onClick={() => setSelectedIndex(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
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

                        {/* Media Display Container */}
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

export default TripDetails;
