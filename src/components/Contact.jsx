import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'
import {
  LuPhone,
  LuClock,
  LuMapPin,
  LuMessageCircle,
  LuExternalLink,
} from 'react-icons/lu'
import { supabase } from '../lib/supabaseClient'
import { WHATSAPP_NUMBER, WHATSAPP_NUMBER_FORMATTED, PHONE_NUMBER_VISIBLE } from '../lib/constants'

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [horarios, setHorarios] = useState([])

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const { data, error } = await supabase
          .from('horarios_atencion')
          .select('*')
          .order('numero_dia', { ascending: true })

        if (error) throw error
        if (data && data.length > 0) {
          setHorarios(data)
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching schedules in public page:', err)
        }
      }
    }

    fetchHorarios()
  }, [])

  const formatTime12h = (timeStr) => {
    if (!timeStr) return ''
    const [hoursStr, minutesStr] = timeStr.split(':')
    const hours = parseInt(hoursStr)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutesStr} ${ampm}`
  }

  const getFormattedHorarios = (schedulesList) => {
    const activeSchedules = schedulesList.filter(h => h.activo)
    if (activeSchedules.length === 0) return ['Sin horarios disponibles']
    
    const abbreviate = (name) => {
      const mapping = {
        'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié',
        'Jueves': 'Jue', 'Viernes': 'Vie', 'Sábado': 'Sáb',
        'Domingo': 'Dom'
      }
      return mapping[name] || name
    }

    const groups = []
    let currentGroup = null

    activeSchedules.forEach((item, idx) => {
      const timeStr = item.estado === 'cerrado' 
        ? 'Cerrado' 
        : `${formatTime12h(item.hora_apertura)} - ${formatTime12h(item.hora_cierre)}`
      
      if (!currentGroup) {
        currentGroup = {
          startDay: item.nombre_dia,
          endDay: item.nombre_dia,
          timeStr: timeStr,
          numeroStart: item.numero_dia,
          numeroEnd: item.numero_dia,
          daysList: [item.nombre_dia]
        }
      } else {
        if (currentGroup.timeStr === timeStr && item.numero_dia === currentGroup.numeroEnd + 1) {
          currentGroup.endDay = item.nombre_dia
          currentGroup.numeroEnd = item.numero_dia
          currentGroup.daysList.push(item.nombre_dia)
        } else {
          groups.push(currentGroup)
          currentGroup = {
            startDay: item.nombre_dia,
            endDay: item.nombre_dia,
            timeStr: timeStr,
            numeroStart: item.numero_dia,
            numeroEnd: item.numero_dia,
            daysList: [item.nombre_dia]
          }
        }
      }
      
      if (idx === activeSchedules.length - 1) {
        groups.push(currentGroup)
      }
    })

    return groups.map(g => {
      if (g.daysList.length === 1) {
        return `${g.startDay}: ${g.timeStr}`
      } else if (g.daysList.length === 2) {
        return `${abbreviate(g.startDay)} y ${abbreviate(g.endDay)}: ${g.timeStr}`
      } else {
        return `${abbreviate(g.startDay)} - ${abbreviate(g.endDay)}: ${g.timeStr}`
      }
    })
  }


  return (
    <section id="contacto" className="section-padding bg-charcoal relative overflow-hidden">
      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Decorative background blur shapes */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-gold/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-subtitle">Contacto & Ubicación</p>
          <h2 className="section-title">Nuestro Taller</h2>
          <div className="gold-divider" />
        </motion.div>

        {/* Intro Text */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h3 className="font-playfair text-3xl md:text-4xl text-white-soft leading-tight mb-4">
            Visítanos o hablemos de tu proyecto
          </h3>
          <p className="font-poppins text-sm text-nude/60 leading-relaxed">
            Cada prenda nace de una conversación. Te invitamos a agendar una cita personalizada
            en nuestro taller para conocer tus ideas, tomar medidas y confeccionar juntos una pieza memorable.
          </p>
        </motion.div>

        {/* Editorial Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Info & WhatsApp Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Info Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Tarjeta Unificada de Contacto */}
              <div className="col-span-2 p-5 bg-charcoal-light/30 border border-gold/20 rounded-lg shadow-lg">
                <p className="font-poppins text-[10px] text-gold uppercase tracking-widest font-semibold mb-4 text-center sm:text-left">Atención & Contacto Directo</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* WhatsApp Link */}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-black-deep/40 border border-white/5 hover:border-gold/30 hover:bg-charcoal-light/20 transition-all duration-300 rounded-lg flex items-center gap-3 group"
                    id="contact-btn-whatsapp"
                  >
                    <div className="w-10 h-10 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <LuMessageCircle className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="font-poppins text-[10px] text-gold uppercase tracking-widest font-semibold">WhatsApp</p>
                      <p className="font-poppins text-sm font-semibold text-white-soft mt-0.5">Escríbenos</p>
                      <p className="font-poppins text-xs text-nude/40">{WHATSAPP_NUMBER_FORMATTED}</p>
                    </div>
                    <span className="ml-auto text-gold group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </a>

                  {/* Teléfono Link */}
                  <a
                    href={`tel:+${WHATSAPP_NUMBER}`}
                    className="p-4 bg-black-deep/40 border border-white/5 hover:border-gold/30 hover:bg-charcoal-light/20 transition-all duration-300 rounded-lg flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-nude/50 group-hover:text-gold group-hover:border-gold/30 transition-colors duration-300 flex-shrink-0">
                      <LuPhone className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="font-poppins text-[10px] text-nude/40 uppercase tracking-widest">Llámanos</p>
                      <p className="font-poppins text-sm font-semibold text-white-soft mt-0.5">Llamada Directa</p>
                      <p className="font-poppins text-xs text-nude/40">{PHONE_NUMBER_VISIBLE}</p>
                    </div>
                    <span className="ml-auto text-nude/40 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </a>


                </div>
              </div>

              {/* Horario Card (Ancho Completo y Espacioso) */}
              <div className="col-span-2 p-6 bg-charcoal-light/20 border border-white/5 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gold flex-shrink-0">
                    <LuClock className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="font-poppins text-[10px] text-nude/40 uppercase tracking-widest">Horarios de Atención</p>
                    <p className="font-poppins text-xs text-gold">Te esperamos en nuestro taller en los siguientes horarios:</p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {horarios.filter(h => h.activo).length === 0 ? (
                    <div className="col-span-2 p-5 bg-black-deep/20 border border-dashed border-gold/20 rounded text-center">
                      <p className="font-poppins text-sm font-semibold text-white-soft">Atención bajo previa cita</p>
                      <p className="font-poppins text-xs text-nude/40 mt-1">
                        Escríbenos por WhatsApp o llámanos para consultar disponibilidad y agendar tu visita.
                      </p>
                    </div>
                  ) : (
                    getFormattedHorarios(horarios).map((text, idx) => {
                      const parts = text.split(':')
                      const days = parts[0]
                      const time = parts.slice(1).join(':').trim()
                      
                      return (
                        <div 
                          key={idx} 
                          className="flex justify-between items-center p-4 bg-black-deep/20 border border-white/5 hover:border-gold/20 rounded transition-colors duration-200"
                        >
                          <span className="font-poppins text-sm font-semibold text-white-soft">{days}</span>
                          <span className="font-poppins text-xs text-nude/60">{time}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Link Blocks */}
            <div className="flex items-center gap-6 pt-4">
              <p className="font-poppins text-xs text-nude/40 uppercase tracking-widest">Síguenos en redes:</p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/torriva_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center text-nude/50 hover:border-gold hover:text-gold transition-all duration-300"
                  id="contact-instagram"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-base" />
                </a>
                <a
                  href="https://www.facebook.com/people/Torriva/61586972301870/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center text-nude/50 hover:border-gold hover:text-gold transition-all duration-300"
                  id="contact-facebook"
                  aria-label="Facebook"
                >
                  <FaFacebook className="text-base" />
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center text-nude/50 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-300"
                  id="contact-whatsapp-icon"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="text-base" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Google Maps Integrator */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6 w-full"
          >
            {/* Map Frame Container */}
            <div className="relative p-2 bg-black-deep/40 border border-gold/15 rounded-xl shadow-2xl overflow-hidden group">
              {/* Gold corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gold/60 -translate-x-[1px] -translate-y-[1px]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gold/60 translate-x-[1px] -translate-y-[1px]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gold/60 -translate-x-[1px] translate-y-[1px]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gold/60 translate-x-[1px] translate-y-[1px]" />

              <div className="overflow-hidden rounded-lg bg-black-deep">
                <iframe
                  title="Ubicación de TORRIVA"
                  src="https://maps.google.com/maps?q=Toluca%204%2C%20Popular%2C%2029089%20Tuxtla%20Guti%C3%A9rrez%2C%20Chis.&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="360"
                  style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2) opacity(0.85)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[300px] md:h-[350px] rounded-lg transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.01]"
                />
              </div>
            </div>

            {/* Map bottom bar information */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-white/5 bg-charcoal-light/10 rounded-lg">
              <div>
                <p className="font-poppins text-[10px] text-nude/40 uppercase tracking-widest">Dirección Física</p>
                <p className="font-poppins text-sm font-semibold text-white-soft mt-1">Toluca 4, Popular</p>
                <p className="font-poppins text-xs text-nude/50">29089 Tuxtla Gutiérrez, Chis.</p>
              </div>
              <a
                href="https://maps.google.com/?q=Toluca+4,+Popular,+29089+Tuxtla+Gutiérrez,+Chis."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline justify-center text-xs py-2.5 px-4 flex items-center gap-2 group whitespace-nowrap self-start sm:self-center"
              >
                <span>Cómo llegar</span>
                <LuExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  )
}
