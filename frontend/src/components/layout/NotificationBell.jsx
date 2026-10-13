import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Bell, Trash2, X } from 'lucide-react';
import * as api from '../../services/api';
import '../../styles/donor-notifications.css';

const NotificationBell = ({ target }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingIds, setDeletingIds] = useState([]);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteError, setDeleteError] = useState('');
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

  const handleDelete = async (id) => {
    if (!id || deletingAll || deletingIds.includes(id)) return;

    setDeletingIds((current) => [...current, id]);
    setDeleteError('');
    try {
      await api.deleteNotification(id);
      setNotifications((current) =>
        current.filter((notification) => (notification._id || notification.id) !== id)
      );
    } catch (deleteError) {
      setDeleteError(deleteError.response?.data?.message || 'Could not delete this notification. Please try again.');
      console.error('Error deleting notification:', deleteError);
    } finally {
      setDeletingIds((current) => current.filter((deletingId) => deletingId !== id));
    }
  };

  const handleDeleteAll = async () => {
    if (deletingAll || deletingIds.length > 0 || notifications.length === 0) return;

    setDeletingAll(true);
    setDeleteError('');
    try {
      await api.deleteAllNotifications();
      setNotifications([]);
    } catch (deleteError) {
      setDeleteError(deleteError.response?.data?.message || 'Could not delete all notifications. Please try again.');
      console.error('Error deleting all notifications:', deleteError);
    } finally {
      setDeletingAll(false);
    }
  };

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
              <div className="donor-notifications-header-actions">
                <button
                  type="button"
                  className="donor-notifications-delete-all"
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0 || deletingAll || deletingIds.length > 0}
                  aria-label="Delete all notifications"
                  title="Delete all notifications"
                >
                  <Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications">
                  <X size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="donor-notifications-state" role="status">Loading notifications...</p>
            ) : error ? (
              <div className="donor-notifications-state" role="alert">
                <p>{error}</p>
                <button type="button" onClick={fetchNotifications}>Try again</button>
              </div>
            ) : notifications.length === 0 ? (
              <>
                {deleteError && <p className="donor-notifications-error" role="alert">{deleteError}</p>}
                <p className="donor-notifications-state">No notifications yet.</p>
              </>
            ) : (
              <ul className="donor-notifications-list">
                {deleteError && (
                  <li className="donor-notifications-error" role="alert">{deleteError}</li>
                )}
                {notifications.map((notification, index) => (
                  <li key={notification._id || notification.id || index}>
                    <div className="donor-notifications-item-header">
                      <h3>{notification.title || 'BloodLink announcement'}</h3>
                      <button
                        type="button"
                        className="donor-notifications-delete"
                        onClick={() => handleDelete(notification._id || notification.id)}
                        disabled={deletingAll || deletingIds.includes(notification._id || notification.id)}
                        aria-label={`Delete ${notification.title || 'notification'}`}
                        title="Delete notification"
                      >
                        <Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
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
