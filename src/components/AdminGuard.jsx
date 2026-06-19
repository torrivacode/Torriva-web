import { useEffect, useState, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminGuard() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Referencia para mantener el estado de autorización actual
  // y poder consultarlo en el callback de onAuthStateChange sin recrear el listener.
  const authorizedRef = useRef(authorized)

  useEffect(() => {
    authorizedRef.current = authorized
  }, [authorized])

  useEffect(() => {
    let authSubscription = null
    let isMounted = true

    const checkAdmin = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true)
        }
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session) {
          if (isMounted) {
            setAuthorized(false)
            setLoading(false)
          }
          return
        }

        // Consultar la tabla de administradores para validar rol
        const { data: adminData, error: adminError } = await supabase
          .from('administradores')
          .select('rol')
          .eq('id', session.user.id)
          .single()

        if (adminError) {
          if (import.meta.env.DEV) {
            console.error('Error fetching admin details:', adminError)
          }
          if (isMounted) {
            setAuthorized(false)
            setErrorMessage('No se pudieron verificar tus permisos en el atelier.')
            setLoading(false)
          }
          return
        }

        if (isMounted) {
          if (adminData && (adminData.rol === 'admin' || adminData.rol === 'superadmin')) {
            setAuthorized(true)
          } else {
            setAuthorized(false)
            setErrorMessage('Acceso denegado: Se requieren privilegios de Administrador.')
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error in AdminGuard check:', err)
        }
        if (isMounted) {
          setAuthorized(false)
          setErrorMessage('Ocurrió un error inesperado al validar tu sesión.')
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false)
        }
      }
    }

    // Ejecutar verificación inicial mostrando cargador de pantalla completa
    checkAdmin(true)

    // Suscribirse a cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setAuthorized(false)
          setLoading(false)
        }
      } else if (event === 'SIGNED_IN') {
        // Si ya estamos autorizados, realizamos una verificación de sesión silenciosa en segundo plano
        // sin interrumpir la interfaz con el spinner dorado.
        const alreadyAuthorized = authorizedRef.current
        checkAdmin(!alreadyAuthorized)
      }
    })
    authSubscription = subscription

    return () => {
      isMounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black-deep flex flex-col items-center justify-center font-poppins">
        {/* Premium Golden Loading Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-gold animate-spin"></div>
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-gold animate-pulse">
          Validando Credenciales
        </p>
        <p className="text-xs text-nude/40 mt-2">Atelier TORRIVA</p>
      </div>
    )
  }

  if (!authorized) {
    // Si el usuario está autenticado pero no es admin, mostrar 403
    // Si no está autenticado en absoluto, redirigir a Login
    const checkUserLogged = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    }

    // Como useEffect corre asíncronamente, podemos manejarlo renderizando una UI 403 premium si hay un email logueado pero no es admin, o si no hay sesión redirigir.
    // Si tenemos error message de falta de rol, mostramos la vista 403 personalizada
    if (errorMessage) {
      return (
        <div className="min-h-screen bg-black-deep flex flex-col items-center justify-center p-6 text-center font-poppins">
          <div className="max-w-md p-8 border border-gold/20 bg-charcoal rounded-lg shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
            
            <div className="text-gold text-5xl mb-6">✦</div>
            <h1 className="font-playfair text-3xl text-white-soft mb-2">403</h1>
            <h2 className="text-gold text-xs uppercase tracking-widest mb-4">Acceso Restringido</h2>
            <div className="w-10 h-px bg-gold/30 mx-auto mb-6" />
            <p className="text-sm text-nude/70 leading-relaxed mb-8">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.reload()
                }}
                className="btn-outline py-2.5 px-6 text-xs justify-center w-full"
              >
                Cerrar Sesión / Volver a Intentar
              </button>
              <a
                href="/"
                className="text-xs text-nude/40 hover:text-gold transition-colors duration-300 underline"
              >
                Regresar a la página principal
              </a>
            </div>
          </div>
        </div>
      )
    }

    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
