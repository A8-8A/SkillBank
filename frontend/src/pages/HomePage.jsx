import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ROTATING_WORDS = ['Guitar', 'Cooking', 'Python', 'Photography', 'Design', 'French', 'Chess', 'Yoga']
const FEATURES = [
  { title: 'Teach What You Know', desc: 'Share your expertise and earn credits for every hour you teach.' },
  { title: 'Learn What You Love', desc: 'Spend your credits to learn from skilled people in your community.' },
  { title: 'No Money Needed', desc: 'Start with 3 free credits. Trade time for time, not cash.' },
]

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length)
        setFade(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-brand">SkillBank</div>
        <Link to="/login" className="btn btn-sm home-login-btn">Sign In</Link>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80"
            alt="People collaborating"
          />
          <div className="home-hero-overlay" />
        </div>
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Trade skills.<br />
            Learn{' '}
            <span className={`home-rotating-word ${fade ? 'home-word-visible' : 'home-word-hidden'}`}>
              {ROTATING_WORDS[wordIndex]}
            </span>
            .
          </h1>
          <p className="home-hero-subtitle">
            SkillBank is a community where you teach what you know and learn what you love — no money, just time.
          </p>
          <Link to="/register" className="btn btn-primary home-cta">Get Started — It's Free</Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-section">
        <h2 className="home-section-title">How It Works</h2>
        <div className="home-steps-row">
          <div className="home-step">
            <div className="home-step-number">1</div>
            <h3>List your skills</h3>
            <p>Tell us what you can teach and what you want to learn.</p>
          </div>
          <div className="home-step-arrow">&#8594;</div>
          <div className="home-step">
            <div className="home-step-number">2</div>
            <h3>Get matched</h3>
            <p>We find people who can teach you and want to learn from you.</p>
          </div>
          <div className="home-step-arrow">&#8594;</div>
          <div className="home-step">
            <div className="home-step-number">3</div>
            <h3>Exchange sessions</h3>
            <p>Book 1-hour sessions. Teach to earn credits, spend credits to learn.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-section home-section-alt">
        <h2 className="home-section-title">Why SkillBank?</h2>
        <div className="home-features-row">
          {FEATURES.map((f, i) => (
            <div key={i} className="home-feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-section home-cta-section">
        <h2>Ready to start trading skills?</h2>
        <p>Join SkillBank and get 3 free credits to begin learning today.</p>
        <Link to="/register" className="btn btn-primary home-cta">Create Your Account</Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>SkillBank — Trade Skills, Grow Together.</p>
      </footer>
    </div>
  )
}
