import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  LuLayoutDashboard,
  LuImage,
  LuLogOut,
  LuMenu,
  LuX,
  LuUser,
  LuClock,
} from 'react-icons/lu'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminProfile, setAdminProfile] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('administradores')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setAdminProfile(data)
      }
    }
    fetchAdminProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LuLayoutDashboard,
    },
    {
      name: 'Portafolio',
      path: '/admin/portfolio',
      icon: LuImage,
    },
    {
      name: 'Horarios',
      path: '/admin/horarios',
      icon: LuClock,
    },
  ]

  const getPageTitle = () => {
    const active = navItems.find((item) => item.path === location.pathname)
    return active ? active.name : 'Administración'
  }

  return (
    <div className="min-h-screen bg-black-deep text-white-soft font-poppins flex">
      {/* Meta robots tag dynamically added for security and to prevent indexing */}
      <meta name="robots" content="noindex, nofollow" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gold/10 bg-charcoal shrink-0">
        {/* Brand Logo Container */}
        <div className="p-8 border-b border-gold/10 flex flex-col items-center">
          <Link to="/" className="group flex flex-col items-center">
            <span className="font-playfair text-2xl tracking-[0.2em] text-white-soft group-hover:text-gold transition-colors duration-300">
              TORRIVA
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold mt-1">
              Alta Costura
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-none group ${
                  isActive
                    ? 'bg-gold/10 text-gold border-l-2 border-gold font-semibold'
                    : 'text-nude/60 hover:text-gold hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gold' : 'text-nude/40 group-hover:text-gold'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gold/10 bg-black-deep/40 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-gold">
              <LuUser className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white-soft truncate">
                {adminProfile?.nombre || 'Administrador'}
              </p>
              <p className="text-[10px] text-nude/40 truncate">
                {adminProfile?.email || 'admin@torriva.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400 text-xs transition-all duration-300 uppercase tracking-wider"
          >
            <LuLogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Panel) */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-black-deep/80 backdrop-blur-sm"
        />
        {/* Side Panel */}
        <div className={`absolute top-0 bottom-0 left-0 w-64 bg-charcoal border-r border-gold/15 p-6 flex flex-col justify-between transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-playfair text-xl tracking-[0.2em] text-white-soft">TORRIVA</span>
                <span className="text-[8px] uppercase tracking-[0.3em] text-gold">Alta Costura</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-nude/40 hover:text-gold text-xl p-1"
                aria-label="Cerrar menú"
              >
                <LuX />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-none transition-all duration-300 ${
                      isActive
                        ? 'bg-gold/10 text-gold border-l-2 border-gold font-semibold'
                        : 'text-nude/60 hover:text-gold hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-nude/40 group-hover:text-gold" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-6 border-t border-gold/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center text-gold">
                <LuUser className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white-soft truncate">
                  {adminProfile?.nombre || 'Administrador'}
                </p>
                <p className="text-[10px] text-nude/40 truncate">
                  {adminProfile?.email || 'admin@torriva.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400 text-xs transition-all duration-300 uppercase tracking-wider"
            >
              <LuLogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-gold/10 bg-charcoal/40 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-nude/60 hover:text-gold text-xl p-1"
              aria-label="Abrir menú"
            >
              <LuMenu />
            </button>
            <h1 className="font-playfair text-xl md:text-2xl text-white-soft tracking-wide">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs text-nude/40 hover:text-gold transition-colors duration-300 border border-white/5 hover:border-gold/30 px-3 py-1.5 uppercase tracking-wider"
            >
              Ver Sitio Web
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
