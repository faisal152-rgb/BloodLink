import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Donors from './pages/Donors';
import Request from './pages/Request';
import AuthPage from './pages/auth';
import ControlPanel from './pages/adminpanel';
import HospitalPanel from './pages/HospitalPanel';
import BloodBankPanel from './pages/BloodBankPanel';
import Profile from './pages/Profile';
import * as api from './services/api';

function App() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('bloodlinkActiveSection') || 'home';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('bloodlinkUser');
    const storedToken = localStorage.getItem('bloodlinkToken');
    if (storedUser && storedToken) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);

      // preserve current activeSection if already set, otherwise set role-based default
      if (!localStorage.getItem('bloodlinkActiveSection') || localStorage.getItem('bloodlinkActiveSection') === 'auth_login') {
        setActiveSection(parsedUser.role === 'donor' ? 'profile' : 'controlpanel');
      }
    }

    fetchDonors();

    // Remove hash from URL if it exists (at user request)
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bloodlinkActiveSection', activeSection);
  }, [activeSection]);

  const fetchDonors = async () => {
    try {
      const res = await api.getDonors();
      const donorsList = Array.isArray(res.data) ? res.data : (res.data?.donors || []);
      setDonors(donorsList.filter(d => d.status === 'approved'));
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  };

  const handleNavItemClick = (key) => {
    setActiveSection(key);
    
    // Update URL according to user request (avoiding hashes)
    if (key === 'home') window.history.pushState(null, '', '/home');
    else if (key === 'request') window.history.pushState(null, '', '/request');
    else if (key === 'donors') window.history.pushState(null, '', '/donor');

    const scrollId = key === 'donors' ? 'donors' : key;
    if (['home', 'donors', 'request'].includes(key)) {
      document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFindDonor = () => handleNavItemClick('donors');
  const handleRequestBlood = () => handleNavItemClick('request');

  const handleLogin = (data, token) => {
    setIsLoggedIn(true);
    setUserData(data);

    if (token) {
      localStorage.setItem('bloodlinkToken', token);
    }
    localStorage.setItem('bloodlinkUser', JSON.stringify(data));

    if (['admin', 'hospital', 'bloodbank'].includes(data.role)) {
      setActiveSection('controlpanel');
    } else {
      setActiveSection('profile');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setActiveSection('home');

    localStorage.removeItem('bloodlinkToken');
    localStorage.removeItem('bloodlinkUser');
  };

  const refreshUserData = async () => {
    try {
      const res = await api.getCurrentUser();
      const updatedUser = res.data?.user || res.data;
      if (updatedUser) {
        setUserData(updatedUser);
        localStorage.setItem('bloodlinkUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const renderSection = () => {
    if (activeSection === 'auth_login') {
      return <AuthPage onLogin={handleLogin} />;
    }
    if (activeSection === 'controlpanel' && isLoggedIn) {
      if (userData?.role === 'hospital') {
        return <HospitalPanel onLogout={handleLogout} userData={userData} onRefreshDonors={fetchDonors} onRefreshUserData={refreshUserData} />;
      }
      if (userData?.role === 'bloodbank') {
        return <BloodBankPanel onLogout={handleLogout} userData={userData} onRefreshDonors={fetchDonors} onRefreshUserData={refreshUserData} />;
      }
      return <ControlPanel onLogout={handleLogout} userData={userData} onRefreshDonors={fetchDonors} onRefreshUserData={refreshUserData} />;
    }
    if (activeSection === 'profile') {
      if (isLoggedIn) {
        return <Profile userData={userData} onLogout={handleLogout} />;
      }
      return <AuthPage onLogin={handleLogin} />;
    }
    if (activeSection === 'donors') {
      return (
        <>
          <Home onFindDonor={handleFindDonor} onRequestBlood={handleRequestBlood} />
          <Donors donors={donors} />
          <Request isLoggedIn={isLoggedIn} setActiveSection={setActiveSection} />
        </>
      );
    }
    // Default home
    return (
      <>
        <Home onFindDonor={handleFindDonor} onRequestBlood={handleRequestBlood} />
        <Donors donors={donors} />
        <Request isLoggedIn={isLoggedIn} setActiveSection={setActiveSection} />
      </>
    );
  };

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      isLoggedIn={isLoggedIn}
      isAdmin={isLoggedIn}
      onLogout={handleLogout}
      userData={userData}
      onAdminClick={() => setActiveSection('auth_login')}
      onNavItemClick={handleNavItemClick}
    >
      {renderSection()}
    </Layout>
  );
}

export default App;
