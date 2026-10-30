import { useState } from 'react';
import { Save, Leaf, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../../lib/api';
import { PageHeading } from '../../components/UI';
function fields(user) {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    bio: user.bio || '',
    dob: user.dob?.slice(0, 10) || '',
    rankingOptIn: user.rankingOptIn,
  };
}
export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(() => fields(user)),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(false),
    [error, setError] = useState('');
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  async function submit(e) {
    e.preventDefault();
    if (busy || !editing) return;
    setBusy(true);
    setError('');
    try {
      const data = await api(`/users/${user.id}`, {
        method: 'PUT',
        body: form,
      });
      setUser(data.user);
      setForm(fields(data.user));
      setEditing(false);
      toast.success('Your profile is up to date.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR SPACE, YOUR WAY"
        title="A little about you."
        description="Keep your details up to date and choose how you connect."
      />
      <div className="profile-layout">
        <aside className="profile-card">
          <span className="avatar large">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <h2>{user.name}</h2>
          <p>@{user.username}</p>
          <span className="pill">
            <Leaf size={14} /> GROWING SINCE{' '}
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <p className="muted">
            Your profile starts with your initial. Image uploads aren’t
            available yet.
          </p>
        </aside>
        <section className="panel profile-form">
          <div className="panel-heading">
            <h3>Personal details</h3>
            {!editing && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setForm(fields(user));
                  setError('');
                  setEditing(true);
                }}
              >
                <Pencil size={16} /> Edit profile
              </button>
            )}
          </div>
          <form onSubmit={submit}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <fieldset className="profile-fields" disabled={!editing || busy}>
              <legend className="sr-only">Personal details</legend>
              <div className="form-grid">
                {[
                  ['name', 'Full name', 'text'],
                  ['username', 'Username', 'text'],
                  ['email', 'Email address', 'email'],
                  ['phone', 'Phone', 'tel'],
                ].map(([name, label, type]) => (
                  <label key={name}>
                    {label}
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={change}
                      required
                      maxLength={
                        name === 'username'
                          ? 30
                          : name === 'name'
                            ? 80
                            : name === 'phone'
                              ? 25
                              : 254
                      }
                      pattern={
                        name === 'username' ? '[A-Za-z0-9_]{3,30}' : undefined
                      }
                    />
                  </label>
                ))}
              </div>
              <label>
                Birthday <span className="muted">(optional)</span>
                <input
                  type="date"
                  name="dob"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.dob}
                  onChange={change}
                />
              </label>
              <label>
                A few words about you
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={change}
                  maxLength={500}
                  rows={4}
                  placeholder="What are you making room for?"
                />
              </label>
              <div className="preference">
                <label>
                  <input
                    type="checkbox"
                    name="rankingOptIn"
                    checked={form.rankingOptIn}
                    onChange={change}
                  />
                  <span>
                    <strong>Join the community leaderboard</strong>
                    <small>
                      Show your name, username, focus totals and tree count to
                      signed-in members. Your email, phone and birthday stay
                      private.
                    </small>
                  </span>
                </label>
              </div>
            </fieldset>
            {editing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => {
                    setForm(fields(user));
                    setError('');
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button className="button" disabled={busy}>
                  <Save size={16} />
                  {busy ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </>
  );
}
