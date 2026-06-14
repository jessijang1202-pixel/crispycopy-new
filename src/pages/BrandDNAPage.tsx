import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Sparkles, Dna } from 'lucide-react'
import type { BrandDNA } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  userId?: string
  initialData?: BrandDNA
  onComplete: (data: BrandDNA) => void
}

const USER_TYPE_OPTIONS = [
  { value: '1인창업가', label: '1인 창업가', desc: '나만의 브랜드로 창업한 대표' },
  { value: '프리랜서', label: '프리랜서', desc: '전문 기술로 일하는 개인' },
  { value: '소상공인', label: '소상공인', desc: '오프라인·온라인 매장 운영자' },
  { value: '기타', label: '기타', desc: '그 외 개인·단체 운영자' },
]
const PURPOSE_OPTIONS = ['정기 콘텐츠 발행', '이벤트/캠페인 홍보', '상품/서비스 판매', '브랜드 홍보', '아직 잘 모르겠어요']
const TONE_OPTIONS = ['친근한', '전문적인', '따뜻한', '믿음직한', '트렌디한', '유쾌한', '차분한']
const CHANNEL_OPTIONS = ['네이버 블로그', '인스타그램', '카카오톡', '당근', '스레드', '기타']
const OPERATION_OPTIONS = [
  { value: '정기', label: '평소에도 정기적으로 콘텐츠가 필요해요' },
  { value: '이벤트', label: '이벤트/캠페인 때만 필요해요' },
  { value: '둘다', label: '둘 다 필요해요' },
]

interface FormState {
  userType: string
  purpose: string[]
  brandName: string
  industry: string
  oneLiner: string
  target: string
  products: string
  tone: string[]
  toneCustom: string
  brandFeeling: string
  strengths: string
  prohibitedWords: string
  channels: string[]
  operationStyle: string
}

const INITIAL: FormState = {
  userType: '', purpose: [],
  brandName: '', industry: '', oneLiner: '', target: '',
  products: '', tone: [], toneCustom: '', brandFeeling: '', strengths: '', prohibitedWords: '',
  channels: [], operationStyle: '',
}

type SetFn = (key: keyof FormState, value: string | string[]) => void
type ToggleFn = (key: keyof FormState, value: string) => void

interface StepProps {
  form: FormState
  set: SetFn
  toggle: ToggleFn
}

function toFormState(dna: BrandDNA): FormState {
  const knownTones = new Set(TONE_OPTIONS)
  return {
    userType: dna.userType || '',
    purpose: Array.isArray(dna.purpose) ? dna.purpose : [],
    brandName: dna.brandName || '',
    industry: dna.industry || '',
    oneLiner: dna.oneLiner || '',
    target: dna.target || '',
    products: dna.products || '',
    tone: Array.isArray(dna.tone) ? dna.tone.filter(t => knownTones.has(t)) : [],
    toneCustom: Array.isArray(dna.tone) ? dna.tone.filter(t => !knownTones.has(t)).join(', ') : '',
    brandFeeling: dna.brandFeeling || '',
    strengths: dna.strengths || '',
    prohibitedWords: dna.prohibitedWords || '',
    channels: Array.isArray(dna.channels) ? dna.channels : [],
    operationStyle: dna.operationStyle || '',
  }
}

export default function BrandDNAPage({ userId, initialData, onComplete }: Props) {
  const [step, setStep] = useState(1) // 1–4 = 입력 단계, 5 = 요약 화면
  const [form, setForm] = useState<FormState>(() => initialData ? toFormState(initialData) : INITIAL)
  const [saving, setSaving] = useState(false)

  const set: SetFn = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const toggle: ToggleFn = (key, value) => {
    const arr = form[key] as string[]
    set(key, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  const canNext = () => {
    if (step === 1) return !!form.userType && form.purpose.length > 0
    if (step === 2) return !!form.brandName && !!form.industry && !!form.oneLiner && !!form.target
    return true
  }

  const buildDNA = (): BrandDNA => ({
    userType: form.userType as BrandDNA['userType'],
    purpose: form.purpose,
    brandName: form.brandName,
    industry: form.industry,
    oneLiner: form.oneLiner,
    target: form.target,
    products: form.products,
    tone: form.toneCustom ? [...form.tone, form.toneCustom] : form.tone,
    brandFeeling: form.brandFeeling,
    strengths: form.strengths,
    prohibitedWords: form.prohibitedWords,
    channels: form.channels,
    operationStyle: form.operationStyle as BrandDNA['operationStyle'],
  })

  const saveDNA = async (dna: BrandDNA) => {
    localStorage.setItem('crispy_brand', JSON.stringify(dna))
    if (userId) {
      await supabase.from('brand_dna').upsert(
        { user_id: userId, data: dna, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    }
  }

  const handleNext = async () => {
    if (step === 2) {
      // 1차 필수 항목 즉시 저장
      await saveDNA(buildDNA())
      setStep(3)
    } else if (step < 4) {
      setStep(prev => prev + 1)
    } else {
      setSaving(true)
      await saveDNA(buildDNA())
      setSaving(false)
      setStep(5)
    }
  }

  const handleSkip = async () => {
    if (step === 3) {
      setStep(4)
    } else {
      setSaving(true)
      await saveDNA(buildDNA())
      setSaving(false)
      setStep(5)
    }
  }

  const progress = Math.min((step / 4) * 100, 100)

  if (step === 5) {
    return <SummaryCard dna={buildDNA()} onDone={() => onComplete(buildDNA())} />
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-lg mx-auto">

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dna className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold gradient-text">브랜드 DNA 등록</h1>
          </div>
          <p className="text-slate-500 text-sm">AI가 여러분의 브랜드를 기억합니다</p>
        </div>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">Step {step} / 4</span>
            <span className="text-xs font-medium" style={{ color: '#60a5fa' }}>{Math.round(progress)}% 완료</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(to right, #3b82f6, #22c55e)' }}
            />
          </div>
          {step >= 3 && (
            <p className="text-xs text-center mt-2" style={{ color: '#818cf8' }}>
              ✨ 브랜드를 더 잘 기억하게 하려면 1분만 더 입력해주세요
            </p>
          )}
        </div>

        {/* 단계별 콘텐츠 */}
        <div className="card p-6 mb-4">
          {step === 1 && <Step1 form={form} set={set} toggle={toggle} />}
          {step === 2 && <Step2 form={form} set={set} toggle={toggle} />}
          {step === 3 && <Step3 form={form} set={set} toggle={toggle} />}
          {step === 4 && <Step4 form={form} set={set} toggle={toggle} />}
        </div>

        {/* 네비게이션 */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 transition-colors hover:text-slate-200"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            >
              <ChevronLeft className="w-4 h-4" />이전
            </button>
          )}
          {(step === 3 || step === 4) && (
            <button
              onClick={handleSkip}
              className="flex-1 py-2.5 rounded-xl text-sm transition-colors hover:text-slate-300"
              style={{ border: '1px solid #334155', color: '#64748b' }}
            >
              건너뛰기
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canNext() || saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-primary"
            style={{ opacity: canNext() && !saving ? 1 : 0.4 }}
          >
            {saving
              ? '저장 중...'
              : step === 4
                ? <><Sparkles className="w-4 h-4" />완료</>
                : <>다음 <ChevronRight className="w-4 h-4" /></>
            }
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Step 1: 사용자 정보 ───────────────────────────────────────────────────

function Step1({ form, set, toggle }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle
          title="어떤 형태로 활동하고 계신가요?"
          help="사용자 유형에 맞는 콘텐츠 스타일을 추천해드려요"
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          {USER_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => set('userType', opt.value)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                border: form.userType === opt.value ? '2px solid #3b82f6' : '1px solid #334155',
                backgroundColor: form.userType === opt.value ? 'rgba(59,130,246,0.1)' : '#0f172a',
              }}
            >
              <p className="font-semibold text-slate-100 text-sm">{opt.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle
          title="주로 어떤 목적으로 사용하실 건가요?"
          help="여러 개 선택 가능 · 목적에 맞게 콘텐츠 방향을 잡아드려요"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {PURPOSE_OPTIONS.map(opt => (
            <Chip
              key={opt}
              label={opt}
              selected={form.purpose.includes(opt)}
              onClick={() => toggle('purpose', opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: 브랜드 기본 정보 (1차 필수) ─────────────────────────────────

function Step2({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="브랜드 기본 정보를 알려주세요"
        help="AI가 브랜드를 이해하는 핵심 정보예요"
      />
      <Field label="브랜드명" help="고객에게 불리는 이름이면 돼요" required>
        <input
          value={form.brandName}
          onChange={e => set('brandName', e.target.value)}
          placeholder="예: 마켓올리브"
          className="input-dark"
        />
      </Field>
      <Field label="업종 또는 카테고리" help="어떤 분야인지 알면 콘텐츠 톤이 달라져요" required>
        <input
          value={form.industry}
          onChange={e => set('industry', e.target.value)}
          placeholder="예: 건강식품, 인테리어 디자인, 원데이 클래스"
          className="input-dark"
        />
      </Field>
      <Field label="브랜드 한 줄 소개" help="우리 브랜드를 한 문장으로 설명한다면?" required>
        <input
          value={form.oneLiner}
          onChange={e => set('oneLiner', e.target.value)}
          placeholder="예: 바쁜 직장인도 건강하게 먹을 수 있는 간편식"
          className="input-dark"
        />
      </Field>
      <Field label="주요 고객층" help="누구에게 말하는지 알아야 맞는 표현을 쓸 수 있어요" required>
        <input
          value={form.target}
          onChange={e => set('target', e.target.value)}
          placeholder="예: 30대 직장인 여성, 건강에 관심 있는 2인 가구"
          className="input-dark"
        />
      </Field>
    </div>
  )
}

// ─── Step 3: 브랜드 스타일 (2차 확장) ────────────────────────────────────

function Step3({ form, set, toggle }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="브랜드 스타일을 알려주세요"
        help="콘텐츠의 말투와 표현 기준을 정해요"
      />
      <Field label="주력 상품/서비스" help="AI가 구체적으로 뭘 판매하는지 알면 콘텐츠가 더 정확해져요">
        <input
          value={form.products}
          onChange={e => set('products', e.target.value)}
          placeholder="예: 영양사가 만든 간편 밀키트, 건강기능식품 구독"
          className="input-dark"
        />
      </Field>
      <Field label="브랜드 톤앤매너" help="여러 개 선택 가능 · 직접 입력도 할 수 있어요">
        <div className="flex flex-wrap gap-2 mb-2">
          {TONE_OPTIONS.map(t => (
            <Chip key={t} label={t} selected={form.tone.includes(t)} onClick={() => toggle('tone', t)} />
          ))}
        </div>
        <input
          value={form.toneCustom}
          onChange={e => set('toneCustom', e.target.value)}
          placeholder="직접 입력 (예: 감성적인, 도발적인)"
          className="input-dark"
        />
      </Field>
      <Field label="고객이 브랜드를 어떻게 느끼길 원하나요?" help="감정 기준으로 콘텐츠 방향을 잡아요">
        <input
          value={form.brandFeeling}
          onChange={e => set('brandFeeling', e.target.value)}
          placeholder="예: 믿을 수 있는, 주변 친구 같은, 편안한 전문가"
          className="input-dark"
        />
      </Field>
      <Field label="핵심 강점 2~3가지" help="경쟁사와 다른 점, 고객이 좋아하는 이유예요">
        <textarea
          value={form.strengths}
          onChange={e => set('strengths', e.target.value)}
          placeholder="예: 국내산 재료만 사용 / 영양사 직접 설계 / 3일 이내 배송"
          rows={2}
          className="input-dark resize-none"
        />
      </Field>
      <Field label="피하고 싶은 표현 또는 금지어" help="이 표현들은 콘텐츠에서 절대 쓰지 않아요">
        <input
          value={form.prohibitedWords}
          onChange={e => set('prohibitedWords', e.target.value)}
          placeholder="예: 다이어트, 살빼기, 저렴한"
          className="input-dark"
        />
      </Field>
    </div>
  )
}

// ─── Step 4: 운영 방식 (2차 확장) ────────────────────────────────────────

function Step4({ form, set, toggle }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="콘텐츠 운영 방식을 알려주세요"
        help="어떤 채널에서 어떻게 쓸지 알면 더 맞는 형식으로 만들어드려요"
      />
      <Field label="주로 사용할 채널" help="여러 개 선택 가능">
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map(c => (
            <Chip key={c} label={c} selected={form.channels.includes(c)} onClick={() => toggle('channels', c)} />
          ))}
        </div>
      </Field>
      <Field label="콘텐츠 운영 방식" help="일상 발행과 이벤트성 발행 중 어떤 게 더 필요한가요?">
        <div className="space-y-2 mt-1">
          {OPERATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => set('operationStyle', opt.value)}
              className="w-full p-3.5 rounded-xl text-left text-sm transition-all"
              style={{
                border: form.operationStyle === opt.value ? '2px solid #3b82f6' : '1px solid #334155',
                backgroundColor: form.operationStyle === opt.value ? 'rgba(59,130,246,0.1)' : '#0f172a',
                color: form.operationStyle === opt.value ? '#60a5fa' : '#94a3b8',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

// ─── 완료 요약 카드 ───────────────────────────────────────────────────────

function SummaryCard({ dna, onDone }: { dna: BrandDNA; onDone: () => void }) {
  const toneList = Array.isArray(dna.tone) ? dna.tone : []
  const channelList = Array.isArray(dna.channels) ? dna.channels : []

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}
          >
            <Check className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">브랜드 DNA 등록 완료!</h2>
          <p className="text-slate-500 text-sm mt-1">AI가 이제 여러분의 브랜드를 기억합니다</p>
        </div>

        <div className="card p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{dna.brandName}</h3>
              <p className="text-sm text-slate-400 mt-0.5">{dna.industry}</p>
            </div>
            {dna.userType && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
              >
                {dna.userType}
              </span>
            )}
          </div>

          <p
            className="text-sm text-slate-300 pb-4 mb-4 italic"
            style={{ borderBottom: '1px solid #334155' }}
          >
            "{dna.oneLiner}"
          </p>

          <div className="space-y-4">
            <DNARow label="타겟 고객" value={dna.target} />
            {dna.products && <DNARow label="주력 상품/서비스" value={dna.products} />}
            {dna.strengths && <DNARow label="핵심 강점" value={dna.strengths} />}
            {toneList.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">톤앤매너</p>
                <div className="flex flex-wrap gap-1.5">
                  {toneList.map(t => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        color: '#4ade80',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {channelList.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">운영 채널</p>
                <div className="flex flex-wrap gap-1.5">
                  {channelList.map(c => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(139,92,246,0.1)',
                        color: '#c084fc',
                        border: '1px solid rgba(139,92,246,0.2)',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dna.operationStyle && (
              <DNARow
                label="운영 방식"
                value={dna.operationStyle === '정기' ? '정기 콘텐츠 발행' : dna.operationStyle === '이벤트' ? '이벤트/캠페인 중심' : '정기 + 이벤트 병행'}
              />
            )}
          </div>
        </div>

        <button
          onClick={onDone}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <Sparkles className="w-4 h-4" />대시보드로 이동
        </button>
      </div>
    </div>
  )
}

// ─── 공통 컴포넌트 ────────────────────────────────────────────────────────

function SectionTitle({ title, help }: { title: string; help: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      <p className="text-xs text-slate-500 mt-1">{help}</p>
    </div>
  )
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        backgroundColor: selected ? 'rgba(59,130,246,0.15)' : '#0f172a',
        border: `1px solid ${selected ? '#3b82f6' : '#334155'}`,
        color: selected ? '#60a5fa' : '#94a3b8',
      }}
    >
      {label}
    </button>
  )
}

function Field({
  label,
  help,
  required,
  children,
}: {
  label: string
  help?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label}
        {required && <span className="text-blue-400 ml-1">*</span>}
      </label>
      {help && <p className="text-xs text-slate-500 mb-2">{help}</p>}
      {children}
    </div>
  )
}

function DNARow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-300 mt-0.5">{value}</p>
    </div>
  )
}
