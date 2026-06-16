import { useRef } from 'react'
import { motion, useInView, useScroll, useSpring } from 'framer-motion'
import {
  LuMessageCircle,
  LuUsers,
  LuRuler,
  LuPencil,
  LuScissors,
  LuSparkles,
  LuCrown,
} from 'react-icons/lu'
import { WHATSAPP_NUMBER } from '../lib/constants'

const steps = [
  {
    num: '01',
    title: 'Contacto Inicial',
    desc: 'Nos contactas por WhatsApp o formulario para expresar tu idea o necesidad.',
    icon: LuMessageCircle,
  },
  {
    num: '02',
    title: 'Consulta Personalizada',
    desc: 'Agendamos una cita para conocerte, entender tu visión y asesorarte.',
    icon: LuUsers,
  },
  {
    num: '03',
    title: 'Toma de Medidas',
    desc: 'Tomamos tus medidas con precisión para garantizar un ajuste perfecto.',
    icon: LuRuler,
  },
  {
    num: '04',
    title: 'Diseño y Propuesta',
    desc: 'Creamos bocetos y seleccionamos telas según tu estilo y presupuesto.',
    icon: LuPencil,
  },
  {
    num: '05',
    title: 'Confección',
    desc: 'Manos expertas dan vida a tu prenda con los más altos estándares de calidad.',
    icon: LuScissors,
  },
  {
    num: '06',
    title: 'Pruebas y Ajustes',
    desc: 'Te probamos la prenda y realizamos los ajustes necesarios hasta que quede perfecta.',
    icon: LuSparkles,
  },
  {
    num: '07',
    title: 'Entrega Final',
    desc: 'Recibes tu prenda lista para lucirla. ¡Momento de brillar!',
    icon: LuCrown,
  },
]

function ProcessStep({ step, i }) {
  const stepRef = useRef(null)
  const isStepInView = useInView(stepRef, { once: false, margin: '-20% 0px -25% 0px' })
  const isRight = i % 2 === 0
  const Icon = step.icon

  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isStepInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-start gap-6 md:gap-0 ${
        isRight ? 'md:flex-row' : 'md:flex-row-reverse'
      } transition-all duration-500`}
    >
      {/* Content Card */}
      <div className={`flex-1 pl-16 md:pl-0 ${isRight ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
        <div
          className={`inline-block p-6 card-dark border transition-all duration-500 ${
            isStepInView
              ? 'border-gold/40 bg-charcoal-light/95 shadow-[0_8px_30px_rgba(201,168,76,0.1)] scale-[1.02]'
              : 'border-white/5 bg-charcoal/20 opacity-60 scale-100'
          }`}
        >
          <div className={`flex items-center gap-3 mb-3 ${isRight ? 'md:flex-row-reverse' : ''}`}>
            <div
              className={`transition-all duration-500 ${
                isStepInView ? 'scale-110 rotate-[5deg] text-gold' : 'scale-100 text-nude/40'
              }`}
            >
              <Icon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className={`font-playfair text-lg font-semibold transition-colors duration-300 ${isStepInView ? 'text-gold' : 'text-white-soft'}`}>
              {step.title}
            </p>
          </div>
          <p className={`font-poppins text-sm leading-relaxed transition-colors duration-300 ${isStepInView ? 'text-nude/80' : 'text-nude/40'}`}>
            {step.desc}
          </p>
        </div>
      </div>

      {/* Center dot / number */}
      <div
        className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
          isStepInView
            ? 'bg-black-deep border-2 border-gold shadow-[0_0_15px_rgba(232,201,106,0.6)] scale-110'
            : 'bg-black-deep border border-white/10 opacity-50 scale-95'
        }`}
      >
        <span className={`font-poppins text-xs font-bold transition-colors duration-300 ${isStepInView ? 'text-gold' : 'text-nude/30'}`}>
          {step.num}
        </span>
      </div>

      {/* Spacer for alignment */}
      <div className="hidden md:block flex-1" />
    </motion.div>
  )
}

export default function Process() {
  const ref = useRef(null)
  const timelineRef = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  // Obtenemos el progreso del scroll dentro del contenedor de la línea de tiempo
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  })

  // Creamos un muelle elástico suave para que el avance de la línea se sienta muy premium
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  })

  return (
    <section id="proceso" className="section-padding bg-black-deep relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gold/3 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-subtitle">Cómo trabajamos</p>
          <h2 className="section-title">Nuestro Proceso</h2>
          <div className="gold-divider" />
          <p className="font-poppins text-nude/60 max-w-lg mx-auto">
            Un proceso transparente, profesional and completamente personalizado
            para que cada prenda sea exactamente como la imaginaste.
          </p>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Base vertical line (tenue) */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />

          {/* Animated vertical progress line */}
          <motion.div
            style={{ scaleY, transformOrigin: 'top' }}
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold-light to-gold-dark origin-top"
          />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <ProcessStep key={step.num} step={step} i={i} />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="font-poppins text-nude/60 mb-6">¿Listo para comenzar?</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20iniciar%20mi%20proceso%20de%20confección.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            id="process-btn-inicio"
          >
            Comenzar mi prenda
          </a>
        </motion.div>
      </div>
    </section>
  )
}
