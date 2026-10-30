import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Check, Circle } from 'lucide-react';
import { Brand, PlantArt, Loading } from './UI';
import { useAuth } from '../Dashboard/context/AuthContext';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import PasswordField from './PasswordField';
import { useUsernameAvailability } from '../hooks/useUsernameAvailability';
export default function AuthForm({ signup = false }) {
  const auth = useAuth(),
    navigate = useNavigate(),
    location = useLocation();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const availability = useUsernameAvailability(username, signup);
  const passwordRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    {
      label: 'No more than 72 bytes (some symbols use more than one)',
      valid: new TextEncoder().encode(password).length <= 72,
    },
  ];
  const validPassword = passwordRules.every((rule) => rule.valid);
  const availabilityText = {
    idle: '3–30 letters, numbers or underscores.',
    invalid: 'Use 3–30 letters, numbers or underscores.',
    checking: 'Checking username…',
    available: 'This username is available.',
    taken: 'This username is already taken.',
    error:
      'Availability could not be checked. We’ll check again when you submit.',
  };
  if (auth.loading) return <Loading />;
  if (auth.user) return <Navigate to="/dashboard" replace />;
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const form = Object.fromEntries(new FormData(event.currentTarget));
    if (
      signup &&
      (!validPassword || availability === 'taken' || availability === 'invalid')
    ) {
      setError('Please check your username and password.');
      return;
    }
    if (signup && form.password !== form.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    delete form.confirmPassword;
    setBusy(true);
    try {
      if (signup) {
        await api('/auth/signup', { method: 'POST', body: form });
        toast.success('Your account is ready. Sign in to begin.');
        navigate('/login');
      } else {
        await auth.login(form);
        navigate(location.state?.from || '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <Brand />
        <div>
          <p className="eyebrow">YOUR NEXT CHAPTER STARTS SMALL</p>
          <h1>
            A little focus.
            <br />A little growth.
            <br />
            <em>A little more you.</em>
          </h1>
          <PlantArt />
          <p>
            <Leaf size={16} /> Make room for what matters.
          </p>
        </div>
        <span>GROW AT YOUR OWN PACE</span>
      </div>
      <main className="auth-form-wrap">
        <div className="auth-form">
          <Link className="text-link" to="/">
            ← Back to Bagiya
          </Link>
          <p className="eyebrow">
            {signup ? 'PLANT YOUR FIRST SEED' : 'GOOD TO SEE YOU AGAIN'}
          </p>
          <h2>{signup ? 'Start something good.' : 'Welcome back.'}</h2>
          <p className="muted">
            {signup
              ? 'Your own little growing space is waiting.'
              : 'Your garden is right where you left it.'}
          </p>
          <form onSubmit={submit}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {signup && (
              <>
                <label>
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                  />
                </label>
                <div className="form-grid">
                  <div className="username-field">
                    <label>
                      Username
                      <input
                        name="username"
                        autoComplete="username"
                        required
                        pattern="[A-Za-z0-9_]{3,30}"
                        title="3–30 letters, numbers or underscores"
                        maxLength={30}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        aria-describedby="username-status"
                        aria-invalid={['taken', 'invalid'].includes(
                          availability,
                        )}
                      />
                    </label>
                    <span
                      id="username-status"
                      className={`field-feedback ${availability}`}
                      role="status"
                    >
                      {availabilityText[availability]}
                    </span>
                  </div>
                  <label>
                    Phone
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      minLength={7}
                      maxLength={25}
                      title="7–15 digits, including your country code when applicable"
                    />
                  </label>
                </div>
              </>
            )}
            <label>
              {signup ? 'Email address' : 'Email, phone or username'}
              <input
                name={signup ? 'email' : 'identifier'}
                type={signup ? 'email' : 'text'}
                autoComplete={signup ? 'email' : 'username'}
                required
                maxLength={254}
                placeholder={
                  signup ? 'you@example.com' : 'Your email, phone or username'
                }
              />
            </label>
            <PasswordField
              name="password"
              autoComplete={signup ? 'new-password' : 'current-password'}
              required
              minLength={signup ? 8 : 1}
              maxLength={72}
              placeholder={
                signup ? 'At least 8 characters' : 'Enter your password'
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={signup ? 'password-rules' : undefined}
              aria-invalid={signup && password.length > 0 && !validPassword}
            />
            {signup && (
              <>
                <ul
                  id="password-rules"
                  className="password-rules"
                  aria-live="polite"
                >
                  {passwordRules.map((rule) => (
                    <li
                      key={rule.label}
                      className={password && rule.valid ? 'valid' : ''}
                    >
                      {password && rule.valid ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={12} />
                      )}
                      {rule.label}
                    </li>
                  ))}
                </ul>
                <PasswordField
                  label="Confirm password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  aria-describedby="password-match"
                  aria-invalid={
                    confirmation.length > 0 && confirmation !== password
                  }
                />
                <p
                  id="password-match"
                  className={`field-feedback ${confirmation && confirmation === password ? 'available' : 'invalid'}`}
                  role="status"
                >
                  {confirmation
                    ? confirmation === password
                      ? 'Passwords match.'
                      : 'Passwords do not match yet.'
                    : ''}
                </p>
              </>
            )}
            <button
              className="button full"
              disabled={
                busy ||
                (signup &&
                  (!validPassword ||
                    password !== confirmation ||
                    ['taken', 'invalid', 'checking', 'idle'].includes(
                      availability,
                    )))
              }
            >
              {busy ? 'One moment…' : signup ? 'Create my account' : 'Sign in'}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {signup ? 'Already growing with us?' : 'New around here?'}{' '}
            <Link to={signup ? '/login' : '/signup'}>
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
