import { LuArrowUp } from 'react-icons/lu'

export default function Footer() {
  return (
    <footer className="bg-black-deep border-t border-white/5 relative overflow-hidden">
      {/* Gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 mb-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="TORRIVA Logo"
                className="h-14 md:h-18 w-auto object-contain"
              />
              <h3 className="font-playfair text-3xl tracking-[0.2em]">
                <span className="text-gold-gradient">TORRIVA</span>
              </h3>
            </div>
            <p className="font-playfair italic text-nude/50 text-sm leading-relaxed">
              "Elegancia hecha a medida.<br />
              Cada detalle cuenta."
            </p>
          </div>

          {/* Action button to scroll to top */}
          <div className="flex items-center justify-center pt-4 md:pt-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 font-poppins text-xs uppercase tracking-[0.2em] text-nude/50 hover:text-gold hover:border-gold transition-all duration-300 border border-white/10 px-5 py-3 rounded-none bg-charcoal-light/10"
              aria-label="Volver al inicio"
            >
              <span>Volver arriba</span>
              <LuArrowUp className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-poppins text-xs text-nude/30 text-center md:text-left">
            © {new Date().getFullYear()} TORRIVA Diseñador de Alta Costura. Todos los derechos reservados.
          </p>
          <p className="font-poppins text-xs text-nude/20">
            Confeccionado con{' '}
            <span className="text-gold">♥</span>
            {' '}en Tuxtla Gutiérrez, Chiapas
          </p>
        </div>
      </div>
    </footer>
  )
}
