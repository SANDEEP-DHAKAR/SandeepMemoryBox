import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Map, Share2, Shield, Sparkles, ArrowRight, Play, Heart, Layers } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <header className="hero-section">
                <div className="hero-content container">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="hero-badge">
                            <Sparkles size={16} className="badge-icon" />
                            <span>Your Personal Vault For Travel Journeys</span>
                        </div>

                        <h1 className="hero-title">
                            Your Travel Memories,<br/>
                            <span className="gradient-text">Beautifully Preserved Forever.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Upload, organize, and share your cherished photo & video adventures in an ultra-sleek, 
                            high-resolution private gallery.
                        </p>

                        <div className="hero-actions">
                            <Link to="/register" className="btn-primary btn-lg">
                                <span>Start Preserving Memories</span>
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="btn-secondary btn-lg">
                                <span>Sign In</span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual Showcase Card */}
                    <motion.div 
                        className="hero-showcase glass"
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="showcase-header">
                            <div className="showcase-dots">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <span className="showcase-title">SandeepMemoryBox • Summer in Paris & Swiss Alps</span>
                        </div>
                        <div className="showcase-grid">
                            <div className="showcase-item item-1">
                                <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80" alt="Eiffel Tower" />
                                <div className="item-overlay">
                                    <span>Paris, France</span>
                                </div>
                            </div>
                            <div className="showcase-item item-2">
                                <img src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80" alt="Swiss Alps" />
                                <div className="item-overlay">
                                    <span>Zermatt, Switzerland</span>
                                </div>
                            </div>
                            <div className="showcase-item item-3">
                                <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80" alt="Louvre" />
                                <div className="item-overlay">
                                    <span>Louvre Museum</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Stats Bar */}
            <section className="stats-section container">
                <div className="stats-grid glass">
                    <div className="stat-card">
                        <h3>100%</h3>
                        <p>High Resolution Quality</p>
                    </div>
                    <div className="stat-card">
                        <h3>Instant</h3>
                        <p>Cloud Synchronization</p>
                    </div>
                    <div className="stat-card">
                        <h3>Shareable</h3>
                        <p>Unique Public Links</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section container">
                <div className="section-header">
                    <h2 className="section-title">Designed for Modern Adventurers</h2>
                    <p className="section-subtitle">Everything you need to document, view, and share your trips with elegance.</p>
                </div>

                <div className="feature-grid">
                    <motion.div className="feature-card glass glass-hover" whileHover={{ y: -8 }}>
                        <div className="feature-icon-wrap">
                            <Camera className="feature-icon" size={32} />
                        </div>
                        <h3>HD Photo & Video Support</h3>
                        <p>Upload photos and videos in full clarity with automatic thumbnail generation and fluid video player integration.</p>
                    </motion.div>

                    <motion.div className="feature-card glass glass-hover" whileHover={{ y: -8 }}>
                        <div className="feature-icon-wrap">
                            <Map className="feature-icon" size={32} />
                        </div>
                        <h3>Organize by Destinations</h3>
                        <p>Tag locations, add travel dates, and write detailed notes for each trip to keep your journeys organized chronologically.</p>
                    </motion.div>

                    <motion.div className="feature-card glass glass-hover" whileHover={{ y: -8 }}>
                        <div className="feature-icon-wrap">
                            <Share2 className="feature-icon" size={32} />
                        </div>
                        <h3>One-Click Public Sharing</h3>
                        <p>Generate encrypted public share links for friends and family so they can view your galleries without logging in.</p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section container">
                <div className="cta-box glass">
                    <h2 className="cta-title">Ready to build your personal memory box?</h2>
                    <p className="cta-desc">Create your free account today and start organizing your favorite journeys.</p>
                    <Link to="/register" className="btn-primary btn-lg">
                        <span>Get Started Free</span>
                        <Sparkles size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
