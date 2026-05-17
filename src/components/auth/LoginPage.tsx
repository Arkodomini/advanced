import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Layers } from 'lucide-react'

type Mode = 'signin' | 'signup' | 'magic'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithMagicLink, loading } = useAuthStore()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email)
        setMagicSent(true)
      } else if (mode === 'signup') {
        if (!displayName.trim()) { setError('Display name is required'); return }
        await signUp(email, password, displayName)
        navigate('/')
      } else {
        await signIn(email, password)
        navigate('/')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (magicSent) return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card p-10 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Layers size={24} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
        <button onClick={() => { setMagicSent(false); setMode('signin') }}
          className="mt-6 text-sm text-blue-500 hover:underline">
          Back to sign in
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card p-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Layers size={18} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">Advanced Notes</span>
        </div>

        {/* Tabs */}
        {mode !== 'magic' && (
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name" required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Loading…' : mode === 'magic' ? 'Send magic link' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'magic' ? (
            <button onClick={() => { setMode('signin'); setError('') }}
              className="text-sm text-gray-500 hover:text-gray-700">
              Back to sign in
            </button>
          ) : (
            <button onClick={() => { setMode('magic'); setError('') }}
              className="text-sm text-blue-500 hover:underline">
              Send me a magic link instead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
