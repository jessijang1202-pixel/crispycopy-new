import { GoogleGenAI } from '@google/genai'
import type { BrandDNA, GeneratedContent, Schedule } from '@/types'
import { supabase } from '@/lib/supabase'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

function extractString(val: unknown): string {
  if (typeof val === 'string') return val
  if (val && typeof val === 'object') {
    const o = val as Record<string, unknown>
    const text = o.caption ?? o.text ?? o.content ?? o.body ?? Object.values(o)[0]
    return typeof text === 'string' ? text : JSON.stringify(val)
  }
  return String(val ?? '')
}

const CHANNEL_GUIDE: Record<string, string> = {
  '네이버 블로그': '블로그 본문 (500자 내외, 전문성 강조, 소제목 활용, 구체적 정보 포함)',
  '인스타그램': '인스타그램 캡션 (감성적 표현, 관련 해시태그 10개 포함)',
  '카카오톡': '카카오톡 채널 메시지 (짧고 친근하게 3~5문장, 이모지 활용)',
  '당근': '당근마켓 게시글 (지역 친화적, 이웃 느낌, 150자 내외)',
  '스레드': '스레드 게시글 (간결하게 2~3문장, 해시태그 3개)',
  '기타': 'SNS 게시글 (200자 내외, 핵심 메시지 중심)',
}

const MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']

export async function generateContent(
  brand: BrandDNA,
  schedule: Schedule,
  selectedChannels: string[],
  userId?: string
): Promise<GeneratedContent> {
  const dateLabel =
    schedule.type === 'campaign'
      ? `${schedule.startDate} ~ ${schedule.endDate}`
      : schedule.date || '일상 콘텐츠'

  const toneDisplay = Array.isArray(brand.tone) ? brand.tone.join(', ') : String(brand.tone || '미입력')

  const channelInstructions = selectedChannels
    .map(ch => `  "${ch}": "${CHANNEL_GUIDE[ch] ?? 'SNS 게시글 (200자 내외)'}"`)
    .join(',\n')

  const prompt = `당신은 SNS 마케팅 전문가입니다. 아래 브랜드 정보와 일정을 바탕으로 채널별 콘텐츠를 작성합니다.

[브랜드 DNA]
- 브랜드명: ${brand.brandName}
- 업종: ${brand.industry || '미입력'}
- 한 줄 소개: ${brand.oneLiner}
- 주력 상품/서비스: ${brand.products || '미입력'}
- 톤앤매너: ${toneDisplay}
- 브랜드 느낌: ${brand.brandFeeling || '미입력'}
- 핵심 강점: ${brand.strengths || '미입력'}
- 금지 표현: ${brand.prohibitedWords || '없음'}
- 타겟 고객: ${brand.target}
- 운영 방식: ${brand.operationStyle || '미입력'}

[일정 정보]
- 종류: ${schedule.type === 'campaign' ? '캠페인' : schedule.type === 'event' ? '이벤트' : '일상'}
- 이름: ${schedule.name}
- 날짜: ${dateLabel}
- 핵심 메시지: ${schedule.keyMessage || schedule.description}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
모든 값은 반드시 하나의 문자열(string)이어야 합니다. 객체나 배열을 사용하지 마세요:
{
${channelInstructions}
}`

  let lastError: Error | null = null

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt })
      const text = response.text ?? '{}'
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('콘텐츠 생성 결과를 파싱할 수 없습니다.')
      const raw = JSON.parse(jsonMatch[0])
      const result: GeneratedContent = {}
      for (const ch of selectedChannels) {
        result[ch] = extractString(raw[ch])
      }
      if (userId) {
        supabase.from('content_logs').insert({ user_id: userId, schedule_name: schedule.name, model_used: model }).then(() => {})
      }
      return result
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('quota') || msg.includes('404') || msg.includes('NOT_FOUND')) {
        lastError = e instanceof Error ? e : new Error(msg)
        continue
      }
      throw e
    }
  }

  throw lastError ?? new Error('모든 모델에서 콘텐츠 생성에 실패했습니다.')
}
