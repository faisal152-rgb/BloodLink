import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

/**
 * OAuthCallback - handles the redirect from the backend after social login.
 * URL: /auth/callback?token=...&id=...&name=...&email=...&role=...&avatar=...
 */
const OAuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      const errorMessages = {
        google_failed:   'Google login failed. Please try again.',
        facebook_failed: 'Facebook login failed. Please try again.',
        twitter_failed:  'X (Twitter) login failed. Please try again.',
      };
      setMsg(errorMessages[error] || 'Social login failed. Please try again.');
      setStatus('error');
      setTimeout(() => navigate('/auth'), 3000);
      return;
    }

    if (token) {
      const user = {
        id:           searchParams.get('id'),
        name:         searchParams.get('name'),
        email:        searchParams.get('email'),
        role:         searchParams.get('role') || 'donor',
        avatar:       searchParams.get('avatar') || '',
        hospitalName: searchParams.get('hospitalName') || '',
        phone:        searchParams.get('phone') || '',
      };

      // Persist token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setStatus('success');
      setMsg(`Welcome, ${user.name}! Redirecting to dashboard...`);

      // Notify app
      if (onLogin) onLogin(user, token);

      setTimeout(() => navigate('/'), 1500);
    } else {
      setMsg('No token received. Redirecting to login...');
      setStatus('error');
      setTimeout(() => navigate('/auth'), 3000);
    }
  }, [searchParams, navigate, onLogin]);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color, #f8f9fa)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'var(--white, #fff)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: '1.5rem' }}
            >
              <Loader size={52} color="var(--primary-red, #dc3545)" />
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Signing you in...
            </h2>
            <p style={{ color: '#888' }}>Just a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <CheckCircle size={56} color="#22c55e" />
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.5rem' }}>
              Login Successful!
            </h2>
            <p style={{ color: '#888' }}>{msg}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <XCircle size={56} color="var(--primary-red, #dc3545)" />
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-red, #dc3545)', marginBottom: '0.5rem' }}>
              Login Failed
            </h2>
            <p style={{ color: '#888' }}>{msg}</p>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default OAuthCallback;
