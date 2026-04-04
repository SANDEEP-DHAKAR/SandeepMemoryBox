import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { MapPin, Calendar, Share2, Trash2, UploadCloud, X, Play } from 'lucide-react';
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
    const [selectedMedia, setSelectedMedia] = useState(null); // For fullscreen

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

        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                console.log(`Uploading file ${i+1}/${acceptedFiles.length}: ${file.name}`);
                
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
                
                console.log(`Uploaded file url: ${uploadRes.data.url}`);

                // 2. Attach media URL to the trip
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
                
                setTrip(attachRes.data); // Update UI
            }
            toast.success('Media uploaded successfully');
        } catch (error) {
            console.error("Upload error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error uploading media');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [id, getAuthHeaders]);

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
