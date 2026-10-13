import React, { useState, useEffect } from 'react';
import { Mail, MapPin, ShieldCheck, Building2, Droplet, User } from 'lucide-react';
import * as api from '../services/api';
import '../styles/profile.css';

const ROLE_CONFIG = {
  admin:     { label: 'System Administrator', icon: ShieldCheck, color: '#dc3545' },
  hospital:  { label: 'Hospital Staff',       icon: Building2,   color: '#0d6efd' },
  bloodbank: { label: 'Blood Bank Manager',   icon: Droplet,     color: '#198754' },
  donor:     { label: 'Donor',                icon: User,        color: '#6f42c1' },
};

const Profile = ({ userData, onLogout }) => {
  const [currentUserData, setCurrentUserData] = useState(userData);

  // Fetch latest user data when component mounts
  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        const res = await api.getCurrentUser();
        setCurrentUserData(res.data);
      } catch (error) {
        console.error("Error fetching latest user data:", error);
        // Fall back to props data if fetch fails
        setCurrentUserData(userData);
      }
    };

    fetchLatestUserData();
  }, []);

  const role     = currentUserData?.role  || 'donor';
  const name     = currentUserData?.name  || 'User';
  const email    = currentUserData?.email || '';
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.donor;
  const RoleIcon = roleConf.icon;
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || '';

  const [firstNameState, setFirstNameState] = useState(firstName);
  const [lastNameState, setLastNameState] = useState(lastName);
  const [emailState, setEmailState] = useState(email);
  const [passwordState, setPasswordState] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');

    const updatedName = `${firstNameState.trim()} ${lastNameState.trim()}`.trim();

    try {
      const payload = { id: currentUserData?.id, name: updatedName, email: emailState.trim() };
      if (passwordState) {
        payload.password = passwordState;
      }
      const res = await api.updateProfile(payload);
      const updatedUser = res.data;

      // persist to localstorage and refresh local state
      setCurrentUserData(updatedUser);
      localStorage.setItem('bloodlinkUser', JSON.stringify(updatedUser));
      setUpdateMessage('Profile updated successfully.');
      setPasswordState(''); // clear the password field after applying
    } catch (err) {
      setUpdateMessage(err.response?.data?.message || 'Update failed. Please retry.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="section user-profile">
      <div className="container">
        <div className="profile-grid">
          {/* Sidebar */}
          <div className="sidebar-card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                className="nav-avatar"
                style={{
                  width: '100px',
                  height: '100px',
                  fontSize: '2.5rem',
                  margin: '0 auto 1.5rem',
                  background: roleConf.color,
                }}
              >
                {initials}
              </div>
              <h2>{name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                <RoleIcon size={16} color={roleConf.color} />
                <p style={{ color: roleConf.color, fontWeight: 600, margin: 0 }}>{roleConf.label}</p>
              </div>
            </div>
            <div className="dropdown-divider" />
            <div style={{ marginTop: '2rem' }}>
              <div className="info-item" style={{ marginBottom: '1rem' }}>
                <Mail size={18} /> <span>{email}</span>
              </div>
              <div className="info-item" style={{ marginBottom: '1rem' }}>
                <MapPin size={18} /> <span>Pakistan</span>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="dash-table-wrap">
            <h3>Personal Details</h3>
            <form style={{ marginTop: '2rem' }} onSubmit={handleUpdateProfile}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" value={firstNameState} onChange={(e) => setFirstNameState(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" value={lastNameState} onChange={(e) => setLastNameState(e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Email</label>
                  <input type="email" value={emailState} onChange={(e) => setEmailState(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Set Local Password (Optional)</label>
                  <input 
                    type="password" 
                    value={passwordState} 
                    onChange={(e) => setPasswordState(e.target.value)} 
                    placeholder="Enter to set or change your password"
                    minLength="6"
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Role</label>
                  <input type="text" value={roleConf.label} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Bio</label>
                  <textarea value={`Registered on BloodLink as ${roleConf.label}.`} rows="4" readOnly />
                </div>
              </div>
              {updateMessage && <p className="update-status">{updateMessage}</p>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
                {onLogout && (
                  <button type="button" className="btn-secondary" onClick={onLogout}>
                    Logout
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
