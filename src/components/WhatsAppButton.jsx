import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../lib/constants'

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 3000)
    const hideTooltip = setTimeout(() => setShowTooltip(false), 6000)
    return () => {
      clearTimeout(timer)
      clearTimeout(tooltipTimer)
      clearTimeout(hideTooltip)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-charcoal border border-gold/20 px-4 py-2 text-right shadow-xl"
              >
                <p className="font-poppins text-xs text-white-soft font-semibold">¡Hola! 👋</p>
                <p className="font-poppins text-xs text-nude/50">
                  ¿Lista para tu prenda soñada?
                  <br />
                  Escríbenos por WhatsApp.
                </p>
                {/* Arrow */}
                <div className="absolute right-4 -bottom-1.5 w-3 h-3 bg-charcoal border-r border-b border-gold/20 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20gustaría%20más%20información%20sobre%20los%20servicios%20de%20TORRIVA.`}
            target="_blank"
            rel="noopener noreferrer"
            id="whatsapp-float-btn"
            aria-label="Contactar por WhatsApp"
            className="w-14 h-14 bg-[#25D366] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 pulse-gold"
          >
            <FaWhatsapp className="text-white text-2xl" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
