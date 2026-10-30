import { Link } from 'react-router-dom';
import { PlantArt } from './components/UI';
export default function NotFound() {
  return (
    <main className="not-found">
      <PlantArt small />
      <p className="eyebrow">A LITTLE OFF THE GARDEN PATH</p>
      <h1>This page hasn’t taken root.</h1>
      <p className="muted">Let’s find your way back to something familiar.</p>
      <Link className="button" to="/">
        Back to Bagiya
      </Link>
    </main>
  );
}
