import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Timer,
  Trees,
  Trophy,
  Users,
  Medal,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Leaf,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Brand } from '../components/UI';
import { useAuth } from './context/AuthContext';
const links = [
  ['/dashboard', LayoutDashboard, 'Overview'],
  ['/timer', Timer, 'Focus timer'],
  ['/dashboard/bagiya', Trees, 'My garden'],
  ['/dashboard/challenges', Trophy, 'Challenges'],
  ['/dashboard/friends', Users, 'Friends'],
  ['/dashboard/rankings', Medal, 'Leaderboard'],
];
export default function Sidebar() {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function signOut() {
    setBusy(true);
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="mobile-header">
        <Brand />
        <button
          className="icon-button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Brand />
        <div className="sidebar-tagline">A little focus. A little growth.</div>
        <p className="nav-label">YOUR SPACE</p>
        <nav aria-label="Main navigation">
          {links.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <Leaf size={23} />
          <p>
            Good things
            <br />
            take a little time.
          </p>
          <Link to="/timer" onClick={() => setOpen(false)}>
            Make room for focus <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <NavLink
            to="/dashboard/profile"
            className="nav-link"
            onClick={() => setOpen(false)}
          >
            <Settings size={19} />
            My profile
          </NavLink>
          <button className="nav-link logout" onClick={signOut} disabled={busy}>
            <LogOut size={19} />
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
          <div className="member">
            <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <span>@{user.username}</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <main id="main-content" className="main-content">
        <div className="topbar">
          <span>
            <span className="online-dot" /> YOUR PERSONAL GROWING SPACE
          </span>
          <span>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <Outlet />
        <footer className="app-footer">
          <Leaf size={13} /> Small steps, lasting roots.
          <span>Bagiya · Grow at your own pace</span>
        </footer>
      </main>
    </div>
  );
}
