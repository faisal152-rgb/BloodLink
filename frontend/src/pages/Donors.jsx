import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, CheckCircle2, Clock, Activity } from 'lucide-react';
import '../styles/donors.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CITIES = ['Bahawalpur', 'Lahore', 'Karachi', 'Islamabad', 'Multan', 'Faisalabad', 'Peshawar'];

const Donors = ({ donors }) => {
  const [filterGroup, setFilterGroup] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');

  const filteredDonors = donors.filter(donor => {
    return (!filterGroup || donor.bloodGroup === filterGroup) &&
      (!filterType || donor.type === filterType) &&
      (!filterCity || donor.location === filterCity);
  });

  return (
    <section id="donors" className="section bg-light">
      <div className="container">
        <div className="page-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-badge"
          >
            <Activity size={14} style={{ marginRight: '6px' }} />
            TRUSTED NETWORK
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="page-title"
          >
            Verified Blood <span style={{ color: 'var(--primary-red)' }}>Donors.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-subtitle"
          >
            Search through our network of verified blood donors across Pakistan.
            Professional and ethical coordination for blood requests.
          </motion.p>
          <div className="decoration-blob blob-1"></div>
          <div className="decoration-blob blob-2"></div>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Blood Group</label>
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Donor Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="unpaid">Voluntary (Unpaid)</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">City</label>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        <div className="donor-grid">
          <AnimatePresence>
            {filteredDonors.map((donor) => (
              <motion.div
                key={donor.id || donor._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="donor-card"
              >
                <div className="blood-tag">{donor.bloodGroup}</div>
                <div className={`donor-type-badge ${donor.type === 'unpaid' ? 'type-unpaid' : 'type-paid'}`}>
                  {donor.type === 'unpaid' ? 'Voluntary' : 'Paid'}
                </div>
                <div className="donor-avatar">
                  <User size={28} />
                </div>
                <h3 className="donor-name">{donor.name}</h3>
                <div className="donor-info">
                  <div className="info-item">
                    <MapPin size={16} /> <span>{donor.location}</span>
                  </div>
                  <div className="info-item">
                    <CheckCircle2 size={16} color="var(--success)" /> <span>Verified Donor</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} /> <span>Available: {donor.availability}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredDonors.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '4rem' }}>
              <p style={{ color: 'var(--secondary-text)' }}>No donors found matching these filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Donors;
