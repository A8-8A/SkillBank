import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HeroOrb from '../components/HeroOrb'

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
    q: "What if the teacher doesn't show up?",
    a: "If a teacher doesn't show up during a session, you can file a dispute. An admin reviews the case and refunds your credit. Our escrow system holds credits until the session is confirmed complete, so your balance is always protected."
  },
  {
    q: 'Can I earn real money?',
    a: "Yes. Once you accumulate credits by teaching, you can redeem 5 credits for $50. The more you teach, the more you earn. It's a way to monetize the skills you already have."
  },
  {
    q: 'What skills can I teach or learn?',
    a: 'Anything. Programming, languages, music, cooking, fitness, photography, business, math — if you know it, someone wants to learn it. We have 20 categories to choose from, and you can add custom skills too.'
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const fadeUpInView = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [flowStep, setFlowStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length)
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
      {/* Nav */}
      <motion.nav className="home-nav" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="home-nav-brand">SkillBank</div>
        <Link to="/login" className="btn btn-sm home-login-btn">Sign In</Link>
      </motion.nav>

      {/* Hero */}
      <section className="home-hero" style={{ position: 'relative' }}>
        <div className="home-hero-bg">
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85" alt="People learning together" />
          <div className="home-hero-overlay" />
        </div>
        <HeroOrb />
        <div className="home-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <motion.h1 className="home-hero-title" {...fadeUp(0.2)}>
            Trade skills.<br />
            Learn{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="home-rotating-word home-word-visible"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            .
          </motion.h1>
          <motion.p className="home-hero-subtitle" {...fadeUp(0.4)}>
            SkillBank is a community where you teach what you know and learn what you love — no money, just time.
          </motion.p>
          <motion.div {...fadeUp(0.6)}>
            <Link to="/register" className="btn btn-primary home-cta">Get Started — It's Free</Link>
          </motion.div>
        </div>
      </section>

      {/* Flow */}
      <section className="home-section">
        <motion.h2 className="home-section-title" {...fadeUpInView()}>Your Journey on SkillBank</motion.h2>
        <div className="home-flow">
          {flowSteps.map((step, i) => (
            <motion.div
              key={i}
              className={`home-flow-step ${i === flowStep ? 'home-flow-active' : ''} ${i < flowStep ? 'home-flow-done' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              animate={i === flowStep ? { scale: 1.05 } : { scale: 1 }}
            >
              <div className="home-flow-icon">{step.icon}</div>
              <div className="home-flow-connector" />
              <h4>{step.label}</h4>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Credit Cycle */}
      <section className="home-section home-section-alt">
        <motion.h2 className="home-section-title" {...fadeUpInView()}>What Are Credits?</motion.h2>
        <motion.p className="home-section-desc" {...fadeUpInView(0.1)}>
          Credits are the currency of SkillBank. Instead of paying money, you trade your time. Here's how the cycle works:
        </motion.p>
        <div className="home-credit-cycle">
          {[
            { cls: 'credit-node-teach', title: 'You Teach', desc: 'Share a skill you know for 1 hour' },
            null,
            { cls: 'credit-node-earn', title: 'You Earn', desc: 'Receive 1 credit for every hour you teach' },
            null,
            { cls: 'credit-node-learn', title: 'You Learn', desc: 'Use 1 credit to book 1 hour of learning' },
          ].map((item, i) => {
            if (!item) {
              const label = i === 1 ? '+1 credit' : 'spend it'
              const cls = i === 1 ? 'credit-arrow credit-arrow-right' : 'credit-arrow credit-arrow-right'
              return (
                <motion.div key={i} className={cls} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                  <span>{label}</span>
                </motion.div>
              )
            }
            return (
              <motion.div key={i} className={`credit-node ${item.cls}`} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15, type: 'spring' }}>
                <div className="credit-node-inner">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="home-credit-extras">
          {[
            { num: '1', text: 'Free credit when you sign up — start learning immediately' },
            { num: '$15', text: 'Buy 1 extra credit if you want to learn without teaching first' },
            { num: '$50', text: 'Cash out 5 credits — turn your teaching into real income' },
          ].map((item, i) => (
            <motion.div key={i} className="credit-extra" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}>
              <div className="credit-extra-number">{item.num}</div>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* See It In Action */}
      <section className="home-section">
        <motion.h2 className="home-section-title" {...fadeUpInView()}>See It In Action</motion.h2>
        <div className="home-example">
          <motion.div className="example-person" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="example-avatar example-avatar-1">S</div>
            <h3>Sara</h3>
            <div className="example-tags">
              <span className="example-tag example-tag-teach">Teaches French</span>
              <span className="example-tag example-tag-learn">Wants Guitar</span>
            </div>
          </motion.div>
          <motion.div className="example-exchange" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="example-exchange-line">
              <span className="example-exchange-label">Sara teaches French</span>
              <div className="example-exchange-arrow">&#8594;</div>
            </div>
            <div className="example-exchange-center">Mutual Match</div>
            <div className="example-exchange-line">
              <div className="example-exchange-arrow">&#8592;</div>
              <span className="example-exchange-label">Karim teaches Guitar</span>
            </div>
          </motion.div>
          <motion.div className="example-person" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="example-avatar example-avatar-2">K</div>
            <h3>Karim</h3>
            <div className="example-tags">
              <span className="example-tag example-tag-teach">Teaches Guitar</span>
              <span className="example-tag example-tag-learn">Wants French</span>
            </div>
          </motion.div>
        </div>
        <motion.p className="home-example-caption" {...fadeUpInView(0.3)}>
          Sara and Karim both have something the other wants. They book sessions with each other — Sara learns guitar, Karim learns French. No money changes hands. They trade time for time.
        </motion.p>
      </section>

      {/* Detailed Steps */}
      <section className="home-section home-section-alt">
        <motion.h2 className="home-section-title" {...fadeUpInView()}>How It Works — Step by Step</motion.h2>
        <div className="home-detailed-steps">
          {[
            { title: 'Create your account', body: 'Sign up with your email, verify it, and you\'re in. You start with 1 free credit — no payment needed. Fill out your profile so others can find you.' },
            { title: 'List your skills', body: 'Tell us what you can teach (like "Python Programming" or "Cooking") and what you want to learn (like "Guitar" or "Photography"). Pick your level — beginner, intermediate, or advanced.' },
            { title: 'Set your availability', body: "Mark the hours you're free on a weekly grid. This lets learners see when they can book a session with you. You can update it anytime." },
            { title: 'Find your match', body: 'Browse users who teach what you want to learn. Our matching system highlights mutual matches — people where both sides benefit. You can also search by name, skill, or category.' },
            { title: 'Book a session', body: 'Pick an available time slot on someone\'s profile and book a 1-hour session. 1 credit is held from your balance until the session is confirmed complete. The teacher has 24 hours to accept.' },
            { title: 'Learn, teach, repeat', body: 'Attend your session, learn something new, and leave a review. When you teach, the credit is released to you after the session. The more you teach, the more you can learn.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              className="detailed-step"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <div className="detailed-step-num">{i + 1}</div>
              <div className="detailed-step-content">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="home-section">
        <motion.h2 className="home-section-title" {...fadeUpInView()}>Why SkillBank?</motion.h2>
        <div className="home-features-row">
          {[
            { title: 'No money needed', body: 'Start with 1 free credit. Earn more by teaching. Trade your time, not your wallet.' },
            { title: 'Protected by escrow', body: 'Credits are held safely until sessions complete. If something goes wrong, you get refunded.' },
            { title: 'Ratings you can trust', body: 'Every session ends with a review. Separate teaching and learning ratings help you find the best match.' },
            { title: 'Earn real income', body: 'Cash out 5 credits for $50. Turn the skills you already have into money.' },
            { title: 'Smart matching', body: 'We find mutual matches — people where both sides benefit. Or browse all users and search by skill.' },
            { title: 'Session reminders', body: 'Get email reminders 2 hours before your session. Never miss a learning opportunity.' },
          ].map((card, i) => (
            <motion.div
              key={i}
              className="home-feature-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="home-section home-section-alt">
        <motion.h2 className="home-section-title" {...fadeUpInView()}>Frequently Asked Questions</motion.h2>
        <div className="home-faq-list">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              className={`home-faq-item ${openFaq === i ? 'home-faq-open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <div className="home-faq-question">
                <span>{faq.q}</span>
                <motion.span
                  className="home-faq-toggle"
                  animate={{ rotate: openFaq === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  +
                </motion.span>
              </div>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    className="home-faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        className="home-section home-cta-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>Ready to start trading skills?</h2>
        <p>Join SkillBank today. Get a free credit and start learning something new.</p>
        <Link to="/register" className="btn btn-primary home-cta">Create Your Account — It's Free</Link>
      </motion.section>

      <footer className="home-footer">
        <p>SkillBank — Trade Skills, Grow Together.</p>
      </footer>
    </div>
  )
}
