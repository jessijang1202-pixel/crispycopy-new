export type UserType = '1인창업가' | '프리랜서' | '소상공인' | '기타'
export type OperationStyle = '정기' | '이벤트' | '둘다' | ''

export interface BrandDNA {
  userType: UserType
  purpose: string[]
  brandName: string
  industry: string
  oneLiner: string
  target: string
  products: string
  tone: string[]
  brandFeeling: string
  strengths: string
  prohibitedWords: string
  channels: string[]
  operationStyle: OperationStyle
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

export type GeneratedContent = Record<string, string>

export type Page = 'login' | 'signup' | 'onboarding' | 'brand-dna' | 'schedule' | 'dashboard' | 'content' | 'admin'
