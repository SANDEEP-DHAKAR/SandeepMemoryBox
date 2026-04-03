import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { MapPin, Calendar, Share2, Trash2, UploadCloud, X, Play } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './TripDetails.css';

const TripDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedMedia, setSelectedMedia] = useState(null); // For fullscreen

    const fetchTrip = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrip(res.data);
            setLoading(false);
        } catch (error) {
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
        
        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('media', file);
        });

        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`http://localhost:5000/api/trips/${id}/media`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            
            setTrip(res.data);
            toast.success('Media uploaded successfully');
        } catch (error) {
            toast.error('Error uploading media');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [id]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.jpg'],
            'video/*': ['.mp4', '.webm', '.mov']
        }
    });

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Trip deleted');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete trip');
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/p/${trip.publicId}`;
        navigator.clipboard.writeText(url);
        toast.success('Public link copied to clipboard!');
    };

    if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

    return (
        <div className="trip-details-container container">
            <div className="trip-header glass">
                <div className="trip-info">
                    <h1 className="trip-title">{trip.title}</h1>
                    <div className="trip-meta">
                        {trip.location && (
                            <span className="meta-badge"><MapPin size={16} /> {trip.location}</span>
                        )}
                        {trip.date && (
                            <span className="meta-badge"><Calendar size={16} /> {new Date(trip.date).toLocaleDateString()}</span>
                        )}
                        {trip.isPublic && (
                            <span className="meta-badge public-badge">Public Link Active</span>
                        )}
                    </div>
                    {trip.description && <p className="trip-desc">{trip.description}</p>}
                </div>
                <div className="trip-actions">
                    {trip.isPublic && (
                        <button className="btn-secondary share-btn" onClick={handleShare}>
                            <Share2 size={18} /> Share
                        </button>
                    )}
                    <button className="btn-icon delete-btn" onClick={handleDelete} title="Delete Trip">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div 
                {...getRootProps()} 
                className={`upload-zone glass ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            >
                <input {...getInputProps()} disabled={uploading} />
                {uploading ? (
                    <div className="upload-progress">
                        <p>Uploading... {uploadProgress}%</p>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <UploadCloud size={48} className="upload-icon" />
                        <h3>{isDragActive ? 'Drop files here' : 'Drag & drop photos/videos here'}</h3>
                        <p>or click to select files</p>
                    </div>
                )}
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

            {/* Fullscreen Media Modal */}
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
                            onClick={e => e.stopPropagation()} // Prevent close when clicking media
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

export default TripDetails;
