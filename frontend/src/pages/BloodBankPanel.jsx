import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Droplet,
  Users,
  Activity,
  History,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  AlertCircle,
  MapPin,
  Phone,
} from 'lucide-react';
import '../styles/bloodbankpanel.css';
import * as api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Real-time API integration ready

const BloodBankPanel = ({ userData, onLogout, onRefreshDonors, onRefreshUserData }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [requestSearch, setRequestSearch] = useState('');
  const [donorSearch, setDonorSearch] = useState('');

  // Modals
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonorDetails, setShowDonorDetails] = useState(false);

  // Form states
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newUnits, setNewUnits] = useState('');
  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: null });
  const [donorForm, setDonorForm] = useState({
    name: '',
    bloodGroup: '',
    contact: '',
    address: '',
    urgency: 'normal',
    units: 1
  });
  const [requestForm, setRequestForm] = useState({
    patient: '',
    bloodGroup: '',
    urgency: 'emergency',
    units: 1,
    contact: '',
    hospital: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    contact: userData?.contact || '',
    threshold: 10,
    role: userData?.role || 'bloodbank'
  });

  // Keep settings Form in sync with userData when it refreshes
  useEffect(() => {
    setSettingsForm(prev => ({
      ...prev,
      name: userData?.name || prev.name,
      email: userData?.email || prev.email,
      contact: userData?.contact || prev.contact,
      role: userData?.role || prev.role
    }));
  }, [userData]);
  const [saveStatus, setSaveStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchData();
    if (onRefreshUserData) {
      onRefreshUserData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, reqRes, donorRes] = await Promise.all([
        api.getInventory(),
        api.getBloodRequests(),
        api.getDonors()
      ]);
      setInventory(Array.isArray(invRes.data?.inventory) ? invRes.data.inventory : (Array.isArray(invRes.data) ? invRes.data : []));
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.data || []));
      setDonors(Array.isArray(donorRes.data) ? donorRes.data : (donorRes.data?.donors || []));
    } catch (error) {
      console.error("Error fetching blood bank data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateBloodRequestStatus(id, newStatus.toLowerCase());
      setRequests(prev =>
        prev.map(req => (req._id === id ? { ...req, status: newStatus } : req))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedGroup || isNaN(newUnits)) return;

    try {
      await api.updateInventory(selectedGroup, parseInt(newUnits));
      setInventory(prev =>
        prev.map(item =>
          item.group === selectedGroup
            ? { ...item, units: parseInt(newUnits) }
            : item
        )
      );
      setShowUpdateModal(false);
      setNewUnits('');
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  const openConfirmModal = (id, type) => {
    setDeleteTarget({ id, type });
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    const { id, type } = deleteTarget;
    if (!id) return;

    try {
      if (type === 'request') {
        await api.deleteBloodRequest(id);
        setRequests(prev => prev.filter(r => (r._id || r.id) !== id));
      } else if (type === 'donor') {
        await api.deleteDonor(id);
        setDonors(prev => prev.filter(d => (d._id || d.id) !== id));
      }
      setShowConfirmModal(false);
      setDeleteTarget({ id: null, type: null });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please retry.`);
    }
  };

  const handleAddDonor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addDonor({
        ...donorForm,
        location: donorForm.address
      });
      setDonors(prev => [...prev, res.data]);
      setShowDonorModal(false);
      setDonorForm({
        name: '',
        bloodGroup: '',
        contact: '',
        address: '',
        urgency: 'normal',
        units: 1
      });
      if (typeof onRefreshDonors === 'function') onRefreshDonors();
    } catch (error) {
      console.error("Error adding donor:", error);
      alert("Failed to add donor.");
    }
  };

  const handleRegisterRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addBloodRequest(requestForm);
      setRequests(prev => [res.data, ...prev]);
      setShowRequestModal(false);
      setRequestForm({
        patient: '',
        bloodGroup: '',
        urgency: 'emergency',
        units: 1,
        contact: '',
        hospital: ''
      });
    } catch (error) {
      console.error("Error adding request:", error);
      alert("Failed to add request. Check details.");
    }
  };

  const handleApproveDonor = async (id) => {
    try {
      await api.approveDonor(id);
      setDonors(prev =>
        prev.map(d => ((d._id || d.id) === id ? { ...d, status: 'approved' } : d))
      );
      // Refresh donors in main App to show on public Donors page
      if (typeof onRefreshDonors === 'function') {
        onRefreshDonors();
      }
    } catch (error) {
      console.error("Error approving donor:", error);
      alert("Failed to approve donor.");
    }
  };

  const handleDeleteDonor = (id) => {
    openConfirmModal(id, 'donor');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: 'loading', msg: 'Saving changes...' });
    try {
      await api.updateProfile({
        id: userData?._id || userData?.id,
        ...settingsForm
      });
      setSaveStatus({ type: 'success', msg: 'Settings updated successfully! ✨' });
      setTimeout(() => setSaveStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus({ type: 'error', msg: 'Update failed. Check permissions.' });
    }
  };

  // Filtered lists
  const filteredRequests = requests.filter(r =>
    r.hospital?.toLowerCase().includes(requestSearch.toLowerCase()) ||
    r.patient?.toLowerCase().includes(requestSearch.toLowerCase())
  );

  const filteredDonors = donors.filter(d =>
    d.name?.toLowerCase().includes(donorSearch.toLowerCase()) ||
    d.bloodGroup?.toLowerCase().includes(donorSearch.toLowerCase())
  );

  return (
    <div className="blood-bank-panel">
      {/* Header */}
      <header className="blood-bank-topbar">
        <div className="topbar-container">
          <h1 className="topbar-title">Blood Bank Central Panel</h1>

          <nav className="topbar-nav">
            <button
              className={`topbar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Activity size={18} /> Dashboard
            </button>
            <button
              className={`topbar-nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Droplet size={18} /> Hospital Requests
            </button>
            <button
              className={`topbar-nav-btn ${activeTab === 'donors' ? 'active' : ''}`}
              onClick={() => setActiveTab('donors')}
            >
              <Users size={18} /> Local Donors
            </button>
            <button
              className={`topbar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Logout button removed */}
          </div>
        </div>
      </header>

      <main className="blood-bank-main">
        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats Overview */}
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon red"><Droplet /></div>
                <div className="stat-info">
                  <h3>Total Blood Units</h3>
                  <p>{inventory.reduce((acc, curr) => acc + curr.units, 0)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue"><Activity /></div>
                <div className="stat-info">
                  <h3>Pending Requests</h3>
                  <p>{requests.filter(r => r.status === 'Pending').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><CheckCircle2 /></div>
                <div className="stat-info">
                  <h3>Approved Recently</h3>
                  <p>{requests.filter(r => r.status === 'approved').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><TrendingDown /></div>
                <div className="stat-info">
                  <h3>Low Stocks</h3>
                  <p>{inventory.filter(i => i.units < 10).length}</p>
                </div>
              </div>
            </div>

            {/* Inventory Realtime Grid */}
            <section className="inventory-section">
              <div className="section-header">
                <h2>Real-time Blood Inventory</h2>
                <span className="last-updated">Last Updated: Just Now</span>
              </div>

              <div className="inventory-grid">
                {inventory.map((item) => (
                  <div
                    key={item.group}
                    className="blood-stock-card"
                    onClick={() => {
                      setSelectedGroup(item.group);
                      setNewUnits(item.units.toString());
                      setShowUpdateModal(true);
                    }}
                  >
                    <div className="stock-group">{item.group}</div>
                    <div className="stock-units">{item.units} <small>Units</small></div>
                    <div className="stock-label">{item.units < 10 ? '🔴 Critical' : '🟢 Stable'}</div>
                    <div className="stock-bar-bg">
                      <div
                        className="stock-bar-fill"
                        style={{
                          width: `${(item.units / item.max) * 100}%`,
                          background: item.units < 10 ? '#dc3545' : '#28a745'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* Hospital Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="panel-card"
          >
            <div className="section-header">
              <h2>Hospital Blood Requests</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="search-bar" style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input
                    type="text"
                    placeholder="Search hospital or patient..."
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #ddd', padding: '8px 12px 8px 40px' }}
                  />
                </div>
                <button className="btn-primary" onClick={() => setShowRequestModal(true)}>
                  <Plus size={18} /> New Request
                </button>
              </div>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hospital Details</th>
                    <th>Patient</th>
                    <th>Units</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req._id}>
                      <td>{req._id?.slice(-6).toUpperCase()}</td>
                      <td>
                        <div className="patient-info">
                          <span className="patient-name">{req.hospital}</span>
                          <span className="patient-hospital">Emergency Contact: {req.contact}</span>
                        </div>
                      </td>
                      <td>
                        <div className="patient-info">
                          <span className="patient-name">{req.patient}</span>
                          <span className="blood-badge" style={{ width: 'fit-content' }}>{req.bloodGroup}</span>
                        </div>
                      </td>
                      <td>{req.units} Units</td>
                      <td>
                        <span style={{
                          color: req.urgency === 'emergency' ? '#dc3545' : '#856404',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}>
                          {req.urgency?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${req.status?.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="topbar-nav-btn"
                            style={{ background: '#e8f5e9', color: '#2e7d32' }}
                            onClick={() => handleStatusChange(req._id, 'Approved')}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            className="topbar-nav-btn"
                            style={{ background: '#ffebee', color: '#c62828' }}
                            onClick={() => openConfirmModal(req._id || req.id, 'request')}
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
          </motion.div>
        )}

        {/* Local Donors Tab */}
        {activeTab === 'donors' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="panel-card"
          >
            <div className="section-header">
              <h2>Registered Local Donors</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="search-bar" style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input
                    type="text"
                    placeholder="Name or Blood Group..."
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #ddd', padding: '8px 12px 8px 40px' }}
                  />
                </div>
                <button className="btn-primary" onClick={() => setShowDonorModal(true)}>
                  <Plus size={18} /> Add New Donor
                </button>
              </div>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Last Donation</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map((donor) => (
                    <tr key={donor._id}>
                      <td><span className="patient-name">{donor.name}</span></td>
                      <td><span className="blood-badge">{donor.bloodGroup}</span></td>
                      <td>{donor.lastDonation || 'Never'}</td>
                      <td>{donor.contact}</td>
                      <td>
                        <span className={`status-badge ${donor.status === 'approved' ? 'approved' : 'pending'}`}>
                          {donor.status || 'Verified'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="topbar-nav-btn"
                            style={{ padding: '6px' }}
                            onClick={() => {
                              setSelectedDonor(donor);
                              setShowDonorDetails(true);
                            }}
                            title="View Donor Details"
                          >
                            <Search size={14} />
                          </button>
                          {donor.status !== 'approved' && (
                            <button
                              className="topbar-nav-btn"
                              style={{ padding: '6px', color: 'var(--success)' }}
                              onClick={() => handleApproveDonor(donor._id || donor.id)}
                              title="Approve Donor"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button className="topbar-nav-btn" style={{ padding: '6px', color: '#dc3545' }} onClick={() => handleDeleteDonor(donor._id || donor.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel-card"
          >
            <div className="section-header">
              <h2>Blood Bank Settings</h2>
            </div>

            <form onSubmit={handleSaveSettings} style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label>Blood Bank Name</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Official Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  value={settingsForm.contact}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contact: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Automatic Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  value={settingsForm.threshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, threshold: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Account Role</label>
                <input
                  type="text"
                  value={settingsForm.role}
                  disabled
                  style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--primary)', background: '#F4F7F9' }}
                />
              </div>

              {saveStatus.msg && (
                <div className={`status-banner ${saveStatus.type}`} style={{
                  padding: '0.8rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: saveStatus.type === 'success' ? '#e8f5e9' : saveStatus.type === 'error' ? '#ffebee' : '#f0f3f5',
                  color: saveStatus.type === 'success' ? '#2e7d32' : saveStatus.type === 'error' ? '#c62828' : '#555'
                }}>
                  {saveStatus.type === 'success' && <CheckCircle2 size={16} />}
                  {saveStatus.type === 'error' && <AlertCircle size={16} />}
                  {saveStatus.msg}
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="topbar-nav-btn" onClick={() => setSettingsForm({
                  name: userData?.name || '',
                  email: userData?.email || '',
                  contact: userData?.contact || '',
                  threshold: 10
                })}>Reset Defaults</button>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      {/* Stock Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Update Inventory: {selectedGroup}</h2>
                <button className="modal-close" onClick={() => setShowUpdateModal(false)}>×</button>
              </div>
              <form onSubmit={handleUpdateStock}>
                <div className="form-group">
                  <label>Current Units Available</label>
                  <input
                    type="number"
                    value={newUnits}
                    onChange={(e) => setNewUnits(e.target.value)}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update Stock</button>
                  <button type="button" className="topbar-nav-btn" style={{ flex: 1 }} onClick={() => setShowUpdateModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Donor Modal */}
      <AnimatePresence>
        {showDonorModal && (
          <div className="modal-overlay" onClick={() => setShowDonorModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Register New Donor</h2>
                <button className="modal-close" onClick={() => setShowDonorModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddDonor}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Donor Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter donor name"
                      required
                      value={donorForm.name}
                      onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      required
                      value={donorForm.bloodGroup}
                      onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                    >
                      <option value="">Select Group</option>
                      {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency Level</label>
                    <select
                      value={donorForm.urgency || 'normal'}
                      onChange={(e) => setDonorForm({ ...donorForm, urgency: e.target.value })}
                    >
                      <option value="emergency">Emergency (Immediate)</option>
                      <option value="urgent">Urgent</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Blood Units (Bottles)</label>
                    <input
                      type="number"
                      min="1"
                      value={donorForm.units || 1}
                      onChange={(e) => setDonorForm({ ...donorForm, units: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      required
                      value={donorForm.contact}
                      onChange={(e) => setDonorForm({ ...donorForm, contact: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Home Address & City</label>
                    <input
                      type="text"
                      placeholder="Street, City"
                      required
                      value={donorForm.address}
                      onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Register Donor</button>
                  <button type="button" className="topbar-nav-btn" style={{ flex: 1 }} onClick={() => setShowDonorModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Request Modal (Added to match user request) */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '600px' }}
            >
              <div className="modal-header">
                <h2>Direct Blood Request</h2>
                <button className="modal-close" onClick={() => setShowRequestModal(false)}>×</button>
              </div>
              <form onSubmit={handleRegisterRequest}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Patient Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter patient name"
                      required
                      value={requestForm.patient}
                      onChange={(e) => setRequestForm({ ...requestForm, patient: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Group Required</label>
                    <select
                      required
                      value={requestForm.bloodGroup}
                      onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                    >
                      <option value="">Select Group</option>
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency Level</label>
                    <select
                      required
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                    >
                      <option value="emergency">Emergency (Immediate)</option>
                      <option value="urgent">Urgent</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Blood Units Required (Bottles)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={requestForm.units}
                      onChange={(e) => setRequestForm({ ...requestForm, units: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      required
                      value={requestForm.contact}
                      onChange={(e) => setRequestForm({ ...requestForm, contact: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Hospital Name & City</label>
                    <input
                      type="text"
                      placeholder="General Hospital, City"
                      required
                      value={requestForm.hospital}
                      onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Manual Request</button>
                  <button type="button" className="topbar-nav-btn" style={{ flex: 1 }} onClick={() => setShowRequestModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donor Details Modal */}
      <AnimatePresence>
        {showDonorDetails && selectedDonor && (
          <div className="modal-overlay" onClick={() => setShowDonorDetails(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '450px' }}
            >
              <div className="modal-header">
                <h2>Donor Information</h2>
                <button className="modal-close" onClick={() => setShowDonorDetails(false)}>×</button>
              </div>
              <div className="donor-profile-details">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div className="donor-avatar" style={{ margin: '0 auto 1rem', background: 'var(--primary-red)', color: 'white', scale: '1.2' }}>
                    {selectedDonor.name?.charAt(0)}
                  </div>
                  <h3>{selectedDonor.name}</h3>
                  <span className={`status-badge ${selectedDonor.status || 'pending'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    {selectedDonor.status?.toUpperCase() || 'VERIFIED'}
                  </span>
                </div>

                <div className="detail-item" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#f0f3f5', padding: '10px', borderRadius: '10px' }}><MapPin size={18} color="#666" /></div>
                  <div>
                    <small style={{ color: '#888', display: 'block' }}>Address / City</small>
                    <strong>{selectedDonor.location || selectedDonor.address || 'Not Provided'}</strong>
                  </div>
                </div>

                <div className="detail-item" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#f0f3f5', padding: '10px', borderRadius: '10px' }}><Phone size={18} color="#666" /></div>
                  <div>
                    <small style={{ color: '#888', display: 'block' }}>Contact</small>
                    <strong>{selectedDonor.contact || 'No Contact'}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f0f3f5', padding: '10px', borderRadius: '10px' }}><Droplet size={18} color="#dc3545" /></div>
                    <div>
                      <small style={{ color: '#888', display: 'block' }}>Group</small>
                      <strong style={{ color: '#dc3545' }}>{selectedDonor.bloodGroup}</strong>
                    </div>
                  </div>
                  <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f0f3f5', padding: '10px', borderRadius: '10px' }}><Activity size={18} color="#0d6efd" /></div>
                    <div>
                      <small style={{ color: '#888', display: 'block' }}>Bottles</small>
                      <strong>{selectedDonor.units || 1} Units</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '2.5rem' }}>
                <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={() => setShowDonorDetails(false)}>Close Details</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '400px', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '50%' }}>
                  <Trash2 size={32} color="#dc3545" />
                </div>
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Delete {deleteTarget.type === 'request' ? 'Request' : 'Donor'}?</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Are you sure you want to delete this {deleteTarget.type}?
                This action is permanent and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, background: '#dc3545' }}
                  onClick={executeDelete}
                >
                  Yes, Delete
                </button>
                <button
                  className="topbar-nav-btn"
                  style={{ flex: 1 }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodBankPanel;
