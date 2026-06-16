import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiScissors } from 'react-icons/hi'
import { GiSewingNeedle, GiDress } from 'react-icons/gi'
import { WHATSAPP_NUMBER } from '../lib/constants'

const services = [
  {
    id: 'ajustes',
    icon: HiScissors,
    eyebrow: '01',
    title: 'Ajustes y Reparaciones',
    description:
      'Damos nueva vida a tus prendas favoritas con ajustes precisos y reparaciones impecables.',
    items: [
      'Cambio de cierres',
      'Dobladillos y bastillas',
      'Entalles y ajustes de figura',
      'Reparaciones generales',
      'Ajustes personalizados',
    ],
    accent: 'from-gold/10 to-transparent',
  },
  {
    id: 'medida',
    icon: GiSewingNeedle,
    eyebrow: '02',
    title: 'Prendas a Medida',
    description:
      'Confeccionamos prendas únicas diseñadas exactamente para tu cuerpo y personalidad.',
    items: [
      'Faldas personalizadas',
      'Blusas a medida',
      'Vestidos exclusivos',
      'Diseños originales',
      'Telas de tu elección',
    ],
    accent: 'from-gold/5 to-transparent',
    featured: true,
  },
  {
    id: 'alta-moda',
    icon: GiDress,
    eyebrow: '03',
    title: 'Alta Moda',
    description:
      'Creamos piezas de lujo para los momentos más especiales de tu vida.',
    items: [
      'Vestidos de XV años',
      'Vestidos de novia',
      'Vestidos de graduación',
      'Diseños exclusivos',
      'Trajes de gala',
    ],
    accent: 'from-gold/10 to-transparent',
  },
]

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="servicios" className="section-padding bg-black-deep relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div ref={ref} className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-subtitle">Nuestros Servicios</p>
          <h2 className="section-title">Todo lo que necesitas<br />para brillar</h2>
          <div className="gold-divider" />
          <p className="font-poppins text-nude/60 max-w-xl mx-auto">
            Desde pequeños ajustes hasta creaciones de alta moda, cada servicio
            se realiza con la misma pasión y dedicación.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`relative group p-8 card-dark ${
                  service.featured ? 'border-gold/40 bg-gradient-to-b from-gold/5 to-charcoal' : ''
                }`}
              >
                {/* Featured badge */}
                {service.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold px-4 py-1">
                    <span className="font-poppins text-xs text-black-deep font-semibold uppercase tracking-widest">
                      Más Solicitado
                    </span>
                  </div>
                )}

                {/* Number */}
                <p className="font-playfair text-6xl text-gold/10 font-bold absolute top-6 right-6 leading-none">
                  {service.eyebrow}
                </p>

                {/* Icon */}
                <div className="w-14 h-14 border border-gold/30 flex items-center justify-center mb-6 group-hover:border-gold group-hover:bg-gold/5 transition-all duration-300">
                  <Icon className="text-gold text-2xl" />
                </div>

                <h3 className="font-playfair text-2xl text-white-soft mb-3 group-hover:text-gold transition-colors">
                  {service.title}
                </h3>
                <p className="font-poppins text-sm text-nude/60 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Items list */}
                <ul className="space-y-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 font-poppins text-sm text-nude/70">
                      <span className="text-gold text-xs">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20interesa%20el%20servicio%20de%20${encodeURIComponent(service.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-8 text-gold text-sm font-poppins font-medium group-hover:gap-3 transition-all duration-300"
                  id={`service-btn-${service.id}`}
                >
                  Solicitar cotización
                  <span className="text-xs">→</span>
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
