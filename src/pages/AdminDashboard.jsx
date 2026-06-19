import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  LuImage,
  LuExternalLink,
  LuChevronRight
} from 'react-icons/lu'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setLoading(true)

        // Obtener los últimos 5 proyectos agregados
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, cover_image_url, status, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        setRecentProjects(data || [])
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching recent projects:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-poppins">
        <div className="w-10 h-10 rounded-full border border-white/5 border-t-gold animate-spin"></div>
        <p className="mt-6 text-[10px] uppercase tracking-widest text-gold/60 animate-pulse">
          Sincronizando Atelier
        </p>
      </div>
    )
  }

  // Formateador de fecha elegante
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace('.', '')
  }

  return (
    <div className="space-y-16 animate-fade-in font-poppins text-white-soft max-w-5xl mx-auto py-4">
      
      {/* Hero Fusionado del Dashboard */}
      <div className="relative p-8 md:p-16 overflow-hidden border border-white/5 bg-gradient-to-br from-[#0B0B0B] via-[#121212] to-[#1E190F] flex flex-col items-center text-center justify-center min-h-[300px]">
        {/* Detalle decorativo dorado de alta costura */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gold/60 via-gold/10 to-transparent" />
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Esquinas decorativas doradas muy sutiles */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-gold/20" />
        <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-gold/20" />
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-gold/20" />
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-gold/20" />

        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-xl">
          <span className="text-[10px] tracking-[0.4em] text-gold uppercase font-semibold">Atelier Torriva</span>
          
          <h1 className="font-playfair text-3xl md:text-5xl text-white-soft font-normal tracking-wide leading-tight">
            Panel de Administración
          </h1>
          
          <p className="text-xs md:text-sm text-nude/50 font-light leading-relaxed max-w-md">
            Administra tus diseños, proyectos y galería de alta costura.
          </p>
          
          <Link
            to="/admin/portfolio"
            state={{ openCreate: true }}
            className="mt-4 inline-flex items-center gap-2 bg-gold hover:bg-[#B3933B] text-black text-[10px] font-semibold uppercase tracking-[0.2em] px-10 py-4 transition-all duration-300 shadow-lg shadow-gold/5 hover:scale-[1.02]"
          >
            Nuevo Diseño
          </Link>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="font-playfair text-lg text-white-soft/95 font-light">
            Últimos proyectos agregados
          </h3>
          <Link 
            to="/admin/portfolio" 
            className="text-[10px] text-gold uppercase tracking-widest hover:text-white-soft transition-colors flex items-center gap-1"
          >
            Ver todos <LuChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-12 text-center border border-white/5 bg-charcoal/20">
            <p className="text-xs text-nude/30 uppercase tracking-widest">No hay proyectos en el portafolio</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {recentProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="py-4 flex items-center justify-between gap-4 group hover:bg-black-deep/10 px-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 shrink-0 bg-black-deep border border-white/10 overflow-hidden relative">
                      {project.cover_image_url ? (
                        <img 
                          src={project.cover_image_url} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold/20">
                          <LuImage className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-playfair text-sm md:text-base text-white-soft font-normal truncate group-hover:text-gold transition-colors duration-300">
                        {project.title}
                      </h4>
                      <p className="text-[10px] text-nude/40 mt-1 uppercase tracking-wider font-light">
                        {formatDate(project.created_at || project.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[9px] uppercase tracking-wider font-semibold border ${
                      project.status === 'publicado'
                        ? 'bg-white/5 text-white-soft border-white/10'
                        : 'bg-gold/5 text-gold border-gold/10'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accesos Rápidos (Máximo dos) */}
      <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16">
        <Link
          to="/admin/portfolio"
          className="text-xs uppercase tracking-[0.2em] text-nude/50 hover:text-gold transition-colors duration-300 flex items-center gap-2 group"
        >
          <LuImage className="w-4 h-4 text-gold/60 group-hover:text-gold transition-colors" />
          Gestionar Portafolio
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs uppercase tracking-[0.2em] text-nude/50 hover:text-gold transition-colors duration-300 flex items-center gap-2 group"
        >
          <LuExternalLink className="w-4 h-4 text-gold/60 group-hover:text-gold transition-colors" />
          Ver Sitio Web
        </a>
      </div>

    </div>
  )
}
