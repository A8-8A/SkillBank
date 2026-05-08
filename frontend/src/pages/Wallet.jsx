import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { fadeUp, stagger, cardVariant } from '../lib/motionVariants'

const WHATSAPP_NUMBER = '96176860746'

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target == null) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setValue(Math.round(start))
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return value
}

function parseBalance(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function Wallet() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'buy')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadWallet = async () => {
      try {
        const { data } = await client.get('/users/me')

        if (!active) return
        setBalance(parseBalance(data.balance))
      } finally {
        if (active) setLoading(false)
      }
    }

    const refreshBalance = async () => {
      try {
        const { data } = await client.get('/users/me')
        if (active) setBalance(parseBalance(data.balance))
      } catch (err) {
        console.error('Wallet balance refresh failed:', err)
      }
    }

    loadWallet()

    const handleFocus = () => refreshBalance()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshBalance()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const balanceRefreshInterval = setInterval(refreshBalance, 30000)

    return () => {
      active = false
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(balanceRefreshInterval)
    }
  }, [])

  const displayBalance = useCountUp(balance)

  const openWhatsApp = (message) => {
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank')
  }

  const handleBuy = (credits, price) => {
    openWhatsApp(
      `Hi! I'd like to purchase ${credits} SkillBank credit${credits > 1 ? 's' : ''} for $${price}.\n\n` +
      `Account: ${user?.email}\n` +
      `Name: ${user?.name}\n` +
      `Package: ${credits} credit${credits > 1 ? 's' : ''} — $${price}\n\n` +
      `Please let me know the payment details.`
    )
  }

  const handleRedeem = () => {
    if (balance < 5) {
      alert('You need at least 5 credits to redeem.')
      return
    }
    openWhatsApp(
      `Hi! I'd like to redeem 5 SkillBank credits for $50.\n\n` +
      `Account: ${user?.email}\n` +
      `Name: ${user?.name}\n` +
      `Current balance: ${balance} credits\n\n` +
      `Please let me know how you'll send the $50.`
    )
  }

  if (loading) return <div className="loading" />

  const steps = [
    'Choose your package and tap "Buy via WhatsApp"',
    'Pay via OMT, Whish Money, or bank transfer',
    'Credits are added to your account within minutes',
  ]

  const redeemSteps = [
    'Click "Redeem via WhatsApp" to send your request',
    'We verify your credit balance and process the request',
    'Receive $50 via OMT, Whish Money, or bank transfer within 24 hours',
  ]

  return (
    <div className="page">
      {/* Balance Header */}
      <motion.div className="wallet-balance-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <p className="wallet-balance-label">Your Balance</p>
        <h1 className="wallet-balance-number">{displayBalance}</h1>
        <p className="wallet-balance-sublabel">credits</p>
      </motion.div>

      {/* Tabs */}
      <motion.div className="wallet-tabs" {...fadeUp(0.12)}>
        <button
          className={`wallet-tab ${tab === 'buy' ? 'wallet-tab-active' : ''}`}
          onClick={() => setTab('buy')}
        >
          Buy Credits
        </button>
        <button
          className={`wallet-tab ${tab === 'redeem' ? 'wallet-tab-active' : ''}`}
          onClick={() => setTab('redeem')}
        >
          Redeem Credits
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Buy Tab */}
        {tab === 'buy' && (
          <motion.div
            key="buy"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="wallet-packages"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.div
                className="wallet-package-card"
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                onClick={() => handleBuy(1, 15)}
                style={{ cursor: 'pointer' }}
              >
                <div className="package-credits">1</div>
                <div className="package-label">credit</div>
                <div className="package-price">$15</div>
                <motion.button className="btn btn-primary btn-full" whileTap={{ scale: 0.97 }}>
                  Buy via WhatsApp
                </motion.button>
              </motion.div>

              <motion.div
                className="wallet-package-card wallet-package-featured"
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                onClick={() => handleBuy(5, 60)}
                style={{ cursor: 'pointer' }}
              >
                <div className="package-badge">4 + 1 Free</div>
                <div className="package-credits">5</div>
                <div className="package-label">credits</div>
                <div className="package-price">$60</div>
                <div className="package-save">Save $15</div>
                <motion.button className="btn btn-primary btn-full" whileTap={{ scale: 0.97 }}>
                  Buy via WhatsApp
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="wallet-info-card"
              style={{ marginTop: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3>How it works</h3>
              <div className="wallet-steps">
                {steps.map((text, i) => (
                  <motion.div
                    key={i}
                    className="wallet-step"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="step-number">{i + 1}</div>
                    <p>{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Redeem Tab */}
        {tab === 'redeem' && (
          <motion.div
            key="redeem"
            className="wallet-redeem-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="wallet-redeem-card"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2>Cash Out Your Credits</h2>
              <p className="wallet-redeem-description">
                Turn your teaching hours into real money. For every 5 credits, you receive <strong>$50</strong>.
              </p>

              <motion.div
                className="wallet-redeem-rate"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="redeem-from">
                  <span className="redeem-amount">5</span>
                  <span className="redeem-label">credits</span>
                </div>
                <div className="redeem-arrow">&#8594;</div>
                <div className="redeem-to">
                  <span className="redeem-amount">$50</span>
                  <span className="redeem-label">cash</span>
                </div>
              </motion.div>

              <p className="wallet-redeem-balance">
                Your current balance: <strong>{balance} credits</strong>
                {balance >= 5
                  ? ` — you can redeem ${Math.floor(balance / 5) * 5} credits for $${Math.floor(balance / 5) * 50}`
                  : ` — you need at least 5 credits to redeem`
                }
              </p>

              <motion.button
                className="btn btn-primary btn-full"
                onClick={handleRedeem}
                disabled={balance < 5}
                style={{ marginTop: '1.5rem', maxWidth: '320px' }}
                whileHover={balance >= 5 ? { scale: 1.03 } : {}}
                whileTap={balance >= 5 ? { scale: 0.97 } : {}}
              >
                {balance < 5 ? 'Not enough credits' : 'Redeem via WhatsApp'}
              </motion.button>
            </motion.div>

            <motion.div
              className="wallet-info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3>How redemption works</h3>
              <div className="wallet-steps">
                {redeemSteps.map((text, i) => (
                  <motion.div
                    key={i}
                    className="wallet-step"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="step-number">{i + 1}</div>
                    <p>{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
