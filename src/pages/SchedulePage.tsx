import { useState } from 'react'
import { Plus, Trash2, Calendar, Megaphone, Sun } from 'lucide-react'
import type { Schedule } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  userId?: string
  schedules: Schedule[]
  onUpdate: (schedules: Schedule[]) => void
}

const emptyForm = { name: '', startDate: '', endDate: '', date: '', description: '', keyMessage: '' }

export default function SchedulePage({ userId, schedules, onUpdate }: Props) {
  const [campaignForm, setCampaignForm] = useState(emptyForm)
  const [eventForm, setEventForm] = useState(emptyForm)
  const [regularForm, setRegularForm] = useState(emptyForm)

  const syncSchedules = async (updated: Schedule[]) => {
    onUpdate(updated)
    localStorage.setItem('crispy_schedules', JSON.stringify(updated))
    if (userId) {
      await supabase
        .from('user_schedules')
        .upsert({ user_id: userId, schedules: updated, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    }
  }

  const handleAdd = (type: 'campaign' | 'event' | 'regular') => {
    const form = type === 'campaign' ? campaignForm : type === 'event' ? eventForm : regularForm
    if (!form.name) return
    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      type,
      name: form.name,
      description: form.description,
      ...(type === 'campaign' && { startDate: form.startDate, endDate: form.endDate, keyMessage: form.keyMessage }),
      ...(type === 'event' && { date: form.date }),
    }
    syncSchedules([...schedules, newSchedule])
    if (type === 'campaign') setCampaignForm(emptyForm)
    else if (type === 'event') setEventForm(emptyForm)
    else setRegularForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    syncSchedules(schedules.filter((s) => s.id !== id))
  }

  const campaigns = schedules.filter((s) => s.type === 'campaign')
  const events = schedules.filter((s) => s.type === 'event')
  const regulars = schedules.filter((s) => s.type === 'regular')

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold gradient-text">일정 관리</h1>

      {/* ── 캠페인 ─────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={<Megaphone className="w-4 h-4" />} label="캠페인" count={campaigns.length} color="#3b82f6" />

        <div className="card p-6 mb-4">
          <div className="space-y-3">
            <input
              type="text"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm(p => ({ ...p, name: e.target.value }))}
              placeholder="캠페인명 (예: 여름 신상품 출시)"
              className="input-dark"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">시작일</label>
                <input
                  type="date"
                  value={campaignForm.startDate}
                  onChange={(e) => setCampaignForm(p => ({ ...p, startDate: e.target.value }))}
                  className="input-dark"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">종료일</label>
                <input
                  type="date"
                  value={campaignForm.endDate}
                  onChange={(e) => setCampaignForm(p => ({ ...p, endDate: e.target.value }))}
                  className="input-dark"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
            <input
              type="text"
              value={campaignForm.keyMessage}
              onChange={(e) => setCampaignForm(p => ({ ...p, keyMessage: e.target.value }))}
              placeholder="핵심 메시지 (예: 이번 여름, 건강한 선택)"
              className="input-dark"
            />
            <textarea
              value={campaignForm.description}
              onChange={(e) => setCampaignForm(p => ({ ...p, description: e.target.value }))}
              placeholder="캠페인 설명 (선택)"
              rows={2}
              className="input-dark resize-none"
            />
            <button
              onClick={() => handleAdd('campaign')}
              disabled={!campaignForm.name}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />캠페인 추가
            </button>
          </div>
        </div>

        <ScheduleList items={campaigns} onDelete={handleDelete} />
      </section>

      {/* ── 이벤트 ─────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={<Calendar className="w-4 h-4" />} label="이벤트" count={events.length} color="#8b5cf6" />

        <div className="card p-6 mb-4">
          <div className="space-y-3">
            <input
              type="text"
              value={eventForm.name}
              onChange={(e) => setEventForm(p => ({ ...p, name: e.target.value }))}
              placeholder="이벤트명 (예: 창업 1주년 기념)"
              className="input-dark"
            />
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">날짜</label>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm(p => ({ ...p, date: e.target.value }))}
                className="input-dark"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm(p => ({ ...p, description: e.target.value }))}
              placeholder="이벤트 설명 (선택)"
              rows={2}
              className="input-dark resize-none"
            />
            <button
              onClick={() => handleAdd('event')}
              disabled={!eventForm.name}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />이벤트 추가
            </button>
          </div>
        </div>

        <ScheduleList items={events} onDelete={handleDelete} />
      </section>

      {/* ── 일상 ───────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={<Sun className="w-4 h-4" />} label="일상 콘텐츠" count={regulars.length} color="#22c55e" />

        <div className="card p-6 mb-4">
          <div className="space-y-3">
            <input
              type="text"
              value={regularForm.name}
              onChange={(e) => setRegularForm(p => ({ ...p, name: e.target.value }))}
              placeholder="콘텐츠 제목 (예: 브랜드 스토리 소개)"
              className="input-dark"
            />
            <textarea
              value={regularForm.description}
              onChange={(e) => setRegularForm(p => ({ ...p, description: e.target.value }))}
              placeholder="어떤 내용을 담을지 간단히 적어주세요 (선택)"
              rows={2}
              className="input-dark resize-none"
            />
            <button
              onClick={() => handleAdd('regular')}
              disabled={!regularForm.name}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />일상 추가
            </button>
          </div>
        </div>

        <ScheduleList items={regulars} onDelete={handleDelete} />
      </section>
    </div>
  )
}

// ─── 공통 컴포넌트 ─────────────────────────────────────────────────────────

function SectionHeader({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '20', color }}
      >
        {icon}
      </div>
      <h2 className="font-semibold text-slate-100">{label}</h2>
      {count > 0 && (
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: color + '20', color }}
        >
          {count}개
        </span>
      )}
    </div>
  )
}

function ScheduleList({ items, onDelete }: { items: Schedule[]; onDelete: (id: string) => void }) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((s) => (
        <div key={s.id} className="card p-4 flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-100 text-sm">{s.name}</p>
            {s.type === 'campaign' && s.startDate && (
              <p className="text-xs text-slate-500 mt-0.5">{s.startDate} ~ {s.endDate}</p>
            )}
            {s.type === 'event' && s.date && (
              <p className="text-xs text-slate-500 mt-0.5">{s.date}</p>
            )}
            {s.keyMessage && (
              <p className="text-xs text-blue-400 mt-1">"{s.keyMessage}"</p>
            )}
            {s.description && (
              <p className="text-xs text-slate-400 mt-1 truncate">{s.description}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(s.id)}
            className="text-slate-600 hover:text-red-400 transition-colors ml-4 flex-shrink-0 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
