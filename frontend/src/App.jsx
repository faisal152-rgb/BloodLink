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

// Helper: Map URL pathname to internal section
const pathToSection = (path) => {
  const cleanPath = (path || window.location.pathname).toLowerCase().replace(/\/$/, '') || '/';
  if (['/login', '/auth', '/register', '/signin'].includes(cleanPath)) return 'auth_login';
  if (cleanPath === '/request') return 'request';
  if (['/donor', '/donors'].includes(cleanPath)) return 'donors';
  if (cleanPath === '/profile') return 'profile';
  if (['/controlpanel', '/admin', '/dashboard'].includes(cleanPath)) return 'controlpanel';
  return 'home';
};

// Helper: Map internal section to URL pathname
const sectionToPath = (section) => {
  switch (section) {
    case 'auth_login': return '/login';
    case 'request': return '/request';
    case 'donors': return '/donor';
    case 'profile': return '/profile';
    case 'controlpanel': return '/controlpanel';
    case 'home':
    default:
      return '/home';
  }
};

function App() {
  const [activeSection, setActiveSection] = useState(() => {
    // 1. First priority: current URL in the browser
    const fromUrl = pathToSection(window.location.pathname);
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      return fromUrl;
    }
    // 2. Second priority: saved section
    return localStorage.getItem('bloodlinkActiveSection') || 'home';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [donors, setDonors] = useState([]);

  // Check URL pathname and OAuth Callback on mount
  useEffect(() => {
    // Check for OAuth Callback parameters in URL: /auth/callback?accesstoken=...
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('accesstoken');

    if (token) {
      const user = {
        id: urlParams.get('id'),
        name: urlParams.get('name'),
        email: urlParams.get('email'),
        role: urlParams.get('role') || 'donor',
        avatar: urlParams.get('avatar'),
        hospitalName: urlParams.get('hospitalName'),
        phone: urlParams.get('phone'),
        verified: urlParams.get('verified') === 'true',
      };

      localStorage.setItem('bloodlinkToken', token);
      localStorage.setItem('bloodlinkUser', JSON.stringify(user));
      setIsLoggedIn(true);
      setUserData(user);

      const target = ['admin', 'hospital', 'bloodbank'].includes(user.role) ? 'controlpanel' : 'profile';
      navigateTo(target);
      return;
    }

    // Existing session check
    const storedUser = localStorage.getItem('bloodlinkUser');
    const storedToken = localStorage.getItem('bloodlinkToken');
    if (storedUser && storedToken) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);

      // If user came to root or home while logged in, role-based default
      const currentSection = pathToSection(window.location.pathname);
      if (currentSection === 'home' && !localStorage.getItem('bloodlinkActiveSection')) {
        navigateTo(parsedUser.role === 'donor' ? 'profile' : 'controlpanel');
      }
    }

    fetchDonors();

    // Listen to browser Back / Forward buttons
    const handlePopState = () => {
      const target = pathToSection(window.location.pathname);
      setActiveSection(target);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync URL and localStorage whenever activeSection changes
  const navigateTo = (section) => {
    setActiveSection(section);
    localStorage.setItem('bloodlinkActiveSection', section);

    const targetPath = sectionToPath(section);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

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
    navigateTo(key);

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
      navigateTo('controlpanel');
    } else {
      navigateTo('profile');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    navigateTo('home');

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
          <Request isLoggedIn={isLoggedIn} setActiveSection={navigateTo} />
        </>
      );
    }
    // Default home
    return (
      <>
        <Home onFindDonor={handleFindDonor} onRequestBlood={handleRequestBlood} />
        <Donors donors={donors} />
        <Request isLoggedIn={isLoggedIn} setActiveSection={navigateTo} />
      </>
    );
  };

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={navigateTo}
      isLoggedIn={isLoggedIn}
      isAdmin={isLoggedIn}
      onLogout={handleLogout}
      userData={userData}
      onAdminClick={() => navigateTo('auth_login')}
      onNavItemClick={handleNavItemClick}
    >
      {renderSection()}
    </Layout>
  );
}

export default App;
