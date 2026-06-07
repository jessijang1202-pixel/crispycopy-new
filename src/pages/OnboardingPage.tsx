import { Sparkles, FileText, Calendar, Send } from 'lucide-react'

interface Props {
  onStart: () => void
}

export default function OnboardingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#0f172a' }}>
      <div className="w-full max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl mb-6 p-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}>
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-slate-100 mb-2">
          <span className="gradient-text">CrispyCopy</span>에 오신 걸 환영합니다
        </h1>
        <p className="text-slate-400 mt-4 mb-12 leading-relaxed">
          브랜드 정보를 한 번 등록하면 AI가 매주<br />
          블로그·인스타그램 콘텐츠를 자동으로 만들어드립니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: FileText, label: '브랜드 DNA 등록', desc: '브랜드 톤, 타겟, 차별점을 입력하면 AI가 브랜드 목소리를 기억합니다.', color: '#3b82f6' },
            { icon: Calendar, label: '일정 등록', desc: '캠페인, 이벤트, 일상 콘텐츠 일정을 등록하고 AI에게 전달합니다.', color: '#8b5cf6' },
            { icon: Send, label: '콘텐츠 승인 & 발행', desc: '생성된 콘텐츠를 검토하고 승인하면 카톡으로 발송 준비가 완료됩니다.', color: '#22c55e' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="card p-6 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">{label}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="btn-primary px-10 py-4 text-base inline-flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          시작하기 — 브랜드 DNA 등록
        </button>
      </div>
    </div>
  )
}
