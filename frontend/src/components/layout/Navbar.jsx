import React, { useState } from 'react';
import { Droplet, User, ShieldCheck, Building2, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: ShieldCheck, color: '#dc3545' },
  hospital: { label: 'Hospital', icon: Building2, color: '#0d6efd' },
  bloodbank: { label: 'Blood Bank', icon: Droplet, color: '#198754' },
  donor: { label: 'Donor', icon: User, color: '#6f42c1' },
};

const Navbar = ({ activeSection, setActiveSection, isLoggedIn, isAdmin, onLogout, userData, onNavItemClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = userData?.role || 'donor';
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.donor;
  const RoleIcon = roleConf.icon;
  const userName = userData?.name || 'User';
  const userEmail = userData?.email || '';
  // initials from name
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
                  <motion.div
                    className="online-indicator"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
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
                    </motion.div>
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
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
