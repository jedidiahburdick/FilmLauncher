import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import './WatchlistPage.css';

export default function WatchlistPage() {
  const { watchlist, toggleWatchlist } = useWatchlist();
  const navigate = useNavigate();

  return (
    <div className="wl__page">
      <div className="wl__header">
        <h1 className="wl__title">My Watchlist</h1>
        <p className="wl__count">{watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'}</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="wl__empty">
          <div className="wl__empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <p className="wl__empty-msg">Your watchlist is empty.</p>
          <p className="wl__empty-sub">Browse films and tap <strong>+ Watchlist</strong> to save them here.</p>
          <button className="btn btn--gold wl__browse-btn" onClick={() => navigate('/')}>Browse Films</button>
        </div>
      ) : (
        <div className="wl__grid">
          {watchlist.map((item) => (
            <div key={item.id} className="wl__card" onClick={() => navigate(`/film/${item.id}`)}>
              <div className="wl__card-poster">
                {item.poster
                  ? <img src={item.poster} alt={item.title} className="wl__card-img" />
                  : <div className="wl__card-img-placeholder" />}
                <span className={`wl__card-badge wl__card-badge--${item.type}`}>
                  {item.type === 'funding' ? 'Funding' : 'Streaming'}
                </span>
                <button
                  className="wl__card-remove"
                  aria-label="Remove from watchlist"
                  onClick={(e) => { e.stopPropagation(); toggleWatchlist(item); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="wl__card-info">
                <p className="wl__card-title">{item.title}</p>
                <p className="wl__card-meta">{item.year}{item.duration ? ` · ${item.duration}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
