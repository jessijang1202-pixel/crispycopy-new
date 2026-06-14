import { CheckCircle, AlertCircle, Calendar, Sparkles, Pencil, Dna, Plus } from 'lucide-react'
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

  const goEdit = () => onNavigate('brand-dna')

  const toneList = Array.isArray(brand?.tone) ? brand.tone : []
  const channelList = Array.isArray(brand?.channels) ? brand.channels : []
  const purposeList = Array.isArray(brand?.purpose) ? brand.purpose : []

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">

      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text">대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── 브랜드 DNA ─────────────────────────────────────── */}
      {!brand ? (
        <div
          className="card p-8 mb-6 cursor-pointer transition-all hover:border-blue-700 flex items-center gap-4"
          onClick={goEdit}
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#f59e0b' }} />
          <div className="flex-1">
            <h2 className="font-semibold text-slate-100">브랜드 DNA 등록이 필요합니다</h2>
            <p className="text-sm text-slate-500 mt-1">AI가 콘텐츠를 생성하려면 브랜드 정보가 필요해요</p>
          </div>
          <Plus className="w-5 h-5 text-blue-400 flex-shrink-0" />
        </div>
      ) : (
        <div className="card mb-6 overflow-hidden">

          {/* 카드 헤더 */}
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #334155' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}
              >
                <Dna className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-base">{brand.brandName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[brand.industry, brand.userType].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
          </div>

          {/* 필드 목록 */}
          <div className="divide-y" style={{ borderColor: '#1e293b' }}>

            <DNARow label="한 줄 소개" onEdit={goEdit}>
              <p className="text-sm text-slate-200 leading-relaxed italic">"{brand.oneLiner}"</p>
            </DNARow>

            <DNARow label="타겟 고객" onEdit={goEdit}>
              <p className="text-sm text-slate-200">{brand.target}</p>
            </DNARow>

            {purposeList.length > 0 && (
              <DNARow label="사용 목적" onEdit={goEdit}>
                <Chips items={purposeList} color="default" />
              </DNARow>
            )}

            {brand.products && (
              <DNARow label="주력 상품/서비스" onEdit={goEdit}>
                <p className="text-sm text-slate-200">{brand.products}</p>
              </DNARow>
            )}

            {toneList.length > 0 && (
              <DNARow label="톤앤매너" onEdit={goEdit}>
                <Chips items={toneList} color="blue" />
              </DNARow>
            )}

            {brand.brandFeeling && (
              <DNARow label="브랜드 느낌" onEdit={goEdit}>
                <p className="text-sm text-slate-200">{brand.brandFeeling}</p>
              </DNARow>
            )}

            {brand.strengths && (
              <DNARow label="핵심 강점" onEdit={goEdit}>
                <p className="text-sm text-slate-200 leading-relaxed">{brand.strengths}</p>
              </DNARow>
            )}

            {brand.prohibitedWords && (
              <DNARow label="금지어" onEdit={goEdit}>
                <p className="text-sm text-slate-400">{brand.prohibitedWords}</p>
              </DNARow>
            )}

            {channelList.length > 0 && (
              <DNARow label="운영 채널" onEdit={goEdit}>
                <Chips items={channelList} color="purple" />
              </DNARow>
            )}

            {brand.operationStyle && (
              <DNARow label="운영 방식" onEdit={goEdit}>
                <p className="text-sm text-slate-200">
                  {brand.operationStyle === '정기'
                    ? '정기 콘텐츠 발행'
                    : brand.operationStyle === '이벤트'
                      ? '이벤트/캠페인 중심'
                      : '정기 + 이벤트 병행'}
                </p>
              </DNARow>
            )}

          </div>
        </div>
      )}

      {/* ── 등록된 일정 ──────────────────────────────────────── */}
      <div
        className="card p-6 mb-6 cursor-pointer transition-all hover:border-blue-700"
        onClick={() => onNavigate('schedule')}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h2 className="font-semibold text-slate-100">등록된 일정</h2>
          </div>
          <Pencil className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { count: campaignCount, label: '캠페인', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { count: eventCount, label: '이벤트', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { count: regularCount, label: '일상', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          ].map(({ count, label, color, bg }) => (
            <div key={label} className="rounded-xl py-4" style={{ backgroundColor: bg }}>
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 콘텐츠 생성 버튼 ─────────────────────────────────── */}
      <button
        onClick={() => onNavigate('content')}
        disabled={!brand}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base"
      >
        <Sparkles className="w-5 h-5" />
        콘텐츠 생성하기
      </button>
      {!brand && (
        <p className="text-center text-xs text-slate-600 mt-2">브랜드 DNA를 먼저 등록해주세요.</p>
      )}

    </div>
  )
}

// ─── 공통 컴포넌트 ─────────────────────────────────────────────────────────

function DNARow({
  label,
  onEdit,
  children,
}: {
  label: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-5">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
        {children}
      </div>
      <button
        onClick={onEdit}
        className="flex-shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-blue-400 transition-colors mt-0.5"
        title="수정"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

const CHIP_STYLE = {
  blue:    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  green:   { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  purple:  { bg: 'rgba(139,92,246,0.12)',  color: '#c084fc', border: 'rgba(139,92,246,0.3)' },
  default: { bg: '#0f172a',                color: '#94a3b8', border: '#334155' },
} as const

function Chips({ items, color }: { items: string[]; color: keyof typeof CHIP_STYLE }) {
  const s = CHIP_STYLE[color]
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span
          key={item}
          className="px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
