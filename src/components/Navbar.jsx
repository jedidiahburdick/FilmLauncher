import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSrc from '../assets/FL-logo.png';
import './Navbar.css';

const NAV_ITEMS = ['Home', 'Movies', 'Series', 'Fund a Film', 'My Watchlist'];

const FILTER_MAP = { Home: 'all', Movies: 'movies', Series: 'series', 'Fund a Film': 'funding' };

export default function Navbar({ onFilterChange, activeFilter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onDetailPage = location.pathname.startsWith('/film/');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (item) => {
    const filter = FILTER_MAP[item];
    if (filter) {
      onFilterChange(filter);
      if (onDetailPage) navigate('/');
    }
    setMenuOpen(false);
  };

  const isActive = (item) => {
    if (onDetailPage) return false;
    return (
      (item === 'Home' && activeFilter === 'all') ||
      (item === 'Movies' && activeFilter === 'movies') ||
      (item === 'Series' && activeFilter === 'series') ||
      (item === 'Fund a Film' && activeFilter === 'funding')
    );
  };

  return (
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
          <button className="navbar__search" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button className="navbar__avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </nav>
  );
}
