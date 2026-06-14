import { useState } from 'react'
import { Sparkles, Check, Send, Loader2, Copy, CheckCheck, Pencil } from 'lucide-react'
import { generateContent } from '@/services/claudeService'
import { supabase } from '@/lib/supabase'
import type { BrandDNA, GeneratedContent, Schedule } from '@/types'

interface Props {
  userId?: string
  brand: BrandDNA
  schedules: Schedule[]
}

const CHANNEL_COLORS: Record<string, { color: string; bg: string }> = {
  '네이버 블로그': { color: '#22c55e',  bg: 'rgba(34,197,94,0.1)' },
  '인스타그램':   { color: '#f472b6',  bg: 'rgba(244,114,182,0.1)' },
  '카카오톡':     { color: '#fbbf24',  bg: 'rgba(251,191,36,0.1)' },
  '당근':         { color: '#f97316',  bg: 'rgba(249,115,22,0.1)' },
  '스레드':       { color: '#a78bfa',  bg: 'rgba(167,139,250,0.1)' },
  '기타':         { color: '#60a5fa',  bg: 'rgba(59,130,246,0.1)' },
}
const DEFAULT_COLOR = { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' }
const DEFAULT_CHANNELS = ['네이버 블로그', '인스타그램']

export default function ContentPage({ userId, brand, schedules }: Props) {
  const availableChannels =
    Array.isArray(brand.channels) && brand.channels.length > 0
      ? brand.channels
      : DEFAULT_CHANNELS

  const [selectedId, setSelectedId] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>(availableChannels)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<GeneratedContent | null>(null)       // AI 원본
  const [editedContent, setEditedContent] = useState<Record<string, string>>({}) // 사용자 수정본
  const [error, setError] = useState('')
  const [approved, setApproved] = useState<Record<string, boolean>>({})
  const [allCopied, setAllCopied] = useState(false)

  const selectedSchedule = schedules.find((s) => s.id === selectedId)

  const toggleChannel = (ch: string) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    )
    setContent(null)
    setEditedContent({})
  }

  const handleGenerate = async () => {
    if (!selectedSchedule || selectedChannels.length === 0) return
    setLoading(true)
    setError('')
    setContent(null)
    setEditedContent({})
    setApproved({})
    try {
      const result = await generateContent(brand, selectedSchedule, selectedChannels, userId)
      setContent(result)
      const init: Record<string, boolean> = {}
      selectedChannels.forEach(ch => { init[ch] = false })
      setApproved(init)
    } catch (e) {
      setError(`오류: ${e instanceof Error ? e.message : String(e)}`)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (channel: string, newText: string) => {
    if (!content || !selectedSchedule) return
    const original = content[channel] ?? ''
    const prevText = editedContent[channel] ?? original

    // 편집 내역 저장
    setEditedContent(prev => ({ ...prev, [channel]: newText }))

    // 수정 로그 기록
    const log = {
      channel,
      schedule_name: selectedSchedule.name,
      brand_name: brand.brandName,
      original_content: prevText,
      edited_content: newText,
      created_at: new Date().toISOString(),
    }
    const stored: object[] = JSON.parse(localStorage.getItem('crispy_edit_logs') ?? '[]')
    stored.push(log)
    localStorage.setItem('crispy_edit_logs', JSON.stringify(stored.slice(-200)))

    if (userId) {
      supabase.from('content_edits').insert({ user_id: userId, ...log }).then(() => {})
    }
  }

  const handleCopyAll = async () => {
    if (!content || !selectedSchedule) return
    const approvedChannels = selectedChannels.filter(ch => approved[ch])
    if (approvedChannels.length === 0) { alert('승인할 채널을 선택해주세요.'); return }
    const parts = approvedChannels.map(ch => {
      const text = editedContent[ch] ?? content[ch] ?? ''
      return `[${ch}]\n${text}`
    })
    const text = `📋 CrispyCopy 콘텐츠\n브랜드: ${brand.brandName}\n일정: ${selectedSchedule.name}\n\n` + parts.join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setAllCopied(true)
      setTimeout(() => setAllCopied(false), 3000)
    } catch {
      alert('클립보드 복사에 실패했습니다.')
    }
  }

  const scheduleLabel = (s: Schedule) => {
    const t = s.type === 'campaign' ? '캠페인' : s.type === 'event' ? '이벤트' : '일상'
    const d = s.type === 'campaign' ? `${s.startDate}~${s.endDate}` : s.date || ''
    return `[${t}] ${s.name}${d ? ' · ' + d : ''}`
  }

  const anyApproved = selectedChannels.some(ch => approved[ch])

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold gradient-text mb-6">콘텐츠 생성</h1>

      <div className="card p-6 mb-6">
        {/* 일정 선택 */}
        <label className="block text-sm font-semibold text-slate-300 mb-3">일정 선택</label>
        {schedules.length === 0 ? (
          <p className="text-sm text-slate-500 mb-5">등록된 일정이 없습니다. 일정 관리에서 먼저 등록해주세요.</p>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setContent(null); setEditedContent({}) }}
            className="input-dark mb-6"
          >
            <option value="">일정을 선택하세요</option>
            {schedules.map((s) => <option key={s.id} value={s.id}>{scheduleLabel(s)}</option>)}
          </select>
        )}

        {/* 채널 선택 */}
        <label className="block text-sm font-semibold text-slate-300 mb-1">채널 선택</label>
        <p className="text-xs text-slate-500 mb-3">생성할 채널을 선택하세요 · 복수 선택 가능</p>
        <div className="space-y-2 mb-6">
          {availableChannels.map(ch => {
            const c = CHANNEL_COLORS[ch] ?? DEFAULT_COLOR
            const checked = selectedChannels.includes(ch)
            return (
              <label
                key={ch}
                className="flex items-center gap-3 cursor-pointer py-2.5 px-4 rounded-xl transition-all"
                style={{
                  backgroundColor: checked ? c.bg : 'transparent',
                  border: `1px solid ${checked ? c.color + '50' : '#334155'}`,
                }}
                onClick={() => toggleChannel(ch)}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: checked ? c.color : 'transparent',
                    border: checked ? 'none' : '2px solid #475569',
                  }}
                >
                  {checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium" style={{ color: checked ? c.color : '#94a3b8' }}>
                  {ch}
                </span>
              </label>
            )
          })}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedId || loading || selectedChannels.length === 0}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />AI가 콘텐츠를 작성하고 있습니다...</>
            : <><Sparkles className="w-4 h-4" />콘텐츠 생성</>
          }
        </button>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {/* 생성된 콘텐츠 */}
      {content && (
        <div className="space-y-4">
          {selectedChannels.map(ch => (
            <ContentCard
              key={ch}
              channel={ch}
              text={editedContent[ch] ?? content[ch] ?? ''}
              originalText={content[ch] ?? ''}
              approved={!!approved[ch]}
              onApprove={(v) => setApproved(prev => ({ ...prev, [ch]: v }))}
              onEdit={(newText) => handleEdit(ch, newText)}
            />
          ))}

          <button
            onClick={handleCopyAll}
            disabled={!anyApproved}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all"
            style={{
              backgroundColor: '#fbbf24',
              color: '#78350f',
              opacity: anyApproved ? 1 : 0.4,
              cursor: anyApproved ? 'pointer' : 'not-allowed',
            }}
          >
            {allCopied
              ? <><CheckCheck className="w-4 h-4" />클립보드에 복사되었습니다!</>
              : <><Send className="w-4 h-4" />승인된 채널 복사</>
            }
          </button>
          {!anyApproved && (
            <p className="text-center text-xs text-slate-600">최소 1개 채널을 승인해야 복사할 수 있습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ContentCard ─────────────────────────────────────────────────────────────

interface ContentCardProps {
  channel: string
  text: string
  originalText: string
  approved: boolean
  onApprove: (v: boolean) => void
  onEdit: (newText: string) => void
}

function ContentCard({ channel, text, originalText, approved, onApprove, onEdit }: ContentCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [copied, setCopied] = useState(false)
  const isModified = text !== originalText
  const c = CHANNEL_COLORS[channel] ?? DEFAULT_COLOR

  const handleStartEdit = () => {
    setDraft(text)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (draft.trim() && draft !== text) {
      onEdit(draft)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(text)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ border: approved ? '1px solid #22c55e' : '1px solid #334155', backgroundColor: '#1e293b' }}
    >
      {/* 헤더 */}
      <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: c.bg }}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: c.color }}>{channel}</span>
          {isModified && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              수정됨
            </span>
          )}
        </div>
        {!isEditing && (
          <button onClick={handleCopy} className="text-slate-500 hover:text-slate-300 transition-colors">
            {copied
              ? <CheckCheck className="w-4 h-4" style={{ color: '#22c55e' }} />
              : <Copy className="w-4 h-4" />
            }
          </button>
        )}
      </div>

      {/* 본문 */}
      <div className="p-6">
        {isEditing ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="input-dark resize-y w-full"
            style={{ minHeight: '160px' }}
            autoFocus
          />
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
        )}
      </div>

      {/* 푸터 */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid #334155' }}>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-xl text-sm font-semibold btn-primary"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 rounded-xl text-sm text-slate-400 transition-colors hover:text-slate-200"
              style={{ border: '1px solid #334155' }}
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* 승인 */}
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => onApprove(!approved)}>
              <div
                className="w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{
                  background: approved ? 'linear-gradient(135deg, #3b82f6, #22c55e)' : 'transparent',
                  border: approved ? 'none' : '2px solid #475569',
                }}
              >
                {approved && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-slate-300">승인</span>
            </label>

            <div className="flex items-center gap-3">
              {approved && (
                <span className="text-xs font-medium" style={{ color: '#22c55e' }}>발행 승인됨</span>
              )}
              {/* 수정 버튼 */}
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-blue-400"
                style={{ border: '1px solid #334155', color: '#64748b' }}
              >
                <Pencil className="w-3 h-3" />수정
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
