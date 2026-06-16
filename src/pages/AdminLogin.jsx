import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState('login') // 'login', 'recovery'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Si ya hay una sesión activa de administrador, redirigir directo al dashboard
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Validar si es admin
        const { data: adminData } = await supabase
          .from('administradores')
          .select('rol')
          .eq('id', session.user.id)
          .single()

        if (adminData && (adminData.rol === 'admin' || adminData.rol === 'superadmin')) {
          navigate('/admin/dashboard')
        }
      }
    }
    checkSession()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      // Verificar que esté en la tabla administradores y tenga rol admin
      const { data: adminData, error: adminError } = await supabase
        .from('administradores')
        .select('rol')
        .eq('id', data.user.id)
        .single()

      if (adminError || !adminData) {
        // Si no está registrado en administradores, le cerramos la sesión
        await supabase.auth.signOut()
        throw new Error('Tu cuenta no tiene privilegios de Administrador en el Atelier.')
      }

      if (adminData.rol !== 'admin' && adminData.rol !== 'superadmin') {
        await supabase.auth.signOut()
        throw new Error('Acceso denegado: Se requieren privilegios de Administrador.')
      }

      // Éxito, redirigir
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }


  const handleRecovery = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      })

      if (recoveryError) throw recoveryError

      setMessage('Se ha enviado un correo con instrucciones para restablecer tu contraseña.')
    } catch (err) {
      setError(err.message || 'Error al solicitar la recuperación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black-deep flex items-center justify-center p-6 relative overflow-hidden font-poppins">
      {/* Meta robots tag dynamically added for security and to prevent indexing */}
      <meta name="robots" content="noindex, nofollow" />

      {/* Decorative Background Blur Shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/3 rounded-full blur-3xl pointer-events-none" />

      {/* Login Box */}
      <div className="relative w-full max-w-md bg-charcoal border border-gold/15 p-8 md:p-10 shadow-2xl z-10 rounded-sm">
        {/* Top Gold Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        {/* Branding Header */}
        <div className="text-center mb-8">
          <span className="font-playfair text-3xl md:text-4xl tracking-[0.2em] text-white-soft block">
            TORRIVA
          </span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold mt-1.5 block">
            Portal Administrativo
          </span>
          <div className="w-12 h-px bg-gold/30 mx-auto mt-4" />
        </div>

        {/* Feedback Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-none leading-relaxed">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-gold/10 border border-gold/30 text-gold text-xs rounded-none leading-relaxed">
            {message}
          </div>
        )}

        {/* View switcher */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] text-nude/50 uppercase tracking-widest mb-1.5 font-medium">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@torriva.com"
                className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-3 text-sm text-white-soft placeholder-nude/25 outline-none transition-colors duration-300"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] text-nude/50 uppercase tracking-widest font-medium">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setView('recovery')}
                  className="text-[10px] text-gold/60 hover:text-gold transition-colors duration-300"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-3 text-sm text-white-soft placeholder-nude/25 outline-none transition-colors duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 transition-all duration-300 text-xs tracking-[0.2em]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black-deep border-t-transparent rounded-full animate-spin" />
              ) : (
                'Iniciar Sesión'
              )}
            </button>


          </form>
        )}



        {view === 'recovery' && (
          <form onSubmit={handleRecovery} className="space-y-5">
            <div>
              <label className="block text-[10px] text-nude/50 uppercase tracking-widest mb-1.5 font-medium">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@torriva.com"
                className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-3 text-sm text-white-soft placeholder-nude/25 outline-none transition-colors duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 transition-all duration-300 text-xs tracking-[0.2em]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black-deep border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enviar Enlace'
              )}
            </button>

            <div className="text-center pt-4 border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-xs text-nude/50 hover:text-gold transition-colors duration-300"
              >
                Volver al Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
