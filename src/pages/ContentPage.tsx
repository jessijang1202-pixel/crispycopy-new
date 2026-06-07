import { useState } from 'react'
import { Sparkles, Check, Send, Loader2, Copy, CheckCheck } from 'lucide-react'
import { generateContent } from '@/services/claudeService'
import type { BrandDNA, GeneratedContent, Schedule } from '@/types'

interface Props {
  brand: BrandDNA
  schedules: Schedule[]
}

export default function ContentPage({ brand, schedules }: Props) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState('')
  const [approved, setApproved] = useState({ blog: false, instagram: false })
  const [copied, setCopied] = useState(false)

  const selectedSchedule = schedules.find((s) => s.id === selectedId)

  const handleGenerate = async () => {
    if (!selectedSchedule) return
    setLoading(true); setError(''); setContent(null); setApproved({ blog: false, instagram: false })
    try {
      setContent(await generateContent(brand, selectedSchedule))
    } catch (e) {
      setError('콘텐츠 생성에 실패했습니다. API 키를 확인하거나 다시 시도해주세요.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoSend = async () => {
    if (!content) return
    const parts = []
    if (approved.blog) parts.push(`[블로그]\n${content.blog}`)
    if (approved.instagram) parts.push(`[인스타그램]\n${content.instagram}`)
    if (parts.length === 0) { alert('승인할 채널을 선택해주세요.'); return }
    const text = `📋 CrispyCopy 콘텐츠 발송\n브랜드: ${brand.brandName}\n일정: ${selectedSchedule?.name}\n\n` + parts.join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 3000)
    } catch {
      alert('클립보드 복사에 실패했습니다.')
    }
  }

  const scheduleLabel = (s: Schedule) => {
    const t = s.type === 'campaign' ? '캠페인' : s.type === 'event' ? '이벤트' : '일상'
    const d = s.type === 'campaign' ? `${s.startDate}~${s.endDate}` : s.date || ''
    return `[${t}] ${s.name}${d ? ' · ' + d : ''}`
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold gradient-text mb-6">콘텐츠 생성</h1>

      {/* Schedule Selector */}
      <div className="card p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-300 mb-3">일정 선택</label>
        {schedules.length === 0 ? (
          <p className="text-sm text-slate-500">등록된 일정이 없습니다. 일정 관리에서 먼저 등록해주세요.</p>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="input-dark"
            style={{ cursor: 'pointer' }}
          >
            <option value="">일정을 선택하세요</option>
            {schedules.map((s) => <option key={s.id} value={s.id}>{scheduleLabel(s)}</option>)}
          </select>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedId || loading}
          className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />AI가 콘텐츠를 작성하고 있습니다...</> : <><Sparkles className="w-4 h-4" />콘텐츠 생성</>}
        </button>

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {/* Generated Content */}
      {content && (
        <div className="space-y-4">
          <ContentCard channel="블로그" channelColor="#60a5fa" channelBg="rgba(59,130,246,0.1)" text={content.blog} approved={approved.blog} onApprove={(v) => setApproved((p) => ({ ...p, blog: v }))} />
          <ContentCard channel="인스타그램" channelColor="#f472b6" channelBg="rgba(244,114,182,0.1)" text={content.instagram} approved={approved.instagram} onApprove={(v) => setApproved((p) => ({ ...p, instagram: v }))} />

          <button
            onClick={handleKakaoSend}
            disabled={!approved.blog && !approved.instagram}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all"
            style={{ backgroundColor: '#fbbf24', color: '#78350f', opacity: (!approved.blog && !approved.instagram) ? 0.4 : 1, cursor: (!approved.blog && !approved.instagram) ? 'not-allowed' : 'pointer' }}
          >
            {copied ? <><CheckCheck className="w-4 h-4" />클립보드에 복사되었습니다!</> : <><Send className="w-4 h-4" />카톡으로 발송 (클립보드 복사)</>}
          </button>
          {(!approved.blog && !approved.instagram) && (
            <p className="text-center text-xs text-slate-600">최소 1개 채널을 승인해야 발송할 수 있습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

interface ContentCardProps {
  channel: string
  channelColor: string
  channelBg: string
  text: string
  approved: boolean
  onApprove: (v: boolean) => void
}

function ContentCard({ channel, channelColor, channelBg, text, approved, onApprove }: ContentCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        border: approved ? '1px solid #22c55e' : '1px solid #334155',
        backgroundColor: '#1e293b',
      }}
    >
      <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: channelBg }}>
        <span className="font-semibold text-sm" style={{ color: channelColor }}>{channel}</span>
        <button onClick={handleCopy} className="text-slate-500 hover:text-slate-300 transition-colors">
          {copied ? <CheckCheck className="w-4 h-4" style={{ color: '#22c55e' }} /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-6">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #334155' }}>
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
        {approved && <span className="text-xs font-medium" style={{ color: '#22c55e' }}>발행 승인됨</span>}
      </div>
    </div>
  )
}
