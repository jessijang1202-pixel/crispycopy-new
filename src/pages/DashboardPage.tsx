import { CheckCircle, AlertCircle, Calendar, Sparkles, ChevronRight } from 'lucide-react'
import type { BrandDNA, Schedule } from '@/types'

interface Props {
  brand: BrandDNA | null
  schedules: Schedule[]
  onNavigate: (page: 'brand-dna' | 'schedule' | 'content') => void
}

export default function DashboardPage({ brand, schedules, onNavigate }: Props) {
  const campaignCount = schedules.filter((s) => s.type === 'campaign').length
  const eventCount = schedules.filter((s) => s.type === 'event').length
  const regularCount = schedules.filter((s) => s.type === 'regular').length

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text">대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Brand DNA Card */}
      <div
        className="card p-6 mb-4 cursor-pointer transition-all hover:border-blue-700"
        onClick={() => onNavigate('brand-dna')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brand
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
              : <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
            }
            <div>
              <h2 className="font-semibold text-slate-100">브랜드 DNA</h2>
              {brand
                ? <p className="text-sm text-slate-400 mt-0.5">{brand.brandName} · {brand.tone} · {brand.jobType}</p>
                : <p className="text-sm mt-0.5" style={{ color: '#f59e0b' }}>등록이 필요합니다</p>
              }
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>

        {brand && (
          <div className="mt-4 pt-4 grid grid-cols-3 gap-4 text-center" style={{ borderTop: '1px solid #1e3a5f' }}>
            {[
              { label: '타겟', value: brand.target },
              { label: '차별점', value: brand.differentiator },
              { label: '메시지', value: brand.keyMessages[0] },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xs font-medium text-slate-300 mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Card */}
      <div
        className="card p-6 mb-6 cursor-pointer transition-all hover:border-blue-700"
        onClick={() => onNavigate('schedule')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h2 className="font-semibold text-slate-100">등록된 일정</h2>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { count: campaignCount, label: '캠페인', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { count: eventCount, label: '이벤트', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { count: regularCount, label: '일상', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          ].map(({ count, label, color, bg }) => (
            <div key={label} className="rounded-xl py-3" style={{ backgroundColor: bg }}>
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => onNavigate('content')}
        disabled={!brand}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base"
      >
        <Sparkles className="w-5 h-5" />
        콘텐츠 생성하기
      </button>
      {!brand && <p className="text-center text-xs text-slate-600 mt-2">브랜드 DNA를 먼저 등록해주세요.</p>}
    </div>
  )
}
