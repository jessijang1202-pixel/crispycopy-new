import { GoogleGenAI } from '@google/genai'
import type { BrandDNA, GeneratedContent, Schedule } from '@/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// 과부하(503) 발생 시 다음 모델로 자동 전환
const MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']

export async function generateContent(
  brand: BrandDNA,
  schedule: Schedule
): Promise<GeneratedContent> {
  const dateLabel =
    schedule.type === 'campaign'
      ? `${schedule.startDate} ~ ${schedule.endDate}`
      : schedule.date || '일상 콘텐츠'

  const prompt = `당신은 SNS 마케팅 전문가입니다. 아래 브랜드 정보와 일정을 바탕으로 채널별 콘텐츠를 작성합니다.

[브랜드 DNA]
- 브랜드명: ${brand.brandName}
- 한 줄 설명: ${brand.oneLiner}
- 제품/서비스: ${brand.products}
- 톤: ${brand.tone}
- 타겟 고객: ${brand.target}
- 차별점: ${brand.differentiator}
- 주요 메시지: ${brand.keyMessages.join(', ')}
- 업종: ${brand.jobType}

[일정 정보]
- 종류: ${schedule.type === 'campaign' ? '캠페인' : schedule.type === 'event' ? '이벤트' : '일상'}
- 이름: ${schedule.name}
- 날짜: ${dateLabel}
- 핵심 메시지: ${schedule.keyMessage || schedule.description}

위 정보를 바탕으로 두 채널의 콘텐츠를 작성해주세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "blog": "블로그 콘텐츠 (500자 내외, 전문성 강조, 구체적인 정보 포함)",
  "instagram": "인스타그램 콘텐츠 (시각적 설명 포함, 관련 해시태그 10개 포함)"
}`

  let lastError: Error | null = null

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt })
      const text = response.text ?? '{}'
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('콘텐츠 생성 결과를 파싱할 수 없습니다.')
      return JSON.parse(jsonMatch[0]) as GeneratedContent
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      // 503(과부하), 429(한도 초과), 404(모델 없음)이면 다음 모델로 시도
      if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('quota') || msg.includes('404') || msg.includes('NOT_FOUND')) {
        lastError = e instanceof Error ? e : new Error(msg)
        continue
      }
      // 그 외 에러(404, 인증 실패 등)는 즉시 throw
      throw e
    }
  }

  throw lastError ?? new Error('모든 모델에서 콘텐츠 생성에 실패했습니다.')
}
