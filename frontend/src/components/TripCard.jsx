import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './TripCard.css';

const TripCard = ({ trip }) => {
    // Determine the thumbnail (first image/video or a placeholder)
    let thumbnail = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
    if (trip.media && trip.media.length > 0) {
        thumbnail = trip.media[0].resourceType === 'video' 
            ? trip.media[0].url.replace(/\.[^/.]+$/, ".jpg") // Replace extension with jpg for cloudinary video thumbnail
            : trip.media[0].url;
    }

    return (
        <Link to={`/trip/${trip._id}`} className="trip-card glass">
            <div className="trip-card-image-wrapper">
                <LazyLoadImage
                    alt={trip.title}
                    effect="blur"
                    src={thumbnail}
                    className="trip-card-image"
                    wrapperClassName="trip-card-image-wrapper"
                />
                <div className="trip-card-overlay">
                    <span className="media-count">{trip.media?.length || 0} items</span>
                </div>
            </div>
            
            <div className="trip-card-content">
                <h3 className="trip-card-title">{trip.title}</h3>
                
                <div className="trip-card-meta">
                    {trip.location && (
                        <div className="meta-item">
                            <MapPin size={14} />
                            <span>{trip.location}</span>
                        </div>
                    )}
                    {trip.date && (
                        <div className="meta-item">
                            <Calendar size={14} />
                            <span>{new Date(trip.date).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TripCard;
