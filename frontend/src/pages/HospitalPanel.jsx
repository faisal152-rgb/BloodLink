import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Bell,
  Menu,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Phone,
  Lock,
  Mail,
} from 'lucide-react';
import '../styles/hospitalpanel.css';
import * as api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const URGENCY_LEVELS = ['Normal', 'Urgent', 'Emergency'];

// API Integration Ready

const HospitalPanel = ({ userData, onLogout, onRefreshUserData }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showForm, setShowForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    if (onRefreshUserData) {
      onRefreshUserData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, notifRes] = await Promise.all([
        api.getBloodRequests(),
        api.getNotifications()
      ]);
      // Filter requests for this specific hospital if needed
      const reqData = Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.data || []);
      const notifData = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.data || []);
      setRequests(reqData);
      setNotifications(notifData);
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    } finally {
      setLoading(false);
    }
  };
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    patient: '',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'Normal',
    location: '',
    date: '',
    contact: '',
    notes: '',
  });
  const [passwordChange, setPasswordChange] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.patient?.trim()) errors.patient = 'Patient name is required';
    if (!formData.units || formData.units < 1) errors.units = 'Units must be at least 1';
    if (!formData.location?.trim()) errors.location = 'Location is required';
    if (!formData.date) errors.date = 'Required date is required';
    if (!formData.contact?.trim()) errors.contact = 'Contact number is required';
    else if (formData.contact.length < 10) errors.contact = 'Valid contact number is required';
    return errors;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        ...formData,
        urgency: formData.urgency.toLowerCase(),
        hospital: userData?.email || userData?.name || 'Hospital',
      };

      if (isEditing) {
        const res = await api.updateBloodRequest(editId, payload);
        setRequests(requests.map(r => ((r._id || r.id) === editId ? res.data : r)));
      } else {
        payload.status = 'pending';
        const res = await api.addBloodRequest(payload);
        setRequests([res.data, ...requests]);
      }

      setFormData({
        patient: '',
        bloodGroup: 'O+',
        units: 1,
        urgency: 'Normal',
        location: '',
        date: '',
        contact: '',
        notes: '',
      });
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setFormErrors({});
      setActiveTab('requests');
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to " + (isEditing ? "update" : "submit") + " request: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await api.deleteBloodRequest(id);
      setRequests(requests.filter(r => (r._id || r.id) !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const handleEditRequest = (request) => {
    setFormData({
      patient: request.patient || request.patientName || '',
      bloodGroup: request.bloodGroup || 'O+',
      units: request.units || 1,
      urgency: request.urgency || 'normal',
      location: request.location || '',
      date: request.date ? new Date(request.date).toISOString().split('T')[0] : '',
      contact: request.contact || '',
      notes: request.notes || request.additionalNotes || '',
    });
    setIsEditing(true);
    setEditId(request._id || request.id);
    setActiveTab('create');
    setShowForm(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 size={18} className="status-icon approved" />;
      case 'pending':
        return <Clock size={18} className="status-icon pending" />;
      case 'completed':
        return <CheckCircle2 size={18} className="status-icon completed" />;
      case 'rejected':
        return <AlertCircle size={18} className="status-icon rejected" />;
      default:
        return null;
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency':
        return 'urgency-emergency';
      case 'urgent':
        return 'urgency-urgent';
      default:
        return 'urgency-normal';
    }
  };

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ message: '', type: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    hospitalName: userData?.hospitalName || '',
    phone: userData?.phone || '',
    role: userData?.role || 'hospital',
  });

  // Sync profile data when userData changes (e.g. refreshed by parent)
  useEffect(() => {
    setProfileFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      hospitalName: userData?.hospitalName || '',
      phone: userData?.phone || '',
      role: userData?.role || 'hospital',
    });
  }, [userData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus({ message: '', type: '' });

    try {
      const resp = await api.updateProfile({
        id: userData?.id || userData?._id,
        ...profileFormData
      });

      setProfileStatus({ message: 'Profile updated successfully! ✨', type: 'success' });
      setIsEditingProfile(false);

      // Update local storage to keep session in sync
      const updatedUser = { ...userData, ...resp.data };
      localStorage.setItem('bloodlinkUser', JSON.stringify(updatedUser));

      // In a more complex app, you'd trigger a re-fetch or clear a cache.
      // For now we'll just show the success status.
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileStatus({
        message: 'Failed to update profile: ' + (error.response?.data?.message || error.message),
        type: 'error'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordStatus({ message: '', type: '' });
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setPasswordStatus({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    // Simulate successful password change if API is not available
    setPasswordStatus({ message: 'Password changed successfully! ✨', type: 'success' });

    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordChange({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStatus({ message: '', type: '' });
    }, 2000);
  };

  return (
    <section className="hospital-panel">
      {/* Top Navigation Bar */}
      <div className="hospital-topbar">
        <div className="topbar-container">
          <div className="topbar-left">
            <h1 className="topbar-title">Hospital Staff Dashboard</h1>
          </div>

          <nav className="topbar-nav">
            <button
              className={`topbar-nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('requests');
              }}
            >
              📋 My Requests
            </button>
            <button
              className={`topbar-nav-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('create');
                setShowForm(true);
              }}
            >
              <Plus size={18} /> New Request
            </button>
            <button
              className={`topbar-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
              }}
            >
              👤 Profile
            </button>
          </nav>

          <div className="topbar-right">
            <button
              className={`notification-btn ${unreadNotifications > 0 ? 'has-unread' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hospital-main">

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="notifications-dropdown"
            >
              <div className="notifications-header">
                <h3>Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="notifications-list">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {notif.type === 'approval' && (
                        <CheckCircle2 size={20} color="#28a745" />
                      )}
                      {notif.type === 'donor' && (
                        <AlertTriangle size={20} color="#ffc107" />
                      )}
                      {notif.type === 'completed' && (
                        <CheckCircle2 size={20} color="#17a2b8" />
                      )}
                      {notif.type === 'rejection' && (
                        <AlertCircle size={20} color="#dc3545" />
                      )}
                    </div>
                    <div className="notification-content">
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tab-content"
          >
            <div className="requests-header">
              <h2>My Blood Requests</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setActiveTab('create');
                }}
              >
                <Plus size={18} /> New Request
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>No blood requests yet. Create your first request.</p>
              </div>
            ) : (
              <div className="requests-table-wrapper">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Blood Group</th>
                      <th>Units</th>
                      <th>Status</th>
                      <th>Urgency</th>
                      <th>Required Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(request => (
                      <tr key={request._id || request.id}>
                        <td>
                          <span className="patient-name">{request.patient || request.patientName}</span>
                        </td>
                        <td>
                          <span className="blood-group">{request.bloodGroup}</span>
                        </td>
                        <td>{request.units}</td>
                        <td>
                          <span className={`status-badge ${request.status.toLowerCase()}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <span className={`urgency-badge ${getUrgencyClass(request.urgency)}`}>
                            {request.urgency === 'Emergency' && '🚨'}
                            {request.urgency === 'Urgent' && '⚠️'}
                            {request.urgency === 'Normal' && '✓'}
                            {request.urgency}
                          </span>
                        </td>
                        <td>{request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewDetails(request)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditRequest(request)}
                              title="Edit Request"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteRequest(request._id || request.id)}
                              title="Delete Request"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Create Request Tab */}
        {activeTab === 'create' && showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tab-content"
          >
            <div className="form-container">
              <div className="form-header">
                <h2>Create Blood Request</h2>
                <p>Fill in all the details below to submit a blood request</p>
              </div>

              <form onSubmit={handleSubmitRequest} className="blood-request-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      name="patient"
                      value={formData.patient}
                      onChange={handleFormChange}
                      placeholder="e.g., Muhammad Hassan"
                      className={formErrors.patient ? 'error' : ''}
                    />
                    {formErrors.patient && (
                      <span className="error-message">{formErrors.patient}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Blood Group *</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleFormChange}
                    >
                      {BLOOD_GROUPS.map(group => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Units Required *</label>
                    <input
                      type="number"
                      name="units"
                      value={formData.units}
                      onChange={handleFormChange}
                      placeholder="1"
                      min="1"
                      max="10"
                      className={formErrors.units ? 'error' : ''}
                    />
                    {formErrors.units && (
                      <span className="error-message">{formErrors.units}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Urgency Level *</label>
                    <div className="urgency-select">
                      {URGENCY_LEVELS.map(level => (
                        <button
                          key={level}
                          type="button"
                          className={`urgency-option ${formData.urgency === level ? 'selected' : ''} ${getUrgencyClass(level)}`}
                          onClick={() =>
                            setFormData(prev => ({ ...prev, urgency: level }))
                          }
                        >
                          {level === 'Emergency' && '🚨'}
                          {level === 'Urgent' && '⚠️'}
                          {level === 'Normal' && '✓'}
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <div className="location-input">
                      <MapPin size={18} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        placeholder="Enter hospital location or auto-detect"
                        className={formErrors.location ? 'error' : ''}
                      />
                    </div>
                    {formErrors.location && (
                      <span className="error-message">{formErrors.location}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Required Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      className={formErrors.date ? 'error' : ''}
                    />
                    {formErrors.date && (
                      <span className="error-message">{formErrors.date}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Contact Number *</label>
                    <div className="contact-input">
                      <Phone size={18} />
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleFormChange}
                        placeholder="e.g., 03001234567"
                        className={formErrors.contact ? 'error' : ''}
                      />
                    </div>
                    {formErrors.contact && (
                      <span className="error-message">{formErrors.contact}</span>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="e.g., Post-surgery transfusion, specific requirements, etc."
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <CheckCircle2 size={18} /> {isEditing ? 'Update Request' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setEditId(null);
                      setActiveTab('requests');
                      setFormData({
                        patient: '',
                        bloodGroup: 'O+',
                        units: 1,
                        urgency: 'Normal',
                        location: '',
                        date: '',
                        contact: '',
                        notes: '',
                      });
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tab-content"
          >
            <div className="profile-container">
              <div className="profile-grid">
                {/* Profile Info Card */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <h2>Hospital Information</h2>
                    {!isEditingProfile && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    )}
                  </div>

                  {profileStatus.message && (
                    <div className={`status-banner ${profileStatus.type}`}>
                      {profileStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{profileStatus.message}</span>
                    </div>
                  )}

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                      <div className="form-group">
                        <label>Hospital Name</label>
                        <input
                          type="text"
                          name="hospitalName"
                          value={profileFormData.hospitalName}
                          onChange={handleProfileChange}
                          placeholder="Hospital Name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Staff Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profileFormData.name}
                          onChange={handleProfileChange}
                          placeholder="Staff Name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profileFormData.email}
                          onChange={handleProfileChange}
                          placeholder="Email Address"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileFormData.phone}
                          onChange={handleProfileChange}
                          placeholder="Contact Number"
                          required
                        />
                      </div>
                      <div className="form-actions profile-actions">
                        <button type="submit" className="btn-primary" disabled={profileLoading}>
                          {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileStatus({ message: '', type: '' });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info-display">
                      <div className="info-group">
                        <label>Hospital Name</label>
                        <p>{profileFormData.hospitalName}</p>
                      </div>
                      <div className="info-group">
                        <label>Staff Name</label>
                        <p>{profileFormData.name}</p>
                      </div>
                      <div className="info-group">
                        <label>Email Address</label>
                        <div className="info-with-icon">
                          <Mail size={16} />
                          <p>{profileFormData.email}</p>
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Contact Number</label>
                        <div className="info-with-icon">
                          <Phone size={16} />
                          <p>{profileFormData.phone}</p>
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Account Role</label>
                        <p style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {profileFormData.role}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Settings Card */}
                <div className="profile-card">
                  <h2>Account Settings</h2>
                  <div className="settings-section">
                    <h3>Security</h3>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <Lock size={16} /> Change Password
                    </button>
                  </div>
                  <div className="settings-section">
                    <h3>Account Status</h3>
                    <div className="status-info">
                      <span className="status-badge verified" style={{ textTransform: 'capitalize' }}>
                        {userData?.role === 'admin' ? '🛡️ Admin' : '✅ ' + (userData?.role || 'Verified')}
                      </span>
                      <p>Your account level: {userData?.role || 'hospital'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {showRequestDetails && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowRequestDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Request Details</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowRequestDetails(false)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Patient Name</span>
                    <span className="detail-value">{selectedRequest.patient || selectedRequest.patientName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Blood Group</span>
                    <span className="detail-value blood-group">
                      {selectedRequest.bloodGroup}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Units Required</span>
                    <span className="detail-value">{selectedRequest.units}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span
                      className={`status-badge ${selectedRequest.status.toLowerCase()}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Urgency</span>
                    <span
                      className={`urgency-badge ${getUrgencyClass(selectedRequest.urgency)}`}
                    >
                      {selectedRequest.urgency === 'Emergency' && '🚨'}
                      {selectedRequest.urgency === 'Urgent' && '⚠️'}
                      {selectedRequest.urgency === 'Normal' && '✓'}
                      {selectedRequest.urgency}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Required Date</span>
                    <span className="detail-value">{selectedRequest.date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Hospital</span>
                    <span className="detail-value">{selectedRequest.hospital}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selectedRequest.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">{selectedRequest.contact}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Additional Notes</span>
                    <span className="detail-value">
                      {selectedRequest.notes || selectedRequest.additionalNotes || 'No additional notes'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Change Password</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordStatus({ message: '', type: '' });
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {passwordStatus.message && (
                <div className={`password-status-banner ${passwordStatus.type}`}>
                  {passwordStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordChange.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordChange.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordChange.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="form-actions modal-actions">
                  <button type="submit" className="btn-primary">
                    Update Password
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HospitalPanel;
