import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSrc from '../assets/FL-logo.png';
import { useAuth } from '../context/AuthContext';
import SearchOverlay from './SearchOverlay';
import './Navbar.css';

const NAV_ITEMS = ['Home', 'Movies', 'Series', 'Fund a Film', 'My Watchlist'];

const FILTER_MAP = { Home: 'all', Movies: 'movies', Series: 'series', 'Fund a Film': 'funding' };

export default function Navbar({ onFilterChange, activeFilter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const onDetailPage = location.pathname.startsWith('/film/');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (item) => {
    if (item === 'My Watchlist') {
      navigate('/watchlist');
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
    if (item === 'My Watchlist') return location.pathname === '/watchlist';
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
                  <button className="navbar__profile-item" onClick={() => { navigate('/watchlist'); setProfileMenuOpen(false); }}>My Watchlist</button>
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
