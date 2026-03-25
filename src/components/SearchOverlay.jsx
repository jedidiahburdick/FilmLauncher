import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { allContent } from '../data/content';
import './SearchOverlay.css';

function search(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return allContent.filter((item) =>
    item.title.toLowerCase().includes(q) ||
    item.tagline?.toLowerCase().includes(q) ||
    item.genre?.some((g) => g.toLowerCase().includes(q)) ||
    item.director?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q)
  );
}

export default function SearchOverlay({ onClose }) {
  const navigate    = useNavigate();
  const inputRef    = useRef(null);
  const [query, setQuery] = useState('');
  const results = search(query);

  // Focus input on mount, close on Escape
  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = (item) => {
    onClose();
    navigate(`/film/${item.id}`);
  };

  return (
    <div className="so__overlay" onClick={onClose}>
      <div className="so__panel" onClick={(e) => e.stopPropagation()}>

        {/* Search bar */}
        <div className="so__bar">
          <svg className="so__icon" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            className="so__input"
            type="text"
            placeholder="Search films, series, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button className="so__clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button className="so__close" onClick={onClose}>Cancel</button>
        </div>

        {/* Results */}
        <div className="so__body">
          {!query && (
            <p className="so__hint">Start typing to search across all films, series, and funding campaigns.</p>
          )}

          {query && results.length === 0 && (
            <div className="so__empty">
              <p className="so__empty-title">No results for <em>"{query}"</em></p>
              <p className="so__empty-sub">Try a different title, genre, or director.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="so__count">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              <div className="so__grid">
                {results.map((item) => (
                  <button key={item.id} className="so__card" onClick={() => handleSelect(item)}>
                    <div className="so__card-poster">
                      <img src={item.poster} alt={item.title} loading="lazy" />
                      <span className={`so__card-badge ${item.type === 'funding' ? 'so__card-badge--funding' : ''}`}>
                        {item.type === 'funding' ? 'FUNDING' : 'STREAMING'}
                      </span>
                    </div>
                    <p className="so__card-title">{item.title}</p>
                    <p className="so__card-meta">{item.year} · {item.genre[0]}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
