import { useState } from 'react'
import { CheckCircle, AlertCircle, Calendar, Sparkles, Pencil, Dna, Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { BrandDNA, Schedule } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  brand: BrandDNA | null
  schedules: Schedule[]
  userId?: string
  onNavigate: (page: 'brand-dna' | 'schedule' | 'content') => void
  onScheduleUpdate: (schedules: Schedule[]) => void
}

type ScheduleType = 'campaign' | 'event' | 'regular'

const TYPE_META: Record<ScheduleType, { label: string; color: string; bg: string }> = {
  campaign: { label: '캠페인', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  event:    { label: '이벤트', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  regular:  { label: '일상',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
}

const emptyEdit = { name: '', startDate: '', endDate: '', date: '', description: '', keyMessage: '' }

export default function DashboardPage({ brand, schedules, userId, onNavigate, onScheduleUpdate }: Props) {
  const [expandedType, setExpandedType] = useState<ScheduleType | null>('campaign')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyEdit)

  const campaigns = schedules.filter((s) => s.type === 'campaign').slice().reverse()
  const events    = schedules.filter((s) => s.type === 'event')
  const regulars  = schedules.filter((s) => s.type === 'regular')

  const countMap: Record<ScheduleType, number> = {
    campaign: campaigns.length,
    event:    events.length,
    regular:  regulars.length,
  }
  const expandedList: Schedule[] =
    expandedType === 'campaign' ? campaigns
    : expandedType === 'event' ? events
    : expandedType === 'regular' ? regulars
    : []

  const goEdit = () => onNavigate('brand-dna')

  const toneList    = Array.isArray(brand?.tone)     ? brand.tone     : []
  const channelList = Array.isArray(brand?.channels) ? brand.channels : []
  const purposeList = Array.isArray(brand?.purpose)  ? brand.purpose  : []

  const syncSchedules = async (updated: Schedule[]) => {
    onScheduleUpdate(updated)
    localStorage.setItem('crispy_schedules', JSON.stringify(updated))
    if (userId) {
      await supabase
        .from('user_schedules')
        .upsert({ user_id: userId, schedules: updated, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    }
  }

  const handleEditStart = (s: Schedule) => {
    setEditingId(s.id)
    setEditForm({
      name: s.name,
      startDate: s.startDate ?? '',
      endDate: s.endDate ?? '',
      date: s.date ?? '',
      description: s.description,
      keyMessage: s.keyMessage ?? '',
    })
  }

  const handleEditSave = async (s: Schedule) => {
    const updated = schedules.map(item =>
      item.id === s.id
        ? {
            ...item,
            name: editForm.name || item.name,
            description: editForm.description,
            ...(item.type === 'campaign' && { startDate: editForm.startDate, endDate: editForm.endDate, keyMessage: editForm.keyMessage }),
            ...(item.type === 'event'    && { date: editForm.date }),
          }
        : item
    )
    await syncSchedules(updated)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    await syncSchedules(schedules.filter(s => s.id !== id))
  }

  const toggleExpand = (type: ScheduleType) => {
    setExpandedType(prev => prev === type ? null : type)
    setEditingId(null)
  }

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
      <div className="card mb-6">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h2 className="font-semibold text-slate-100">등록된 일정</h2>
          </div>
          <button
            onClick={() => onNavigate('schedule')}
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
          >
            일정 추가 →
          </button>
        </div>

        <div className="px-6 pb-5">
          {/* 카운트 박스 3개 */}
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(TYPE_META) as [ScheduleType, typeof TYPE_META[ScheduleType]][]).map(([type, meta]) => {
              const isActive = expandedType === type
              return (
                <button
                  key={type}
                  onClick={() => toggleExpand(type)}
                  className="rounded-xl py-4 text-center transition-all relative"
                  style={{
                    backgroundColor: meta.bg,
                    border: `2px solid ${isActive ? meta.color : 'transparent'}`,
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: meta.color }}>{countMap[type]}</p>
                  <p className="text-xs text-slate-400 mt-1">{meta.label}</p>
                  {countMap[type] > 0 && (
                    <span className="absolute top-2 right-2 opacity-50">
                      {isActive
                        ? <ChevronUp className="w-3 h-3" style={{ color: meta.color }} />
                        : <ChevronDown className="w-3 h-3" style={{ color: meta.color }} />
                      }
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 펼쳐진 일정 목록 */}
          {expandedType && (
            <div className="mt-4 space-y-2">
              {expandedList.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-3">등록된 일정이 없습니다</p>
                  <button
                    onClick={() => onNavigate('schedule')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + 일정 추가하기
                  </button>
                </div>
              ) : (
                expandedList.map(s => (
                  <ScheduleItem
                    key={s.id}
                    schedule={s}
                    isEditing={editingId === s.id}
                    editForm={editForm}
                    onEditForm={setEditForm}
                    onEditStart={() => handleEditStart(s)}
                    onSave={() => handleEditSave(s)}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(s.id)}
                  />
                ))
              )}
            </div>
          )}
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

// ─── ScheduleItem ─────────────────────────────────────────────────────────────

interface ScheduleItemProps {
  schedule: Schedule
  isEditing: boolean
  editForm: typeof emptyEdit
  onEditForm: (f: typeof emptyEdit) => void
  onEditStart: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
}

function ScheduleItem({ schedule: s, isEditing, editForm, onEditForm, onEditStart, onSave, onCancel, onDelete }: ScheduleItemProps) {
  const meta = TYPE_META[s.type]

  if (isEditing) {
    return (
      <div
        className="rounded-xl p-4 space-y-2.5"
        style={{ background: '#1e293b', border: `1px solid ${meta.color}50` }}
      >
        <input
          type="text"
          value={editForm.name}
          onChange={e => onEditForm({ ...editForm, name: e.target.value })}
          placeholder="이름"
          className="input-dark text-sm"
        />
        {s.type === 'campaign' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">시작일</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={e => onEditForm({ ...editForm, startDate: e.target.value })}
                  className="input-dark text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">종료일</label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={e => onEditForm({ ...editForm, endDate: e.target.value })}
                  className="input-dark text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
            <input
              type="text"
              value={editForm.keyMessage}
              onChange={e => onEditForm({ ...editForm, keyMessage: e.target.value })}
              placeholder="핵심 메시지"
              className="input-dark text-sm"
            />
          </>
        )}
        {s.type === 'event' && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">날짜</label>
            <input
              type="date"
              value={editForm.date}
              onChange={e => onEditForm({ ...editForm, date: e.target.value })}
              className="input-dark text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        )}
        <textarea
          value={editForm.description}
          onChange={e => onEditForm({ ...editForm, description: e.target.value })}
          placeholder="설명 (선택)"
          rows={2}
          className="input-dark text-sm resize-none"
        />
        <div className="flex gap-2 pt-1">
          <button
            onClick={onSave}
            disabled={!editForm.name.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-semibold btn-primary disabled:opacity-40"
          >
            저장
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors"
            style={{ border: '1px solid #334155' }}
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-4 flex justify-between items-start"
      style={{ background: '#1e293b', border: '1px solid #334155' }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-100 text-sm">{s.name}</p>
        {s.type === 'campaign' && s.startDate && (
          <p className="text-xs text-slate-500 mt-0.5">{s.startDate} ~ {s.endDate}</p>
        )}
        {s.type === 'event' && s.date && (
          <p className="text-xs text-slate-500 mt-0.5">{s.date}</p>
        )}
        {s.keyMessage && (
          <p className="text-xs mt-1 truncate" style={{ color: meta.color }}>"{s.keyMessage}"</p>
        )}
        {s.description && (
          <p className="text-xs text-slate-400 mt-1 truncate">{s.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <button
          onClick={onEditStart}
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 transition-colors"
          title="수정"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
          title="삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
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
