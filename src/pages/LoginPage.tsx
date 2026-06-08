import { useState } from 'react'
import { LogIn, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  onLogin: (uid: string, email: string) => void
  onGoSignup: () => void
}

function mapError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (msg.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 메일함을 확인해주세요.'
  if (msg.includes('Too many requests')) return '잠시 후 다시 시도해주세요.'
  return msg
}

export default function LoginPage({ onLogin, onGoSignup }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return }
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(mapError(authError.message)); setLoading(false); return }
    onLogin(data.user.id, data.user.email ?? email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}>
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">CrispyCopy</h1>
          <p className="text-slate-400 mt-2 text-sm">SNS 콘텐츠 자동 생성 플랫폼</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">로그인</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" className="input-dark" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">아직 계정이 없으신가요?</span>{' '}
            <button onClick={onGoSignup} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">회원가입</button>
          </div>
        </div>
      </div>
    </div>
  )
}
