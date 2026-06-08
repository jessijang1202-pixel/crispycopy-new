import { useEffect, useState, useCallback } from 'react'
import { LayoutDashboard, Dna, Calendar, Sparkles, LogOut, Shield } from 'lucide-react'
import type { BrandDNA, Page, Schedule } from '@/types'
import { supabase } from '@/lib/supabase'

import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import OnboardingPage from '@/pages/OnboardingPage'
import BrandDNAPage from '@/pages/BrandDNAPage'
import SchedulePage from '@/pages/SchedulePage'
import DashboardPage from '@/pages/DashboardPage'
import ContentPage from '@/pages/ContentPage'
import AdminPage from '@/pages/AdminPage'

const NAV_ITEMS: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { page: 'brand-dna', label: '브랜드 DNA', icon: Dna },
  { page: 'schedule', label: '일정', icon: Calendar },
  { page: 'content', label: '콘텐츠', icon: Sparkles },
]

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jessijang1202@gmail.com'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [brand, setBrand] = useState<BrandDNA | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const loadUserData = useCallback(async (uid: string, email?: string) => {
    const isAdminUser = email?.toLowerCase() === 'jessijang1202@gmail.com'

    const [brandRes, schedRes] = await Promise.all([
      supabase.from('brand_dna').select('data').eq('user_id', uid).single(),
      supabase.from('user_schedules').select('schedules').eq('user_id', uid).single(),
    ])

    if (brandRes.data?.data) {
      const b = brandRes.data.data as BrandDNA
      setBrand(b)
      localStorage.setItem('crispy_brand', JSON.stringify(b))
      setPage('dashboard')
    } else if (isAdminUser) {
      setPage('dashboard')
    } else {
      const saved = localStorage.getItem('crispy_brand')
      if (saved) {
        try { setBrand(JSON.parse(saved)); setPage('dashboard') } catch { setPage('onboarding') }
      } else {
        setPage('onboarding')
      }
    }

    if (schedRes.data?.schedules) {
      const s = schedRes.data.schedules as Schedule[]
      setSchedules(s)
      localStorage.setItem('crispy_schedules', JSON.stringify(s))
    } else {
      const saved = localStorage.getItem('crispy_schedules')
      if (saved) {
        try { setSchedules(JSON.parse(saved)) } catch { /* ignore */ }
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email ?? null
        setUserId(session.user.id)
        setUserEmail(email)
        loadUserData(session.user.id, email ?? undefined)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email ?? null)
      } else {
        setUserId(null)
        setUserEmail(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [loadUserData])

  const handleLogin = async (uid: string, email: string) => {
    setUserId(uid)
    setUserEmail(email)
    await loadUserData(uid, email)
  }

  const handleBrandComplete = async (data: BrandDNA) => {
    setBrand(data)
    setPage('dashboard')
  }

  const handleScheduleUpdate = (updated: Schedule[]) => {
    setSchedules(updated)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('crispy_auth')
    setBrand(null)
    setSchedules([])
    setUserId(null)
    setUserEmail(null)
    setPage('login')
  }

  const isAuthPage = page === 'login' || page === 'signup'
  const isAdmin = !!userEmail && (userEmail === ADMIN_EMAIL || userEmail.toLowerCase() === 'jessijang1202@gmail.com')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      {!isAuthPage && (
        <nav style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }} className="sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-0 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-2 pr-4 py-3 mr-2" style={{ borderRight: '1px solid #334155' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e)' }}>
                  <span className="text-white font-bold text-xs">C</span>
                </div>
                <span className="font-bold text-sm gradient-text">CrispyCopy</span>
              </div>
              {NAV_ITEMS.map(({ page: p, label, icon: Icon }) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 ${
                    page === p ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => setPage('admin')}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 ${
                    page === 'admin' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />관리자
                </button>
              )}
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-300 transition-colors p-2" title="로그아웃">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}

      {page === 'login' && <LoginPage onLogin={handleLogin} onGoSignup={() => setPage('signup')} />}
      {page === 'signup' && <SignupPage onSignup={handleLogin} onGoLogin={() => setPage('login')} />}
      {page === 'onboarding' && <OnboardingPage onStart={() => setPage('brand-dna')} />}
      {page === 'brand-dna' && <BrandDNAPage userId={userId ?? undefined} onComplete={handleBrandComplete} />}
      {page === 'schedule' && <SchedulePage userId={userId ?? undefined} schedules={schedules} onUpdate={handleScheduleUpdate} />}
      {page === 'dashboard' && <DashboardPage brand={brand} schedules={schedules} onNavigate={setPage} />}
      {page === 'content' && brand && <ContentPage userId={userId ?? undefined} brand={brand} schedules={schedules} />}
      {page === 'content' && !brand && (
        <div className="max-w-2xl mx-auto py-20 text-center text-slate-500">
          <p>브랜드 DNA를 먼저 등록해주세요.</p>
        </div>
      )}
      {page === 'admin' && isAdmin && <AdminPage />}
      {page === 'admin' && !isAdmin && (
        <div className="max-w-2xl mx-auto py-20 text-center text-slate-500">
          <p>접근 권한이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
