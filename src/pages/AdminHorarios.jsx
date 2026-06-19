import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LuClock, LuX } from 'react-icons/lu'

export default function AdminHorarios() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados de edición
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedules, setEditingSchedules] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('horarios_atencion')
        .select('*')
        .order('numero_dia', { ascending: true })

      if (err) throw err
      setSchedules(data || [])
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching schedules:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) {
        fetchSchedules()
      }
    }, 0)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  const handleOpenEdit = () => {
    setEditingSchedules(schedules.map(s => ({ ...s })))
    setError('')
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Validar hora de cierre posterior a la de apertura en días activos y abiertos
    for (const day of editingSchedules) {
      if (day.activo && day.estado === 'abierto') {
        if (!day.hora_apertura || !day.hora_cierre) {
          setError(`Por favor define el horario completo para el día ${day.nombre_dia}.`)
          setSaving(false)
          return
        }

        const openTime = day.hora_apertura.substring(0, 5)
        const closeTime = day.hora_cierre.substring(0, 5)

        if (openTime >= closeTime) {
          setError(`En el día ${day.nombre_dia}, la hora de cierre debe ser posterior a la de apertura.`)
          setSaving(false)
          return
        }
      }
    }

    try {
      // Upsert
      const rowsToUpsert = editingSchedules.map(day => ({
        id: day.id,
        numero_dia: day.numero_dia,
        nombre_dia: day.nombre_dia,
        hora_apertura: day.estado === 'cerrado' ? null : day.hora_apertura,
        hora_cierre: day.estado === 'cerrado' ? null : day.hora_cierre,
        estado: day.estado,
        activo: day.activo,
        updated_at: new Date().toISOString()
      }))

      const { error: upsertError } = await supabase
        .from('horarios_atencion')
        .upsert(rowsToUpsert)

      if (upsertError) throw upsertError

      // Perfil del administrador
      const { data: { session } } = await supabase.auth.getSession()
      let adminName = 'Administrador'
      if (session) {
        const { data: profile } = await supabase
          .from('administradores')
          .select('nombre')
          .eq('id', session.user.id)
          .single()
        if (profile?.nombre) adminName = profile.nombre
      }

      // Actividad
      await supabase
        .from('actividad')
        .insert({
          tipo: 'configuracion',
          descripcion: `Horarios de atención actualizados por ${adminName}`,
          usuario: adminName
        })

      setSchedules(editingSchedules)
      setIsModalOpen(false)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error saving schedules:', err)
      }
      setError('Ocurrió un error al guardar los horarios: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const hours = parseInt(h)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h12 = hours % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  return (
    <div className="space-y-6 animate-fade-in font-poppins text-white-soft">
      {/* Control Bar */}
      <div className="bg-charcoal border border-white/5 p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-xl text-white-soft">Horarios de Atención</h2>
          <p className="text-xs text-nude/40 mt-1">Configura las horas comerciales y la disponibilidad del atelier para tus clientes.</p>
        </div>
        {!loading && schedules.length > 0 && (
          <button
            onClick={handleOpenEdit}
            className="btn-primary py-2.5 px-5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
          >
            <LuClock className="w-4 h-4" />
            Configurar Horarios
          </button>
        )}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-20 bg-charcoal/30 border border-white/5">
          <div className="w-10 h-10 border-2 border-white/5 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-gold animate-pulse">Sincronizando Horarios</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-20 bg-charcoal border border-white/5 text-nude/40">
          No hay horarios registrados. Verifica la base de datos de Supabase.
        </div>
      ) : (
        <div className="bg-charcoal border border-white/5 max-w-2xl">
          <div className="p-6 space-y-4">
            <h3 className="font-playfair text-lg text-white-soft/80 border-b border-white/5 pb-3 font-light">Horario comercial actual</h3>
            <div className="space-y-3 pt-2">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  className={`flex items-center justify-between py-3 border-b border-white/5 last:border-0 ${
                    !schedule.activo ? 'opacity-35' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${schedule.activo ? 'bg-gold' : 'bg-white/10'}`} />
                    <span className="text-sm font-semibold text-white-soft w-28">
                      {schedule.nombre_dia}
                    </span>
                    {!schedule.activo && (
                      <span className="text-[8px] bg-white/5 border border-white/10 text-nude/40 px-2 py-0.5 uppercase tracking-wider font-bold">
                        Inactivo en Web
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gold uppercase tracking-wider bg-black-deep/50 px-4 py-2 border border-white/5 w-48 text-center">
                    {schedule.estado === 'cerrado'
                      ? 'Cerrado'
                      : `${formatTime(schedule.hora_apertura)} - ${formatTime(schedule.hora_cierre)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black-deep/85 backdrop-blur-sm" />
          <div className="relative w-full max-w-3xl bg-charcoal border border-gold/30 p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto rounded-none">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-nude/40 hover:text-gold text-2xl transition-colors"
              aria-label="Cerrar modal"
            >
              <LuX />
            </button>

            <h3 className="font-playfair text-xl md:text-2xl text-white-soft mb-1">
              Configurar Horarios de Atención
            </h3>
            <p className="text-xs text-gold uppercase tracking-widest mb-6">Atelier Torriva</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-none">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="divide-y divide-white/5">
                {editingSchedules.map((day, idx) => (
                  <div key={day.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Nombre del día y checkbox activo */}
                    <div className="flex items-center gap-3 w-40 shrink-0">
                      <input
                        type="checkbox"
                        id={`active-${day.id}`}
                        checked={day.activo}
                        onChange={(e) => {
                          const updated = [...editingSchedules]
                          updated[idx].activo = e.target.checked
                          setEditingSchedules(updated)
                        }}
                        className="w-4 h-4 border border-white/10 rounded-none bg-black-deep text-gold focus:ring-0 focus:ring-offset-0 cursor-pointer accent-gold"
                      />
                      <label htmlFor={`active-${day.id}`} className={`text-sm font-semibold cursor-pointer ${day.activo ? 'text-white-soft' : 'text-nude/30'}`}>
                        {day.nombre_dia}
                      </label>
                    </div>

                    {/* Controles de Horario */}
                    <div className="flex-1 flex flex-wrap items-center gap-4 sm:justify-end">
                      {/* Estado: Abierto / Cerrado */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-nude/40 uppercase tracking-wider">Estado:</span>
                        <select
                          disabled={!day.activo}
                          value={day.estado}
                          onChange={(e) => {
                            const updated = [...editingSchedules]
                            updated[idx].estado = e.target.value
                            setEditingSchedules(updated)
                          }}
                          className="bg-black-deep border border-white/10 focus:border-gold px-3 py-1.5 text-xs text-white-soft outline-none disabled:opacity-40 cursor-pointer"
                        >
                          <option value="abierto">Abierto</option>
                          <option value="cerrado">Cerrado</option>
                        </select>
                      </div>

                      {/* Horas de apertura/cierre (Solo si está abierto) */}
                      {day.estado === 'abierto' && day.activo ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            required
                            value={day.hora_apertura ? day.hora_apertura.substring(0, 5) : '09:00'}
                            onChange={(e) => {
                              const updated = [...editingSchedules]
                              updated[idx].hora_apertura = `${e.target.value}:00`
                              setEditingSchedules(updated)
                            }}
                            className="bg-black-deep border border-white/10 focus:border-gold px-3 py-1.5 text-xs text-white-soft outline-none"
                          />
                          <span className="text-nude/35 text-xs">a</span>
                          <input
                            type="time"
                            required
                            value={day.hora_cierre ? day.hora_cierre.substring(0, 5) : '19:00'}
                            onChange={(e) => {
                              const updated = [...editingSchedules]
                              updated[idx].hora_cierre = `${e.target.value}:00`
                              setEditingSchedules(updated)
                            }}
                            className="bg-black-deep border border-white/10 focus:border-gold px-3 py-1.5 text-xs text-white-soft outline-none"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-nude/30 w-36 text-center sm:text-right italic">
                          {!day.activo ? 'Desactivado' : 'Cerrado'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs tracking-widest font-semibold justify-center uppercase py-3 px-6 sm:w-auto w-full"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-black-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline text-xs tracking-widest font-semibold justify-center uppercase py-3 px-6 sm:w-auto w-full"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
