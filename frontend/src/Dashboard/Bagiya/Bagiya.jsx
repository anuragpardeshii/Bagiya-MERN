import { useState, useRef } from 'react';
import { Coins, Trees, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../../hooks/useResource';
import { api, number, dateTime } from '../../lib/api';
import {
  PageHeading,
  Resource,
  Empty,
  Pagination,
  PlantArt,
} from '../../components/UI';
import Calendar from './Calendar';
export default function Bagiya() {
  const { user, refresh } = useAuth();
  const [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const guard = useRef(false);
  const wallet = useResource(`/users/balance/${user.id}`),
    history = useResource(`/transactions/${user.id}?page=${page}&limit=6`);
  async function plant() {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    setError('');
    const key = `bagiya:plant:${user.id}`;
    let requestId = sessionStorage.getItem(key);
    if (!requestId) {
      requestId = crypto.randomUUID();
      sessionStorage.setItem(key, requestId);
    }
    try {
      const result = await api('/transactions/spend', {
        method: 'POST',
        body: { type: 'TREE_PLANTING', requestId },
      });
      sessionStorage.removeItem(key);
      wallet.setData(result);
      history.reload();
      refresh();
      toast.success('Your garden has a new little tree.');
    } catch (e) {
      setError(e.message);
      if (e.status && e.status < 500) sessionStorage.removeItem(key);
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ROOTED IN YOUR EVERYDAY"
        title="Your little garden."
        description="A living reminder of the time you made for yourself."
      >
        <Link className="button secondary" to="/timer">
          Earn more coins <ArrowUpRight size={17} />
        </Link>
      </PageHeading>
      <Resource resource={wallet}>
        {(data) => (
          <section className="garden-hero">
            <div>
              <span className="pill">
                <Trees size={15} /> YOUR VIRTUAL GARDEN
              </span>
              <h2>
                {data.trees
                  ? `${number(data.trees)} little ${data.trees === 1 ? 'reason' : 'reasons'} to keep growing.`
                  : 'Every garden starts with a little seed.'}
              </h2>
              <p>
                Plant a virtual tree with the coins you earn from focusing. A
                little more green, a little more you.
              </p>
              <p className="tree-count">
                {number(data.trees)} {data.trees === 1 ? 'tree' : 'trees'}{' '}
                planted
              </p>
              <div className="garden-wallet">
                <span>
                  <Coins size={21} />
                  <strong>{number(data.balance)}</strong> coins available
                </span>
              </div>
              <button
                className="button"
                onClick={plant}
                disabled={busy || data.balance < 2500}
              >
                <Plus size={17} />
                {busy ? 'Planting…' : 'Plant a tree · 2,500 coins'}
              </button>
              {data.balance < 2500 && (
                <p className="muted small-text">
                  {number(2500 - data.balance)} more coins until your next tree.
                </p>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="garden-art">
              <PlantArt />
            </div>
          </section>
        )}
      </Resource>
      <Calendar />
      <section className="panel history-panel">
        <div className="panel-heading">
          <div>
            <h3>Your garden journal</h3>
            <p className="muted">Every coin earned. Every tree planted.</p>
          </div>
          <Coins size={22} />
        </div>
        <Resource resource={history}>
          {(data) =>
            data.transactions.length ? (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Moment</th>
                        <th>Date</th>
                        <th>Coins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((t) => (
                        <tr key={t._id}>
                          <td>{t.reference || 'Legacy wallet activity'}</td>
                          <td>{dateTime(t.createdAt)}</td>
                          <td className={t.amount > 0 ? 'positive' : 'muted'}>
                            {t.amount > 0 ? '+' : ''}
                            {number(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pages={data.pages} onChange={setPage} />
              </>
            ) : (
              <Empty title="Your story is just beginning." link="/timer">
                Complete a focus session to earn your first coins.
              </Empty>
            )
          }
        </Resource>
      </section>
    </>
  );
}
