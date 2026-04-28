import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const WHATSAPP_NUMBER = '961XXXXXXXX' // <-- REPLACE with your actual WhatsApp number

export default function Wallet() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'buy')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/users/me').then(r => setProfile(r.data)).finally(() => setLoading(false))
  }, [])

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
    if ((profile?.balance ?? 0) < 5) {
      alert('You need at least 5 credits to redeem.')
      return
    }
    openWhatsApp(
      `Hi! I'd like to redeem 5 SkillBank credits for $50.\n\n` +
      `Account: ${user?.email}\n` +
      `Name: ${user?.name}\n` +
      `Current balance: ${profile?.balance} credits\n\n` +
      `Please let me know how you'll send the $50.`
    )
  }

  if (loading) return <div className="loading" />

  return (
    <div className="page">
      {/* Balance Header */}
      <div className="wallet-balance-card">
        <p className="wallet-balance-label">Your Balance</p>
        <h1 className="wallet-balance-number">{profile?.balance ?? 0}</h1>
        <p className="wallet-balance-sublabel">credits</p>
      </div>

      {/* Tabs */}
      <div className="wallet-tabs">
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
      </div>

      {/* Buy Tab */}
      {tab === 'buy' && (
        <>
          <div className="wallet-packages">
            <div className="wallet-package-card" onClick={() => handleBuy(1, 15)}>
              <div className="package-credits">1</div>
              <div className="package-label">credit</div>
              <div className="package-price">$15</div>
              <button className="btn btn-primary btn-full">Buy via WhatsApp</button>
            </div>

            <div className="wallet-package-card wallet-package-featured" onClick={() => handleBuy(5, 60)}>
              <div className="package-badge">4 + 1 Free</div>
              <div className="package-credits">5</div>
              <div className="package-label">credits</div>
              <div className="package-price">$60</div>
              <div className="package-save">Save $15</div>
              <button className="btn btn-primary btn-full">Buy via WhatsApp</button>
            </div>
          </div>

          <div className="wallet-info-card" style={{ marginTop: '1.5rem' }}>
            <h3>How it works</h3>
            <div className="wallet-steps">
              <div className="wallet-step">
                <div className="step-number">1</div>
                <p>Choose your package and tap "Buy via WhatsApp"</p>
              </div>
              <div className="wallet-step">
                <div className="step-number">2</div>
                <p>Pay via OMT, Wish Money, or bank transfer</p>
              </div>
              <div className="wallet-step">
                <div className="step-number">3</div>
                <p>Credits are added to your account within minutes</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Redeem Tab */}
      {tab === 'redeem' && (
        <div className="wallet-redeem-section">
          <div className="wallet-redeem-card">
            <h2>Cash Out Your Credits</h2>
            <p className="wallet-redeem-description">
              Turn your teaching hours into real money. For every 5 credits, you receive <strong>$50</strong>.
            </p>

            <div className="wallet-redeem-rate">
              <div className="redeem-from">
                <span className="redeem-amount">5</span>
                <span className="redeem-label">credits</span>
              </div>
              <div className="redeem-arrow">&#8594;</div>
              <div className="redeem-to">
                <span className="redeem-amount">$50</span>
                <span className="redeem-label">cash</span>
              </div>
            </div>

            <p className="wallet-redeem-balance">
              Your current balance: <strong>{profile?.balance ?? 0} credits</strong>
              {(profile?.balance ?? 0) >= 5
                ? ` — you can redeem ${Math.floor(profile.balance / 5) * 5} credits for $${Math.floor(profile.balance / 5) * 50}`
                : ` — you need at least 5 credits to redeem`
              }
            </p>

            <button
              className="btn btn-primary btn-full"
              onClick={handleRedeem}
              disabled={(profile?.balance ?? 0) < 5}
              style={{ marginTop: '1.5rem', maxWidth: '320px' }}
            >
              {(profile?.balance ?? 0) < 5 ? 'Not enough credits' : 'Redeem via WhatsApp'}
            </button>
          </div>

          <div className="wallet-info-card">
            <h3>How redemption works</h3>
            <div className="wallet-steps">
              <div className="wallet-step">
                <div className="step-number">1</div>
                <p>Click "Redeem via WhatsApp" to send your request</p>
              </div>
              <div className="wallet-step">
                <div className="step-number">2</div>
                <p>We verify your credit balance and process the request</p>
              </div>
              <div className="wallet-step">
                <div className="step-number">3</div>
                <p>Receive $50 via OMT, Wish Money, or bank transfer within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
