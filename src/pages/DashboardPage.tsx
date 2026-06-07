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
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Brand DNA Card */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 cursor-pointer hover:border-orange-200 transition-colors"
        onClick={() => onNavigate('brand-dna')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brand ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            )}
            <div>
              <h2 className="font-semibold text-gray-900">브랜드 DNA</h2>
              {brand ? (
                <p className="text-sm text-gray-500 mt-0.5">
                  {brand.brandName} · {brand.tone} · {brand.jobType}
                </p>
              ) : (
                <p className="text-sm text-orange-500 mt-0.5">등록이 필요합니다</p>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>

        {brand && (
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">타겟</p>
              <p className="text-xs font-medium text-gray-700 mt-0.5 line-clamp-1">{brand.target}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">차별점</p>
              <p className="text-xs font-medium text-gray-700 mt-0.5 line-clamp-1">{brand.differentiator}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">메시지</p>
              <p className="text-xs font-medium text-gray-700 mt-0.5 line-clamp-1">{brand.keyMessages[0]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Card */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 cursor-pointer hover:border-orange-200 transition-colors"
        onClick={() => onNavigate('schedule')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900">등록된 일정</h2>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-orange-50 rounded-xl py-3">
            <p className="text-2xl font-bold text-orange-500">{campaignCount}</p>
            <p className="text-xs text-gray-500 mt-1">캠페인</p>
          </div>
          <div className="bg-blue-50 rounded-xl py-3">
            <p className="text-2xl font-bold text-blue-500">{eventCount}</p>
            <p className="text-xs text-gray-500 mt-1">이벤트</p>
          </div>
          <div className="bg-green-50 rounded-xl py-3">
            <p className="text-2xl font-bold text-green-500">{regularCount}</p>
            <p className="text-xs text-gray-500 mt-1">일상</p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => onNavigate('content')}
        disabled={!brand}
        className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base transition-colors shadow-md"
      >
        <Sparkles className="w-5 h-5" />
        콘텐츠 생성하기
      </button>
      {!brand && (
        <p className="text-center text-xs text-gray-400 mt-2">
          브랜드 DNA를 먼저 등록해주세요.
        </p>
      )}
    </div>
  )
}
