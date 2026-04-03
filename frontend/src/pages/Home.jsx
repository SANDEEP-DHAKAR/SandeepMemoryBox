import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Map, Share2 } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <header className="hero-section">
                <div className="hero-content container">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-title">Your Travel Memories,<br/><span className="gradient-text">Beautifully Preserved.</span></h1>
                        <p className="hero-subtitle">Upload, organize, and share your adventures in a stunning personal gallery. Experience your journeys all over again with SandeepMemoryBox.</p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn-primary btn-lg">Get Started</Link>
                            <Link to="/login" className="btn-secondary btn-lg">Log In</Link>
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="features-section container">
                <div className="feature-grid">
                    <motion.div className="feature-card glass" whileHover={{ y: -10 }}>
                        <Camera className="feature-icon" size={40} />
                        <h3>Stunning Galleries</h3>
                        <p>Your photos and videos displayed in a premium, Instagram-style grid tailored for high-quality media.</p>
                    </motion.div>
                    <motion.div className="feature-card glass" whileHover={{ y: -10 }}>
                        <Map className="feature-icon" size={40} />
                        <h3>Organize by Trip</h3>
                        <p>Group your memories by destination. Add locations, dates, and descriptions to completely document every journey.</p>
                    </motion.div>
                    <motion.div className="feature-card glass" whileHover={{ y: -10 }}>
                        <Share2 className="feature-icon" size={40} />
                        <h3>Share Instantly</h3>
                        <p>Generate a unique public link for any trip to securely share your adventures with friends and family.</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
