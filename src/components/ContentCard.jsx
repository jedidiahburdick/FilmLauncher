import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContentCard.css';

const GRADIENT_COLORS = [
  'linear-gradient(160deg, #1a1020 0%, #0d0f1a 100%)',
  'linear-gradient(160deg, #0f1a14 0%, #0a0d12 100%)',
  'linear-gradient(160deg, #1a1510 0%, #12100d 100%)',
  'linear-gradient(160deg, #100f1a 0%, #0d0a12 100%)',
  'linear-gradient(160deg, #1a1010 0%, #120a0a 100%)',
  'linear-gradient(160deg, #0f1a1a 0%, #0a1212 100%)',
];

export default function ContentCard({ item }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const fallbackGradient = GRADIENT_COLORS[item.id % GRADIENT_COLORS.length];

  const fundingPct = item.type === 'funding'
    ? Math.round((item.fundingRaised / item.fundingGoal) * 100)
    : null;

  const handleSelect = () => navigate(`/film/${item.id}`);

  return (
    <article className="card" onClick={handleSelect} tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()} role="button" aria-label={item.title}>

      {/* Poster */}
      <div className="card__poster-wrap">
        {!imgError ? (
          <img
            src={item.poster}
            alt={item.title}
            className={`card__poster ${imgLoaded ? 'card__poster--loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="card__poster-fallback" style={{ background: fallbackGradient }}>
            <span className="card__poster-fallback-title">{item.title}</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="card__overlay">
          <div className="card__overlay-inner">
            <button
              className="card__play"
              aria-label={item.type === 'funding' ? 'Back this film' : 'Play now'}
              onClick={(e) => {
                e.stopPropagation();
                const param = item.type === 'funding' ? 'back=1' : 'play=1';
                navigate(`/film/${item.id}?${param}`);
              }}
            >
              {item.type === 'streaming' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Type badge */}
        <span className={`card__badge ${item.type === 'funding' ? 'card__badge--funding' : 'card__badge--streaming'}`}>
          {item.type === 'funding' ? 'FUNDING' : 'STREAMING'}
        </span>

        {/* Funding urgency for nearly-complete campaigns */}
        {item.type === 'funding' && fundingPct >= 80 && (
          <span className="card__badge card__badge--urgent" style={{ top: 'auto', bottom: 8, left: 8, right: 'auto' }}>
            {fundingPct >= 95 ? '🔥 Almost Funded' : `${fundingPct}% funded`}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="card__info">
        <h3 className="card__title">{item.title}</h3>
        <div className="card__sub">
          <span className="card__year">{item.year}</span>
          {item.genre.slice(0, 2).map((g) => (
            <span key={g} className="card__dot-sep">·</span>
          ))}
          <span className="card__genre">{item.genre.slice(0, 2).join(' · ')}</span>
        </div>

        {/* Funding progress bar */}
        {item.type === 'funding' && (
          <div className="card__funding">
            <div className="card__funding-row">
              <span className="card__funding-pct">{fundingPct}%</span>
              <span className="card__funding-days">{item.fundingDaysLeft}d left</span>
            </div>
            <div className="card__funding-track">
              <div className="card__funding-fill" style={{ width: `${Math.min(fundingPct, 100)}%` }}/>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
