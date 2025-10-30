'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, writeBatch, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);

        const notifData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notifData);
        setUnreadCount(notifData.filter((n) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });

      // Update local state
      setNotifications(
        notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));

      // Update local state
      const deletedNotif = notifications.find((n) => n.id === notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!confirm('Clear all notifications?')) return;

    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        batch.delete(doc(db, 'notifications', notif.id));
      });
      await batch.commit();

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <Link
                    href={notification.link || '#'}
                    onClick={() => handleNotificationClick(notification)}
                    className="block"
                  >
                    <div className="flex items-start">
                      <div className="flex-1 pr-8">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt.toDate
                                  ? notification.createdAt.toDate()
                                  : notification.createdAt
                              ).toLocaleDateString()
                            : 'Just now'}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="ml-2 flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </Link>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-xl font-bold leading-none"
                    aria-label="Delete notification"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleClearAllNotifications}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 mb-2"
              >
                Clear All Notifications
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
