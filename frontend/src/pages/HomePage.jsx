import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ROTATING_WORDS = ['Guitar', 'Cooking', 'Python', 'Photography', 'Design', 'French', 'Chess', 'Yoga']

const FAQS = [
  {
    q: 'Is SkillBank free to use?',
    a: 'Yes. You sign up for free and start with 1 credit — enough to book your first hour of learning. You earn more credits by teaching others. You can also purchase additional credits if you want to learn more without teaching first.'
  },
  {
    q: 'How do sessions work?',
    a: 'Once you find someone to learn from, you pick a time slot from their availability and book a 1-hour session. The teacher confirms, and you both meet at the scheduled time. After the session, you can rate and review each other.'
  },
  {
    q: 'What if the teacher doesn\'t show up?',
    a: 'If a teacher doesn\'t show up during a session, you can file a dispute. An admin reviews the case and refunds your credit. Our escrow system holds credits until the session is confirmed complete, so your balance is always protected.'
  },
  {
    q: 'Can I earn real money?',
    a: 'Yes. Once you accumulate credits by teaching, you can redeem 5 credits for $50. The more you teach, the more you earn. It\'s a way to monetize the skills you already have.'
  },
  {
    q: 'What skills can I teach or learn?',
    a: 'Anything. Programming, languages, music, cooking, fitness, photography, business, math — if you know it, someone wants to learn it. We have 20 categories to choose from, and you can add custom skills too.'
  },
]

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)
  const [flowStep, setFlowStep] = useState(0)

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

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowStep(prev => (prev + 1) % 5)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const flowSteps = [
    { label: 'Sign Up', desc: 'Create your free account and get 1 credit', icon: '1' },
    { label: 'List Skills', desc: 'Add what you can teach and what you want to learn', icon: '2' },
    { label: 'Get Matched', desc: 'We find people who complement your skills', icon: '3' },
    { label: 'Book a Session', desc: 'Pick a time, book a 1-hour session', icon: '4' },
    { label: 'Learn and Earn', desc: 'Teach to earn credits, spend them to learn', icon: '5' },
  ]

  return (
    <div className="homepage">
      <nav className="home-nav">
        <div className="home-nav-brand">SkillBank</div>
        <Link to="/login" className="btn btn-sm home-login-btn">Sign In</Link>
      </nav>

      <section className="home-hero">
        <div className="home-hero-bg">
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85" alt="People learning together" />
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

      <section className="home-section">
        <h2 className="home-section-title">Your Journey on SkillBank</h2>
        <div className="home-flow">
          {flowSteps.map((step, i) => (
            <div key={i} className={`home-flow-step ${i === flowStep ? 'home-flow-active' : ''} ${i < flowStep ? 'home-flow-done' : ''}`}>
              <div className="home-flow-icon">{step.icon}</div>
              <div className="home-flow-connector" />
              <h4>{step.label}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-section-alt">
        <h2 className="home-section-title">What Are Credits?</h2>
        <p className="home-section-desc">
          Credits are the currency of SkillBank. Instead of paying money, you trade your time. Here's how the cycle works:
        </p>
        <div className="home-credit-cycle">
          <div className="credit-node credit-node-teach">
            <div className="credit-node-inner">
              <h4>You Teach</h4>
              <p>Share a skill you know for 1 hour</p>
            </div>
          </div>
          <div className="credit-arrow credit-arrow-right">
            <span>+1 credit</span>
          </div>
          <div className="credit-node credit-node-earn">
            <div className="credit-node-inner">
              <h4>You Earn</h4>
              <p>Receive 1 credit for every hour you teach</p>
            </div>
          </div>
          <div className="credit-arrow credit-arrow-right">
            <span>spend it</span>
          </div>
          <div className="credit-node credit-node-learn">
            <div className="credit-node-inner">
              <h4>You Learn</h4>
              <p>Use 1 credit to book 1 hour of learning</p>
            </div>
          </div>
        </div>
        <div className="home-credit-extras">
          <div className="credit-extra">
            <div className="credit-extra-number">1</div>
            <p>Free credit when you sign up — start learning immediately</p>
          </div>
          <div className="credit-extra">
            <div className="credit-extra-number">$15</div>
            <p>Buy 1 extra credit if you want to learn without teaching first</p>
          </div>
          <div className="credit-extra">
            <div className="credit-extra-number">$50</div>
            <p>Cash out 5 credits — turn your teaching into real income</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">See It In Action</h2>
        <div className="home-example">
          <div className="example-person">
            <div className="example-avatar example-avatar-1">S</div>
            <h3>Sara</h3>
            <div className="example-tags">
              <span className="example-tag example-tag-teach">Teaches French</span>
              <span className="example-tag example-tag-learn">Wants Guitar</span>
            </div>
          </div>
          <div className="example-exchange">
            <div className="example-exchange-line">
              <span className="example-exchange-label">Sara teaches French</span>
              <div className="example-exchange-arrow">&#8594;</div>
            </div>
            <div className="example-exchange-center">Mutual Match</div>
            <div className="example-exchange-line">
              <div className="example-exchange-arrow">&#8592;</div>
              <span className="example-exchange-label">Karim teaches Guitar</span>
            </div>
          </div>
          <div className="example-person">
            <div className="example-avatar example-avatar-2">K</div>
            <h3>Karim</h3>
            <div className="example-tags">
              <span className="example-tag example-tag-teach">Teaches Guitar</span>
              <span className="example-tag example-tag-learn">Wants French</span>
            </div>
          </div>
        </div>
        <p className="home-example-caption">
          Sara and Karim both have something the other wants. They book sessions with each other — Sara learns guitar, Karim learns French. No money changes hands. They trade time for time.
        </p>
      </section>

      <section className="home-section home-section-alt">
        <h2 className="home-section-title">How It Works — Step by Step</h2>
        <div className="home-detailed-steps">
          <div className="detailed-step">
            <div className="detailed-step-num">1</div>
            <div className="detailed-step-content">
              <h3>Create your account</h3>
              <p>Sign up with your email, verify it, and you're in. You start with 1 free credit — no payment needed. Fill out your profile so others can find you.</p>
            </div>
          </div>
          <div className="detailed-step">
            <div className="detailed-step-num">2</div>
            <div className="detailed-step-content">
              <h3>List your skills</h3>
              <p>Tell us what you can teach (like "Python Programming" or "Cooking") and what you want to learn (like "Guitar" or "Photography"). Pick your level — beginner, intermediate, or advanced.</p>
            </div>
          </div>
          <div className="detailed-step">
            <div className="detailed-step-num">3</div>
            <div className="detailed-step-content">
              <h3>Set your availability</h3>
              <p>Mark the hours you're free on a weekly grid. This lets learners see when they can book a session with you. You can update it anytime.</p>
            </div>
          </div>
          <div className="detailed-step">
            <div className="detailed-step-num">4</div>
            <div className="detailed-step-content">
              <h3>Find your match</h3>
              <p>Browse users who teach what you want to learn. Our matching system highlights mutual matches — people where both sides benefit. You can also search by name, skill, or category.</p>
            </div>
          </div>
          <div className="detailed-step">
            <div className="detailed-step-num">5</div>
            <div className="detailed-step-content">
              <h3>Book a session</h3>
              <p>Pick an available time slot on someone's profile and book a 1-hour session. 1 credit is held from your balance until the session is confirmed complete. The teacher has 24 hours to accept.</p>
            </div>
          </div>
          <div className="detailed-step">
            <div className="detailed-step-num">6</div>
            <div className="detailed-step-content">
              <h3>Learn, teach, repeat</h3>
              <p>Attend your session, learn something new, and leave a review. When you teach, the credit is released to you after the session. The more you teach, the more you can learn.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Why SkillBank?</h2>
        <div className="home-features-row">
          <div className="home-feature-card">
            <h3>No money needed</h3>
            <p>Start with 1 free credit. Earn more by teaching. Trade your time, not your wallet.</p>
          </div>
          <div className="home-feature-card">
            <h3>Protected by escrow</h3>
            <p>Credits are held safely until sessions complete. If something goes wrong, you get refunded.</p>
          </div>
          <div className="home-feature-card">
            <h3>Ratings you can trust</h3>
            <p>Every session ends with a review. Separate teaching and learning ratings help you find the best match.</p>
          </div>
          <div className="home-feature-card">
            <h3>Earn real income</h3>
            <p>Cash out 5 credits for $50. Turn the skills you already have into money.</p>
          </div>
          <div className="home-feature-card">
            <h3>Smart matching</h3>
            <p>We find mutual matches — people where both sides benefit. Or browse all users and search by skill.</p>
          </div>
          <div className="home-feature-card">
            <h3>Session reminders</h3>
            <p>Get email reminders 2 hours before your session. Never miss a learning opportunity.</p>
          </div>
        </div>
      </section>

      <section className="home-section home-section-alt">
        <h2 className="home-section-title">Frequently Asked Questions</h2>
        <div className="home-faq-list">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`home-faq-item ${openFaq === i ? 'home-faq-open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="home-faq-question">
                <span>{faq.q}</span>
                <span className="home-faq-toggle">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && (
                <div className="home-faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-cta-section">
        <h2>Ready to start trading skills?</h2>
        <p>Join SkillBank today. Get a free credit and start learning something new.</p>
        <Link to="/register" className="btn btn-primary home-cta">Create Your Account — It's Free</Link>
      </section>

      <footer className="home-footer">
        <p>SkillBank — Trade Skills, Grow Together.</p>
      </footer>
    </div>
  )
}
