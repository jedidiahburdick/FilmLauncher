import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { allContent } from '../data/content';
import { useWatchlist } from '../context/WatchlistContext';
import { useLibrary } from '../context/LibraryContext';
import './DetailPage.css';

/* ─── SVG icon helpers ─────────────────────────────────────────────────────── */
const IconPlay = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconTrailer = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
    <line x1="22" y1="4" x2="22" y2="20"/>
  </svg>
);
const IconPlus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconShare = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IconStar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
/* ─── Video embed URL helper (YouTube + Vimeo) ─────────────────────────────── */
function getEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}?title=0&byline=0&portrait=0&color=c9a84c`;
  return null;
}

/* ─── Photo gallery carousel ───────────────────────────────────────────────── */
function UpdateGallery({ images }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);
  return (
    <div className="dp__gallery">
      <div className="dp__gallery-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`Photo ${i + 1}`} className="dp__gallery-img" />
        ))}
      </div>
      <button className="dp__gallery-btn dp__gallery-btn--prev" onClick={prev} aria-label="Previous">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button className="dp__gallery-btn dp__gallery-btn--next" onClick={next} aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div className="dp__gallery-dots">
        {images.map((_, i) => (
          <button key={i} className={`dp__gallery-dot${i === idx ? ' dp__gallery-dot--active' : ''}`} onClick={() => setIdx(i)} aria-label={`Photo ${i + 1}`} />
        ))}
      </div>
      <span className="dp__gallery-counter">{idx + 1} / {images.length}</span>
    </div>
  );
}

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ─── Trailer Modal ────────────────────────────────────────────────────────── */
function TrailerModal({ url, title, onClose }) {
  // Accept full Vimeo or YouTube URL and extract the embeddable src
  const embedSrc = React.useMemo(() => {
    if (!url) return null;
    // Vimeo: https://vimeo.com/123456789
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&color=c9a84c&title=0&byline=0&portrait=0`;
    // YouTube: various formats
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
    return null;
  }, [url]);

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!embedSrc) return null;

  return (
    <div className="tm__overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tm">
        <button className="tm__close" onClick={onClose} aria-label="Close trailer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="tm__player">
          <iframe
            src={embedSrc}
            title={`${title} — Trailer`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="tm__caption">{title} — Official Trailer</p>
      </div>
    </div>
  );
}

/* ─── Episode thumbnail gradients ─────────────────────────────────────────── */
const EP_GRADIENTS = [
  'linear-gradient(135deg, #1a1020 0%, #0d0f2a 100%)',
  'linear-gradient(135deg, #0f1a14 0%, #0a1520 100%)',
  'linear-gradient(135deg, #1a1510 0%, #201008 100%)',
  'linear-gradient(135deg, #100f1a 0%, #1a0a20 100%)',
  'linear-gradient(135deg, #1a1010 0%, #200a0a 100%)',
  'linear-gradient(135deg, #0f1a1a 0%, #0a1818 100%)',
];
/* ─── Play Modal ──────────────────────────────────────────────────────────── */
function PlayModal({ item, onClose }) {
  const { addRental, addToHistory } = useLibrary();
  const price    = item.rentalPrice ?? 3.99;
  const isFree   = price === 0;
  const steps    = isFree ? ['Login', 'Watch'] : ['Login', 'Rent', 'Watch'];
  const [step, setStep]   = useState(1);
  const [email, setEmail]         = useState('');
  const [form, setForm]           = useState({ card: '', expiry: '', cvv: '' });
  const [showNewCard, setShowNewCard] = useState(false);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const formatCard   = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1  ').trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0,2) + ' / ' + d.slice(2) : d; };

  const canLogin   = email.includes('@');
  const canRent    = !showNewCard || (form.card.length >= 19 && form.expiry.length >= 5 && form.cvv.length >= 3);

  const handleLoginContinue = () => {
    if (isFree) { addToHistory(item); setStep(3); }
    else setStep(2);
  };

  return (
    <div className="rm__overlay" onClick={onClose}>
      <div className="rm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* Stepper */}
        <div className="rm__header">
          <div className="rm__steps">
            {steps.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={n}>
                  {i > 0 && <div className={`rm__step-line${done ? ' rm__step-line--done' : ''}`} />}
                  <div className={`rm__step${active ? ' rm__step--active' : ''}${done ? ' rm__step--done' : ''}`}>
                    <span className="rm__step-num">{done ? <IconCheck /> : n}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <button className="rm__close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Step 1: Login */}
        {step === 1 && (
          <div className="rm__body">
            <div className="rm__recap">
              {item.poster && <img src={item.poster} alt="" className="rm__recap-img" />}
              <div className="rm__recap-body">
                <div className="rm__recap-name">{item.title}</div>
                <div className="rm__recap-amt">{isFree ? 'Free to watch' : `Rent for $${price.toFixed(2)}`}</div>
              </div>
            </div>
            <h2 className="rm__title">Great, let's get you logged in!</h2>
            <div className="rm__form">
              <div className="rm__field">
                <label className="rm__label">Email Address</label>
                <input className="rm__input" type="email" placeholder="Enter your email"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              <button className="btn btn--gold rm__login-continue" disabled={!canLogin} onClick={handleLoginContinue}>Continue</button>
            </div>
            <div className="rm__auth-divider"><span>or</span></div>
            <div className="rm__auth-socials">
              <button className="rm__auth-social" onClick={handleLoginContinue}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="rm__auth-social" onClick={handleLoginContinue}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Rent (paid only) */}
        {step === 2 && !isFree && (
          <div className="rm__body">
            <h2 className="rm__title">Rent {item.title}</h2>
            <div className="rm__recap">
              {item.poster && <img src={item.poster} alt="" className="rm__recap-img" />}
              <div className="rm__recap-body">
                <div className="rm__recap-name">{item.title}</div>
                <div className="rm__recap-amt">${price.toFixed(2)} · 48-hr rental</div>
              </div>
            </div>

            {/* Saved card */}
            <div className="pm__saved-card">
              <div className="pm__saved-card-left">
                <div className="pm__card-icon">
                  <svg width="22" height="16" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#1a1f71"/><rect y="5" width="38" height="6" fill="#f7b731"/><rect x="4" y="15" width="10" height="3" rx="1" fill="rgba(255,255,255,0.5)"/></svg>
                </div>
                <div>
                  <div className="pm__card-label">Visa ending in 4242</div>
                  <div className="pm__card-exp">Expires 12/26</div>
                </div>
              </div>
              <div className="pm__card-check"><IconCheck size={14} /></div>
            </div>

            <button className="pm__change-card-btn" onClick={() => setShowNewCard((v) => !v)}>
              {showNewCard ? '↑ Cancel' : '+ Use a different card'}
            </button>

            {showNewCard && (
              <div className="rm__form" style={{ marginTop: 12 }}>
                <div className="rm__field">
                  <label className="rm__label">Card Number</label>
                  <input className="rm__input rm__input--card" placeholder="1234  5678  9012  3456"
                    value={form.card} onChange={(e) => setForm((f) => ({ ...f, card: formatCard(e.target.value) }))} autoFocus />
                </div>
                <div className="rm__row">
                  <div className="rm__field">
                    <label className="rm__label">Expiry</label>
                    <input className="rm__input" placeholder="MM / YY"
                      value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))} />
                  </div>
                  <div className="rm__field">
                    <label className="rm__label">CVV</label>
                    <input className="rm__input" placeholder="123" maxLength={4} value={form.cvv} onChange={upd('cvv')} />
                  </div>
                </div>
              </div>
            )}

            <div className="rm__secure-note"><IconLock /><span>Payments are encrypted and secure</span></div>
            <div className="rm__footer">
              <button className="btn btn--secondary rm__btn-back" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn--gold" disabled={!canRent} onClick={() => { addRental(item); addToHistory(item); setStep(3); }}>Pay ${price.toFixed(2)}</button>
            </div>
          </div>
        )}

        {/* Step 3: Now Playing */}
        {step === 3 && (
          <div className="rm__body rm__body--confirm">
            <div className="rm__confirm-check">
              <IconPlay size={28} />
            </div>
            <h2 className="rm__title">{isFree ? 'Enjoy the film!' : 'You\'re all set!'}</h2>
            <p className="rm__subtitle">
              {isFree
                ? `${item.title} is now playing.`
                : `Your rental of ${item.title} is active for 48 hours.`}
            </p>
            <div className="pm__player">
              <div className="pm__player-inner">
                <IconPlay size={40} />
                <span>Now Playing</span>
              </div>
            </div>
            <div className="rm__footer rm__footer--center">
              <button className="btn btn--secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Reward Modal ─────────────────────────────────────────────────────────── */
function RewardModal({ item, onClose }) {
  const [step, setStep]                 = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [tipAmount, setTipAmount]       = useState(5);
  const [form, setForm]               = useState({ name: '', email: '', card: '', expiry: '', cvv: '' });

  const tiers        = item.rewardTiers || [];
  const steps        = ['Reward', 'Details', 'Payment', 'Consideration', 'Confirm'];
  const MAX_TIP      = 250;
  const effectiveAmt = selectedTier?.amount === 'custom' ? Number(customAmount) : selectedTier?.amount;
  const totalAmt     = (effectiveAmt || 0) + tipAmount;
  const fmtAmt       = (n) => (n != null ? Number(n).toLocaleString() : '');

  const handleOverlay  = (e) => { if (e.target === e.currentTarget) onClose(); };
  const upd            = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const formatCard     = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry   = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const canContinue1 = selectedTier && (selectedTier.amount !== 'custom' || (customAmount && Number(customAmount) > 0));
  const canContinue2 = form.email.includes('@');
  const canContinue3 = form.card.length >= 19 && form.expiry.length >= 5 && form.cvv.length >= 3;

  return (
    <div className="rm__overlay" onClick={handleOverlay}>
      <div className="rm" role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className="rm__header">
          <div className="rm__steps">
            {steps.map((label, i) => {
              const n = i + 1, active = step === n, done = step > n;
              return (
                <React.Fragment key={n}>
                  {i > 0 && <div className={`rm__step-line${done ? ' rm__step-line--done' : ''}`} />}
                  <div className={`rm__step${active ? ' rm__step--active' : ''}${done ? ' rm__step--done' : ''}`}>
                    <span className="rm__step-num">{done ? <IconCheck /> : n}</span>
                    <span className="rm__step-label">{label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <button className="rm__close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Step 1: Choose Reward ── */}
        {step === 1 && (
          <div className="rm__body">
            <h2 className="rm__title">Choose Your Reward</h2>
            <p className="rm__subtitle">Support <em>{item.title}</em> and receive exclusive perks.</p>
            <div className="rm__tiers">
              {tiers.map((tier) => {
                const spotsLeft = tier.available != null ? tier.available - (tier.backerCount || 0) : null;
                const isSel = selectedTier?.amount === tier.amount;
                return (
                  <button key={tier.amount} className={`rm__tier${isSel ? ' rm__tier--selected' : ''}`} onClick={() => { setSelectedTier(tier); setStep(2); }}>
                    {tier.image && <img src={tier.image} alt={tier.title} className="rm__tier-img" />}
                    <div className="rm__tier-body">
                      <div className="rm__tier-header">
                        <span className="rm__tier-amount">${fmtAmt(tier.amount)}</span>
                        <span className="rm__tier-name">{tier.title}</span>
                      </div>
                      <p className="rm__tier-desc">{tier.description}</p>
                      <div className="rm__tier-stats">
                        <span className="rm__stat-backers">{(tier.backerCount || 0).toLocaleString()} backers</span>
                        <span className="rm__stat-sep">·</span>
                        <span className="rm__stat-spots">{spotsLeft != null ? `${spotsLeft} left` : 'Unlimited'}</span>
                      </div>
                    </div>
                    {isSel && <span className="rm__tier-check"><IconCheck /></span>}
                  </button>
                );
              })}

              {/* Custom amount */}
              <button
                className={`rm__tier rm__tier--custom${selectedTier?.amount === 'custom' ? ' rm__tier--selected' : ''}`}
                onClick={() => setSelectedTier({ amount: 'custom', title: 'Custom Amount', description: '' })}
              >
                <div className="rm__custom-thumb">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div className="rm__tier-body">
                  <div className="rm__tier-header">
                    <span className="rm__tier-name" style={{ fontSize: '14px', fontWeight: 600 }}>Choose Your Amount</span>
                  </div>
                  <p className="rm__tier-desc">Support the film with any amount you choose.</p>
                  {selectedTier?.amount === 'custom' && (
                    <div className="rm__custom-row" onClick={(e) => e.stopPropagation()}>
                      <span className="rm__custom-prefix">$</span>
                      <input type="number" min="1" placeholder="Enter amount" className="rm__custom-input"
                        value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} autoFocus />
                    </div>
                  )}
                </div>
              </button>
            </div>
            <div className="rm__footer">
              <button className="btn btn--gold" disabled={!canContinue1} onClick={() => setStep(2)}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Login ── */}
        {step === 2 && (
          <div className="rm__body">
            <div className="rm__recap">
              {selectedTier?.image && <img src={selectedTier.image} alt="" className="rm__recap-img" />}
              <div className="rm__recap-body">
                <div className="rm__recap-name">{selectedTier?.title}</div>
                <div className="rm__recap-amt">${fmtAmt(effectiveAmt)}</div>
              </div>
            </div>
            <h2 className="rm__title">Great, let's get you logged in!</h2>
            <div className="rm__form">
              <div className="rm__field">
                <label className="rm__label">Email Address</label>
                <input className="rm__input" type="email" placeholder="Enter your email" value={form.email} onChange={upd('email')} autoFocus />
              </div>
              <button className="btn btn--gold rm__login-continue" disabled={!canContinue2} onClick={() => setStep(3)}>Continue</button>
            </div>
            <div className="rm__auth-divider"><span>or</span></div>
            <div className="rm__auth-socials">
              <button className="rm__auth-social">
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="rm__auth-social">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
            </div>
            <div className="rm__footer">
              <button className="btn btn--secondary rm__btn-back" onClick={() => setStep(1)}>← Back</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Payment ── */}
        {step === 3 && (
          <div className="rm__body">
            <h2 className="rm__title">Payment</h2>
            <p className="rm__subtitle">Demo only — no real charges will be made.</p>
            <div className="rm__recap">
              {selectedTier?.image && <img src={selectedTier.image} alt="" className="rm__recap-img" />}
              <div className="rm__recap-body">
                <div className="rm__recap-name">{selectedTier?.title}</div>
                <div className="rm__recap-amt">${fmtAmt(effectiveAmt)}</div>
              </div>
            </div>
            <div className="rm__form">
              <div className="rm__field">
                <label className="rm__label">Cardholder Name</label>
                <input className="rm__input" placeholder="Jane Smith" value={form.name} onChange={upd('name')} />
              </div>
              <div className="rm__field">
                <label className="rm__label">Card Number</label>
                <input className="rm__input rm__input--card" placeholder="1234  5678  9012  3456"
                  value={form.card} onChange={(e) => setForm((f) => ({ ...f, card: formatCard(e.target.value) }))} />
              </div>
              <div className="rm__row">
                <div className="rm__field">
                  <label className="rm__label">Expiry</label>
                  <input className="rm__input" placeholder="MM / YY"
                    value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))} />
                </div>
                <div className="rm__field">
                  <label className="rm__label">CVV</label>
                  <input className="rm__input" placeholder="123" maxLength={4} value={form.cvv} onChange={upd('cvv')} />
                </div>
              </div>
            </div>
            <div className="rm__secure-note"><IconLock /><span>Payments are encrypted and secure</span></div>
            <div className="rm__footer">
              <button className="btn btn--secondary rm__btn-back" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn--gold" disabled={!canContinue3} onClick={() => setStep(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Tip ── */}
        {step === 4 && (
          <div className="rm__body">
            <div className="rm__tip-intro">
              <div className="rm__tip-heart">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <p className="rm__tip-msg">
                All of your financial support goes directly to the filmmaker.<br/>
                Consider adding a tip to help keep FilmLauncher running.
              </p>
            </div>

            <div className="rm__tip-display">
              <span className="rm__tip-currency">$</span>
              <span className="rm__tip-value">{tipAmount}</span>
            </div>

            <input
              type="range" min="0" max={MAX_TIP} step="1"
              value={tipAmount}
              className="rm__tip-slider"
              style={{ '--pct': `${(tipAmount / MAX_TIP) * 100}%` }}
              onChange={(e) => setTipAmount(Number(e.target.value))}
            />

            <div className="rm__tip-presets">
              {[0, 3, 5, 10, 25, 50].map((v) => (
                <button key={v}
                  className={`rm__tip-preset${tipAmount === v ? ' rm__tip-preset--active' : ''}`}
                  onClick={() => setTipAmount(v)}>
                  {v === 0 ? 'No tip' : `$${v}`}
                </button>
              ))}
            </div>

            <div className="rm__field" style={{ marginBottom: 24 }}>
              <label className="rm__label">Or enter your own amount</label>
              <div className="rm__custom-row">
                <span className="rm__custom-prefix">$</span>
                <input
                  type="number" min="0" max="1000" placeholder="0"
                  className="rm__custom-input"
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(Math.min(1000, Math.max(0, Number(e.target.value) || 0)))}
                />
              </div>
            </div>

            <div className="rm__total">
              <div className="rm__total-row">
                <span>{selectedTier?.title}</span>
                <span>${fmtAmt(effectiveAmt)}</span>
              </div>
              <div className="rm__total-row">
                <span>Tip to FilmLauncher</span>
                <span>${fmtAmt(tipAmount)}</span>
              </div>
              <div className="rm__total-row rm__total-row--grand">
                <span>Total</span>
                <span>${fmtAmt(totalAmt)}</span>
              </div>
            </div>

            <div className="rm__footer">
              <button className="btn btn--secondary rm__btn-back" onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn--gold" onClick={() => setStep(5)}>
                Pay ${fmtAmt(totalAmt)}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Confirmation ── */}
        {step === 5 && (
          <div className="rm__body rm__body--confirm">
            <div className="rm__confirm-check">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="rm__title">You're a Backer!</h2>
            <p className="rm__subtitle">
              Thank you for supporting <em>{item.title}</em>. A confirmation has been sent to <strong>{form.email}</strong>.
            </p>
            <div className="rm__confirm-reward">
              {selectedTier?.image && <img src={selectedTier.image} alt="" className="rm__confirm-img" />}
              <div>
                <div className="rm__confirm-label">Your reward</div>
                <div className="rm__confirm-name">{selectedTier?.title}</div>
                <div className="rm__confirm-amt">${fmtAmt(effectiveAmt)}</div>
              </div>
            </div>
            <div className="rm__footer rm__footer--center">
              <button className="btn btn--secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Episode row ──────────────────────────────────────────────────────────── */
function EpisodeRow({ ep, index }) {
  return (
    <div className="dp__episode">
      <div className="dp__episode-thumb" style={{ background: EP_GRADIENTS[index % EP_GRADIENTS.length] }}>
        <div className="dp__episode-play-overlay"><IconPlay size={22} /></div>
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

/* ─── Mock data for funding tabs ───────────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: 'rgba(201,168,76,0.18)',  fg: '#c9a84c' },
  { bg: 'rgba(99,102,241,0.18)',  fg: '#818cf8' },
  { bg: 'rgba(236,72,153,0.18)',  fg: '#f472b6' },
  { bg: 'rgba(34,197,94,0.18)',   fg: '#4ade80' },
  { bg: 'rgba(249,115,22,0.18)',  fg: '#fb923c' },
];

function getTeam(item) {
  const dir = item.director || 'Alex Reid';
  return [
    { name: dir, role: 'Director',
      initials: dir.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      bio: 'Award-winning filmmaker with a decade of narrative and documentary experience. Work has screened at Sundance, TIFF, and the Berlin International Film Festival.',
      chips: ['Sundance Alum', 'TIFF Selection', 'Best Director — Nashville FF'] },
    { name: 'Jordan Ellis', role: 'Producer', initials: 'JE',
      bio: 'Produced 14 independent features, two of which earned Oscar eligibility. Fifteen-plus years navigating international co-productions and film finance.',
      chips: ['Oscar Eligible', '14 Features', 'Cannes Selection'] },
    { name: 'Sam Torres', role: 'Director of Photography', initials: 'ST',
      bio: 'Known for naturalistic available-light cinematography. Has shot documentaries across 42 countries and lensed three narrative features.',
      chips: ['42 Countries', 'ASC Member', 'SXSW Cinematography Award'] },
    { name: 'Maya Chen', role: 'Editor', initials: 'MC',
      bio: 'ACE Award nominee whose work spans narrative features, episodic television, and documentary. Known for rhythmic, story-first editing that honors performance.',
      chips: ['ACE Nominee', 'HBO · A24 · Netflix'] },
    { name: 'Lena Park', role: 'Composer', initials: 'LP',
      bio: 'Film composer blending orchestral and electronic textures. Recent work includes a Sundance Grand Jury Prize winner and three festival champions.',
      chips: ['Sundance Grand Jury Score', 'ASCAP Film Award'] },
  ];
}

const MOCK_FAQS = [
  { q: 'When will the film be completed?',
    a: 'Production begins Q3 2025, with principal photography wrapping by year end. Post-production targets early 2026. Backers receive progress updates throughout.' },
  { q: 'What do the funds cover?',
    a: 'Every dollar goes directly to production: camera and equipment rental, crew wages, location permits, catering, travel, and post-production including sound design, color grading, and score recording.' },
  { q: 'When will I receive my rewards?',
    a: 'Digital rewards (downloads, early-access screeners) are fulfilled within 60 days of the film\'s final delivery. Physical rewards ship within 90 days. Producer credits appear in the finished film.' },
  { q: 'What if the campaign doesn\'t reach its goal?',
    a: 'This is an all-or-nothing campaign. If the goal is not met by the deadline, every backer is fully refunded. No charges are processed unless the goal is reached.' },
  { q: 'Can I upgrade or change my backing tier?',
    a: 'Yes — reach out directly via the campaign contact email and the team can adjust your pledge level before the campaign closes.' },
  { q: 'Will the film be available internationally?',
    a: 'Absolutely. The team is pursuing worldwide distribution. All backers receive access regardless of territory. A global streaming release is planned to follow the festival premiere window.' },
];

const MOCK_COMMENTS = [
  { id: 1, author: 'Marcus Webb', initials: 'MW', timeAgo: '2 days ago',
    text: 'This project is exactly what independent cinema needs right now. The script excerpt in the last update was extraordinary — backed at the $75 tier and genuinely can\'t wait.',
    likes: 18,
    replies: [{ id: 11, author: 'Creative Team', initials: 'CT', isOfficial: true, timeAgo: '1 day ago',
      text: 'Thank you Marcus — this genuinely means a lot. We can\'t wait to share more of the story with you.', likes: 6 }] },
  { id: 2, author: 'Priya Nair', initials: 'PN', timeAgo: '4 days ago',
    text: 'I\'ve followed this director since their short film days. The jump to this scale feels completely earned. Told everyone — three of them have already backed.',
    likes: 12, replies: [] },
  { id: 3, author: 'David Fontaine', initials: 'DF', timeAgo: '1 week ago',
    text: 'A question for the team: will there be a theatrical run before streaming? And any timeline on the behind-the-scenes documentary mentioned in the reward tiers?',
    likes: 7,
    replies: [{ id: 31, author: 'Creative Team', initials: 'CT', isOfficial: true, timeAgo: '6 days ago',
      text: 'Great questions David. We\'re targeting a festival premiere followed by limited theatrical, then streaming roughly six months later. The BTS doc (25–30 min) ships to eligible backers within 3 months of final delivery.', likes: 11 }] },
  { id: 4, author: 'Sofia Reyes', initials: 'SR', timeAgo: '1 week ago',
    text: 'The production stills alone sold me. There\'s a visual confidence here that\'s rare at this budget level. Backed.', likes: 22, replies: [] },
];

const MOCK_BACKERS = [
  { name: 'Marcus Webb',    amount: 75,  daysAgo: 0, anonymous: false },
  { name: 'Priya Nair',     amount: 150, daysAgo: 1, anonymous: false },
  { name: 'Anonymous',      amount: 25,  daysAgo: 1, anonymous: true  },
  { name: 'David Fontaine', amount: 500, daysAgo: 2, anonymous: false },
  { name: 'Sofia Reyes',    amount: 75,  daysAgo: 2, anonymous: false },
  { name: 'James Wu',       amount: 250, daysAgo: 3, anonymous: false },
  { name: 'Anonymous',      amount: 50,  daysAgo: 3, anonymous: true  },
  { name: 'Elena Moss',     amount: 100, daysAgo: 4, anonymous: false },
  { name: 'Tyler Grant',    amount: 150, daysAgo: 5, anonymous: false },
  { name: 'Rosa Kim',       amount: 75,  daysAgo: 6, anonymous: false },
];

/* ─── Backer stream ticker ──────────────────────────────────────────────────── */
function BackerStream({ item, onOpenModal }) {
  const backers = item.backers?.length > 0 ? item.backers : MOCK_BACKERS;
  const [idx, setIdx]     = useState(0);
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const hold = setTimeout(() => setPhase('out'), 2800);
    return () => clearTimeout(hold);
  }, [idx]);

  useEffect(() => {
    if (phase !== 'out') return;
    const t = setTimeout(() => { setIdx((i) => (i + 1) % backers.length); setPhase('in'); }, 420);
    return () => clearTimeout(t);
  }, [phase, backers.length]);

  const b = backers[idx];
  const timeStr = b.daysAgo === 0 ? 'just now' : b.daysAgo === 1 ? '1 day ago' : `${b.daysAgo}d ago`;

  return (
    <div className="dp__backer-stream" onClick={onOpenModal} role="button" tabIndex={0}>
      <div className={`dp__backer-ticker dp__backer-ticker--${phase}`}>
        <div className="dp__backer-ticker-avatar">{b.anonymous ? '?' : b.name.charAt(0)}</div>
        <span className="dp__backer-ticker-text">
          <strong>{b.anonymous ? 'Anonymous' : b.name}</strong>{' backed '}
          <strong>${b.amount.toLocaleString()}</strong>
          <span className="dp__backer-ticker-time"> · {timeStr}</span>
        </span>
        <span className="dp__backer-ticker-cta">
          See all {item.fundingBackers?.toLocaleString() ?? backers.length} →
        </span>
      </div>
    </div>
  );
}

/* ─── Backers modal ─────────────────────────────────────────────────────────── */
function BackersModal({ item, onClose }) {
  const backers = item.backers?.length > 0 ? item.backers : MOCK_BACKERS;
  return (
    <div className="rm__overlay" onClick={onClose}>
      <div className="rm rm--wide" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="rm__header">
          <div className="dp__bm-header-inner">
            <h2 className="rm__title" style={{ margin: 0 }}>Backers</h2>
            <span className="dp__bm-count">{item.fundingBackers?.toLocaleString() ?? backers.length} total</span>
          </div>
          <button className="rm__close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="rm__body rm__body--scroll">
          {backers.map((b, i) => {
            const ts = b.daysAgo === 0 ? 'today' : b.daysAgo === 1 ? '1 day ago' : `${b.daysAgo}d ago`;
            return (
              <div key={i} className="dp__backer">
                <div className="dp__backer-avatar">{b.anonymous ? '?' : b.name.charAt(0)}</div>
                <div className="dp__backer-info">
                  <span className="dp__backer-name">{b.anonymous ? 'Anonymous Backer' : b.name}</span>
                  <span className="dp__backer-tier">{b.tier || 'Backer'}</span>
                </div>
                <div className="dp__backer-right">
                  <span className="dp__backer-amount">${b.amount.toLocaleString()}</span>
                  <span className="dp__backer-time">{ts}</span>
                </div>
              </div>
            );
          })}
          {item.fundingBackers > backers.length && (
            <p className="dp__backers-more">+ {(item.fundingBackers - backers.length).toLocaleString()} more backers</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Team tab ──────────────────────────────────────────────────────────────── */
function TeamTab({ item }) {
  const team = getTeam(item);
  return (
    <div className="dp__section dp__team">
      {team.map((m, i) => {
        const col = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <div key={i} className="dp__team-card">
            <div className="dp__team-avatar" style={{ background: col.bg, color: col.fg }}>{m.initials}</div>
            <div className="dp__team-body">
              <p className="dp__team-name">{m.name}</p>
              <p className="dp__team-role">{m.role}</p>
              <p className="dp__team-bio">{m.bio}</p>
              <div className="dp__team-chips">
                {m.chips.map((c) => <span key={c} className="dp__team-chip">{c}</span>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── FAQ tab ───────────────────────────────────────────────────────────────── */
function FAQTab() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="dp__section dp__faq">
      {MOCK_FAQS.map((faq, i) => (
        <div key={i} className={`dp__faq-item${openIdx === i ? ' dp__faq-item--open' : ''}`}>
          <button className="dp__faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span>{faq.q}</span>
            <svg className="dp__faq-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {openIdx === i && <div className="dp__faq-a"><p>{faq.a}</p></div>}
        </div>
      ))}
    </div>
  );
}

/* ─── Community tab ─────────────────────────────────────────────────────────── */
function CommentBlock({ c, liked, onLike }) {
  return (
    <div className={`dp__comment${c.isReply ? ' dp__comment--reply' : ''}`}>
      <div className={`dp__comment-avatar${c.isOfficial ? ' dp__comment-avatar--official' : ''}${c.isReply ? ' dp__comment-avatar--sm' : ''}`}>
        {c.initials}
      </div>
      <div className="dp__comment-body">
        <div className="dp__comment-meta">
          <span className="dp__comment-author">{c.author}</span>
          {c.isOfficial && <span className="dp__comment-official-badge">Official</span>}
          <span className="dp__comment-time">{c.timeAgo}</span>
        </div>
        <p className="dp__comment-text">{c.text}</p>
        <div className="dp__comment-actions">
          <button className={`dp__comment-like${liked ? ' dp__comment-like--active' : ''}`} onClick={() => onLike(c.id)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {c.likes + (liked ? 1 : 0)}
          </button>
          {!c.isReply && <button className="dp__comment-reply-btn">Reply</button>}
        </div>
      </div>
    </div>
  );
}

function CommunityTab({ item }) {
  const comments = item.comments?.length > 0 ? item.comments : MOCK_COMMENTS;
  const [liked, setLiked] = useState({});
  const toggle = (id) => setLiked((l) => ({ ...l, [id]: !l[id] }));
  return (
    <div className="dp__section dp__community">
      <div className="dp__community-compose">
        <div className="dp__community-compose-avatar">U</div>
        <input className="dp__community-input" placeholder="Share a thought or ask a question…" />
      </div>
      <div className="dp__community-list">
        {comments.map((c) => (
          <div key={c.id} className="dp__comment-thread">
            <CommentBlock c={c} liked={!!liked[c.id]} onLike={toggle} />
            {c.replies?.map((r) => (
              <CommentBlock key={r.id} c={{ ...r, isReply: true }} liked={!!liked[r.id]} onLike={toggle} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function DetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [backdropLoaded, setBackdropLoaded]   = useState(false);
  const [backdropError, setBackdropError]     = useState(false);
  const [posterError, setPosterError]         = useState(false);
  const [activeSeason, setActiveSeason]       = useState(1);
  const [seasonPickerOpen, setSeasonPickerOpen] = useState(false);
  const [tab, setTab]                           = useState('overview');
  const [rewardModalOpen, setRewardModalOpen]   = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [playModalOpen, setPlayModalOpen]       = useState(false);
  const [backersModalOpen, setBackersModalOpen] = useState(false);

  const item = allContent.find((c) => c.id === Number(id));

  /* Reset on film change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveSeason(1);
    setSeasonPickerOpen(false);
    setTab('overview');
    setBackdropLoaded(false);
    setBackdropError(false);
    setPosterError(false);
    setRewardModalOpen(false);
    setPlayModalOpen(false);
    if (searchParams.get('play') === '1') setPlayModalOpen(true);
    if (searchParams.get('back') === '1') setRewardModalOpen(true);
  }, [id]);

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

  const isFunding  = item.type === 'funding';
  const isSeries   = !!item.seasons;
  const fundingPct = isFunding ? Math.round((item.fundingRaised / item.fundingGoal) * 100) : null;
  const backdropSrc     = item.backdrop || item.poster;
  const seasonNums      = isSeries ? Array.from({ length: item.seasons }, (_, i) => i + 1) : [];
  const currentEpisodes = isSeries ? (item.episodes?.[activeSeason] ?? []) : [];

  const handleSeasonSelect = (s) => { setActiveSeason(s); setSeasonPickerOpen(false); };

  return (
    <div className="dp">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="dp__hero">

        {/* Backdrop — ref callback handles cached/instant local images */}
        {!backdropError && backdropSrc ? (
          <img
            src={backdropSrc} alt=""
            className={`dp__hero-img ${backdropLoaded ? 'dp__hero-img--loaded' : ''}`}
            onLoad={() => setBackdropLoaded(true)}
            onError={() => setBackdropError(true)}
            ref={(el) => { if (el?.complete && el?.naturalWidth > 0) setBackdropLoaded(true); }}
          />
        ) : item.poster ? (
          <img src={item.poster} alt="" className="dp__hero-img dp__hero-img--loaded" />
        ) : (
          <div className="dp__hero-fallback" />
        )}

        <div className="dp__hero-grad-bottom" />
        <div className="dp__hero-grad-top" />
        <div className="dp__hero-grad-left" />
        <div className="dp__hero-grad-right" />

        {/* ── Hero content block ────────────────────────────────────────── */}
        <div className="dp__hero-bottom">

          {/* Back arrow */}
          <button className="dp__back" onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {/* Badges */}
          <div className="dp__hero-badges">
            <span className={`badge ${isFunding ? 'badge--funding' : 'badge--streaming'}`}>
              {isFunding ? '★ NOW FUNDING' : isSeries ? '▶ SERIES' : '▶ STREAMING'}
            </span>
            {item.awards?.slice(0, 1).map((a) => (
              <span key={a} className="badge badge--award">🏆 {a}</span>
            ))}
          </div>

          {/* Title */}
          <h1 className="dp__hero-title">{item.title}</h1>
          {item.tagline && <p className="dp__hero-tagline">{item.tagline}</p>}

          {/* ── Funding progress — right below title ─────────────────── */}
          {isFunding && (
            <div className="dp__hero-funding">
              <div className="dp__hero-funding-stats">
                <span className="dp__hero-funding-raised">
                  ${item.fundingRaised.toLocaleString()}
                  <em> raised</em>
                </span>
                <span className="dp__hero-funding-pct">{fundingPct}%</span>
              </div>
              <div className="dp__hero-funding-track">
                <div className="dp__hero-funding-fill" style={{ width: `${Math.min(fundingPct, 100)}%` }} />
              </div>
              <div className="dp__hero-funding-sub">
                <span>${item.fundingGoal.toLocaleString()} goal · {item.fundingBackers?.toLocaleString()} backers</span>
                <span>{item.fundingDaysLeft} days left</span>
              </div>
            </div>
          )}

          {/* ── Action buttons ────────────────────────────────────────── */}
          <div className="dp__hero-actions">

            {/* Primary CTA */}
            {isFunding ? (
              <button className="btn btn--gold" onClick={() => setRewardModalOpen(true)}>
                <IconStar size={14} />Back This Film
              </button>
            ) : isSeries ? (
              <button className="btn btn--primary" onClick={() => setPlayModalOpen(true)}>
                <IconPlay size={14} />Play S{activeSeason} E1
              </button>
            ) : (
              <button className="btn btn--primary" onClick={() => setPlayModalOpen(true)}>
                <IconPlay size={14} />Play Now
              </button>
            )}

            {/* Season toggle (series only) */}
            {isSeries && (
              <button
                className={`dp__season-toggle ${seasonPickerOpen ? 'dp__season-toggle--open' : ''}`}
                onClick={() => setSeasonPickerOpen((o) => !o)}
              >
                Season {activeSeason}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: seasonPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            )}

            {/* Trailer — always shown on funding; shown elsewhere only when URL exists */}
            {(item.trailerUrl || isFunding) && (
              <div className="dp__icon-wrap">
                <button
                  className={`dp__icon-btn${!item.trailerUrl ? ' dp__icon-btn--soon' : ''}`}
                  aria-label="Play Trailer"
                  onClick={() => item.trailerUrl && setTrailerModalOpen(true)}
                >
                  <IconTrailer />
                </button>
                <span className="dp__icon-label">Trailer</span>
              </div>
            )}

            {/* Watchlist */}
            <div className="dp__icon-wrap">
              <button
                className={`dp__icon-btn${isInWatchlist(item.id) ? ' dp__icon-btn--active' : ''}`}
                aria-label={isInWatchlist(item.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                onClick={() => toggleWatchlist(item)}
              >
                {isInWatchlist(item.id)
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                  : <IconPlus />}
              </button>
              <span className="dp__icon-label">{isInWatchlist(item.id) ? 'Saved' : 'Watchlist'}</span>
            </div>

            {/* Share */}
            <div className="dp__icon-wrap">
              <button className="dp__icon-btn" aria-label="Share"><IconShare /></button>
              <span className="dp__icon-label">Share</span>
            </div>

          </div>

          {/* ── Series: meta + description OR season picker ──────────── */}
          {isSeries && !seasonPickerOpen && (
            <div className="dp__hero-meta" key="meta">
              <div className="dp__stats">
                <span>{item.year}</span>
                <span className="dp__stats-sep">·</span>
                <span className="dp__rating-chip">{item.rating}</span>
                <span className="dp__stats-sep">·</span>
                <span>{item.duration}</span>
                {item.director && (
                  <><span className="dp__stats-sep">·</span><span>Cr. <strong>{item.director}</strong></span></>
                )}
                {item.matchScore && (
                  <><span className="dp__stats-sep">·</span><span className="dp__match">{item.matchScore}% Match</span></>
                )}
              </div>
              <div className="dp__genres">
                {item.genre.map((g) => <span key={g} className="dp__genre-pill">{g}</span>)}
              </div>
              <p className="dp__hero-desc">{item.description}</p>
            </div>
          )}

          {isSeries && seasonPickerOpen && (
            <div className="dp__season-panel" key="seasons">
              {seasonNums.map((s) => (
                <button
                  key={s}
                  className={`dp__season-btn ${activeSeason === s ? 'dp__season-btn--active' : ''}`}
                  onClick={() => handleSeasonSelect(s)}
                >Season {s}</button>
              ))}
            </div>
          )}

        </div>

        {/* Poster — absolutely positioned bottom-right (series + funding) */}
        {(isSeries || isFunding) && item.poster && !posterError && (
          <img src={item.poster} alt={item.title} className="dp__hero-poster"
            onError={() => setPosterError(true)} />
        )}

      </div>

      {/* ── Series body ───────────────────────────────────────────────────── */}
      {isSeries && (
        <div className="dp__series-body">
          <div className="dp__ep-bar">
            <span className="dp__ep-season-label">Season {activeSeason}</span>
            <span className="dp__ep-count">{currentEpisodes.length} episodes</span>
          </div>
          <div className="dp__episode-list">
            {currentEpisodes.map((ep, i) => <EpisodeRow key={ep.ep} ep={ep} index={i} />)}
          </div>
        </div>
      )}

      {/* ── Funding body ──────────────────────────────────────────────────── */}
      {isFunding && (
        <div className="dp__body">
          <div className="dp__funding-body">

            {/* Backer stream */}
            <BackerStream item={item} onOpenModal={() => setBackersModalOpen(true)} />

            {/* Tabs */}
            <div className="dp__tabs">
              {['overview', 'team', 'updates', 'faq', 'community'].map((t) => (
                <button key={t} className={`dp__tab ${tab === t ? 'dp__tab--active' : ''}`} onClick={() => setTab(t)}>
                  {{ overview: 'Overview', team: 'Team', updates: 'Updates', faq: 'FAQ', community: 'Community' }[t]}
                  {t === 'updates' && item.updates?.length > 0 && (
                    <span className="dp__tab-badge">{item.updates.length}</span>
                  )}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="dp__section">
                <div className="dp__stats dp__stats--body">
                  <span>{item.year}</span>
                  <span className="dp__stats-sep">·</span>
                  <span className="dp__rating-chip">{item.rating}</span>
                  <span className="dp__stats-sep">·</span>
                  <span>{item.duration}</span>
                  {item.director && (<><span className="dp__stats-sep">·</span><span>Dir. <strong>{item.director}</strong></span></>)}
                </div>
                <div className="dp__genres dp__genres--body">
                  {item.genre.map((g) => <span key={g} className="dp__genre-pill dp__genre-pill--body">{g}</span>)}
                </div>
                <p className="dp__description">{item.description}</p>
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
                          <IconStar size={10} />{a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Updates tab ──────────────────────────────────────────── */}
            {tab === 'updates' && (
              <div className="dp__section">
                {item.updates?.length > 0 ? (
                  <div className="dp__updates">
                    {item.updates.map((u, i) => (
                      <article key={u.id} className="dp__update">
                        <div className="dp__update-meta">
                          <span className="dp__update-num">Update {item.updates.length - i}</span>
                          <span className="dp__update-date">{u.date}</span>
                        </div>
                        <h3 className="dp__update-title">{u.title}</h3>
                        {u.body.split('\n\n').map((para, pi) => (
                          <p key={pi} className="dp__update-body">{para}</p>
                        ))}
                        {u.images?.length > 0 && <UpdateGallery images={u.images} />}
                        {u.videoUrl && getEmbedUrl(u.videoUrl) && (
                          <div className="dp__update-video">
                            <iframe
                              src={getEmbedUrl(u.videoUrl)}
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen title={u.title}
                            />
                          </div>
                        )}
                        <div className="dp__update-author">
                          <span className="dp__update-avatar">{u.author.charAt(0)}</span>
                          <span className="dp__update-byline">{u.author} &middot; {u.authorRole}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="dp__empty-state">
                    <span className="dp__empty-icon">📋</span>
                    <p>No campaign updates yet.</p>
                    <p className="dp__empty-sub">Check back soon for news from the creators.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Team tab ──────────────────────────────────────────────── */}
            {tab === 'team'      && <TeamTab item={item} />}

            {/* ── FAQ tab ───────────────────────────────────────────────── */}
            {tab === 'faq'       && <FAQTab />}

            {/* ── Community tab ─────────────────────────────────────────── */}
            {tab === 'community' && <CommunityTab item={item} />}

          </div>
        </div>
      )}

      {/* ── Movie body ────────────────────────────────────────────────────── */}
      {!isSeries && !isFunding && (
        <div className="dp__body">
          <div className="dp__body-inner">
            <div className="dp__main">
              <div className="dp__stats dp__stats--body">
                <span>{item.year}</span>
                <span className="dp__stats-sep">·</span>
                <span className="dp__rating-chip">{item.rating}</span>
                <span className="dp__stats-sep">·</span>
                <span>{item.duration}</span>
                {item.director && (<><span className="dp__stats-sep">·</span><span>Dir. <strong>{item.director}</strong></span></>)}
                {item.matchScore && (<><span className="dp__stats-sep">·</span><span className="dp__match">{item.matchScore}% Match</span></>)}
              </div>
              <div className="dp__genres dp__genres--body">
                {item.genre.map((g) => <span key={g} className="dp__genre-pill dp__genre-pill--body">{g}</span>)}
              </div>
              <p className="dp__description">{item.description}</p>
              {item.cast && item.cast[0] !== 'Documentary' && (
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
                        <IconStar size={10} />{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <aside className="dp__sidebar">
              {item.poster && !posterError && (
                <div className="dp__sidebar-poster">
                  <img src={item.poster} alt={item.title} className="dp__poster-img" onError={() => setPosterError(true)} />
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* ── Reward modal ─────────────────────────────────────────────────── */}
      {rewardModalOpen && <RewardModal item={item} onClose={() => setRewardModalOpen(false)} />}

      {/* ── Trailer modal ────────────────────────────────────────────────── */}
      {trailerModalOpen && <TrailerModal url={item.trailerUrl} title={item.title} onClose={() => setTrailerModalOpen(false)} />}

      {/* ── Play modal ───────────────────────────────────────────────────── */}
      {playModalOpen && <PlayModal item={item} onClose={() => setPlayModalOpen(false)} />}

      {/* ── Backers modal ────────────────────────────────────────────────── */}
      {backersModalOpen && <BackersModal item={item} onClose={() => setBackersModalOpen(false)} />}

    </div>
  );
}
