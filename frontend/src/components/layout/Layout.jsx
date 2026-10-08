import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/layout.css';

const Layout = ({ children, activeSection, setActiveSection, isLoggedIn, isAdmin, onLogout, userData, onAdminClick, onNavItemClick }) => {
  return (
    <div className="layout-wrapper">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={onLogout}
        userData={userData}
        onNavItemClick={onNavItemClick}
      />
      <main>
        {children}
      </main>
      <Footer onAdminClick={onAdminClick} onNavItemClick={onNavItemClick} />
    </div>
  );
};

export default Layout;
