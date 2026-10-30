import { useState, useRef } from 'react';
import { Users, Search, UserPlus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../../hooks/useResource';
import { api } from '../../lib/api';
import { PageHeading, Resource, Empty, Pagination } from '../../components/UI';
export default function Friends() {
  const { user } = useAuth();
  const [page, setPage] = useState(1),
    [results, setResults] = useState(null),
    [error, setError] = useState(''),
    [searching, setSearching] = useState(false),
    [busy, setBusy] = useState(null);
  const guard = useRef(false);
  const resource = useResource(`/social/friends?page=${page}`);
  async function search(e) {
    e.preventDefault();
    setSearching(true);
    setError('');
    try {
      const q = new FormData(e.currentTarget).get('q');
      setResults(
        (await api(`/social/search?q=${encodeURIComponent(q)}`)).users,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }
  async function mutate(id, method) {
    if (guard.current) return;
    guard.current = true;
    setBusy(id);
    try {
      await api(`/social/friends/${id}`, {
        method,
        body: method === 'DELETE' ? undefined : {},
      });
      resource.reload();
      if (method === 'POST') setResults((r) => r?.filter((v) => v._id !== id));
      toast.success(
        method === 'POST'
          ? 'Friend request sent.'
          : method === 'PATCH'
            ? 'You’re now growing together.'
            : 'Connection removed.',
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      guard.current = false;
      setBusy(null);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="GOOD COMPANY MAKES ROOM FOR GROWTH"
        title="Grow alongside friends."
        description="Find your people. Encourage their little beginnings."
      />
      <section className="panel search-panel">
        <div>
          <h3>A familiar name?</h3>
          <p className="muted">
            Search by the first few letters of a username.
          </p>
        </div>
        <form className="search-form" onSubmit={search}>
          <label className="sr-only" htmlFor="friend-search">
            Search usernames
          </label>
          <Search size={18} />
          <input
            id="friend-search"
            name="q"
            placeholder="Find a friend…"
            required
            minLength={2}
            maxLength={30}
            pattern="[A-Za-z0-9_]{2,30}"
          />
          <button className="button" disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>
      {results && (
        <section className="panel">
          <h3>People we found</h3>
          {results.length ? (
            <div className="people-grid">
              {results.map((p) => (
                <article className="person" key={p._id}>
                  <span className="avatar">{p.name.charAt(0)}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <span>@{p.username}</span>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Add ${p.username}`}
                    disabled={busy !== null}
                    onClick={() => mutate(p._id, 'POST')}
                  >
                    <UserPlus size={19} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <Empty title="No matching members.">
              Try another username or invite your friend to create an account.
            </Empty>
          )}
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Your growing circle</h3>
            <p className="muted">Friends and pending requests.</p>
          </div>
          <Users size={22} />
        </div>
        <Resource resource={resource}>
          {(data) =>
            data.friends.length ? (
              <>
                <div className="people-grid">
                  {data.friends.map((f) => {
                    const incoming = f.recipient?._id === user.id,
                      person = incoming ? f.requester : f.recipient;
                    if (!person) return null;
                    return (
                      <article className="person" key={f._id}>
                        <span className="avatar">{person.name.charAt(0)}</span>
                        <div>
                          <strong>{person.name}</strong>
                          <span>@{person.username}</span>
                          <small>
                            {f.status === 'accepted'
                              ? 'Growing together'
                              : incoming
                                ? 'Wants to be friends'
                                : 'Request sent'}
                          </small>
                        </div>
                        {incoming && f.status === 'pending' && (
                          <button
                            className="icon-button"
                            aria-label={`Accept ${person.username}`}
                            disabled={busy !== null}
                            onClick={() => mutate(f._id, 'PATCH')}
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          className="icon-button"
                          aria-label={`${f.status === 'accepted' ? 'Remove' : 'Cancel'} ${person.username}`}
                          disabled={busy !== null}
                          onClick={() => mutate(f._id, 'DELETE')}
                        >
                          <X size={18} />
                        </button>
                      </article>
                    );
                  })}
                </div>
                <Pagination page={page} pages={data.pages} onChange={setPage} />
              </>
            ) : (
              <Empty title="There’s room for good company.">
                Search for a friend to send your first request.
              </Empty>
            )
          }
        </Resource>
      </section>
    </>
  );
}
