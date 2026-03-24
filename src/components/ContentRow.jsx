import React, { useRef, useState } from 'react';
import ContentCard from './ContentCard';
import './ContentRow.css';

export default function ContentRow({ label, items, onSelect }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const SCROLL_AMOUNT = 640;

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: 'smooth' });
    setTimeout(updateArrows, 400);
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="row">
      <div className="row__header">
        <h2 className="row__label">{label}</h2>
        <button className="row__see-all">See all →</button>
      </div>

      <div className="row__track-wrap">
        {canLeft && (
          <button className="row__arrow row__arrow--left" onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div
          className="row__track"
          ref={trackRef}
          onScroll={updateArrows}
        >
          {items.map((item) => (
            <ContentCard key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>

        {canRight && (
          <button className="row__arrow row__arrow--right" onClick={() => scroll(1)} aria-label="Scroll right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
