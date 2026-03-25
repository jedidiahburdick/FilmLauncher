import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Hero({ items = [] }) {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx]   = useState(0);
  const [loaded, setLoaded]         = useState({});
  const [imgError, setImgError]     = useState({});
  const timerRef                    = useRef(null);
  const itemsRef                    = useRef(items);

  // Keep ref in sync so the interval closure never goes stale
  useEffect(() => { itemsRef.current = items; }, [items]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (itemsRef.current.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % itemsRef.current.length);
    }, 15000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = useCallback((idx) => {
    setActiveIdx(idx);
    startTimer(); // resets the 7 s timer on manual click
  }, [startTimer]);

  if (!items.length) return null;

  const item       = items[activeIdx];
  const fundingPct = item.type === 'funding'
    ? Math.round((item.fundingRaised / item.fundingGoal) * 100)
    : null;
  const goToDetail = () => navigate(`/film/${item.id}`);

  return (
    <section className="hero">

      {/* ── Crossfade backdrops ── */}
      <div className="hero__backdrop">
        {items.map((it, i) => {
          const src = it.backdrop || it.poster;
          if (!src || imgError[it.id]) return null;
          return (
            <img
              key={it.id}
              src={src}
              alt=""
              className={`hero__bg-img${loaded[it.id] ? ' hero__bg-img--ready' : ''}${i === activeIdx && loaded[it.id] ? ' hero__bg-img--active' : ''}`}
              onLoad={() => setLoaded((prev) => ({ ...prev, [it.id]: true }))}
              onError={() => setImgError((prev) => ({ ...prev, [it.id]: true }))}
            />
          );
        })}
        {/* Fallback if active image errored */}
        {imgError[item.id] && <div className="hero__bg-fallback" />}
        <div className="hero__gradient-bottom" />
        <div className="hero__gradient-left" />
        <div className="hero__gradient-right" />
        <div className="hero__gradient-top" />
      </div>

      {/* ── Content — key re-triggers slide-in animation ── */}
      <div key={item.id} className="hero__content">
        <div className="hero__meta">
          <TypeBadge type={item.type} />
          <span className="hero__year">{item.year}</span>
          <span className="hero__rating">{item.rating}</span>
          <span className="hero__duration">{item.duration}</span>
        </div>

        <h1 className="hero__title">{item.title}</h1>

        {item.tagline && <p className="hero__tagline">{item.tagline}</p>}

        <p className="hero__description">{item.description}</p>

        <div className="hero__genre-list">
          {item.genre.map((g) => (
            <span key={g} className="hero__genre-pill">{g}</span>
          ))}
        </div>

        {/* Funding bar */}
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
              <button className="btn btn--primary" onClick={goToDetail}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play Now
              </button>
              <button className="btn btn--secondary" onClick={goToDetail}>More Info</button>
            </>
          ) : (
            <>
              <button className="btn btn--gold" onClick={goToDetail}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Back This Film
              </button>
              <button className="btn btn--secondary" onClick={goToDetail}>View Campaign</button>
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

      {/* ── Slide indicators ── */}
      {items.length > 1 && (
        <div className="hero__indicators">
          {items.map((_, i) => (
            <button
              key={i}
              className={`hero__indicator${i === activeIdx ? ' hero__indicator--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            >
              {/* key on span restarts the CSS fill animation on each slide change */}
              {i === activeIdx && <span key={activeIdx} className="hero__indicator-fill" />}
            </button>
          ))}
        </div>
      )}

    </section>
  );
}
