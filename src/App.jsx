import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Process from './components/Process'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

// Importaciones del Panel de Administración con Lazy Loading (Code Splitting)
const AdminGuard = lazy(() => import('./components/AdminGuard'))
const AdminLayout = lazy(() => import('./components/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminPortfolio = lazy(() => import('./pages/AdminPortfolio'))
const AdminHorarios = lazy(() => import('./pages/AdminHorarios'))


// Componente para la Landing Page pública
function PublicSite() {
  return (
    <div className="bg-black-deep text-white-soft">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Process />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

// Componente para inyectar políticas de robots dinámicamente y ocultar la sección de los buscadores
function RobotsMetaManager() {
  const location = useLocation()

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    
    if (location.pathname.startsWith('/admin')) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'robots'
        document.head.appendChild(meta)
      }
      meta.content = 'noindex, nofollow'
    } else {
      // Remover noindex en la landing pública para permitir posicionamiento SEO normal
      if (meta) {
        meta.remove()
      }
    }
  }, [location])

  return null
}

function AdminLoading() {
  return (
    <div className="min-h-screen bg-black-deep flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/5 border-t-gold rounded-full animate-spin mb-4" />
      <p className="font-poppins text-xs uppercase tracking-widest text-gold animate-pulse">Cargando Panel...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RobotsMetaManager />
      <Routes>
        {/* Sitio Público */}
        <Route path="/" element={<PublicSite />} />

        {/* Acceso Administrativo (Login) */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminLogin />
            </Suspense>
          }
        />

        {/* Panel Administrativo Protegido */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminGuard />
            </Suspense>
          }
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="horarios" element={<AdminHorarios />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

