export type JobType = '1인창업자' | '프리랜서' | '소상공인' | '기타'

export type ToneType = '친근함' | '전문성' | '고급스러움' | '유머' | '감성'

export interface BrandDNA {
  brandName: string
  oneLiner: string
  products: string
  tone: ToneType
  target: string
  differentiator: string
  keyMessages: [string, string, string]
  jobType: JobType
  jobSpecificAnswers: Record<string, string>
}

export interface Schedule {
  id: string
  type: 'campaign' | 'event' | 'regular'
  name: string
  startDate?: string
  endDate?: string
  date?: string
  description: string
  keyMessage?: string
}

export interface GeneratedContent {
  blog: string
  instagram: string
}

export type Page = 'login' | 'signup' | 'onboarding' | 'brand-dna' | 'schedule' | 'dashboard' | 'content' | 'admin'
