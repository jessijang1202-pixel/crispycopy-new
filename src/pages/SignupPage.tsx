import { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  onSignup: (uid: string, email: string) => void
  onGoLogin: () => void
}

function mapError(msg: string): string {
  if (msg.includes('User already registered')) return '이미 가입된 이메일입니다.'
  if (msg.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.'
  if (msg.includes('Unable to validate email')) return '유효한 이메일 주소를 입력해주세요.'
  return msg
}

export default function SignupPage({ onSignup, onGoLogin }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirmPassword) { setError('모든 항목을 입력해주세요.'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (password !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return }

    setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(mapError(authError.message)); setLoading(false); return }
    if (!data.user) { setError('회원가입에 실패했습니다.'); setLoading(false); return }

    await supabase.from('profiles').upsert({ id: data.user.id, name, email })
    onSignup(data.user.id, email)
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
          <h2 className="text-xl font-semibold text-slate-100 mb-6">회원가입</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: '이름', type: 'text', value: name, onChange: setName, placeholder: '홍길동' },
              { label: '이메일', type: 'email', value: email, onChange: setEmail, placeholder: 'example@email.com' },
              { label: '비밀번호', type: 'password', value: password, onChange: setPassword, placeholder: '6자 이상' },
              { label: '비밀번호 확인', type: 'password', value: confirmPassword, onChange: setConfirmPassword, placeholder: '비밀번호 재입력' },
            ].map(({ label, type, value, onChange, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-dark" />
              </div>
            ))}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">이미 계정이 있으신가요?</span>{' '}
            <button onClick={onGoLogin} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">로그인</button>
          </div>
        </div>
      </div>
    </div>
  )
}
