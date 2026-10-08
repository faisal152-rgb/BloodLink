import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import donorsImg from '../assets/donors.png';
import '../styles/home.css';

const Home = ({ onFindDonor, onRequestBlood }) => (
  <section id="home" className="hero-section">
    <div className="container hero-grid">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-badge"
        >
          <Activity size={14} style={{ marginRight: '6px' }} />
          ADMIN VERIFIED DONOR NETWORK
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-title"
        >
          Save Lives in Every <span style={{ color: 'var(--primary-red)' }}>Heartbeat.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-subtitle"
        >
          BloodLink connects patients with verified blood donors across Pakistan.
          Zero registration, zero fraud, 100% ethical coordination.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hero-btns"
        >
          <button className="btn-primary" onClick={onFindDonor}>
            Find Blood Donor
          </button>
          <button className="btn-secondary" onClick={onRequestBlood}>
            Request Blood
          </button>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
        className="hero-image-wrap"
      >
        <div className="hero-image-inner">
          <img src={donorsImg} alt="Verified Blood Donors" className="hero-image" />
          <div className="image-overlay-glow"></div>
        </div>
        {/* Decorative elements */}
        <div className="decoration-blob blob-1"></div>
        <div className="decoration-blob blob-2"></div>
      </motion.div>
    </div>
  </section>
);

export default Home;
