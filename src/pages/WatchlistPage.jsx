import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useNotifications } from '../context/NotificationContext';
import { useLibrary } from '../context/LibraryContext';
import './WatchlistPage.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function expiryLabel(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.ceil(h / 24)}d left`;
  return `${h}h ${m}m left`;
}

function watchedLabel(watchedAt) {
  const diff = Date.now() - watchedAt;
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)  return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/* ── Shared poster card ───────────────────────────────────────────────────── */
function PosterCard({ item, badge, badgeVariant = 'muted', updateLabel, onRemove, onAction, actionLabel }) {
  const navigate = useNavigate();
  return (
    <div className="wl__card" onClick={() => navigate(`/film/${item.id}`)}>
      <div className="wl__card-poster">
        {item.poster
          ? <img src={item.poster} alt={item.title} className="wl__card-img" />
          : <div className="wl__card-img-placeholder" />}
        {badge && (
          <span className={`wl__card-badge wl__card-badge--${badgeVariant}`}>{badge}</span>
        )}
        {updateLabel && <span className="wl__card-update">{updateLabel}</span>}
        {onRemove && (
          <button
            className="wl__card-remove"
            aria-label="Remove"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        {onAction && (
          <button
            className="wl__card-action"
            onClick={(e) => { e.stopPropagation(); onAction(); }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="wl__card-info">
        <p className="wl__card-title">{item.title}</p>
        <p className="wl__card-meta">{item.year}{item.duration ? ` · ${item.duration}` : ''}</p>
      </div>
    </div>
  );
}

/* ── Tab definitions ──────────────────────────────────────────────────────── */
const TABS = [
  { id: 'saved',   label: 'Saved'   },
  { id: 'rentals', label: 'Rentals' },
  { id: 'history', label: 'History' },
];

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function LibraryPage() {
  const { watchlist, toggleWatchlist } = useWatchlist();
  const { getItemNotification } = useNotifications();
  const { rentals, history } = useLibrary();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');

  const activeRentals = rentals.filter((r) => r.expiresAt > Date.now());

  const tabCounts = {
    saved:   watchlist.length,
    rentals: activeRentals.length,
    history: history.length,
  };

  return (
    <div className="wl__page">
      {/* Header */}
      <div className="wl__header">
        <h1 className="wl__title">My Library</h1>
      </div>

      {/* Tabs */}
      <div className="wl__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`wl__tab${activeTab === tab.id ? ' wl__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tabCounts[tab.id] > 0 && (
              <span className="wl__tab-count">{tabCounts[tab.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Saved ── */}
      {activeTab === 'saved' && (
        watchlist.length === 0 ? (
          <EmptyState
            icon="bookmark"
            message="Nothing saved yet."
            sub={<>Browse films and tap <strong>+ Watchlist</strong> to save them here.</>}
            cta="Browse Films"
            onCta={() => navigate('/')}
          />
        ) : (
          <div className="wl__grid">
            {watchlist.map((item) => {
              const notif = getItemNotification(item.id);
              return (
                <PosterCard
                  key={item.id}
                  item={item}
                  badge={item.type === 'funding' ? 'Funding' : 'Streaming'}
                  badgeVariant={item.type}
                  updateLabel={notif ? notif.label : null}
                  onRemove={() => toggleWatchlist(item)}
                />
              );
            })}
          </div>
        )
      )}

      {/* ── Rentals ── */}
      {activeTab === 'rentals' && (
        activeRentals.length === 0 ? (
          <EmptyState
            icon="film"
            message="No active rentals."
            sub="Rent a film to watch it here for 48 hours."
            cta="Browse Films"
            onCta={() => navigate('/')}
          />
        ) : (
          <div className="wl__grid">
            {activeRentals.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                badge={expiryLabel(item.expiresAt)}
                badgeVariant="rental"
                onAction={() => navigate(`/film/${item.id}?play=1`)}
                actionLabel={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                }
              />
            ))}
          </div>
        )
      )}

      {/* ── History ── */}
      {activeTab === 'history' && (
        history.length === 0 ? (
          <EmptyState
            icon="clock"
            message="No watch history yet."
            sub="Films you watch will appear here."
            cta="Browse Films"
            onCta={() => navigate('/')}
          />
        ) : (
          <div className="wl__grid">
            {history.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                badge={watchedLabel(item.watchedAt)}
                badgeVariant="history"
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ── Reusable empty state ─────────────────────────────────────────────────── */
function EmptyState({ icon, message, sub, cta, onCta }) {
  return (
    <div className="wl__empty">
      <div className="wl__empty-icon">
        {icon === 'bookmark' && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {icon === 'film' && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        )}
        {icon === 'clock' && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        )}
      </div>
      <p className="wl__empty-msg">{message}</p>
      <p className="wl__empty-sub">{sub}</p>
      <button className="btn btn--gold wl__browse-btn" onClick={onCta}>{cta}</button>
    </div>
  );
}
