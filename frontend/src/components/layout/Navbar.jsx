import React, { useEffect, useRef, useState } from 'react';
import { Droplet, User, ShieldCheck, Building2, LayoutDashboard, LogOut, Menu, X, Bell } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import * as api from '../../services/api';
import '../../styles/donor-notifications.css';

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: ShieldCheck, color: '#dc3545' },
  hospital: { label: 'Hospital', icon: Building2, color: '#0d6efd' },
  bloodbank: { label: 'Blood Bank', icon: Droplet, color: '#198754' },
  donor: { label: 'Donor', icon: User, color: '#6f42c1' },
};

const Navbar = ({ activeSection, setActiveSection, isLoggedIn, onLogout, userData, onNavItemClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const welcomeDismissalsInFlight = useRef(new Set());

  const role = typeof userData?.role === 'string'
    ? userData.role.trim().toLowerCase()
    : 'donor';
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.donor;
  const RoleIcon = roleConf.icon;
  const userName = userData?.name || 'User';
  const userEmail = userData?.email || '';
  // initials from name
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const response = await api.getNotifications('donor');
      if (!Array.isArray(response.data)) {
        throw new Error('Unexpected notifications response.');
      }
      setNotifications(response.data);
    } catch (error) {
      setNotificationsError(error.response?.data?.message || error.message || 'Could not load notifications.');
      console.error('Error fetching donor notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationsClick = () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    if (willOpen) fetchNotifications();
  };

  useEffect(() => {
    if (!showNotifications || notificationsLoading) return;

    const welcomeIds = notifications
      .filter((notification) => notification.type === 'welcome')
      .map((notification) => notification._id || notification.id)
      .filter((id) => id && !welcomeDismissalsInFlight.current.has(id));

    welcomeIds.forEach((id) => welcomeDismissalsInFlight.current.add(id));

    welcomeIds.forEach(async (id) => {
      try {
        await api.dismissWelcomeNotification(id);
        setNotifications((current) =>
          current.filter((notification) => (notification._id || notification.id) !== id)
        );
      } catch (error) {
        console.error('Error dismissing viewed welcome notification:', error);
      } finally {
        welcomeDismissalsInFlight.current.delete(id);
      }
    });
  }, [showNotifications, notificationsLoading, notifications]);

  const handleLogoClick = () => {
    onNavItemClick('home');
    setShowMenu(false);
    setMobileMenuOpen(false);
  };

  const handleNavItemClick = (key) => {
    onNavItemClick(key);
    setShowMenu(false);
    setMobileMenuOpen(false);
  };

  // Panel label depends on role
  const panelLabel = role === 'admin'
    ? 'Admin Panel'
    : role === 'hospital'
      ? 'Hospital Panel'
      : role === 'bloodbank'
        ? 'BloodBank Panel'
        : 'Dashboard';

  const navItems = [
    { label: 'Home', key: 'home', href: '/home' },
    { label: 'Donors', key: 'donors', href: '/donor' },
    { label: 'Request', key: 'request', href: '/request' }
  ];

  return (
    <header className="app-header">
      <div className="container nav-container">
        {/* Logo */}
        <div className="logo-group" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Droplet fill="#dc3545" size={32} />
          <span className="logo-text">BloodLink</span>
        </div>

        {/* Nav Links (Desktop) */}
        <nav className="nav-links">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavItemClick(item.key);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              {role === 'donor' && (
                <div className="donor-notifications-wrap">
                  <button
                    type="button"
                    className="donor-notifications-button"
                    onClick={handleNotificationsClick}
                    aria-label={`Notifications${notifications.length ? `, ${notifications.length} messages` : ''}`}
                    aria-expanded={showNotifications}
                    aria-controls="donor-notifications-panel"
                  >
                    <Bell size={21} />
                    {notifications.length > 0 && (
                      <span className="donor-notifications-badge">
                        {notifications.length > 99 ? '99+' : notifications.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <Motion.section
                        id="donor-notifications-panel"
                        className="donor-notifications-panel"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        aria-label="Notifications"
                      >
                        <div className="donor-notifications-header">
                          <h2>Notifications</h2>
                          <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            aria-label="Close notifications"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {notificationsLoading ? (
                          <p className="donor-notifications-state" role="status">Loading notifications...</p>
                        ) : notificationsError ? (
                          <div className="donor-notifications-state" role="alert">
                            <p>{notificationsError}</p>
                            <button type="button" onClick={fetchNotifications}>Try again</button>
                          </div>
                        ) : notifications.length === 0 ? (
                          <p className="donor-notifications-state">No notifications yet.</p>
                        ) : (
                          <ul className="donor-notifications-list">
                            {notifications.map((notification, index) => (
                              <li key={notification._id || notification.id || index}>
                                <h3>{notification.title || 'BloodLink announcement'}</h3>
                                <p>{notification.message}</p>
                                {(notification.timestamp || notification.createdAt) && (
                                  <time dateTime={notification.timestamp || notification.createdAt}>
                                    {new Date(notification.timestamp || notification.createdAt).toLocaleString()}
                                  </time>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </Motion.section>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <a 
                href="/request" 
                className="nav-cta desktop-only" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavItemClick('request'); 
                }}
              >
                Urgent Request
              </a>
              <div className="nav-profile-container">
                <div className="nav-profile-wrap" onClick={() => setShowMenu(!showMenu)}>
                  <div className="nav-avatar" style={{ background: roleConf.color }}>
                    {initials}
                  </div>
                  <Motion.div
                    className="online-indicator"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>

                <AnimatePresence>
                  {showMenu && (
                    <Motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="profile-dropdown"
                    >
                      {/* User Info */}
                      <div className="dropdown-user-info">
                        <div className="user-role-badge" style={{ color: roleConf.color }}>
                          <RoleIcon size={16} />
                          <span>:{roleConf.label}</span>
                        </div>
                        <span className="user-name">{userName}</span>
                        <span className="user-email">{userEmail}</span>
                      </div>

                      <div className="dropdown-divider" />

                      {/* Profile */}
                      <button
                        className="dropdown-item"
                        onClick={() => { setActiveSection('profile'); setShowMenu(false); }}
                      >
                        <User size={18} /> My Profile
                      </button>

                      {/* Panel */}
                      {['admin', 'hospital', 'bloodbank'].includes(role) && (
                        <button
                          className="dropdown-item"
                          onClick={() => { setActiveSection('controlpanel'); setShowMenu(false); }}
                          style={{ color: roleConf.color }}
                        >
                          <LayoutDashboard size={18} /> {panelLabel}
                        </button>
                      )}

                      <div className="dropdown-divider" />

                      {/* Logout */}
                      <button
                        className="dropdown-item logout"
                        onClick={() => { onLogout(); setShowMenu(false); }}
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <a 
                href="/request" 
                className="nav-cta desktop-only" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavItemClick('request'); 
                }}
              >
                Urgent Request
              </a>
              <button className="btn-login" onClick={() => setActiveSection('auth_login')}>
                <User size={18} /> Login
              </button>
            </>
          )}

          {/* Hamburger Toggle Button */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-nav-drawer"
          >
            <div className="container mobile-nav-content">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`mobile-nav-link ${activeSection === item.key ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavItemClick(item.key);
                  }}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/request"
                className="mobile-nav-cta"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavItemClick('request');
                }}
              >
                Urgent Request
              </a>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
