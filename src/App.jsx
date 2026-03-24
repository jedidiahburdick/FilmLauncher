import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContentRow from './components/ContentRow';
import DetailPage from './pages/DetailPage';
import { allContent, rows, heroContent } from './data/content';
import './App.css';

function BrowsePage({ activeFilter }) {
  const filteredRows = useMemo(() => {
    if (activeFilter === 'all') return rows;
    if (activeFilter === 'movies') {
      return [
        { id: 'movies', label: 'All Movies', filter: (c) => c.type === 'streaming' && c.duration && !c.duration.includes('Season') },
        { id: 'award-winners', label: 'Award-Winning Cinema', filter: rows.find(r => r.id === 'award-winners').filter },
      ];
    }
    if (activeFilter === 'series') {
      return [{ id: 'series', label: 'Series', filter: (c) => c.rows.includes('series') }];
    }
    if (activeFilter === 'funding') {
      return [
        { id: 'funding-all', label: 'All Campaigns', filter: (c) => c.type === 'funding' },
        { id: 'funding-closing', label: 'Closing Soon', filter: (c) => c.type === 'funding' && c.fundingDaysLeft <= 10 },
        { id: 'funding-hot', label: 'Nearly Funded', filter: (c) => c.type === 'funding' && (c.fundingRaised / c.fundingGoal) >= 0.7 },
      ];
    }
    return rows;
  }, [activeFilter]);

  const heroItem = useMemo(() => {
    if (activeFilter === 'funding') {
      return allContent.find((c) => c.type === 'funding' && c.rows.includes('featured')) || allContent.find((c) => c.type === 'funding');
    }
    return heroContent;
  }, [activeFilter]);

  return (
    <>
      <Hero item={heroItem} />

      <main className="app__main">
        {filteredRows.map((row) => {
          const items = allContent.filter(row.filter);
          return (
            <ContentRow
              key={row.id}
              label={row.label}
              items={items}
            />
          );
        })}
      </main>

      <footer className="app__footer">
        <div className="footer__inner">
          <p className="footer__logo">FILM<span>LAUNCHER</span></p>
          <p className="footer__tagline">Stream the world. Fund the next story.</p>
          <div className="footer__links">
            <button>About</button>
            <button>Press</button>
            <button>Careers</button>
            <button>Terms</button>
            <button>Privacy</button>
            <button>Contact</button>
          </div>
          <p className="footer__copy">© 2025 FilmLauncher. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="app">
      <Navbar onFilterChange={setActiveFilter} activeFilter={activeFilter} />

      <Routes>
        <Route path="/" element={<BrowsePage activeFilter={activeFilter} />} />
        <Route path="/film/:id" element={<DetailPage />} />
      </Routes>
    </div>
  );
}
