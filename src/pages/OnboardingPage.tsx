import { Sparkles, FileText, Calendar, Send } from 'lucide-react'

interface Props {
  onStart: () => void
}

export default function OnboardingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          CrispyCopy에 오신 걸 환영합니다
        </h1>
        <p className="text-lg text-gray-500 mb-12 leading-relaxed">
          브랜드 정보를 한 번 등록하면 AI가 매주<br />
          블로그·인스타그램 콘텐츠를 자동으로 만들어드립니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">브랜드 DNA 등록</h3>
            <p className="text-sm text-gray-500">브랜드 톤, 타겟, 차별점을 입력하면 AI가 브랜드 목소리를 기억합니다.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">일정 등록</h3>
            <p className="text-sm text-gray-500">캠페인, 이벤트, 일상 콘텐츠 일정을 등록하고 AI에게 전달합니다.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Send className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">콘텐츠 승인 & 발행</h3>
            <p className="text-sm text-gray-500">생성된 콘텐츠를 검토하고 승인하면 카톡으로 발송 준비가 완료됩니다.</p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-4 rounded-2xl text-lg transition-colors shadow-md"
        >
          시작하기 — 브랜드 DNA 등록
        </button>
      </div>
    </div>
  )
}
