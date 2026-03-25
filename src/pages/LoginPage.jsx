import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSrc from '../assets/FL-logo.png';
import heroImg from '../assets/pilgrims-progress.png';
import './LoginPage.css';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [step,  setStep]  = useState(1);
  const [email, setEmail] = useState('');
  const [name,  setName]  = useState('');

  const from = location.state?.from || '/';

  const finishLogin = (userData) => {
    login(userData);
    setStep(3);
    setTimeout(() => navigate(from, { replace: true }), 1200);
  };

  const handleSocial = (provider) => {
    finishLogin({
      name:  provider === 'Google' ? 'Google User' : 'Apple User',
      email: provider === 'Google' ? 'user@gmail.com' : 'user@icloud.com',
      provider,
    });
  };

  const initials = name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="lp">
      {/* ── Left: form panel ───────────────────────────── */}
      <div className="lp__form-panel">
        <button className="lp__logo-btn" onClick={() => navigate('/')}>
          <img src={logoSrc} alt="FilmLauncher" className="lp__logo-img" />
        </button>
        <div className="lp__content">

        {step === 1 && (
          <div className="lp__form">
            <h1 className="lp__title">Stories with Purpose</h1>
            <p className="lp__subtitle">
              Use your account to watch content, create<br />new fundraising projects, and more.
            </p>

            <div className="lp__field">
              <label className="lp__label">Email Address</label>
              <input
                className="lp__input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email.includes('@') && setStep(2)}
                autoFocus
              />
            </div>

            <button
              className="btn btn--gold lp__cta"
              disabled={!email.includes('@')}
              onClick={() => setStep(2)}
            >
              Continue
            </button>

            <div className="lp__divider"><span>or</span></div>

            <div className="lp__socials">
              <button className="lp__social" onClick={() => handleSocial('Google')} aria-label="Continue with Google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button className="lp__social" onClick={() => handleSocial('Apple')} aria-label="Continue with Apple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>

            <p className="lp__terms">
              By continuing you agree to our <span>Terms</span> and <span>Privacy Policy</span>.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="lp__form">
            <h1 className="lp__title">Create your account</h1>
            <p className="lp__subtitle">{email}</p>

            <div className="lp__field" style={{ marginTop: 32 }}>
              <label className="lp__label">Full Name</label>
              <input
                className="lp__input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && finishLogin({ name: name.trim(), email, provider: 'email' })}
                autoFocus
              />
            </div>

            <button
              className="btn btn--gold lp__cta"
              disabled={!name.trim()}
              onClick={() => finishLogin({ name: name.trim(), email, provider: 'email' })}
            >
              Create Account
            </button>
            <button className="lp__back" onClick={() => setStep(1)}>← Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="lp__form lp__form--success">
            <div className="lp__success-avatar">
              {initials || name[0]?.toUpperCase() || '✓'}
            </div>
            <h1 className="lp__title">Welcome{name ? `, ${name.split(' ')[0]}` : ''}!</h1>
            <p className="lp__subtitle">You're all set to stream and fund.</p>
          </div>
        )}
        </div>
      </div>


      {/* ── Right: static cinematic panel ──────────────── */}
      <div className="lp__visual-panel">
        <img src={heroImg} alt="" className="lp__hero-img" />
      </div>
    </div>
  );
}
