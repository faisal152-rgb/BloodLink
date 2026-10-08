import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, AlertCircle, LogIn, UserPlus, Droplet, Building2, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import '../styles/auth.css';
import * as api from '../services/api';

// SVG Icons for OAuth providers
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const OAUTH_PROVIDERS = [
  { id: 'google',   label: 'Continue with Google',   icon: GoogleIcon,   class: 'oauth-btn-google',   url: 'http://localhost:5000/api/auth/google' },
  { id: 'facebook', label: 'Continue with Facebook', icon: FacebookIcon, class: 'oauth-btn-facebook', url: 'http://localhost:5000/api/auth/facebook' },
  { id: 'twitter',  label: 'Continue with X',        icon: XIcon,        class: 'oauth-btn-twitter',  url: 'http://localhost:5000/api/auth/twitter' },
];

const ROLES = [
  { id: 'donor',    label: 'Donor',    desc: 'I want to donate blood',       icon: Droplet,    color: '#e53935', bg: 'rgba(229,57,53,0.08)',   border: '#e53935' },
  { id: 'hospital', label: 'Hospital', desc: 'We need blood for patients',   icon: Building2,  color: '#1565c0', bg: 'rgba(21,101,192,0.08)',  border: '#1565c0' },
];

// ── OTP Step ──────────────────────────────────────────────────────────────────
const OtpStep = ({ email, onSuccess, onBack }) => {
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRefs             = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;          // digits only
    const next = [...otp];
    next[idx] = val.slice(-1);               // keep only last digit
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the full 6-digit OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp({ otp: code, email });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="otp-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
    >
      {/* Back button */}
      <button type="button" className="otp-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Login
      </button>

      {/* Header */}
      <div className="otp-header">
        <div className="otp-mail-icon"><Mail size={32} /></div>
        <h3>Check your email</h3>
        <p>We sent a 6-digit OTP to<br /><strong>{email}</strong></p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 6-box OTP input */}
        <div className="otp-boxes" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-box-${idx}`}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              className={`otp-box ${digit ? 'otp-box--filled' : ''}`}
              autoFocus={idx === 0}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <p className="otp-hint">Didn't receive it? Check spam or wait a moment and try logging in again.</p>
    </motion.div>
  );
};

// ── Main Auth Page ─────────────────────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin]       = useState(true);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [role, setRole]             = useState('donor');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP step state
  const [otpEmail, setOtpEmail]     = useState('');
  const [showOtp, setShowOtp]       = useState(false);

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) { setError('Please fill in all required fields.'); return; }
    if (!isLogin && !name)   { setError('Please enter your full name to register.'); return; }

    try {
      setLoading(true);
      if (isLogin) {
        const res = await api.login({ email, password });
        onLogin(res.data.user, res.data.token || res.data.accesstoken);
      } else {
        await api.register({ name, email, password, role });
        // After register, backend sends OTP → show OTP step
        setOtpEmail(email);
        setShowOtp(true);
      }
    } catch (err) {
      const data = err.response?.data;
      // Backend returns 403 + requireOtp:true if user exists but email not verified
      if (err.response?.status === 403 && data?.requireOtp) {
        setOtpEmail(data.email || email);
        setShowOtp(true);
        return;
      }
      setError(data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtp(false);
    setSuccessMsg('Email verified! ✅ You can now sign in.');
    switchMode(true);
  };

  const handleOAuthLogin = (url) => { window.location.href = url; };

  return (
    <section className="section login-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="login-card"
        >
          <AnimatePresence mode="wait">
            {showOtp ? (
              <OtpStep
                key="otp"
                email={otpEmail}
                onSuccess={handleOtpSuccess}
                onBack={() => { setShowOtp(false); switchMode(true); }}
              />
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
              >
                {/* Header */}
                <div className="login-header">
                  <UserCircle size={52} color="var(--primary-red)" />
                  <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                  <p>{isLogin ? 'Sign in to the BloodLink Network' : 'Join our community of life savers'}</p>
                </div>

                {/* Sign In / Sign Up Toggle */}
                <div className="auth-toggle">
                  <button type="button" className={isLogin ? 'btn-primary' : 'btn-secondary'} onClick={() => switchMode(true)}>
                    <LogIn size={18} /> Sign In
                  </button>
                  <button type="button" className={!isLogin ? 'btn-primary' : 'btn-secondary'} onClick={() => switchMode(false)}>
                    <UserPlus size={18} /> Sign Up
                  </button>
                </div>

                {/* Role Selector */}
                <div className="role-selector-label"></div>
                <div className="role-selector">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const selected = role === r.id;
                    return (
                      <motion.button
                        key={r.id}
                        type="button"
                        className={`role-card ${selected ? 'role-card--selected' : ''}`}
                        style={{ '--role-color': r.color, '--role-bg': r.bg, '--role-border': r.border }}
                        onClick={() => setRole(r.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="role-card__icon"><Icon size={22} /></div>
                        <div className="role-card__text">
                          <span className="role-card__name">{r.label}</span>
                          <span className="role-card__desc">{r.desc}</span>
                        </div>
                        <AnimatePresence>
                          {selected && (
                            <motion.div className="role-card__check"
                              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                              <CheckCircle size={18} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Alerts */}
                {error      && <div className="error-alert"><AlertCircle size={16} /> {error}</div>}
                {successMsg && <div className="success-alert"><CheckCircle size={16} /> {successMsg}</div>}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required={!isLogin} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                  <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin
                      ? `Sign In as ${role === 'donor' ? 'Donor' : 'Hospital'}`
                      : `Create ${role === 'donor' ? 'Donor' : 'Hospital'} Account`)}
                  </button>
                </form>

                {/* Divider */}
                <div className="oauth-divider"><span>or continue with</span></div>

                {/* OAuth */}
                <div className="oauth-section">
                  {OAUTH_PROVIDERS.map((provider) => {
                    const Icon = provider.icon;
                    return (
                      <motion.button key={provider.id} type="button" className={`oauth-btn ${provider.class}`}
                        onClick={() => handleOAuthLogin(provider.url)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Icon /><span>{provider.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default AuthPage;
