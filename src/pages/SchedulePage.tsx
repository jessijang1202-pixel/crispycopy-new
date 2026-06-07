import { useState } from 'react'
import { Plus, Trash2, Calendar, Megaphone, Sun } from 'lucide-react'
import type { Schedule } from '@/types'

interface Props {
  schedules: Schedule[]
  onUpdate: (schedules: Schedule[]) => void
}

type TabType = 'campaign' | 'event' | 'regular'

const TABS: { type: TabType; label: string; icon: typeof Calendar }[] = [
  { type: 'campaign', label: '캠페인', icon: Megaphone },
  { type: 'event', label: '이벤트', icon: Calendar },
  { type: 'regular', label: '일상', icon: Sun },
]

const emptyForm = {
  name: '',
  startDate: '',
  endDate: '',
  date: '',
  description: '',
  keyMessage: '',
}

export default function SchedulePage({ schedules, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('campaign')
  const [form, setForm] = useState(emptyForm)

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleAdd = () => {
    if (!form.name) return
    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      type: activeTab,
      name: form.name,
      description: form.description,
      ...(activeTab === 'campaign' && { startDate: form.startDate, endDate: form.endDate, keyMessage: form.keyMessage }),
      ...(activeTab === 'event' && { date: form.date }),
    }
    const updated = [...schedules, newSchedule]
    onUpdate(updated)
    localStorage.setItem('crispy_schedules', JSON.stringify(updated))
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id)
    onUpdate(updated)
    localStorage.setItem('crispy_schedules', JSON.stringify(updated))
  }

  const filtered = schedules.filter((s) => s.type === activeTab)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">일정 관리</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {TABS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === type ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {activeTab === 'campaign' ? '캠페인' : activeTab === 'event' ? '이벤트' : '일상 콘텐츠'} 등록
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder={
              activeTab === 'campaign' ? '캠페인명 (예: 여름 신상품 출시)' :
              activeTab === 'event' ? '이벤트명 (예: 창업 1주년 기념)' :
              '콘텐츠 제목 (예: 브랜드 스토리 소개)'
            }
            className={inputClass}
          />

          {activeTab === 'campaign' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">시작일</label>
                <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">종료일</label>
                <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          {activeTab === 'event' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">날짜</label>
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className={inputClass} />
            </div>
          )}

          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="설명을 입력하세요"
            rows={2}
            className={`${inputClass} resize-none`}
          />

          {activeTab === 'campaign' && (
            <input
              type="text"
              value={form.keyMessage}
              onChange={(e) => update('keyMessage', e.target.value)}
              placeholder="핵심 메시지 (예: 이번 여름, 건강한 선택)"
              className={inputClass}
            />
          )}

          <button
            onClick={handleAdd}
            disabled={!form.name}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          등록된 일정이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                {s.type === 'campaign' && s.startDate && (
                  <p className="text-xs text-gray-400 mt-0.5">{s.startDate} ~ {s.endDate}</p>
                )}
                {s.type === 'event' && s.date && (
                  <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>
                )}
                {s.description && (
                  <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                )}
                {s.keyMessage && (
                  <p className="text-xs text-orange-500 mt-1">"{s.keyMessage}"</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-gray-300 hover:text-red-400 transition-colors ml-4 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm'
