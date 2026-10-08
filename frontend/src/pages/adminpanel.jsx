import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Droplet,
  MapPin,
  Bell,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  ChevronDown,
  TrendingUp,
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import '../styles/adminpanel.css';
import * as api from '../services/api';

// ============ DASHBOARD COMPONENT ============
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalDonors: 0,
    activeDonors: 0,
    pendingRequests: 0,
    completedRequests: 0,
    emergencyRequests: 0,
    recentDonations: [],
    emergencyList: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes, requestsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentDonations(),
        api.getBloodRequests()
      ]);

      setDashboardData({
        ...statsRes.data,
        recentDonations: recentRes.data,
        emergencyList: (Array.isArray(requestsRes.data) ? requestsRes.data : (requestsRes.data?.data || [])).filter(r => r.urgency === 'emergency')
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Donors', value: dashboardData.totalDonors, icon: Users, color: '#0d6efd' },
    { label: 'Active Donors', value: dashboardData.activeDonors, icon: Activity, color: '#198754' },
    { label: 'Pending Requests', value: dashboardData.pendingRequests, icon: AlertCircle, color: '#ffc107' },
    { label: 'Emergency Cases', value: dashboardData.emergencyRequests, icon: AlertCircle, color: '#dc3545' },
  ];

  if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Dashboard Overview</h2>
        <p>Monitor key metrics and recent activities</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="stat-card"
            >
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.value?.toLocaleString() || 0}</h3>
                <p>{stat.label}</p>
              </div>
              <TrendingUp size={16} style={{ color: stat.color, opacity: 0.5 }} />
            </motion.div>
          );
        })}
      </div>

      {/* Recent Donations & Emergency Requests */}
      <div className="dashboard-grid">
        {/* Recent Donations */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="dashboard-card"
        >
          <h3>Recent Donations 🩸</h3>
          <div className="recent-list">
            {dashboardData.recentDonations.length > 0 ? (
              dashboardData.recentDonations.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="recent-item"
                >
                  <div className="recent-info">
                    <p className="donor-name">{item.donor}</p>
                    <span className="blood-badge" style={{ background: '#dc354520', color: '#dc3545' }}>
                      {item.bloodGroup}
                    </span>
                  </div>
                  <div className="recent-details">
                    <small>{item.hospital}</small>
                    <small className="date">{new Date(item.date).toLocaleDateString()}</small>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="no-data">No recent donations</p>
            )}
          </div>
        </motion.div>

        {/* Emergency Requests */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="dashboard-card emergency"
        >
          <h3>🚨 Emergency Requests</h3>
          <div className="emergency-list">
            {dashboardData.emergencyList.length > 0 ? (
              dashboardData.emergencyList.map((req, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="emergency-item"
                >
                  <div className="emergency-header">
                    <p className="patient-name">{req.patient}</p>
                    <span className="urgency-badge emergency">{req.status.toUpperCase()}</span>
                  </div>
                  <div className="emergency-info">
                    <small>{req.hospital} - {req.bloodGroup}</small>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="no-data">No active emergency requests</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============ DONOR MANAGEMENT COMPONENT ============
const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlood, setFilterBlood] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', bloodGroup: 'A+', location: '', contact: '', type: 'unpaid' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDonor, setNewDonor] = useState({ name: '', bloodGroup: 'A+', location: '', contact: '', type: 'unpaid' });

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await api.getDonors();
      setDonors(res.data);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBlood = filterBlood === 'all' || d.bloodGroup === filterBlood;
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchBlood && matchStatus;
  });

  const handleAddDonor = async () => {
    if (newDonor.name && newDonor.contact) {
      try {
        const res = await api.addDonor(newDonor);
        setDonors([res.data, ...donors]);
        setNewDonor({ name: '', bloodGroup: 'A+', location: '', contact: '', type: 'unpaid' });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding donor:", error);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveDonor(id);
      setDonors(donors.map(d => (d._id || d.id) === id ? { ...d, status: 'approved' } : d));
    } catch (error) {
      console.error("Error approving donor:", error);
    }
  };

  const handleBlock = async (id) => {
    try {
      await api.blockDonor(id);
      setDonors(donors.map(d => (d._id || d.id) === id ? { ...d, status: 'blocked' } : d));
    } catch (error) {
      console.error("Error blocking donor:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDonor(id);
      setDonors(donors.filter(d => (d._id || d.id) !== id));
    } catch (error) {
      console.error("Error deleting donor:", error);
    }
  };

  const handleEditStart = (donor) => {
    setEditingId(donor._id || donor.id);
    setEditFormData({
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      location: donor.location,
      contact: donor.contact,
      type: donor.type
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', bloodGroup: 'A+', location: '', contact: '', type: 'unpaid' });
  };

  const handleSaveEdit = async () => {
    if (editFormData.name && editFormData.contact) {
      try {
        await api.updateDonor(editingId, editFormData);
        setDonors(donors.map(d =>
          (d._id || d.id) === editingId
            ? { ...d, ...editFormData }
            : d
        ));
        handleCancelEdit();
      } catch (error) {
        console.error("Error updating donor:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#198754';
      case 'pending': return '#ffc107';
      case 'blocked': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Donor Management 🧑‍🤝‍🧑</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(prev => !prev)}>
          <Plus size={18} /> Add New Donor
        </button>
      </div>

      {/* Add Donor Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="add-admin-form"
          >
            <input
              type="text"
              placeholder="Donor Name"
              value={newDonor.name}
              onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
            />
            <select value={newDonor.bloodGroup} onChange={(e) => setNewDonor({ ...newDonor, bloodGroup: e.target.value })}>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <input
              type="text"
              placeholder="Location/City"
              value={newDonor.location}
              onChange={(e) => setNewDonor({ ...newDonor, location: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Contact Number"
              value={newDonor.contact}
              onChange={(e) => setNewDonor({ ...newDonor, contact: e.target.value })}
            />
            <select value={newDonor.type} onChange={(e) => setNewDonor({ ...newDonor, type: e.target.value })}>
              <option value="unpaid">Unpaid/Volunteer</option>
              <option value="paid">Paid</option>
            </select>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleAddDonor} type="button">Add Donor</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterBlood} onChange={(e) => setFilterBlood(e.target.value)} className="filter-select">
          <option value="all">All Blood Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Donors Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood Group</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Last Donation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.map((donor, idx) => (
              <motion.tr
                key={donor.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {editingId === (donor._id || donor.id) ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <select
                        value={editFormData.bloodGroup}
                        onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                        className="edit-input"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <input
                        type="tel"
                        value={editFormData.contact}
                        onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                        className="edit-input"
                      />
                    </td>
                    <td>{donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}</td>
                    <td>{new Date(donor.lastDonation).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="btn-icon approve" onClick={handleSaveEdit} title="Save" type="button">
                          <CheckCircle size={16} />
                        </button>
                        <button className="btn-icon block" onClick={handleCancelEdit} title="Cancel" type="button">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="name-cell">
                      <div className="donor-avatar">{donor.name.charAt(0)}</div>
                      {donor.name}
                    </td>
                    <td>
                      <span className="blood-badge">{donor.bloodGroup}</span>
                    </td>
                    <td>{donor.location}</td>
                    <td className="contact-cell">{donor.contact}</td>
                    <td>
                      <span className="status-badge" style={{ background: `${getStatusColor(donor.status)}20`, color: getStatusColor(donor.status) }}>
                        {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(donor.lastDonation).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {donor.status !== 'approved' && (
                          <button type="button" className="btn-icon approve" onClick={() => handleApprove(donor._id || donor.id)} title="Approve">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {donor.status !== 'blocked' && (
                          <button type="button" className="btn-icon block" onClick={() => handleBlock(donor._id || donor.id)} title="Block">
                            <XCircle size={16} />
                          </button>
                        )}
                        <button type="button" className="btn-icon edit" onClick={() => handleEditStart(donor)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button type="button" className="btn-icon delete" onClick={() => handleDelete(donor._id || donor.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="result-info">Showing {filteredDonors.length} of {donors.length} donors</p>
    </motion.div>
  );
};

// ============ BLOOD REQUESTS MANAGEMENT ============
const BloodRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ patient: '', bloodGroup: 'A+', hospital: '', urgency: 'normal', units: 1 });
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getBloodRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchUrgency = filterUrgency === 'all' || r.urgency === filterUrgency;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchUrgency && matchStatus;
  });

  const handleAddRequest = async () => {
    if (!newRequest.patient.trim() || !newRequest.hospital.trim() || !newRequest.contact?.trim()) {
      setRequestMessage('Patient, Hospital, and Contact are required.');
      return;
    }

    try {
      const res = await api.addBloodRequest(newRequest);
      setRequests([res.data, ...requests]);
      setNewRequest({ patient: '', bloodGroup: 'A+', hospital: '', urgency: 'normal', units: 1, contact: '' });
      setShowAddForm(false);
      setRequestMessage('Request added successfully.');
      setTimeout(() => setRequestMessage(''), 3000);
    } catch (error) {
      console.error('Error adding request:', error);
      const message = error?.response?.data?.message || 'Failed to add request. Check your server connection.';
      setRequestMessage(message);
      setTimeout(() => setRequestMessage(''), 3000);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.updateBloodRequestStatus(id, 'approved');
      setRequests(requests.map(r => (r._id || r.id) === id ? { ...r, status: 'approved' } : r));
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.deleteBloodRequest(id);
      setRequests(requests.filter(r => (r._id || r.id) !== id));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.updateBloodRequestStatus(id, 'completed');
      setRequests(requests.map(r => (r._id || r.id) === id ? { ...r, status: 'completed' } : r));
    } catch (error) {
      console.error("Error completing request:", error);
    }
  };

  const getUrgencyColor = (urgency) => {
    return urgency === 'emergency' ? '#dc3545' : '#198754';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#0d6efd';
      case 'completed': return '#198754';
      default: return '#6c757d';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Blood Requests Management 🩸</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(prev => !prev)}>
          <Plus size={18} /> New Request
        </button>
      </div>

      {/* Add Request Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="add-admin-form"
          >
            <input
              type="text"
              placeholder="Patient Name"
              value={newRequest.patient}
              onChange={(e) => setNewRequest({ ...newRequest, patient: e.target.value })}
            />
            <input
              type="text"
              placeholder="Hospital"
              value={newRequest.hospital}
              onChange={(e) => setNewRequest({ ...newRequest, hospital: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Contact Number"
              value={newRequest.contact || ''}
              onChange={(e) => setNewRequest({ ...newRequest, contact: e.target.value })}
            />
            <select value={newRequest.bloodGroup} onChange={(e) => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <input
              type="number"
              placeholder="Units"
              min="1"
              value={newRequest.units}
              onChange={(e) => setNewRequest({ ...newRequest, units: Number(e.target.value) })}
            />
            <select value={newRequest.urgency} onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}>
              <option value="normal">Normal</option>
              <option value="emergency">Emergency 🚨</option>
            </select>
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={handleAddRequest}>Add Request</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
            {requestMessage && <div className="form-feedback">{requestMessage}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="filters-bar">
        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="filter-select">
          <option value="all">All Urgency Levels</option>
          <option value="normal">Normal</option>
          <option value="emergency">Emergency 🚨</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Blood Group</th>
              <th>Hospital</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req, idx) => (
              <motion.tr
                key={req._id || req.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={req.urgency === 'emergency' ? 'emergency-row' : ''}
              >
                <td className="name-cell">{req.patient}</td>
                <td>
                  <span className="blood-badge">{req.bloodGroup}</span>
                </td>
                <td>{req.hospital}</td>
                <td className="units-cell">{req.units} units</td>
                <td>
                  <span className="urgency-badge" style={{ background: `${getUrgencyColor(req.urgency)}20`, color: getUrgencyColor(req.urgency) }}>
                    {req.urgency === 'emergency' ? '🚨 Emergency' : 'Normal'}
                  </span>
                </td>
                <td>
                  <span className="status-badge" style={{ background: `${getStatusColor(req.status)}20`, color: getStatusColor(req.status) }}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </td>
                <td>{new Date(req.date).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {req.status === 'pending' && (
                      <>
                        <button type="button" className="btn-icon approve" onClick={() => handleApprove(req._id || req.id)} title="Approve">
                          <CheckCircle size={16} />
                        </button>
                        <button type="button" className="btn-icon delete" onClick={() => handleReject(req._id || req.id)} title="Reject">
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <button type="button" className="btn-icon edit" onClick={() => handleComplete(req._id || req.id)} title="Mark Complete">
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="result-info">Showing {filteredRequests.length} of {requests.length} requests</p>
    </motion.div>
  );
};

// ============ LOCATION MANAGEMENT ============
const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.getLocations();
      setLocations(res.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newCity.trim()) {
      setLocationMessage('City name is required.');
      return;
    }

    try {
      const res = await api.addLocation({ city: newCity });
      setLocations([...locations, res.data]);
      setNewCity('');
      setLocationMessage('City added successfully.');
      setTimeout(() => setLocationMessage(''), 3000);
    } catch (error) {
      console.error('Error adding location:', error);
      setLocationMessage('Failed to add city. Check your server connection.');
      setTimeout(() => setLocationMessage(''), 3000);
    }
  };

  const handleDeleteLocation = async (id) => {
    try {
      await api.deleteLocation(id);
      setLocations(locations.filter(l => (l._id || l.id) !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
      setLocationMessage('Failed to delete location.');
      setTimeout(() => setLocationMessage(''), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Location Management 📍</h2>
      </div>

      {/* Add New Location */}
      <div className="add-location-form">
        <input
          type="text"
          placeholder="Enter city name..."
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
        />
        <button type="button" className="btn btn-primary" onClick={handleAddLocation}>
          <Plus size={18} /> Add City
        </button>
      </div>
      {locationMessage && <div className="form-feedback">{locationMessage}</div>}

      {/* Locations Grid */}
      <div className="locations-grid">
        {locations.map((loc, idx) => (
          <motion.div
            key={loc._id || loc.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="location-card"
          >
            <div className="location-header">
              <h3>📌 {loc.city}</h3>
              <button
                type="button"
                className="btn-icon delete"
                onClick={() => handleDeleteLocation(loc._id || loc.id)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="location-stats">
              <div className="stat">
                <p className="stat-value">{loc.totalDonors}</p>
                <p className="stat-label">Total Donors</p>
              </div>
              <div className="stat">
                <p className="stat-value">{loc.activeDonors}</p>
                <p className="stat-label">Active Donors</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============ NOTIFICATIONS SYSTEM ============
const NotificationsSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationText, setNotificationText] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (notificationText.trim()) {
      try {
        const res = await api.sendNotification({ message: notificationText });
        setNotifications([res.data, ...notifications]);
        setNotificationText('');
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Notifications Management 📢</h2>
      </div>

      {/* Send Notification */}
      <div className="notification-form">
        <textarea
          placeholder="Write notification message..."
          value={notificationText}
          onChange={(e) => setNotificationText(e.target.value)}
          rows="3"
        />
        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSendNotification} type="button">
            <Bell size={18} /> Send Notification
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`notification-item ${notif.status}`}
          >
            <div className="notification-icon">
              <Bell size={20} />
            </div>
            <div className="notification-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <small>{notif.timestamp}</small>
            </div>
            <span className="status-badge">{notif.status.toUpperCase()}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============ ADMIN MANAGEMENT ============
const AdminManagement = ({ onRefreshUserData }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'admin' });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'admin' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.getAdmins();
      setAdmins(res.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    setError('');
    setSuccess('');
    setAdminMessage('');

    if (!newAdmin.name.trim()) {
      setError('Please enter admin name');
      return;
    }
    if (!newAdmin.email.trim()) {
      setError('Please enter admin email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.addAdmin(newAdmin);
      if (res.status === 200 && res.data?.message) {
        setAdminMessage(res.data.message);
      } else {
        setSuccess('Admin added successfully!');
      }
      setNewAdmin({ name: '', email: '', role: 'admin' });
      setShowAddForm(false);
      await fetchAdmins();

      // Refresh current user data in case they were just promoted
      if (onRefreshUserData) {
        onRefreshUserData();
      }

      setTimeout(() => {
        setSuccess('');
        setAdminMessage('');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add admin';
      setError(errorMsg);
      console.error("Error adding admin:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    try {
      await api.deleteAdmin(id);
      await fetchAdmins();
      setSuccess('Admin deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete admin';
      setError(errorMsg);
      console.error("Error deleting admin:", error);
    }
  };

  const handleEditAdmin = (id) => {
    const admin = admins.find(a => a.id === id);
    if (!admin) {
      setError('Admin record not found for edit.');
      return;
    }
    setEditingAdmin(admin);
    setEditFormData({ name: admin.name, email: admin.email, role: admin.role });
    setShowEditForm(true);
  };

  const handleUpdateAdmin = async () => {
    setError('');
    setSuccess('');
    setAdminMessage('');

    if (!editFormData.name.trim()) {
      setError('Please enter admin name');
      return;
    }
    if (!editFormData.email.trim()) {
      setError('Please enter admin email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.updateAdmin(editingAdmin.id, editFormData);
      setSuccess(res.data.message || 'Admin updated successfully!');
      setShowEditForm(false);
      setEditingAdmin(null);
      setEditFormData({ name: '', email: '', role: 'admin' });
      await fetchAdmins();

      // Refresh current user data if the updated user is the logged-in user
      if (onRefreshUserData) {
        onRefreshUserData();
      }

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update admin';
      setError(errorMsg);
      console.error("Error updating admin:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Admin Management 👨‍💻</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(prev => !prev)} disabled={submitting}>
          <Plus size={18} /> Add Admin
        </button>
      </div>

      {/* Error/Success/Admin Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-error"
          style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f8d7da', borderLeft: '4px solid #dc3545', borderRadius: '4px', color: '#721c24' }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-success"
          style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#d4edda', borderLeft: '4px solid #198754', borderRadius: '4px', color: '#155724' }}
        >
          {success}
        </motion.div>
      )}
      {adminMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-info"
          style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#d1ecf1', borderLeft: '4px solid #0dcaf0', borderRadius: '4px', color: '#0c5460' }}
        >
          {adminMessage}
        </motion.div>
      )}

      {/* Add Admin Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="add-admin-form"
          >
            <input
              type="text"
              placeholder="Full Name"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              disabled={submitting}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              disabled={submitting}
            />
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              disabled={submitting}
            >
              <option value="admin">Admin</option>
              <option value="bloodbank">Blood Bank</option>
              <option value="hospital">Hospital</option>
              <option value="donor">Donor</option>
            </select>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleAddAdmin}
                disabled={submitting}
                type="button">
                {submitting ? 'Adding...' : 'Add Admin'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setNewAdmin({ name: '', email: '', role: 'admin' });
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Admin Form */}
      <AnimatePresence>
        {showEditForm && editingAdmin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="add-admin-form"
          >
            <h3 style={{ marginBottom: '1rem', color: '#212529' }}>Edit Admin - {editingAdmin.name}</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              disabled={submitting}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              disabled={submitting}
            />
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              disabled={submitting}
            >
              <option value="admin">Admin</option>
              <option value="bloodbank">Blood Bank</option>
              <option value="hospital">Hospital</option>
              <option value="donor">Donor</option>
            </select>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleUpdateAdmin}
                disabled={submitting}
                type="button">
                {submitting ? 'Updating...' : 'Update Admin'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAdmin(null);
                  setEditFormData({ name: '', email: '', role: 'admin' });
                  setError('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admins Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, idx) => (
              <motion.tr
                key={admin.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td className="name-cell">
                  <div className="admin-avatar">{(admin.name || '?').charAt(0)}</div>
                  {admin.name || '—'}
                </td>
                <td>{admin.email}</td>
                <td>{admin.role}</td>
                <td>
                  <span className="status-badge" style={{ background: '#19875420', color: '#198754' }}>
                    {admin.status
                      ? admin.status.charAt(0).toUpperCase() + admin.status.slice(1)
                      : 'Active'}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button type="button" className="btn-icon edit" onClick={() => handleEditAdmin(admin.id)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button type="button" className="btn-icon delete" onClick={() => handleDeleteAdmin(admin.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// ============ SETTINGS COMPONENT ============
const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'BloodLink',
    contactEmail: 'contact@bloodlink.pk',
    contactPhone: '+92-300-1234567',
    smsAPI: 'Twilio',
    emailAPI: 'SendGrid',
    enableNotifications: true,
    enableEmergencyBroadcast: true,
  });
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('bloodlinkSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('bloodlinkSettings', JSON.stringify(settings));
    setSettingsMessage('Settings saved successfully.');
    setTimeout(() => setSettingsMessage(''), 3000);
    console.log('Settings saved:', settings);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
      <div className="section-header">
        <h2>Settings ⚙️</h2>
      </div>

      {/* Settings Form */}
      <div className="settings-form">
        <div className="settings-group">
          <h3>Website Configuration</h3>
          <div className="form-group">
            <label>Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
            />
          </div>
        </div>

        <div className="settings-group">
          <h3>API Integration</h3>
          <div className="form-group">
            <label>SMS API Provider</label>
            <select value={settings.smsAPI} onChange={(e) => handleSettingChange('smsAPI', e.target.value)}>
              <option>Twilio</option>
              <option>AWS SNS</option>
              <option>Nexmo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email API Provider</label>
            <select value={settings.emailAPI} onChange={(e) => handleSettingChange('emailAPI', e.target.value)}>
              <option>SendGrid</option>
              <option>AWS SES</option>
              <option>Gmail</option>
            </select>
          </div>
        </div>

        <div className="settings-group">
          <h3>Features</h3>
          <div className="toggle-row">
            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                />
                Enable Notifications
              </label>
            </div>
            <div className="toggle-group toggle-group-right">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableEmergencyBroadcast}
                  onChange={(e) => handleSettingChange('enableEmergencyBroadcast', e.target.checked)}
                />
                Enable Emergency Broadcast
              </label>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
            <CheckCircle size={18} /> Save Settings
          </button>
        </div>
        {settingsMessage && <div className="form-feedback">{settingsMessage}</div>}
      </div>
    </motion.div>
  );
};

// ============ MAIN ADMIN PANEL COMPONENT ============
const AdminPanel = ({ onLogout, userData, onRefreshUserData }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donors', label: 'Donor Mgmt', icon: Users },
    { id: 'requests', label: 'Blood Req', icon: Droplet },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'admins', label: 'Admins', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'donors':
        return <DonorManagement />;
      case 'requests':
        return <BloodRequestsManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'notifications':
        return <NotificationsSystem />;
      case 'admins':
        return <AdminManagement onRefreshUserData={onRefreshUserData} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-panel">
      {/* Topbar Navigation */}
      <div className="admin-topbar">
        <div className="topbar-container">
          <div className="topbar-left">
            <h1 className="topbar-title">Admin Dashboard</h1>
          </div>

          {/* Admin Navigation */}
          <nav className="topbar-nav">
            {adminTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`topbar-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  title={tab.label}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {renderContent()}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
