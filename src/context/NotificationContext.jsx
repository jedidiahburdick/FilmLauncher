import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWatchlist } from './WatchlistContext';

const NotificationContext = createContext(null);

const FUNDING_UPDATES = [
  { type: 'milestone',    label: 'Milestone Hit',  message: (t) => `${t} just hit a new funding milestone` },
  { type: 'ending_soon', label: 'Ending Soon',     message: (t) => `${t}'s campaign ends in 3 days` },
  { type: 'half_funded', label: '50% Funded',      message: (t) => `${t} reached 50% of its goal` },
  { type: 'new_backers', label: 'New Backers',     message: (t) => `${t} just gained 100 new backers` },
];

const STREAMING_UPDATES = [
  { type: 'new_episode', label: 'New Episode',     message: (t) => `A new episode of ${t} is now available` },
  { type: 'hd',         label: '4K Available',     message: (t) => `${t} is now streaming in 4K HDR` },
  { type: 'award',      label: 'Award Nom.',        message: (t) => `${t} received an award nomination` },
  { type: 'updated',    label: 'Updated',           message: (t) => `New content has been added to ${t}` },
];

function generateNotif(item) {
  const pool   = item.type === 'funding' ? FUNDING_UPDATES : STREAMING_UPDATES;
  const update = pool[item.id % pool.length];
  return {
    id:        `notif-${item.id}`,
    itemId:    item.id,
    title:     item.title,
    poster:    item.poster,
    itemType:  item.type,
    type:      update.type,
    label:     update.label,
    message:   update.message(item.title),
    timestamp: Date.now(),
    read:      false,
  };
}

export function NotificationProvider({ children }) {
  const { watchlist } = useWatchlist();

  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_notifications') || '[]'); }
    catch { return []; }
  });

  // Sync: add notifs for newly-watchlisted items, remove for de-listed items
  useEffect(() => {
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.itemId));
      const added = watchlist
        .filter((item) => !existingIds.has(item.id))
        .map(generateNotif);
      const kept = prev.filter((n) => watchlist.some((w) => w.id === n.itemId));
      return added.length > 0 ? [...added, ...kept] : kept;
    });
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('fl_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  // First unread notification for a specific item (used for card badges)
  const getItemNotification = (itemId) =>
    notifications.find((n) => n.itemId === itemId && !n.read) ?? null;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearNotification, getItemNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
