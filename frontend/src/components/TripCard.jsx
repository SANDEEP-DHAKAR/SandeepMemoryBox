import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Globe, Lock, Image as ImageIcon, Video } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './TripCard.css';

const TripCard = ({ trip }) => {
    // Default placeholder photo if no media exists
    let thumbnail = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
    let isVideo = false;

    if (trip.media && trip.media.length > 0) {
        const first = trip.media[0];
        isVideo = first.resourceType === 'video';
        if (isVideo) {
            thumbnail = first.url.replace(/\.[^/.]+$/, ".jpg");
        } else {
            thumbnail = first.url;
        }
    }

    const photoCount = trip.media?.filter(m => m.resourceType !== 'video').length || 0;
    const videoCount = trip.media?.filter(m => m.resourceType === 'video').length || 0;

    return (
        <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
        >
            <Link to={`/trip/${trip._id}`} className="trip-card glass glass-hover">
                <div className="trip-card-image-wrapper">
                    <LazyLoadImage
                        alt={trip.title}
                        effect="blur"
                        src={thumbnail}
                        className="trip-card-image"
                    />
                    <div className="trip-card-overlay-top">
                        <span className={`privacy-badge ${trip.isPublic ? 'public' : 'private'}`}>
                            {trip.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                            {trip.isPublic ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="trip-card-overlay-bottom">
                        <div className="media-badges">
                            {photoCount > 0 && (
                                <span className="media-badge">
                                    <ImageIcon size={12} /> {photoCount}
                                </span>
                            )}
                            {videoCount > 0 && (
                                <span className="media-badge">
                                    <Video size={12} /> {videoCount}
                                </span>
                            )}
                            {trip.media?.length === 0 && (
                                <span className="media-badge empty">No media yet</span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="trip-card-content">
                    <h3 className="trip-card-title">{trip.title}</h3>
                    
                    <div className="trip-card-meta">
                        {trip.location && (
                            <div className="meta-item">
                                <MapPin size={14} className="meta-icon" />
                                <span>{trip.location}</span>
                            </div>
                        )}
                        {trip.date && (
                            <div className="meta-item">
                                <Calendar size={14} className="meta-icon" />
                                <span>{new Date(trip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default TripCard;
