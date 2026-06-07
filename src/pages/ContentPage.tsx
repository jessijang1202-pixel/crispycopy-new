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
    setLoading(true)
    setError('')
    setContent(null)
    setApproved({ blog: false, instagram: false })
    try {
      const result = await generateContent(brand, selectedSchedule)
      setContent(result)
    } catch (e) {
      setError('콘텐츠 생성에 실패했습니다. API 키를 확인하거나 다시 시도해주세요.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoSend = async () => {
    if (!content) return
    const approvedChannels = []
    if (approved.blog) approvedChannels.push(`[블로그]\n${content.blog}`)
    if (approved.instagram) approvedChannels.push(`[인스타그램]\n${content.instagram}`)
    if (approvedChannels.length === 0) {
      alert('승인할 채널을 선택해주세요.')
      return
    }
    const text = `📋 CrispyCopy 콘텐츠 발송\n브랜드: ${brand.brandName}\n일정: ${selectedSchedule?.name}\n\n` + approvedChannels.join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      alert('클립보드 복사에 실패했습니다. 텍스트를 직접 복사해주세요.')
    }
  }

  const scheduleLabel = (s: Schedule) => {
    const typeLabel = s.type === 'campaign' ? '캠페인' : s.type === 'event' ? '이벤트' : '일상'
    const dateLabel = s.type === 'campaign' ? `${s.startDate}~${s.endDate}` : s.date || ''
    return `[${typeLabel}] ${s.name}${dateLabel ? ' · ' + dateLabel : ''}`
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">콘텐츠 생성</h1>

      {/* Schedule Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">일정 선택</label>
        {schedules.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 일정이 없습니다. 일정 관리에서 먼저 등록해주세요.</p>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
          >
            <option value="">일정을 선택하세요</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>{scheduleLabel(s)}</option>
            ))}
          </select>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedId || loading}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI가 콘텐츠를 작성하고 있습니다...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              콘텐츠 생성
            </>
          )}
        </button>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* Generated Content */}
      {content && (
        <div className="space-y-4">
          {/* Blog */}
          <ContentCard
            channel="블로그"
            channelColor="text-blue-600"
            channelBg="bg-blue-50"
            text={content.blog}
            approved={approved.blog}
            onApprove={(v) => setApproved((prev) => ({ ...prev, blog: v }))}
          />

          {/* Instagram */}
          <ContentCard
            channel="인스타그램"
            channelColor="text-pink-600"
            channelBg="bg-pink-50"
            text={content.instagram}
            approved={approved.instagram}
            onApprove={(v) => setApproved((prev) => ({ ...prev, instagram: v }))}
          />

          {/* KakaoTalk Send */}
          <button
            onClick={handleKakaoSend}
            disabled={!approved.blog && !approved.instagram}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 font-bold rounded-2xl transition-colors"
          >
            {copied ? (
              <>
                <CheckCheck className="w-4 h-4" />
                클립보드에 복사되었습니다!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                카톡으로 발송 (클립보드 복사)
              </>
            )}
          </button>
          {(!approved.blog && !approved.instagram) && (
            <p className="text-center text-xs text-gray-400">최소 1개 채널을 승인해야 발송할 수 있습니다.</p>
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
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${approved ? 'border-green-300' : 'border-gray-100'} overflow-hidden transition-colors`}>
      <div className={`${channelBg} px-6 py-3 flex items-center justify-between`}>
        <span className={`font-semibold text-sm ${channelColor}`}>{channel}</span>
        <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 transition-colors">
          {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onApprove(!approved)}
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors cursor-pointer ${
              approved ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {approved && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-sm font-medium text-gray-700">승인</span>
        </label>
        {approved && (
          <span className="text-xs text-green-500 font-medium">발행 승인됨</span>
        )}
      </div>
    </div>
  )
}
