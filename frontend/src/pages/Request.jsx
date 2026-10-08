import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/request.css';
import * as api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const Request = ({ isLoggedIn, setActiveSection }) => {
  const [submitted, setSubmitted] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    patient: '',
    bloodGroup: '',
    urgency: 'emergency',
    hospital: '',
    contact: '',
    units: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setActiveSection('auth_login');
      return;
    }
    
    setStatusMsg({ type: 'loading', text: 'Submitting request...' });
    
    try {
      await api.addBloodRequest(formData);
      setSubmitted(true);
      setStatusMsg({ type: '', text: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setStatusMsg({ 
        type: 'error', 
        text: error.response?.data?.message || "Failed to submit request. Please try again." 
      });
    }
  };

  return (
    <section id="request" className="section">
      <div className="container">
        <div className="page-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-badge"
          >
            <AlertCircle size={14} style={{ marginRight: '6px' }} />
            EMERGENCY ASSISTANCE
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="page-title"
          >
            Request Life-Saving <span style={{ color: 'var(--primary-red)' }}>Blood.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-subtitle"
          >
            Submit a request to our admin. We will review and coordinate
            with compatible donors immediately to save precious lives.
          </motion.p>
          <div className="decoration-blob blob-1"></div>
          <div className="decoration-blob blob-2"></div>
        </div>

        <div className="request-form-container">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-message"
            >
              <div className="success-icon-wrapper">
                <CheckCircle2 size={48} />
              </div>
              <h3>Request Submitted Successfully!</h3>
              <p>Our administrator will contact you shortly to coordinate the donation.</p>
              <button
                className="btn-secondary"
                style={{ marginTop: '2.5rem' }}
                onClick={() => setSubmitted(false)}
              >
                Submit Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {statusMsg.text && (
                <div className={`status-alert ${statusMsg.type}`} style={{ 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: statusMsg.type === 'error' ? '#ffebee' : '#f0f3f5',
                  color: statusMsg.type === 'error' ? '#c62828' : '#555',
                  border: `1px solid ${statusMsg.type === 'error' ? '#ffcdd2' : '#e0e0e0'}`
                }}>
                  {statusMsg.type === 'error' && <AlertCircle size={18} />}
                  {statusMsg.text}
                </div>
              )}
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Patient Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group Required</label>
                  <select
                    required
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="">Select Group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select
                    required
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="emergency">Emergency (Immediate)</option>
                    <option value="urgent">Urgent</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Units Required (Bottles)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Hospital Name & City</label>
                  <input
                    type="text"
                    placeholder="General Hospital, City"
                    required
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '2rem' }}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    setActiveSection('auth_login');
                  }
                }}
              >
                Submit Vital Request
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Request;
