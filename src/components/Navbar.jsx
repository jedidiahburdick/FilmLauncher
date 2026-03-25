import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSrc from '../assets/FL-logo.png';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import SearchOverlay from './SearchOverlay';
import './Navbar.css';

function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(d / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

const NAV_ITEMS = ['Home', 'Movies', 'Series', 'Fund a Film', 'My Library'];

const FILTER_MAP = { Home: 'all', Movies: 'movies', Series: 'series', 'Fund a Film': 'funding' };

export default function Navbar({ onFilterChange, activeFilter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, clearNotification } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const onDetailPage = location.pathname.startsWith('/film/');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (item) => {
    if (item === 'My Library') {
      navigate('/library');
      setMenuOpen(false);
      return;
    }
    const filter = FILTER_MAP[item];
    if (filter) {
      onFilterChange(filter);
      navigate('/');
    }
    setMenuOpen(false);
  };

  const isActive = (item) => {
    if (item === 'My Library') return location.pathname === '/library';
    if (location.pathname !== '/') return false;
    return (
      (item === 'Home' && activeFilter === 'all') ||
      (item === 'Movies' && activeFilter === 'movies') ||
      (item === 'Series' && activeFilter === 'series') ||
      (item === 'Fund a Film' && activeFilter === 'funding')
    );
  };

  return (
    <>
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <button className="navbar__logo" onClick={() => { onFilterChange('all'); navigate('/'); }}>
          <img src={logoSrc} alt="FilmLauncher" className="navbar__logo-img" />
        </button>

        {/* Nav links */}
        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item}>
              <button
                className={`navbar__link ${isActive(item) ? 'navbar__link--active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="navbar__right">
          <button className="navbar__search" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {user && (
            <div className="navbar__bell-wrap">
              <button
                className="navbar__bell"
                aria-label="Notifications"
                onClick={() => { setBellOpen((o) => !o); setProfileMenuOpen(false); if (!bellOpen) markAllRead(); }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="navbar__bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="navbar__notif-menu">
                  <div className="navbar__notif-header">
                    <p className="navbar__notif-title">Notifications</p>
                    {notifications.length > 0 && (
                      <button className="navbar__notif-mark-read" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="navbar__notif-list">
                    {notifications.length === 0 ? (
                      <p className="navbar__notif-empty">No notifications yet.<br/>Add titles to your watchlist to get updates.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          className={`navbar__notif-item${!n.read ? ' navbar__notif-item--unread' : ''}`}
                          onClick={() => { navigate(`/film/${n.itemId}`); setBellOpen(false); }}
                        >
                          <div className="navbar__notif-poster">
                            {n.poster && <img src={n.poster} alt={n.title} />}
                          </div>
                          <div className="navbar__notif-body">
                            <p className="navbar__notif-label">{n.label}</p>
                            <p className="navbar__notif-msg">{n.message}</p>
                            <p className="navbar__notif-time">{timeAgo(n.timestamp)}</p>
                          </div>
                          {!n.read && <span className="navbar__notif-dot" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="navbar__profile-wrap">
              <button
                className="navbar__profile-btn"
                onClick={() => setProfileMenuOpen((o) => !o)}
                aria-label="Profile"
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="navbar__profile-img" />
                  : <span className="navbar__profile-initials">
                      {user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                    </span>}
              </button>
              {profileMenuOpen && (
                <div className="navbar__profile-menu">
                  <div className="navbar__profile-info">
                    <p className="navbar__profile-name">{user.name}</p>
                    <p className="navbar__profile-email">{user.email}</p>
                  </div>
                  <div className="navbar__profile-divider" />
                  <button className="navbar__profile-item" onClick={() => { navigate('/library'); setProfileMenuOpen(false); }}>My Library</button>
                  <button className="navbar__profile-item navbar__profile-item--danger" onClick={() => { logout(); setProfileMenuOpen(false); }}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar__get-started" onClick={() => navigate('/login', { state: { from: location.pathname } })}>
              Get Started
            </button>
          )}

          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </nav>

    {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
