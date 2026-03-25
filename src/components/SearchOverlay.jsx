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

const TRENDING = allContent.filter((c) => c.rows?.includes('trending')).slice(0, 10);

export default function SearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const results = search(query);

  const streamingResults = results.filter((r) => r.type !== 'funding');
  const fundingResults   = results.filter((r) => r.type === 'funding');

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = (item) => { onClose(); navigate(`/film/${item.id}`); };

  const ResultCard = ({ item }) => (
    <button className="so__card" onClick={() => handleSelect(item)}>
      <div className="so__card-poster">
        <img src={item.poster} alt={item.title} loading="lazy" />
        <span className={`so__card-badge${item.type === 'funding' ? ' so__card-badge--funding' : ''}`}>
          {item.type === 'funding' ? 'FUNDING' : 'STREAMING'}
        </span>
      </div>
      <p className="so__card-title">{item.title}</p>
      <p className="so__card-meta">{item.year}{item.genre?.[0] ? ` · ${item.genre[0]}` : ''}</p>
    </button>
  );

  return (
    <div className="so__overlay" onClick={onClose}>
      {/* Top bar — stops click propagation so typing doesn't close */}
      <div className="so__topbar" onClick={(e) => e.stopPropagation()}>
        <div className="so__bar-inner">
          <svg className="so__icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button className="so__cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>

      {/* Body */}
      <div className="so__body" onClick={(e) => e.stopPropagation()}>

        {/* Pre-search: trending grid */}
        {!query && (
          <>
            <p className="so__section-label">Trending</p>
            <div className="so__grid">
              {TRENDING.map((item) => <ResultCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {/* No results */}
        {query && results.length === 0 && (
          <div className="so__empty">
            <p className="so__empty-title">No results for <em>"{query}"</em></p>
            <p className="so__empty-sub">Try a different title, genre, or director.</p>
          </div>
        )}

        {/* Streaming results */}
        {query && streamingResults.length > 0 && (
          <>
            <p className="so__section-label">
              Streaming
              <span className="so__section-count">{streamingResults.length}</span>
            </p>
            <div className={`so__grid${fundingResults.length > 0 ? ' so__grid--mb' : ''}`}>
              {streamingResults.map((item) => <ResultCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {/* Funding results */}
        {query && fundingResults.length > 0 && (
          <>
            <p className="so__section-label">
              Funding Campaigns
              <span className="so__section-count">{fundingResults.length}</span>
            </p>
            <div className="so__grid">
              {fundingResults.map((item) => <ResultCard key={item.id} item={item} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
