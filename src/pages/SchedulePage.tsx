import { useState } from 'react'
import { Plus, Trash2, Calendar, Megaphone, Sun } from 'lucide-react'
import type { Schedule } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  userId?: string
  schedules: Schedule[]
  onUpdate: (schedules: Schedule[]) => void
}

type TabType = 'campaign' | 'event' | 'regular'

const TABS: { type: TabType; label: string; icon: typeof Calendar }[] = [
  { type: 'campaign', label: '캠페인', icon: Megaphone },
  { type: 'event', label: '이벤트', icon: Calendar },
  { type: 'regular', label: '일상', icon: Sun },
]

const emptyForm = { name: '', startDate: '', endDate: '', date: '', description: '', keyMessage: '' }

export default function SchedulePage({ userId, schedules, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('campaign')
  const [form, setForm] = useState(emptyForm)

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const syncSchedules = async (updated: Schedule[]) => {
    onUpdate(updated)
    localStorage.setItem('crispy_schedules', JSON.stringify(updated))
    if (userId) {
      await supabase.from('user_schedules').upsert({ user_id: userId, schedules: updated, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    }
  }

  const handleAdd = () => {
    if (!form.name) return
    const newSchedule: Schedule = {
      id: crypto.randomUUID(), type: activeTab, name: form.name, description: form.description,
      ...(activeTab === 'campaign' && { startDate: form.startDate, endDate: form.endDate, keyMessage: form.keyMessage }),
      ...(activeTab === 'event' && { date: form.date }),
    }
    syncSchedules([...schedules, newSchedule])
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    syncSchedules(schedules.filter((s) => s.id !== id))
  }

  const filtered = schedules.filter((s) => s.type === activeTab)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold gradient-text mb-6">일정 관리</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: '#1e293b' }}>
        {TABS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === type ? '#0f172a' : 'transparent',
              color: activeTab === type ? '#60a5fa' : '#64748b',
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">
          {activeTab === 'campaign' ? '캠페인' : activeTab === 'event' ? '이벤트' : '일상 콘텐츠'} 등록
        </h2>
        <div className="space-y-3">
          <input
            type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            placeholder={activeTab === 'campaign' ? '캠페인명 (예: 여름 신상품 출시)' : activeTab === 'event' ? '이벤트명 (예: 창업 1주년 기념)' : '콘텐츠 제목 (예: 브랜드 스토리 소개)'}
            className="input-dark"
          />
          {activeTab === 'campaign' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">시작일</label>
                <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="input-dark" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">종료일</label>
                <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className="input-dark" />
              </div>
            </div>
          )}
          {activeTab === 'event' && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">날짜</label>
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="input-dark" />
            </div>
          )}
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="설명을 입력하세요" rows={2} className="input-dark resize-none" />
          {activeTab === 'campaign' && (
            <input type="text" value={form.keyMessage} onChange={(e) => update('keyMessage', e.target.value)} placeholder="핵심 메시지 (예: 이번 여름, 건강한 선택)" className="input-dark" />
          )}
          <button onClick={handleAdd} disabled={!form.name} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" />추가
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">등록된 일정이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="card p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold text-slate-100 text-sm">{s.name}</p>
                {s.type === 'campaign' && s.startDate && <p className="text-xs text-slate-500 mt-0.5">{s.startDate} ~ {s.endDate}</p>}
                {s.type === 'event' && s.date && <p className="text-xs text-slate-500 mt-0.5">{s.date}</p>}
                {s.description && <p className="text-xs text-slate-400 mt-1">{s.description}</p>}
                {s.keyMessage && <p className="text-xs text-blue-400 mt-1">"{s.keyMessage}"</p>}
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
