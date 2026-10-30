import {
  Leaf,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Bagiya home">
      <span className="brand-icon">
        <Leaf size={23} />
      </span>
      bagiya<span className="brand-dot">.</span>
    </Link>
  );
}
export function PageHeading({ eyebrow, title, description, children }) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {children}
    </header>
  );
}
export function Loading() {
  return (
    <div className="loading-state" role="status">
      <Leaf className="loading-leaf" />
      <span>A little moment to grow…</span>
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
export function Resource({ resource, children }) {
  if (resource.loading) return <Loading />;
  if (resource.error)
    return <ErrorState message={resource.error} retry={resource.reload} />;
  return children(resource.data);
}
export function Empty({ title, children, link }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Leaf />
      </span>
      <h3>{title}</h3>
      <p className="muted">{children}</p>
      {link && (
        <Link className="text-link" to={link}>
          Start a focus session <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function Pagination({ page, pages, onChange }) {
  if (pages < 2) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="icon-button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={18} />
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button
        className="icon-button"
        aria-label="Next page"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
export function PlantArt({ small = false }) {
  return (
    <svg
      className={small ? 'plant-art small' : 'plant-art'}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="200" cy="192" r="153" fill="#e5eadb" />
      <circle cx="284" cy="92" r="28" fill="#dbbb75" opacity=".65" />
      <path d="M35 317Q195 255 365 317" stroke="#c7d4bc" strokeWidth="2" />
      <ellipse cx="203" cy="334" rx="112" ry="17" fill="#cbd4bd" />
      <path d="M157 277h88l-14 62h-60z" fill="#b58262" />
      <path d="M149 273h104v14H149z" fill="#c49370" />
      <path
        d="M202 278V112M202 231l-45-38M202 199l47-37M202 164l-36-34"
        stroke="#586d44"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M201 214c-66 5-91-24-91-64 47-2 88 15 91 64" fill="#58774d" />
      <path d="M205 184c-2-59 26-91 79-92 5 43-25 83-79 92" fill="#74935e" />
      <path d="M199 159c-51-6-70-33-66-69 41 4 63 30 66 69" fill="#8ca775" />
      <path
        d="M202 132c-23-43-15-78 17-102 23 32 19 70-17 102"
        fill="#426848"
      />
      <path
        d="M130 169l65 41M267 110l-54 66M147 103l45 47"
        stroke="#b0c297"
        strokeWidth="2"
      />
      <circle cx="105" cy="280" r="4" fill="#dbbb75" />
      <path d="M317 220v16m-8-8h16" stroke="#a1b38a" strokeWidth="2" />
    </svg>
  );
}
