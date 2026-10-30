import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Timer,
  Trees,
  ChartNoAxesColumn,
  Leaf,
  Check,
} from 'lucide-react';
import { Brand, PlantArt } from '../components/UI';
import { useAuth } from '../Dashboard/context/AuthContext';
export default function Home() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Brand />
        <div className="landing-links">
          <a href="#how-it-works">How it works</a>
          <a href="#your-space">Your growing space</a>
        </div>
        <Link className="button secondary" to={user ? '/dashboard' : '/login'}>
          {user ? 'My space' : 'Sign in'}
          <ArrowUpRight size={17} />
        </Link>
      </nav>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">
              <span className="online-dot" /> A MINDFUL WAY TO GET THINGS DONE
            </span>
            <h1>
              Find your focus.
              <br />
              Grow something
              <br />
              <em>beautiful.</em>
            </h1>
            <p>
              A quieter space for your busy mind. Turn small moments of focus
              into a flourishing virtual garden, one session at a time.
            </p>
            <div className="hero-actions">
              <Link to={user ? '/timer' : '/signup'} className="button">
                Let’s start growing <ArrowRight size={18} />
              </Link>
              <a className="text-link" href="#how-it-works">
                Take a little look <ArrowUpRight size={16} />
              </a>
            </div>
            <span className="hero-footnote">
              <Check size={15} /> Your pace. Your progress. Your little garden.
            </span>
          </div>
          <div className="hero-visual">
            <div className="botanical-caption">
              THE ART OF SLOW, STEADY GROWTH
            </div>
            <PlantArt />
            <div className="floating-card">
              <span className="round-icon">
                <Timer size={23} />
              </span>
              <div>
                <strong>A moment, just for you.</strong>
                <span>Put down the noise. Plant a little focus.</span>
              </div>
            </div>
            <span className="vertical-caption">ROOTED IN THE PRESENT</span>
          </div>
        </section>
        <section id="how-it-works" className="landing-section">
          <div className="section-intro">
            <p className="eyebrow">SIMPLE BY NATURE</p>
            <h2>
              Less distraction.
              <br />
              More room to grow.
            </h2>
            <p className="muted">
              You don’t need a perfect routine.
              <br />
              Just a place to begin.
            </p>
          </div>
          <div className="steps">
            {[
              [
                Timer,
                '01',
                'Make a little time',
                'Choose 5 to 180 minutes. Settle into a task and give it your attention.',
              ],
              [
                Leaf,
                '02',
                'Let your focus take root',
                'Complete your session and earn 100 coins for every focused minute.',
              ],
              [
                Trees,
                '03',
                'Watch your garden grow',
                'Plant a virtual tree for 2,500 coins. Make your progress something you can see.',
              ],
            ].map(([Icon, n, title, copy]) => (
              <article key={n}>
                <div className="step-top">
                  <Icon size={25} />
                  <span>{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="your-space" className="landing-banner">
          <div>
            <p className="eyebrow">A ROUTINE THAT FEELS LIKE YOU</p>
            <h2>
              Small beginnings.
              <br />
              Meaningful progress.
            </h2>
            <p>
              See your focus over time, take on a challenge, and grow alongside
              friends. Your garden is virtual. Your progress is real.
            </p>
            <Link className="button light" to={user ? '/dashboard' : '/signup'}>
              Find your growing space <ArrowUpRight size={18} />
            </Link>
          </div>
          <ChartNoAxesColumn
            className="banner-icon"
            size={170}
            strokeWidth={0.8}
          />
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <p>Made for a more mindful everyday.</p>
        <span>Focus. Flourish. Repeat.</span>
      </footer>
    </div>
  );
}
