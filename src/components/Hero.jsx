import { motion } from 'framer-motion'
import { HiArrowDown } from 'react-icons/hi'

export default function Hero() {
  const scrollToSection = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.webp"
          alt="TORRIVA Diseñador de Alta Costura — Alta Costura a Medida"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layer overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black-deep/95 via-black-deep/60 to-black-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black-deep via-transparent to-black-deep/40" />
      </div>

      {/* Decorative gold line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid lg:grid-cols-2 gap-12 items-center py-32">
        <div>
          {/* Eyebrow */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="font-poppins text-xs md:text-sm tracking-[0.3em] text-gold uppercase font-medium">
              ALTA COSTURA A MEDIDA
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="font-playfair text-5xl md:text-7xl text-white-soft leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Diseños únicos{' '}
            <span className="italic text-gold-gradient">
              hechos
            </span>{' '}
            para ti
          </motion.h1>

          {/* Divider */}
          <motion.div
            className="w-20 h-px bg-gold mb-8"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />

          {/* Subtitle */}
          <motion.p
            className="font-poppins text-nude/70 text-lg leading-relaxed max-w-lg mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            Transformamos ideas en prendas únicas hechas a tu medida.
            Cada detalle cuenta, cada costura es un arte.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 max-w-md sm:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <button
              onClick={() => scrollToSection('#servicios')}
              className="btn-primary justify-center"
              id="hero-btn-servicios"
            >
              Ver Servicios
            </button>
            <button
              onClick={() => scrollToSection('#portafolio')}
              className="btn-outline justify-center"
              id="hero-btn-portafolio"
            >
              Ver Portafolio
            </button>
          </motion.div>
        </div>

        {/* Right side brand tagline */}
        <motion.div
          className="hidden lg:flex flex-col items-end gap-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
        >
          <div className="text-right">
            <p className="font-playfair italic text-2xl text-gold/60 leading-relaxed">
              "No solo confeccionamos prendas.
              <br />
              <span className="text-gold/90">Diseñamos piezas únicas</span>
              <br />
              que reflejan tu esencia."
            </p>
          </div>


        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={() => scrollToSection('#diseñador')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gold/50 hover:text-gold transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="font-poppins text-xs uppercase tracking-widest">Descubrir</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <HiArrowDown className="text-xl" />
        </motion.div>
      </motion.button>
    </section>
  )
}
