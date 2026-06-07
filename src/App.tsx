import { useEffect, useState } from 'react'
import { LayoutDashboard, Dna, Calendar, Sparkles, LogOut } from 'lucide-react'
import type { BrandDNA, Page, Schedule } from '@/types'

import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import OnboardingPage from '@/pages/OnboardingPage'
import BrandDNAPage from '@/pages/BrandDNAPage'
import SchedulePage from '@/pages/SchedulePage'
import DashboardPage from '@/pages/DashboardPage'
import ContentPage from '@/pages/ContentPage'

const NAV_ITEMS: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { page: 'brand-dna', label: '브랜드 DNA', icon: Dna },
  { page: 'schedule', label: '일정', icon: Calendar },
  { page: 'content', label: '콘텐츠', icon: Sparkles },
]

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [brand, setBrand] = useState<BrandDNA | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    const auth = localStorage.getItem('crispy_auth')
    const savedBrand = localStorage.getItem('crispy_brand')
    const savedSchedules = localStorage.getItem('crispy_schedules')

    if (savedSchedules) {
      try { setSchedules(JSON.parse(savedSchedules)) } catch { /* ignore */ }
    }

    if (!auth) { setPage('login'); return }

    if (savedBrand) {
      try { setBrand(JSON.parse(savedBrand)); setPage('dashboard') }
      catch { setPage('onboarding') }
    } else {
      setPage('onboarding')
    }
  }, [])

  const handleLogin = () => {
    const savedBrand = localStorage.getItem('crispy_brand')
    if (savedBrand) {
      try { setBrand(JSON.parse(savedBrand)) } catch { /* ignore */ }
      setPage('dashboard')
    } else {
      setPage('onboarding')
    }
  }

  const handleBrandComplete = (data: BrandDNA) => {
    setBrand(data)
    setPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('crispy_auth')
    setPage('login')
  }

  const isAuthPage = page === 'login' || page === 'signup' || page === 'onboarding'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      {/* Navigation */}
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
                    page === p
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-300 transition-colors p-2"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}

      {/* Pages */}
      {page === 'login' && <LoginPage onLogin={handleLogin} onGoSignup={() => setPage('signup')} />}
      {page === 'signup' && <SignupPage onSignup={handleLogin} onGoLogin={() => setPage('login')} />}
      {page === 'onboarding' && <OnboardingPage onStart={() => setPage('brand-dna')} />}
      {page === 'brand-dna' && <BrandDNAPage onComplete={handleBrandComplete} />}
      {page === 'schedule' && <SchedulePage schedules={schedules} onUpdate={setSchedules} />}
      {page === 'dashboard' && <DashboardPage brand={brand} schedules={schedules} onNavigate={setPage} />}
      {page === 'content' && brand && <ContentPage brand={brand} schedules={schedules} />}
      {page === 'content' && !brand && (
        <div className="max-w-2xl mx-auto py-20 text-center text-slate-500">
          <p>브랜드 DNA를 먼저 등록해주세요.</p>
        </div>
      )}
    </div>
  )
}
