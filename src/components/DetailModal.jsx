import React, { useState, useEffect } from 'react';
import './DetailModal.css';

function FundingBar({ raised, goal, daysLeft, backers }) {
  const pct = Math.round((raised / goal) * 100);
  return (
    <div className="modal__funding-block">
      <div className="modal__funding-header">
        <h3 className="modal__funding-heading">Campaign Progress</h3>
        {daysLeft <= 7 && (
          <span className="modal__funding-urgent">
            {daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`}
          </span>
        )}
      </div>

      <div className="modal__funding-stat-row">
        <div className="modal__funding-stat">
          <span className="modal__funding-stat-val">${raised.toLocaleString()}</span>
          <span className="modal__funding-stat-label">raised</span>
        </div>
        <div className="modal__funding-stat">
          <span className="modal__funding-stat-val">${goal.toLocaleString()}</span>
          <span className="modal__funding-stat-label">goal</span>
        </div>
        <div className="modal__funding-stat">
          <span className="modal__funding-stat-val">{backers?.toLocaleString()}</span>
          <span className="modal__funding-stat-label">backers</span>
        </div>
        <div className="modal__funding-stat">
          <span className="modal__funding-stat-val">{daysLeft}</span>
          <span className="modal__funding-stat-label">days left</span>
        </div>
      </div>

      <div className="modal__funding-bar-wrap">
        <div className="modal__funding-bar-track">
          <div className="modal__funding-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className="modal__funding-bar-pct">{pct}%</span>
      </div>
    </div>
  );
}

function RewardTier({ tier, index }) {
  const labels = ['🎬', '⭐', '🏆'];
  return (
    <div className="modal__tier">
      <div className="modal__tier-top">
        <span className="modal__tier-icon">{labels[index] || '🎁'}</span>
        <div>
          <span className="modal__tier-amount">${tier.amount}</span>
          <span className="modal__tier-title">{tier.title}</span>
        </div>
      </div>
      <p className="modal__tier-desc">{tier.description}</p>
      <button className="modal__tier-btn">Select Reward</button>
    </div>
  );
}

export default function DetailModal({ item, onClose }) {
  const [tab, setTab] = useState('overview');
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!item) return null;

  const fundingPct = item.type === 'funding'
    ? Math.round((item.fundingRaised / item.fundingGoal) * 100)
    : null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={item.title}>

        {/* Close */}
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Hero image */}
        <div className="modal__hero">
          {!backdropError && (item.backdrop || item.poster) ? (
            <img
              src={item.backdrop || item.poster}
              alt=""
              className="modal__hero-img"
              onError={() => setBackdropError(true)}
            />
          ) : (
            <div className="modal__hero-fallback" />
          )}
          <div className="modal__hero-gradient" />

          {/* Overlaid badges */}
          <div className="modal__hero-badges">
            <span className={`badge ${item.type === 'funding' ? 'badge--funding' : 'badge--streaming'}`}>
              {item.type === 'funding' ? '★ NOW FUNDING' : '▶ STREAMING'}
            </span>
            {item.awards?.slice(0, 1).map((a) => (
              <span key={a} className="badge badge--award">🏆 {a}</span>
            ))}
          </div>

          {/* Title block over hero */}
          <div className="modal__hero-title-block">
            {!posterError && item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                className="modal__poster-thumb"
                onError={() => setPosterError(true)}
              />
            )}
            <div>
              <h2 className="modal__title">{item.title}</h2>
              {item.tagline && <p className="modal__tagline">{item.tagline}</p>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* Quick stats */}
          <div className="modal__stats">
            <span>{item.year}</span>
            <span className="modal__stat-sep">·</span>
            <span className="modal__rating-chip">{item.rating}</span>
            <span className="modal__stat-sep">·</span>
            <span>{item.duration}</span>
            {item.director && (
              <>
                <span className="modal__stat-sep">·</span>
                <span>Dir. <strong>{item.director}</strong></span>
              </>
            )}
          </div>

          {/* Genre pills */}
          <div className="modal__genres">
            {item.genre.map((g) => (
              <span key={g} className="modal__genre-pill">{g}</span>
            ))}
          </div>

          {/* Tabs — only show for funding */}
          {item.type === 'funding' && (
            <div className="modal__tabs">
              {['overview', 'campaign', 'rewards'].map((t) => (
                <button
                  key={t}
                  className={`modal__tab ${tab === t ? 'modal__tab--active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {(tab === 'overview' || item.type === 'streaming') && (
            <div className="modal__section">
              <p className="modal__description">{item.description}</p>

              {item.cast && item.cast[0] !== 'Documentary' && item.cast[0] !== 'Casting in progress' && (
                <div className="modal__cast">
                  <h4 className="modal__section-title">Cast</h4>
                  <div className="modal__cast-list">
                    {item.cast.map((c) => (
                      <span key={c} className="modal__cast-chip">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.awards && item.awards.length > 0 && (
                <div className="modal__awards">
                  <h4 className="modal__section-title">Recognition</h4>
                  <div className="modal__awards-list">
                    {item.awards.map((a) => (
                      <span key={a} className="modal__award-chip">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'campaign' && item.type === 'funding' && (
            <div className="modal__section">
              <p className="modal__description">{item.description}</p>
              <FundingBar
                raised={item.fundingRaised}
                goal={item.fundingGoal}
                daysLeft={item.fundingDaysLeft}
                backers={item.fundingBackers}
              />
            </div>
          )}

          {tab === 'rewards' && item.type === 'funding' && item.rewardTiers && (
            <div className="modal__section">
              <h4 className="modal__section-title" style={{ marginBottom: 16 }}>Choose a Reward Tier</h4>
              <div className="modal__tiers">
                {item.rewardTiers.map((tier, i) => (
                  <RewardTier key={tier.amount} tier={tier} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="modal__ctas">
            {item.type === 'streaming' ? (
              <>
                <button className="btn btn--primary modal__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play Now
                </button>
                <button className="btn btn--secondary modal__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add to Watchlist
                </button>
                <button className="btn btn--secondary modal__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--gold modal__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Back This Film
                </button>
                <button className="btn btn--secondary modal__cta-btn" onClick={() => setTab('rewards')}>
                  View Rewards
                </button>
                <button className="btn btn--secondary modal__cta-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </>
            )}
          </div>

          {/* Inline funding summary for streaming detail */}
          {item.type === 'funding' && tab === 'overview' && (
            <div className="modal__funding-summary">
              <div className="modal__funding-summary-bar">
                <div className="modal__funding-summary-fill" style={{ width: `${Math.min(fundingPct, 100)}%` }} />
              </div>
              <div className="modal__funding-summary-row">
                <span className="modal__funding-summary-pct">{fundingPct}% funded</span>
                <span className="modal__funding-summary-days">{item.fundingDaysLeft} days remaining</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
