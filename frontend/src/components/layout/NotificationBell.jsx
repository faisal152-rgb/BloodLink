import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import * as api from '../../services/api';
import '../../styles/donor-notifications.css';

const NotificationBell = ({ target }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const welcomeDismissalsInFlight = useRef(new Set());
  const panelId = `${target}-notifications-panel`;

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getNotifications(target);
      if (!Array.isArray(response.data)) {
        throw new Error('Unexpected notifications response.');
      }
      setNotifications(response.data);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || fetchError.message || 'Could not load notifications.');
      console.error(`Error fetching ${target} notifications:`, fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) fetchNotifications();
  };

  useEffect(() => {
    if (!isOpen || loading || error) return;

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
      } catch (dismissError) {
        console.error('Error dismissing viewed welcome notification:', dismissError);
      } finally {
        welcomeDismissalsInFlight.current.delete(id);
      }
    });
  }, [isOpen, loading, error, notifications]);

  return (
    <div className="donor-notifications-wrap">
      <button
        type="button"
        className="donor-notifications-button"
        onClick={handleToggle}
        aria-label={`Notifications${notifications.length ? `, ${notifications.length} messages` : ''}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <Bell size={21} />
        {notifications.length > 0 && (
          <span className="donor-notifications-badge">
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <Motion.section
            id={panelId}
            className="donor-notifications-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            aria-label="Notifications"
          >
            <div className="donor-notifications-header">
              <h2>Notifications</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications">
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <p className="donor-notifications-state" role="status">Loading notifications...</p>
            ) : error ? (
              <div className="donor-notifications-state" role="alert">
                <p>{error}</p>
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
  );
};

export default NotificationBell;
