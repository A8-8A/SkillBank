import { VercelV0Chat } from '../components/ui/v0-ai-chat'

export default function AiChat() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
      <VercelV0Chat />
    </div>
  )
}
