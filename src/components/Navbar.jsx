import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX } from 'react-icons/hi'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Diseñador', href: '#diseñador' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Portafolio', href: '#portafolio' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black-deep/95 backdrop-blur-md border-b border-gold/10 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          {/* Logo */}
          <motion.a
            href="#inicio"
            onClick={() => handleNavClick('#inicio')}
            className="flex items-center gap-3 cursor-pointer group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Contenedor del Isotipo (monograma TV) */}
            <div className="h-8 md:h-12 w-8 md:w-12 overflow-hidden flex items-start justify-center">
              <img
                src="/logo.png"
                alt="Isotipo TORRIVA"
                className="w-full h-auto object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-playfair text-2xl tracking-[0.25em] text-white-soft transition-colors duration-300">
              <span className="text-gold-gradient">TORRIVA</span>
            </span>
          </motion.a>

          {/* Desktop Links */}
          <motion.ul
            className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className="font-poppins text-xs uppercase tracking-[0.15em] text-nude/70 hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </motion.ul>



          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gold text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black-deep/98 backdrop-blur-md flex flex-col items-center justify-center gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Logo en menú móvil */}
            <motion.div 
              className="flex flex-col items-center gap-2 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <img
                src="/logo.png"
                alt="TORRIVA Logo"
                className="h-28 w-auto object-contain"
              />
              <span className="font-playfair text-2xl tracking-[0.25em] text-gold-gradient font-semibold mt-1">TORRIVA</span>
              <span className="font-poppins text-[10px] tracking-[0.25em] text-white/50 uppercase mt-0.5">Alta Costura</span>
            </motion.div>

            <ul className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="font-playfair text-2xl text-white-soft hover:text-gold transition-colors"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}

            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
