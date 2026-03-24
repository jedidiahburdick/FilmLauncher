import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContentRow from './components/ContentRow';
import DetailModal from './components/DetailModal';
import { allContent, rows, heroContent } from './data/content';
import './App.css';

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Hero item: if filter is funding, show a funding item; else show default
  const heroItem = useMemo(() => {
    if (activeFilter === 'funding') {
      return allContent.find((c) => c.type === 'funding' && c.rows.includes('featured')) || allContent.find((c) => c.type === 'funding');
    }
    return heroContent;
  }, [activeFilter]);

  return (
    <div className="app">
      <Navbar onFilterChange={setActiveFilter} activeFilter={activeFilter} />

      {/* Hero */}
      <Hero item={heroItem} onSelect={setSelectedItem} />

      {/* Content rows */}
      <main className="app__main">
        {filteredRows.map((row) => {
          const items = allContent.filter(row.filter);
          return (
            <ContentRow
              key={row.id}
              label={row.label}
              items={items}
              onSelect={setSelectedItem}
            />
          );
        })}
      </main>

      {/* Footer */}
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

      {/* Modal */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
