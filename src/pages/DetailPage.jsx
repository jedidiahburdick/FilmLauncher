import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allContent } from '../data/content';
import './DetailPage.css';

/* ─── Episode thumbnail gradients ─────────────────────────────────────────── */
const EP_GRADIENTS = [
  'linear-gradient(135deg, #1a1020 0%, #0d0f2a 100%)',
  'linear-gradient(135deg, #0f1a14 0%, #0a1520 100%)',
  'linear-gradient(135deg, #1a1510 0%, #201008 100%)',
  'linear-gradient(135deg, #100f1a 0%, #1a0a20 100%)',
  'linear-gradient(135deg, #1a1010 0%, #200a0a 100%)',
  'linear-gradient(135deg, #0f1a1a 0%, #0a1818 100%)',
];

/* ─── Episode row ──────────────────────────────────────────────────────────── */
function EpisodeRow({ ep, index }) {
  return (
    <div className="dp__episode">
      <div className="dp__episode-thumb" style={{ background: EP_GRADIENTS[index % EP_GRADIENTS.length] }}>
        <div className="dp__episode-play-overlay">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <span className="dp__episode-num">E{ep.ep}</span>
      </div>
      <div className="dp__episode-info">
        <div className="dp__episode-header">
          <span className="dp__episode-title">{ep.title}</span>
          <span className="dp__episode-dur">{ep.duration}</span>
        </div>
        <p className="dp__episode-desc">{ep.description}</p>
      </div>
    </div>
  );
}

/* ─── Series episode browser ───────────────────────────────────────────────── */
function SeriesBrowser({ item }) {
  const seasonCount = item.seasons || 1;
  const [activeSeason, setActiveSeason] = useState(1);
  const seasons = Array.from({ length: seasonCount }, (_, i) => i + 1);
  const episodes = item.episodes?.[activeSeason] ?? [];

  return (
    <div className="dp__series-browser">
      <div className="dp__series-header">
        <h3 className="dp__series-title">Episodes</h3>
        <div className="dp__season-pills">
          {seasons.map((s) => (
            <button
              key={s}
              className={`dp__season-pill ${activeSeason === s ? 'dp__season-pill--active' : ''}`}
              onClick={() => setActiveSeason(s)}
            >
              Season {s}
            </button>
          ))}
        </div>
      </div>

      <div className="dp__episode-list">
        {episodes.length > 0 ? (
          episodes.map((ep, i) => <EpisodeRow key={ep.ep} ep={ep} index={i} />)
        ) : (
          <div className="dp__episodes-empty">
            <p>Episode guide coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Funding panel ────────────────────────────────────────────────────────── */
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

/* ─── Reward tier ──────────────────────────────────────────────────────────── */
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

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const item = allContent.find((c) => c.id === Number(id));

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [id]);

  useEffect(() => {
    document.title = item ? `${item.title} | FilmLauncher` : 'Not Found | FilmLauncher';
    return () => { document.title = 'FilmLauncher'; };
  }, [item]);

  if (!item) {
    return (
      <div className="dp__not-found">
        <h1>Film not found</h1>
        <p>We couldn't find what you're looking for.</p>
        <button className="btn btn--secondary" onClick={() => navigate('/')}>← Back to Browse</button>
      </div>
    );
  }

  const isFunding = item.type === 'funding';
  const isSeries  = !!item.seasons;
  const fundingPct = isFunding ? Math.round((item.fundingRaised / item.fundingGoal) * 100) : null;
  const backdropSrc = item.backdrop || item.poster;

  return (
    <div className="dp">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="dp__hero">
        {!backdropError && backdropSrc ? (
          <img
            src={backdropSrc} alt=""
            className={`dp__hero-img ${backdropLoaded ? 'dp__hero-img--loaded' : ''}`}
            onLoad={() => setBackdropLoaded(true)}
            onError={() => setBackdropError(true)}
          />
        ) : <div className="dp__hero-fallback" />}

        <div className="dp__hero-grad-bottom" />
        <div className="dp__hero-grad-top" />
        <div className="dp__hero-grad-left" />
        <div className="dp__hero-grad-right" />

        <button className="dp__back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <div className="dp__hero-bottom">
          <div className="dp__hero-badges">
            <span className={`badge ${isFunding ? 'badge--funding' : 'badge--streaming'}`}>
              {isFunding ? '★ NOW FUNDING' : isSeries ? '▶ SERIES' : '▶ STREAMING'}
            </span>
            {item.awards?.slice(0, 1).map((a) => (
              <span key={a} className="badge badge--award">🏆 {a}</span>
            ))}
          </div>

          <h1 className="dp__hero-title">{item.title}</h1>
          {item.tagline && <p className="dp__hero-tagline">{item.tagline}</p>}

          <div className="dp__hero-actions">
            {isFunding ? (
              <>
                <button className="btn btn--gold">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Back This Film
                </button>
                <button className="dp__icon-btn" aria-label="View Rewards" onClick={() => setTab('rewards')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </>
            ) : isSeries ? (
              <>
                <button className="btn btn--primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play S1 E1
                </button>
                <button className="dp__icon-btn" aria-label="Add to Watchlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play Now
                </button>
                <button className="dp__icon-btn" aria-label="Add to Watchlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </>
            )}
            <button className="dp__icon-btn" aria-label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="dp__body">
        <div className="dp__body-inner">

          {/* ── Main column ────────────────────────────────────────────── */}
          <div className="dp__main">

            {/* Stats */}
            <div className="dp__stats">
              <span>{item.year}</span>
              <span className="dp__stats-sep">·</span>
              <span className="dp__rating-chip">{item.rating}</span>
              <span className="dp__stats-sep">·</span>
              <span>{item.duration}</span>
              {item.director && (<><span className="dp__stats-sep">·</span><span>Dir. <strong>{item.director}</strong></span></>)}
              {item.matchScore && (<><span className="dp__stats-sep">·</span><span className="dp__match">{item.matchScore}% Match</span></>)}
            </div>

            {/* Genre pills */}
            <div className="dp__genres">
              {item.genre.map((g) => <span key={g} className="dp__genre-pill">{g}</span>)}
            </div>

            {/* Funding tabs */}
            {isFunding && (
              <div className="dp__tabs">
                {['overview', 'campaign', 'rewards'].map((t) => (
                  <button key={t} className={`dp__tab ${tab === t ? 'dp__tab--active' : ''}`} onClick={() => setTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Overview / description */}
            {(tab === 'overview' || !isFunding) && (
              <div className="dp__section">
                <p className="dp__description">{item.description}</p>

                {isFunding && (
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

                {item.cast && item.cast[0] !== 'Documentary' && item.cast[0] !== 'Casting in progress' && (
                  <div className="dp__cast">
                    <h4 className="dp__section-label">Cast</h4>
                    <div className="dp__cast-list">
                      {item.cast.map((c) => <span key={c} className="dp__cast-chip">{c}</span>)}
                    </div>
                  </div>
                )}

                {item.awards?.length > 0 && (
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

                {/* Series episode browser */}
                {isSeries && <SeriesBrowser item={item} />}
              </div>
            )}

            {/* Campaign tab */}
            {tab === 'campaign' && isFunding && (
              <div className="dp__section">
                <p className="dp__description">{item.description}</p>
                <FundingPanel item={item} />
              </div>
            )}

            {/* Rewards tab */}
            {tab === 'rewards' && isFunding && item.rewardTiers && (
              <div className="dp__section">
                <h4 className="dp__section-label" style={{ marginBottom: 20 }}>Choose a Reward Tier</h4>
                <div className="dp__tiers">
                  {item.rewardTiers.map((tier, i) => <RewardTier key={tier.amount} tier={tier} index={i} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="dp__sidebar">
            {/* Poster */}
            {item.poster && !posterError && (
              <div className="dp__sidebar-poster">
                <img
                  src={item.poster} alt={item.title}
                  className="dp__poster-img"
                  onError={() => setPosterError(true)}
                />
              </div>
            )}

            {/* Funding panel */}
            {isFunding && <FundingPanel item={item} />}
          </aside>

        </div>
      </div>
    </div>
  );
}
