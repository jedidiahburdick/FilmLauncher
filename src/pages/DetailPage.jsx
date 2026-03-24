import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allContent } from '../data/content';
import './DetailPage.css';

/* ─── Sub-components ───────────────────────────────────────────────────────── */

function FundingPanel({ item }) {
  const pct = Math.round((item.fundingRaised / item.fundingGoal) * 100);
  return (
    <div className="dp__funding-panel">
      <div className="dp__funding-panel-header">
        <h3 className="dp__funding-panel-title">Campaign Progress</h3>
        {item.fundingDaysLeft <= 7 && (
          <span className="dp__funding-urgent">
            {item.fundingDaysLeft === 0 ? 'Last day!' : `${item.fundingDaysLeft} days left`}
          </span>
        )}
      </div>

      <div className="dp__funding-stats">
        <div className="dp__funding-stat">
          <span className="dp__funding-stat-val">${item.fundingRaised.toLocaleString()}</span>
          <span className="dp__funding-stat-label">raised</span>
        </div>
        <div className="dp__funding-stat">
          <span className="dp__funding-stat-val">${item.fundingGoal.toLocaleString()}</span>
          <span className="dp__funding-stat-label">goal</span>
        </div>
        <div className="dp__funding-stat">
          <span className="dp__funding-stat-val">{item.fundingBackers?.toLocaleString()}</span>
          <span className="dp__funding-stat-label">backers</span>
        </div>
        <div className="dp__funding-stat">
          <span className="dp__funding-stat-val">{item.fundingDaysLeft}</span>
          <span className="dp__funding-stat-label">days left</span>
        </div>
      </div>

      <div className="dp__funding-bar-wrap">
        <div className="dp__funding-bar-track">
          <div className="dp__funding-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className="dp__funding-bar-pct">{pct}%</span>
      </div>

      <button className="btn btn--gold dp__cta-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Back This Film
      </button>
    </div>
  );
}

function RewardTier({ tier, index }) {
  const icons = ['🎬', '⭐', '🏆', '🎁'];
  return (
    <div className="dp__tier">
      <div className="dp__tier-top">
        <span className="dp__tier-icon">{icons[index] ?? '🎁'}</span>
        <div className="dp__tier-header">
          <span className="dp__tier-amount">${tier.amount}</span>
          <span className="dp__tier-title">{tier.title}</span>
        </div>
      </div>
      <p className="dp__tier-desc">{tier.description}</p>
      <button className="dp__tier-btn">Select Reward</button>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  const item = allContent.find((c) => c.id === Number(id));

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Update document title
  useEffect(() => {
    if (item) {
      document.title = `${item.title} | FilmLauncher`;
    } else {
      document.title = 'Not Found | FilmLauncher';
    }
    return () => { document.title = 'FilmLauncher'; };
  }, [item]);

  // 404 state
  if (!item) {
    return (
      <div className="dp__not-found">
        <h1>Film not found</h1>
        <p>We couldn't find what you're looking for.</p>
        <button className="btn btn--secondary" onClick={() => navigate('/')}>
          ← Back to Browse
        </button>
      </div>
    );
  }

  const fundingPct = item.type === 'funding'
    ? Math.round((item.fundingRaised / item.fundingGoal) * 100)
    : null;

  const backdropSrc = item.backdrop || item.poster;

  return (
    <div className="dp">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="dp__hero">
        {/* Backdrop */}
        {!backdropError && backdropSrc ? (
          <img
            src={backdropSrc}
            alt=""
            className={`dp__hero-img ${backdropLoaded ? 'dp__hero-img--loaded' : ''}`}
            onLoad={() => setBackdropLoaded(true)}
            onError={() => setBackdropError(true)}
          />
        ) : (
          <div className="dp__hero-fallback" />
        )}

        {/* Gradient overlays */}
        <div className="dp__hero-grad-bottom" />
        <div className="dp__hero-grad-top" />
        <div className="dp__hero-grad-left" />
        <div className="dp__hero-grad-right" />

        {/* Back button */}
        <button className="dp__back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        {/* Hero bottom content */}
        <div className="dp__hero-bottom">
          <div className="dp__hero-badges">
            <span className={`badge ${item.type === 'funding' ? 'badge--funding' : 'badge--streaming'}`}>
              {item.type === 'funding' ? '★ NOW FUNDING' : '▶ STREAMING'}
            </span>
            {item.awards?.slice(0, 1).map((a) => (
              <span key={a} className="badge badge--award">🏆 {a}</span>
            ))}
          </div>
          <h1 className="dp__hero-title">{item.title}</h1>
          {item.tagline && (
            <p className="dp__hero-tagline">{item.tagline}</p>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="dp__body">
        <div className="dp__body-inner">

          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="dp__main">

            {/* Quick stats bar */}
            <div className="dp__stats">
              <span className="dp__stats-year">{item.year}</span>
              <span className="dp__stats-sep">·</span>
              <span className="dp__rating-chip">{item.rating}</span>
              <span className="dp__stats-sep">·</span>
              <span>{item.duration}</span>
              {item.director && (
                <>
                  <span className="dp__stats-sep">·</span>
                  <span>Dir. <strong>{item.director}</strong></span>
                </>
              )}
              {item.matchScore && (
                <>
                  <span className="dp__stats-sep">·</span>
                  <span className="dp__match">{item.matchScore}% Match</span>
                </>
              )}
            </div>

            {/* Genre pills */}
            <div className="dp__genres">
              {item.genre.map((g) => (
                <span key={g} className="dp__genre-pill">{g}</span>
              ))}
            </div>

            {/* Tabs — funding items only */}
            {item.type === 'funding' && (
              <div className="dp__tabs">
                {['overview', 'campaign', 'rewards'].map((t) => (
                  <button
                    key={t}
                    className={`dp__tab ${tab === t ? 'dp__tab--active' : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* ── Overview / Description ────────────────────────────────── */}
            {(tab === 'overview' || item.type === 'streaming') && (
              <div className="dp__section">
                <p className="dp__description">{item.description}</p>

                {/* Inline funding summary for overview tab */}
                {item.type === 'funding' && tab === 'overview' && (
                  <div className="dp__funding-summary">
                    <div className="dp__funding-summary-bar">
                      <div className="dp__funding-summary-fill" style={{ width: `${Math.min(fundingPct, 100)}%` }} />
                    </div>
                    <div className="dp__funding-summary-row">
                      <span className="dp__funding-summary-pct">{fundingPct}% funded</span>
                      <span className="dp__funding-summary-days">{item.fundingDaysLeft} days remaining</span>
                    </div>
                  </div>
                )}

                {/* Cast */}
                {item.cast && item.cast[0] !== 'Documentary' && item.cast[0] !== 'Casting in progress' && (
                  <div className="dp__cast">
                    <h4 className="dp__section-label">Cast</h4>
                    <div className="dp__cast-list">
                      {item.cast.map((c) => (
                        <span key={c} className="dp__cast-chip">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards */}
                {item.awards && item.awards.length > 0 && (
                  <div className="dp__awards">
                    <h4 className="dp__section-label">Recognition</h4>
                    <div className="dp__awards-list">
                      {item.awards.map((a) => (
                        <span key={a} className="dp__award-chip">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streaming CTAs */}
                {item.type === 'streaming' && (
                  <div className="dp__ctas">
                    <button className="btn btn--primary dp__cta-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Play Now
                    </button>
                    <button className="btn btn--secondary dp__cta-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add to Watchlist
                    </button>
                    <button className="btn btn--secondary dp__cta-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      Share
                    </button>
                  </div>
                )}

                {/* Funding CTAs (overview tab) */}
                {item.type === 'funding' && tab === 'overview' && (
                  <div className="dp__ctas">
                    <button className="btn btn--gold dp__cta-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Back This Film
                    </button>
                    <button className="btn btn--secondary dp__cta-btn" onClick={() => setTab('rewards')}>
                      View Rewards
                    </button>
                    <button className="btn btn--secondary dp__cta-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      Share
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Campaign tab ──────────────────────────────────────────── */}
            {tab === 'campaign' && item.type === 'funding' && (
              <div className="dp__section">
                <p className="dp__description">{item.description}</p>
                <FundingPanel item={item} />
              </div>
            )}

            {/* ── Rewards tab ───────────────────────────────────────────── */}
            {tab === 'rewards' && item.type === 'funding' && item.rewardTiers && (
              <div className="dp__section">
                <h4 className="dp__section-label" style={{ marginBottom: 20 }}>Choose a Reward Tier</h4>
                <div className="dp__tiers">
                  {item.rewardTiers.map((tier, i) => (
                    <RewardTier key={tier.amount} tier={tier} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="dp__sidebar">
            {/* Poster card */}
            {item.poster && (
              <div className="dp__sidebar-poster">
                <img src={item.poster} alt={item.title} className="dp__poster-img" />
              </div>
            )}

            {/* Funding panel in sidebar for funding type */}
            {item.type === 'funding' && <FundingPanel item={item} />}

            {/* Film details */}
            <div className="dp__details-card">
              <h4 className="dp__section-label">Film Details</h4>
              <div className="dp__details-list">
                <div className="dp__detail-row">
                  <span className="dp__detail-key">Director</span>
                  <span className="dp__detail-val">{item.director}</span>
                </div>
                <div className="dp__detail-row">
                  <span className="dp__detail-key">Year</span>
                  <span className="dp__detail-val">{item.year}</span>
                </div>
                <div className="dp__detail-row">
                  <span className="dp__detail-key">Rating</span>
                  <span className="dp__detail-val">{item.rating}</span>
                </div>
                <div className="dp__detail-row">
                  <span className="dp__detail-key">Duration</span>
                  <span className="dp__detail-val">{item.duration}</span>
                </div>
                <div className="dp__detail-row">
                  <span className="dp__detail-key">Genre</span>
                  <span className="dp__detail-val">{item.genre.join(', ')}</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
