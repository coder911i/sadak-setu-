import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck, Activity, Radar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

const REMEMBER_KEY = 'sadak_setu_remember_email';

const DEMO_ACCOUNTS = [
  { role: 'Administrator', email: 'admin@sadaksetu.gov.in' },
  { role: 'Field inspector', email: 'inspector@sadaksetu.gov.in' },
];
const DEMO_PASSWORD = 'SadakSetu@2026';

const HIGHLIGHTS = [
  { icon: Radar, title: 'AI damage detection', copy: 'Potholes and cracks classified with confidence scores.' },
  { icon: Activity, title: 'Live road health', copy: 'Condition index and telemetry across every corridor.' },
  { icon: ShieldCheck, title: 'Verified repairs', copy: 'Before/after evidence closes every work order.' },
];

// Turns SDK/network failures into something a field officer can act on.
const friendlyError = (err) => {
  const raw = (err?.message || '').toLowerCase();
  if (raw.includes('failed to fetch') || raw.includes('network')) {
    return 'Cannot reach the Sadak Setu server. Check your connection and try again.';
  }
  if (raw.includes('invalid') || raw.includes('credential') || raw.includes('401')) {
    return 'Incorrect email or password. Please try again.';
  }
  return err?.message || 'Sign in failed. Please try again.';
};

export function LoginPage() {
  const remembered = typeof window !== 'undefined' ? localStorage.getItem(REMEMBER_KEY) : null;

  const [email, setEmail] = useState(remembered || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Enter your official email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'That email address looks incomplete.';
    if (!password) errors.password = 'Enter your password.';
    else if (password.length < 6) errors.password = 'Passwords are at least 6 characters.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_KEY);
      navigate('/');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const useDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setFieldErrors({});
  };

  return (
    <div className="min-h-[100dvh] bg-canvas lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — desktop only */}
      <section className="hidden lg:flex flex-col justify-between page-header-gradient text-white p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center p-2.5">
            <img src="/logo.svg" alt="" className="w-full h-full object-contain brightness-0 invert" />
          </span>
          <span>
            <span className="block text-headline font-semibold tracking-tight">Sadak Setu</span>
            <span className="block text-footnote text-white/70">Road health & maintenance intelligence</span>
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-display font-semibold leading-tight text-white">
            Every road, continuously inspected.
          </h2>
          <p className="mt-3 text-body text-white/80">
            One command centre for detection, complaints, repairs and verification across the network.
          </p>

          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="flex gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-subhead font-semibold">{title}</span>
                  <span className="block text-footnote text-white/70">{copy}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-caption text-white/60">
          Government of India · Ministry of Road Transport & Highways initiative
        </p>
      </section>

      {/* Sign-in panel */}
      <section className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-sm mx-auto animate-fade-in">
          {/* Compact brand for mobile */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <span className="w-14 h-14 rounded-3xl bg-brand-600 flex items-center justify-center p-3.5 shadow-card">
              <img src="/logo.svg" alt="" className="w-full h-full object-contain brightness-0 invert" />
            </span>
            <h1 className="mt-4 text-title2 font-semibold text-ink-900">Sadak Setu</h1>
            <p className="text-subhead text-ink-500 mt-1">Road health & maintenance intelligence</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-title1 font-semibold text-ink-900">Sign in</h1>
            <p className="text-subhead text-ink-500 mt-1">Use your official Sadak Setu credentials.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <Alert variant="danger" title="Unable to sign in">
                {error}
              </Alert>
            )}

            <Input
              label="Email address"
              id="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoFocus
              icon={Mail}
              placeholder="name@sadaksetu.gov.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
            />

            <label className="flex items-center gap-2.5 text-subhead text-ink-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-line-strong text-brand-600 focus:ring-brand-500/30 cursor-pointer"
              />
              Keep me signed in on this device
            </label>

            <Button type="submit" size="lg" fullWidth isLoading={loading} icon={ArrowRight} iconPosition="right">
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-2xl border border-line bg-white p-4">
            <p className="text-caption uppercase tracking-wide text-ink-400">Demo accounts</p>
            <ul className="mt-2 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => useDemoAccount(account.email)}
                    className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-50 transition-colors press"
                  >
                    <span className="min-w-0">
                      <span className="block text-subhead font-medium text-ink-900">{account.role}</span>
                      <span className="block text-caption text-ink-400 truncate">{account.email}</span>
                    </span>
                    <span className="text-caption font-semibold text-brand-700 flex-shrink-0">Use</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 px-3 text-caption text-ink-400">
              Password: <span className="font-mono">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
