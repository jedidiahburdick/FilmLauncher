import React, { useState, useEffect } from 'react';
import './Hero.css';

const TypeBadge = ({ type }) =>
  type === 'funding' ? (
    <span className="badge badge--funding">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-4H9l3-8 3 8h-2v4z"/>
      </svg>
      NOW FUNDING
    </span>
  ) : (
    <span className="badge badge--streaming">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      STREAMING
    </span>
  );

export default function Hero({ item, onSelect }) {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setLoaded(false); setImgError(false); }, [item?.id]);

  if (!item) return null;

  const fundingPct = item.type === 'funding'
    ? Math.round((item.fundingRaised / item.fundingGoal) * 100)
    : null;

  return (
    <section className="hero">
      {/* Backdrop */}
      <div className="hero__backdrop">
        {!imgError && item.backdrop ? (
          <img
            src={item.backdrop}
            alt=""
            className={`hero__bg-img ${loaded ? 'hero__bg-img--loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="hero__bg-fallback" />
        )}
        {/* Gradient overlays */}
        <div className="hero__gradient-bottom" />
        <div className="hero__gradient-left" />
        <div className="hero__gradient-right" />
        <div className="hero__gradient-top" />
      </div>

      {/* Content */}
      <div className="hero__content">
        <div className="hero__meta">
          <TypeBadge type={item.type} />
          <span className="hero__year">{item.year}</span>
          <span className="hero__rating">{item.rating}</span>
          <span className="hero__duration">{item.duration}</span>
        </div>

        <h1 className="hero__title">{item.title}</h1>

        {item.tagline && (
          <p className="hero__tagline">{item.tagline}</p>
        )}

        <p className="hero__description">{item.description}</p>

        <div className="hero__genre-list">
          {item.genre.map((g) => (
            <span key={g} className="hero__genre-pill">{g}</span>
          ))}
        </div>

        {/* Funding bar in hero */}
        {item.type === 'funding' && (
          <div className="hero__funding">
            <div className="hero__funding-stats">
              <span className="hero__funding-raised">
                ${item.fundingRaised.toLocaleString()}
                <em> raised of ${item.fundingGoal.toLocaleString()}</em>
              </span>
              <span className="hero__funding-pct">{fundingPct}%</span>
            </div>
            <div className="hero__funding-bar">
              <div className="hero__funding-fill" style={{ width: `${Math.min(fundingPct, 100)}%` }} />
            </div>
            <div className="hero__funding-sub">
              <span>{item.fundingBackers?.toLocaleString()} backers</span>
              <span>{item.fundingDaysLeft} days left</span>
            </div>
          </div>
        )}

        <div className="hero__actions">
          {item.type === 'streaming' ? (
            <>
              <button className="btn btn--primary" onClick={() => onSelect(item)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play Now
              </button>
              <button className="btn btn--secondary" onClick={() => onSelect(item)}>
                More Info
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--gold" onClick={() => onSelect(item)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Back This Film
              </button>
              <button className="btn btn--secondary" onClick={() => onSelect(item)}>
                View Campaign
              </button>
            </>
          )}
        </div>

        {item.awards && item.awards.length > 0 && (
          <div className="hero__awards">
            {item.awards.slice(0, 2).map((a) => (
              <span key={a} className="hero__award">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
