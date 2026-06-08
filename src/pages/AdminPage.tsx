import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users, BarChart3, CreditCard, MessageSquare, Loader2,
  Trash2, Eye, Plus, X, CheckCircle, Clock, AlertCircle, Ban, UserCheck,
} from 'lucide-react'

// ---- Types ----
interface Profile {
  id: string; name: string | null; email: string; created_at: string; is_active: boolean
}
interface ProfileWithData extends Profile {
  hasBrandDNA: boolean; schedulesCount: number; contentCount: number
}
interface UserDetail {
  profile: Profile; brandDNA: Record<string, unknown> | null; schedules: unknown[]; contentCount: number
}
interface Payment {
  id: string; user_id: string | null; user_name: string | null; user_email: string | null
  amount: number; status: 'paid' | 'cancelled' | 'refunded'; description: string | null; created_at: string
}
interface Claim {
  id: string; user_id: string | null; user_name: string | null; user_email: string | null
  title: string; content: string; status: 'pending' | 'in_progress' | 'resolved'; admin_note: string | null; created_at: string
}
type AdminTab = 'users' | 'stats' | 'payments' | 'claims'

// ---- Helpers ----
const fmt = (s: string) => new Date(s).toLocaleDateString('ko-KR')
const money = (n: number) => n.toLocaleString('ko-KR') + '원'

const TABS: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: 'users', label: '회원 목록', icon: Users },
  { id: 'stats', label: '통계', icon: BarChart3 },
  { id: 'payments', label: '결제 관리', icon: CreditCard },
  { id: 'claims', label: '클레임', icon: MessageSquare },
]

function Spinner() {
  return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
}

// ---- Main ----
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold gradient-text mb-6">관리자 대시보드</h1>
      <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ backgroundColor: '#1e293b' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: activeTab === id ? '#0f172a' : 'transparent', color: activeTab === id ? '#60a5fa' : '#64748b' }}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'stats' && <StatsTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'claims' && <ClaimsTab />}
    </div>
  )
}

// ---- Users Tab ----
function UsersTab() {
  const [users, setUsers] = useState<ProfileWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const [pRes, bRes, sRes, lRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('brand_dna').select('user_id'),
      supabase.from('user_schedules').select('user_id, schedules'),
      supabase.from('content_logs').select('user_id'),
    ])
    const profiles: Profile[] = pRes.data ?? []
    const brandIds = new Set((bRes.data ?? []).map((b: { user_id: string }) => b.user_id))
    const schedMap = new Map((sRes.data ?? []).map((s: { user_id: string; schedules: unknown[] }) => [s.user_id, Array.isArray(s.schedules) ? s.schedules.length : 0]))
    const logCounts = ((lRes.data ?? []) as { user_id: string }[]).reduce((acc, l) => { acc[l.user_id] = (acc[l.user_id] ?? 0) + 1; return acc }, {} as Record<string, number>)
    setUsers(profiles.map(p => ({ ...p, hasBrandDNA: brandIds.has(p.id), schedulesCount: schedMap.get(p.id) ?? 0, contentCount: logCounts[p.id] ?? 0 })))
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggle = async (user: ProfileWithData) => {
    await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id)
    fetchUsers()
  }

  const handleViewDetail = async (userId: string) => {
    setDetailLoading(true)
    const profile = users.find(u => u.id === userId)!
    const [bRes, sRes, lRes] = await Promise.all([
      supabase.from('brand_dna').select('data').eq('user_id', userId).single(),
      supabase.from('user_schedules').select('schedules').eq('user_id', userId).single(),
      supabase.from('content_logs').select('id').eq('user_id', userId),
    ])
    setDetail({ profile, brandDNA: bRes.data?.data ?? null, schedules: Array.isArray(sRes.data?.schedules) ? sRes.data!.schedules : [], contentCount: (lRes.data ?? []).length })
    setDetailLoading(false)
  }

  if (loading) return <Spinner />

  return (
    <div>
      <p className="text-sm text-slate-400 mb-4">총 <span className="text-white font-semibold">{users.length}</span>명</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              {['이름', '이메일', '가입일', '브랜드DNA', '일정', '콘텐츠', '상태', '관리'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e3a5f' }} className="hover:bg-slate-800/20">
                <td className="px-4 py-3 text-slate-200">{u.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{fmt(u.created_at)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={u.hasBrandDNA ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' } : { backgroundColor: 'rgba(100,116,139,0.1)', color: '#64748b' }}>
                    {u.hasBrandDNA ? '등록' : '미등록'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{u.schedulesCount}</td>
                <td className="px-4 py-3 text-slate-300">{u.contentCount}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={u.is_active ? { backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa' } : { backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                    {u.is_active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleViewDetail(u.id)} className="text-slate-500 hover:text-blue-400 transition-colors" title="상세보기"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleToggle(u)} className="text-slate-500 hover:text-yellow-400 transition-colors" title={u.is_active ? '비활성화' : '활성화'}>
                      {u.is_active ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-center py-12 text-slate-600 text-sm">등록된 회원이 없습니다.</div>}
      </div>

      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            {detailLoading ? <Spinner /> : detail && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-100">{detail.profile.name ?? detail.profile.email}</h2>
                  <button onClick={() => setDetail(null)} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-slate-400 mb-1">{detail.profile.email}</p>
                <p className="text-xs text-slate-600 mb-4">가입일: {fmt(detail.profile.created_at)} · 콘텐츠 생성: {detail.contentCount}회</p>

                {detail.brandDNA ? (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wide">브랜드 DNA</p>
                    <div className="space-y-1.5 p-4 rounded-xl" style={{ backgroundColor: '#0f172a' }}>
                      {Object.entries(detail.brandDNA).filter(([, v]) => typeof v !== 'object').map(([k, v]) => (
                        <div key={k} className="flex gap-3 text-xs">
                          <span className="text-slate-500 w-28 flex-shrink-0">{k}</span>
                          <span className="text-slate-300">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-600 mb-6">브랜드 DNA 미등록</p>}

                {detail.schedules.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wide">일정 ({detail.schedules.length}개)</p>
                    <div className="space-y-2">
                      {(detail.schedules as { name: string; type: string }[]).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                          <span className="text-slate-500">[{s.type}]</span>
                          <span className="text-slate-300">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Stats Tab ----
function StatsTab() {
  const [stats, setStats] = useState({ total: 0, active: 0, withDNA: 0, totalSchedules: 0, totalContent: 0, models: {} as Record<string, number> })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [pRes, bRes, sRes, lRes] = await Promise.all([
        supabase.from('profiles').select('is_active'),
        supabase.from('brand_dna').select('user_id'),
        supabase.from('user_schedules').select('schedules'),
        supabase.from('content_logs').select('model_used'),
      ])
      const profiles = (pRes.data ?? []) as { is_active: boolean }[]
      const totalSchedules = ((sRes.data ?? []) as { schedules: unknown[] }[]).reduce((a, s) => a + (Array.isArray(s.schedules) ? s.schedules.length : 0), 0)
      const models = ((lRes.data ?? []) as { model_used: string | null }[]).reduce((a, l) => { const m = l.model_used ?? 'unknown'; a[m] = (a[m] ?? 0) + 1; return a }, {} as Record<string, number>)
      setStats({ total: profiles.length, active: profiles.filter(p => p.is_active).length, withDNA: (bRes.data ?? []).length, totalSchedules, totalContent: (lRes.data ?? []).length, models })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Spinner />

  const cards = [
    { label: '총 회원', value: stats.total, color: '#60a5fa' },
    { label: '활성 회원', value: stats.active, color: '#22c55e' },
    { label: '브랜드DNA 등록', value: stats.withDNA, color: '#a78bfa' },
    { label: '총 일정', value: stats.totalSchedules, color: '#f59e0b' },
    { label: '콘텐츠 생성', value: stats.totalContent, color: '#f472b6' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      {Object.keys(stats.models).length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-300 mb-4">AI 모델 사용 현황</p>
          <div className="space-y-3">
            {Object.entries(stats.models).map(([model, count]) => (
              <div key={model} className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 w-36 flex-shrink-0">{model}</span>
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#1e293b' }}>
                  <div className="h-2 rounded-full" style={{ width: `${(count / stats.totalContent) * 100}%`, background: 'linear-gradient(to right, #3b82f6, #22c55e)' }} />
                </div>
                <span className="text-slate-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Payments Tab ----
function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'cancelled' | 'refunded'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ user_email: '', user_name: '', amount: '', status: 'paid', description: '' })

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false })
    setPayments((data ?? []) as Payment[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleAdd = async () => {
    if (!form.user_email || !form.amount) return
    await supabase.from('payments').insert({ user_email: form.user_email, user_name: form.user_name || null, amount: parseInt(form.amount), status: form.status, description: form.description || null })
    setForm({ user_email: '', user_name: '', amount: '', status: 'paid', description: '' })
    setShowForm(false); fetch()
  }

  const handleStatusChange = async (id: string, status: Payment['status']) => {
    await supabase.from('payments').update({ status }).eq('id', id); fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('payments').delete().eq('id', id); fetch()
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const total = filtered.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)

  const statusStyle = (s: Payment['status']) => ({
    paid: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: '결제완료' },
    cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', label: '취소' },
    refunded: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', label: '환불' },
  }[s])

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'paid', 'cancelled', 'refunded'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: filter === f ? 'rgba(59,130,246,0.2)' : '#1e293b', color: filter === f ? '#60a5fa' : '#64748b' }}>
              {f === 'all' ? '전체' : f === 'paid' ? '결제완료' : f === 'cancelled' ? '취소' : '환불'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
          <Plus className="w-3 h-3" />추가
        </button>
      </div>

      {total > 0 && (
        <div className="card p-4 mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">결제 합계</span>
          <span className="text-lg font-bold" style={{ color: '#22c55e' }}>{money(total)}</span>
        </div>
      )}

      {showForm && (
        <div className="card p-5 mb-4 space-y-3">
          <p className="text-sm font-semibold text-slate-300">결제 내역 추가</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.user_email} onChange={e => setForm(p => ({ ...p, user_email: e.target.value }))} placeholder="이메일 *" className="input-dark text-sm" />
            <input value={form.user_name} onChange={e => setForm(p => ({ ...p, user_name: e.target.value }))} placeholder="이름" className="input-dark text-sm" />
            <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="금액 (원) *" type="number" className="input-dark text-sm" />
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-dark text-sm">
              <option value="paid">결제완료</option>
              <option value="cancelled">취소</option>
              <option value="refunded">환불</option>
            </select>
          </div>
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="메모" className="input-dark text-sm" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary text-xs px-4 py-2">저장</button>
            <button onClick={() => setShowForm(false)} className="text-xs px-4 py-2 rounded-xl text-slate-400" style={{ border: '1px solid #334155' }}>취소</button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              {['회원', '금액', '상태', '메모', '날짜', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const s = statusStyle(p.status)
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #1e3a5f' }}>
                  <td className="px-4 py-3"><p className="text-slate-200 text-xs">{p.user_name ?? '—'}</p><p className="text-slate-500 text-xs">{p.user_email}</p></td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{money(p.amount)}</td>
                  <td className="px-4 py-3">
                    <select value={p.status} onChange={e => handleStatusChange(p.id, e.target.value as Payment['status'])}
                      className="text-xs px-2 py-1 rounded-full border-0 cursor-pointer outline-none"
                      style={{ backgroundColor: s.bg, color: s.color }}>
                      <option value="paid">결제완료</option><option value="cancelled">취소</option><option value="refunded">환불</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.description ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{fmt(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-600 text-sm">결제 내역이 없습니다.</div>}
      </div>
    </div>
  )
}

// ---- Claims Tab ----
function ClaimsTab() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')
  const [selected, setSelected] = useState<Claim | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Claim['status']>('pending')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ user_email: '', user_name: '', title: '', content: '' })

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('claims').select('*').order('created_at', { ascending: false })
    setClaims((data ?? []) as Claim[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openDetail = (claim: Claim) => {
    setSelected(claim); setAdminNote(claim.admin_note ?? ''); setSelectedStatus(claim.status)
  }

  const handleUpdate = async () => {
    if (!selected) return
    await supabase.from('claims').update({ status: selectedStatus, admin_note: adminNote, updated_at: new Date().toISOString() }).eq('id', selected.id)
    setSelected(null); fetch()
  }

  const handleAdd = async () => {
    if (!form.user_email || !form.title || !form.content) return
    await supabase.from('claims').insert({ user_email: form.user_email, user_name: form.user_name || null, title: form.title, content: form.content })
    setForm({ user_email: '', user_name: '', title: '', content: '' }); setShowForm(false); fetch()
  }

  const statusInfo = (s: Claim['status']) => ({
    pending: { icon: AlertCircle, color: '#f59e0b', label: '접수' },
    in_progress: { icon: Clock, color: '#60a5fa', label: '처리중' },
    resolved: { icon: CheckCircle, color: '#22c55e', label: '해결' },
  }[s])

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter)

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'in_progress', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: filter === f ? 'rgba(59,130,246,0.2)' : '#1e293b', color: filter === f ? '#60a5fa' : '#64748b' }}>
              {f === 'all' ? '전체' : f === 'pending' ? '접수' : f === 'in_progress' ? '처리중' : '해결'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
          <Plus className="w-3 h-3" />추가
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-4 space-y-3">
          <p className="text-sm font-semibold text-slate-300">클레임 추가</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.user_email} onChange={e => setForm(p => ({ ...p, user_email: e.target.value }))} placeholder="이메일 *" className="input-dark text-sm" />
            <input value={form.user_name} onChange={e => setForm(p => ({ ...p, user_name: e.target.value }))} placeholder="이름" className="input-dark text-sm" />
          </div>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="제목 *" className="input-dark text-sm" />
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="내용 *" rows={3} className="input-dark text-sm resize-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary text-xs px-4 py-2">저장</button>
            <button onClick={() => setShowForm(false)} className="text-xs px-4 py-2 rounded-xl text-slate-400" style={{ border: '1px solid #334155' }}>취소</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(claim => {
          const { icon: Icon, color, label } = statusInfo(claim.status)
          return (
            <div key={claim.id} className="card p-4 flex items-start justify-between cursor-pointer hover:border-blue-800 transition-all" onClick={() => openDetail(claim)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  <p className="font-semibold text-sm text-slate-100 truncate">{claim.title}</p>
                </div>
                <p className="text-xs text-slate-500">{claim.user_email ?? claim.user_name ?? '—'} · {fmt(claim.created_at)}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{claim.content}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full ml-3 flex-shrink-0" style={{ backgroundColor: `${color}20`, color }}>{label}</span>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-slate-600 text-sm">클레임이 없습니다.</div>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 truncate pr-4">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 flex-shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">{selected.user_email} · {fmt(selected.created_at)}</p>
            <div className="p-4 rounded-xl mb-4 text-sm text-slate-300" style={{ backgroundColor: '#0f172a' }}>{selected.content}</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">상태 변경</label>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as Claim['status'])} className="input-dark text-sm">
                  <option value="pending">접수</option>
                  <option value="in_progress">처리중</option>
                  <option value="resolved">해결</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">관리자 메모</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} className="input-dark text-sm resize-none" placeholder="처리 내용, 답변 등을 기록하세요" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdate} className="btn-primary text-xs px-4 py-2">저장</button>
                <button onClick={() => setSelected(null)} className="text-xs px-4 py-2 rounded-xl text-slate-400" style={{ border: '1px solid #334155' }}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
