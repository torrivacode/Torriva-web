import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { WHATSAPP_NUMBER } from '../lib/constants'

const textContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.5,
    }
  }
}

const textItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Hook for image scroll parallax effect
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  // Subtle vertical movement to avoid empty borders (image is absolute and taller than container)
  const yParallax = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <section id="diseñador" className="section-padding bg-charcoal relative overflow-hidden">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            {/* Gold frame accent */}
            <motion.div
              className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-gold/50 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Image mask container */}
            <div className="relative overflow-hidden w-full h-[600px]">
              {/* Designer Image (visible from start with opacity 0.3, scale 1.05) */}
              <motion.img
                src="/disenador.jpg"
                alt="Diseñador de TORRIVA Alta Costura"
                decoding="async"
                className="w-full h-[660px] absolute -top-[30px] left-0 object-cover object-center grayscale-[15%] contrast-105"
                initial={{ opacity: 0.3, scale: 1.05 }}
                animate={isInView ? {
                  opacity: 1,
                  scale: 1.00
                } : {}}
                transition={{
                  duration: 1.5,
                  ease: [0.25, 1, 0.5, 1]
                }}
                style={{ y: yParallax }}
              />

              {/* Gold shimmer light beam (occupies ~20% of width, skewed, soft edge via gradient stops) */}
              <motion.div
                className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-gold/10 via-gold/45 via-gold/10 to-transparent skew-x-12 z-20 pointer-events-none"
                initial={{ left: "-30%" }}
                animate={isInView ? { left: "120%" } : {}}
                transition={{
                  duration: 1.5,
                  ease: [0.25, 1, 0.5, 1]
                }}
              />

              {/* Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black-deep/40 to-transparent pointer-events-none z-10" />
            </div>

            {/* Logo badge (appears after shimmer finishes, duration 0.5s) */}
            <motion.div
              className="absolute -bottom-6 -right-6 bg-black-deep border border-gold/30 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center shadow-lg z-25"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.9,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <img
                src="/logo.png"
                alt="Logo TORRIVA"
                className="w-full h-full object-contain p-2.5"
              />
            </motion.div>
          </div>

          {/* Text side */}
          <motion.div
            variants={textContainerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.p variants={textItemVariants} className="section-subtitle">
              Conoce al Diseñador
            </motion.p>
            <motion.h2 variants={textItemVariants} className="section-title">
              El arte detrás<br />de cada prenda
            </motion.h2>
            <motion.div variants={textItemVariants} className="gold-divider-left" />

            <motion.div variants={textItemVariants} className="space-y-5 font-poppins text-nude/70 leading-relaxed">
              <p>
                Con más de una década de experiencia en el mundo de la costura y la alta moda,
                TORRIVA nace de una pasión genuina por transformar telas e hilos en
                <span className="text-gold"> piezas únicas que cuentan historias</span>.
              </p>
              <p>
                Cada prenda es el resultado de un proceso artesanal cuidadoso: desde la primera
                consulta hasta la entrega final, el objetivo es que cada cliente se sienta
                exactly como imaginó — o mejor.
              </p>
              <p>
                La filosofía de TORRIVA se basa en la atención al detalle, la confección
                impecable y el respeto por la identidad de cada persona.
                <span className="text-gold"> Tu cuerpo, tu historia, tu prenda.</span>
              </p>
            </motion.div>

            {/* Values */}
            <motion.div variants={textItemVariants} className="grid grid-cols-2 gap-4 mt-10">
              {[
                { icon: '✦', title: 'Atención al detalle', desc: 'Cada costura es perfecta' },
                { icon: '✦', title: 'Diseño exclusivo', desc: 'Prendas únicas para ti' },
                { icon: '✦', title: 'Calidad premium', desc: 'Materiales de primera' },
                { icon: '✦', title: 'Proceso personalizado', desc: 'Hecho a tu medida' },
              ].map((value) => (
                <div key={value.title} className="group">
                  <div className="flex items-start gap-3">
                    <span className="text-gold text-sm mt-0.5">{value.icon}</span>
                    <div>
                      <p className="font-poppins text-sm font-semibold text-white-soft group-hover:text-gold transition-colors">
                        {value.title}
                      </p>
                      <p className="font-poppins text-xs text-nude/50 mt-0.5">{value.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={textItemVariants} className="mt-10">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20gustaría%20agendar%20una%20consulta.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex"
                id="about-btn-consulta"
              >
                Agendar Consulta
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
