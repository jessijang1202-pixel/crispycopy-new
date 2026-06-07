import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { BrandDNA, JobType, ToneType } from '@/types'

interface Props {
  onComplete: (data: BrandDNA) => void
}

const JOB_TYPES: { type: JobType; label: string; emoji: string; desc: string }[] = [
  { type: '1인창업자', label: '1인 창업자', emoji: '🚀', desc: '나만의 브랜드로 창업한 대표' },
  { type: '프리랜서', label: '프리랜서', emoji: '💻', desc: '전문 기술을 바탕으로 일하는 개인' },
  { type: '소상공인', label: '소상공인', emoji: '🏪', desc: '오프라인·온라인 매장 운영자' },
  { type: '기타', label: '기타', emoji: '✨', desc: '그 외 개인·단체 운영자' },
]

const TONES: ToneType[] = ['친근함', '전문성', '고급스러움', '유머', '감성']

const JOB_QUESTIONS: Record<JobType, { key: string; label: string; placeholder: string }[]> = {
  '1인창업자': [
    { key: 'founding_reason', label: '창업 계기', placeholder: '어떤 문제를 해결하고 싶어서 창업했나요?' },
    { key: 'success_case', label: '대표 성공 사례', placeholder: '고객에게 가장 좋은 반응을 얻은 사례를 알려주세요.' },
    { key: 'conversion_point', label: '고객 전환 포인트', placeholder: '처음 온 고객이 단골이 되는 이유는 무엇인가요?' },
    { key: 'personal_story', label: '개인 스토리', placeholder: '대표님만의 독특한 경험이나 스토리를 공유해주세요.' },
  ],
  '프리랜서': [
    { key: 'specialty', label: '전문 분야', placeholder: '어떤 분야에서 가장 두각을 나타내나요?' },
    { key: 'portfolio', label: '대표 작업물', placeholder: '가장 자랑스러운 작업물이나 프로젝트를 알려주세요.' },
    { key: 'work_process', label: '작업 프로세스', placeholder: '의뢰부터 납품까지 어떤 방식으로 진행하나요?' },
    { key: 'ideal_client', label: '선호 클라이언트', placeholder: '어떤 유형의 클라이언트와 일할 때 가장 좋은 결과가 나오나요?' },
  ],
  '소상공인': [
    { key: 'store_feature', label: '매장/서비스 특징', placeholder: '매장의 분위기나 특별한 특징이 있나요?' },
    { key: 'signature', label: '시그니처 상품/서비스', placeholder: '가장 인기 있는 상품이나 서비스는 무엇인가요?' },
    { key: 'regular_type', label: '단골 고객 유형', placeholder: '주로 어떤 유형의 고객이 단골이 되나요?' },
    { key: 'community', label: '지역 커뮤니티 활동', placeholder: '지역 사회와 어떻게 연결되어 있나요?' },
  ],
  '기타': [
    { key: 'industry_desc', label: '업종/활동 설명', placeholder: '어떤 분야에서 활동하고 계신가요?' },
    { key: 'main_activity', label: '주요 활동', placeholder: '주된 활동이나 서비스는 무엇인가요?' },
    { key: 'customer_touchpoint', label: '고객 접점', placeholder: '고객과 주로 어떤 방식으로 만나나요?' },
    { key: 'unique_experience', label: '차별 경험', placeholder: '경쟁자와 다른 특별한 경험을 제공하나요?' },
  ],
}

export default function BrandDNAPage({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [jobType, setJobType] = useState<JobType | null>(null)
  const [form, setForm] = useState({
    brandName: '', oneLiner: '', products: '', tone: '' as ToneType | '',
    target: '', differentiator: '', keyMessage1: '', keyMessage2: '', keyMessage3: '',
  })
  const [jobAnswers, setJobAnswers] = useState<Record<string, string>>({})

  const updateForm = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))
  const canProceedStep1 = jobType !== null
  const canProceedStep2 = form.brandName && form.oneLiner && form.products && form.tone &&
    form.target && form.differentiator && form.keyMessage1 && form.keyMessage2 && form.keyMessage3

  const handleComplete = () => {
    if (!jobType || !form.tone) return
    const data: BrandDNA = {
      brandName: form.brandName, oneLiner: form.oneLiner, products: form.products,
      tone: form.tone as ToneType, target: form.target, differentiator: form.differentiator,
      keyMessages: [form.keyMessage1, form.keyMessage2, form.keyMessage3],
      jobType, jobSpecificAnswers: jobAnswers,
    }
    localStorage.setItem('crispy_brand', JSON.stringify(data))
    onComplete(data)
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text">브랜드 DNA 등록</h1>
          <p className="text-slate-400 mt-1 text-sm">AI가 여러분의 브랜드를 기억합니다</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  background: step >= s ? 'linear-gradient(135deg, #3b82f6, #22c55e)' : '#1e293b',
                  color: step >= s ? 'white' : '#475569',
                  border: step >= s ? 'none' : '1px solid #334155',
                }}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className="w-16 h-0.5 transition-all" style={{ background: step > s ? 'linear-gradient(to right, #3b82f6, #22c55e)' : '#334155' }} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-6">업종을 선택해주세요</h2>
              <div className="grid grid-cols-2 gap-4">
                {JOB_TYPES.map((j) => (
                  <button
                    key={j.type}
                    onClick={() => setJobType(j.type)}
                    className="p-5 rounded-xl text-left transition-all"
                    style={{
                      border: jobType === j.type ? '2px solid #3b82f6' : '1px solid #334155',
                      backgroundColor: jobType === j.type ? 'rgba(59,130,246,0.1)' : '#0f172a',
                    }}
                  >
                    <div className="text-2xl mb-2">{j.emoji}</div>
                    <div className="font-semibold text-slate-100">{j.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{j.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-6">브랜드 기본 정보</h2>
              <div className="space-y-5">
                <Field label="브랜드명" required>
                  <input type="text" value={form.brandName} onChange={(e) => updateForm('brandName', e.target.value)} placeholder="예: 마켓올리브" className="input-dark" />
                </Field>
                <Field label="한 줄 설명 (타겟 고객이 느껴야 할 감정)" required>
                  <input type="text" value={form.oneLiner} onChange={(e) => updateForm('oneLiner', e.target.value)} placeholder="예: 바쁜 직장인도 건강하게 먹을 수 있다는 안도감" className="input-dark" />
                </Field>
                <Field label="주요 제품/서비스" required>
                  <input type="text" value={form.products} onChange={(e) => updateForm('products', e.target.value)} placeholder="예: 간편 건강식 밀키트, 영양제 구독 서비스" className="input-dark" />
                </Field>
                <Field label="브랜드 톤" required>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => updateForm('tone', t)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: form.tone === t ? 'linear-gradient(to right, #3b82f6, #22c55e)' : '#0f172a',
                          color: form.tone === t ? 'white' : '#94a3b8',
                          border: form.tone === t ? 'none' : '1px solid #334155',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="타겟 고객층" required>
                  <input type="text" value={form.target} onChange={(e) => updateForm('target', e.target.value)} placeholder="예: 30대 초반 직장인 여성, 건강에 관심 많은 2인 가구" className="input-dark" />
                </Field>
                <Field label="경쟁사 대비 차별점" required>
                  <input type="text" value={form.differentiator} onChange={(e) => updateForm('differentiator', e.target.value)} placeholder="예: 국내산 재료만 사용, 영양사가 직접 설계한 레시피" className="input-dark" />
                </Field>
                <Field label="주요 메시지 3가지" required>
                  <div className="space-y-2">
                    {(['keyMessage1', 'keyMessage2', 'keyMessage3'] as const).map((key, i) => (
                      <input key={key} type="text" value={form[key]} onChange={(e) => updateForm(key, e.target.value)} placeholder={`메시지 ${i + 1}`} className="input-dark" />
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && jobType && (
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                {JOB_TYPES.find((j) => j.type === jobType)?.label} 추가 정보
              </h2>
              <p className="text-sm text-slate-400 mb-6">더 정확한 콘텐츠 생성을 위한 질문입니다.</p>
              <div className="space-y-5">
                {JOB_QUESTIONS[jobType].map((q) => (
                  <Field key={q.key} label={q.label}>
                    <textarea
                      value={jobAnswers[q.key] || ''}
                      onChange={(e) => setJobAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                      placeholder={q.placeholder}
                      rows={2}
                      className="input-dark resize-none"
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6" style={{ borderTop: '1px solid #334155' }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 font-medium text-sm transition-colors"
                style={{ border: '1px solid #334155' }}
              >
                <ChevronLeft className="w-4 h-4" />이전
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                다음<ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                <Check className="w-4 h-4" />등록 완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span style={{ color: '#3b82f6' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
