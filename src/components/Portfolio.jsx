import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu'
import { WHATSAPP_NUMBER } from '../lib/constants'

const ITEMS_PER_PAGE = 6

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  
  // Proyectos dinámicos desde Supabase
  const [dbProjects, setDbProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Calcular las categorías dinámicamente
  const categories = ['Todos', ...new Set(dbProjects.map((p) => p.category).filter(Boolean))]

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)

  // Resetear página al cambiar de categoría
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory])

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Cargar proyectos de Supabase al iniciar
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('*, project_images(*)')
          .eq('status', 'publicado')
          .order('orden', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const mapped = data.map((proj) => {
            // Ordenar imágenes de la galería según display_order
            const sortedImages = [...(proj.project_images || [])].sort(
              (a, b) => a.display_order - b.display_order
            )
            
            // Garantizar que la imagen principal sea el primer elemento del carrusel
            const galleryUrls = sortedImages.map((img) => img.image_url)
            const gallery = galleryUrls.includes(proj.cover_image_url)
              ? galleryUrls
              : [proj.cover_image_url, ...galleryUrls]

            return {
              id: proj.id,
              category: proj.category,
              title: proj.title,
              desc: proj.description || '',
              image: proj.cover_image_url,
              gallery,
              tag: proj.custom_tag || '',
            }
          })
          setDbProjects(mapped)
        } else {
          setDbProjects([])
        }
      } catch (err) {
        console.error('Error al cargar portafolio público:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [])

  // Seleccionar proyectos dinámicos
  const currentPortfolio = dbProjects

  const filtered = activeCategory === 'Todos'
    ? currentPortfolio
    : currentPortfolio.filter((item) => item.category === activeCategory)

  // Paginación lógica
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Inyectar optimización automática de Cloudinary
  const getOptimizedUrl = (url) => {
    if (url && url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/')
    }
    return url
  }

  // Navegación en el lightbox del portafolio
  const handlePrevImage = (e, gallery) => {
    e.stopPropagation()
    setActiveImageIdx((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
  }

  const handleNextImage = (e, gallery) => {
    e.stopPropagation()
    setActiveImageIdx((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
  }

  return (
    <section id="portafolio" className="section-padding bg-charcoal relative overflow-hidden">
      {/* Decorative Blur shapes */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold/2 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-subtitle">Nuestro Trabajo</p>
          <h2 className="section-title">Portafolio</h2>
          <div className="gold-divider" />
          <p className="font-poppins text-nude/60 max-w-lg mx-auto text-sm">
            Cada prenda es una obra de arte única. Explora nuestra colección de vestidos y diseños confeccionados a mano en nuestro taller.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 font-poppins text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gold text-black-deep font-semibold'
                  : 'border border-white/10 text-nude/60 hover:border-gold/50 hover:text-gold'
              }`}
              id={`portfolio-filter-${cat.toLowerCase().replace(' ', '-')}`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Portafolio Grid */}
        {loading && dbProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-white/5 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest text-gold animate-pulse">Obteniendo Diseños...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            className="text-center py-20 border border-white/5 bg-charcoal-light/10 p-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-2xl mb-4 block">✨</span>
            <p className="font-playfair text-lg text-gold/80 font-light">Próximamente nuevas colecciones</p>
            <p className="font-poppins text-xs text-nude/40 mt-2 leading-relaxed">
              Estamos confeccionando prendas exclusivas. Muy pronto podrás explorar nuestros nuevos diseños en esta sección.
            </p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {paginatedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="group relative overflow-hidden cursor-pointer border border-white/5 hover:border-gold/20 transition-all duration-300"
                  onClick={() => {
                    setSelectedItem(item)
                    setActiveImageIdx(0)
                  }}
                  id={`portfolio-item-${item.id}`}
                >
                  <img
                    src={getOptimizedUrl(item.image)}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black-deep via-black-deep/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

                  {/* Category Tag */}
                  {item.tag && (
                    <div className="absolute top-4 right-4 bg-gold/90 px-3 py-1 z-10">
                      <span className="font-poppins text-[10px] text-black-deep font-bold uppercase tracking-wider">
                        {item.tag}
                      </span>
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-poppins text-[10px] text-gold uppercase tracking-widest mb-1.5 font-semibold">
                      {item.category}
                    </p>
                    <h3 className="font-playfair text-xl text-white-soft">{item.title}</h3>
                    <p className="font-poppins text-xs text-nude/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-12 font-poppins"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Botón Anterior */}
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1)
                  document.getElementById('portafolio')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              disabled={currentPage === 1}
              className={`p-2.5 border border-white/10 hover:border-gold hover:text-gold transition-colors flex items-center justify-center ${
                currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'text-nude/70 cursor-pointer'
              }`}
              aria-label="Página anterior"
            >
              <LuChevronLeft className="w-5 h-5" />
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page)
                  document.getElementById('portafolio')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`w-10 h-10 border transition-all duration-300 font-medium text-xs tracking-wider flex items-center justify-center ${
                  currentPage === page
                    ? 'bg-gold text-black-deep border-gold font-semibold scale-105'
                    : 'border-white/10 text-nude/60 hover:border-gold/50 hover:text-gold cursor-pointer'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Botón Siguiente */}
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1)
                  document.getElementById('portafolio')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              disabled={currentPage === totalPages}
              className={`p-2.5 border border-white/10 hover:border-gold hover:text-gold transition-colors flex items-center justify-center ${
                currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-nude/70 cursor-pointer'
              }`}
              aria-label="Página siguiente"
            >
              <LuChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* --- Lightbox Modal with Carousel --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black-deep/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="relative max-w-2xl w-full bg-charcoal border border-gold/20 rounded-none shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button X */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute -top-12 right-0 text-white-soft hover:text-gold text-2xl p-2 z-10 transition-colors"
                aria-label="Cerrar"
              >
                <LuX />
              </button>

              {/* Carousel Container */}
              <div className="relative w-full h-[450px] sm:h-[550px] md:h-[600px] overflow-hidden bg-black-deep flex items-center justify-center">
                <img
                  src={getOptimizedUrl(selectedItem.gallery[activeImageIdx])}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />

                {/* Navigation arrows (only if there are multiple images) */}
                {selectedItem.gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrevImage(e, selectedItem.gallery)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-white/5 hover:border-gold hover:text-gold text-white flex items-center justify-center transition-colors"
                      aria-label="Anterior imagen"
                    >
                      <LuChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => handleNextImage(e, selectedItem.gallery)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-white/5 hover:border-gold hover:text-gold text-white flex items-center justify-center transition-colors"
                      aria-label="Siguiente imagen"
                    >
                      <LuChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Carousel Indicators Dot Bar */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {selectedItem.gallery.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIdx ? 'bg-gold w-4' : 'bg-white/30'}`}
                          aria-label={`Ir a imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Details Info */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="font-poppins text-[10px] text-gold uppercase tracking-widest font-semibold">
                    {selectedItem.category}
                  </span>
                  <span className="text-[10px] text-nude/40">
                    Foto {activeImageIdx + 1} de {selectedItem.gallery.length}
                  </span>
                </div>
                
                <h3 className="font-playfair text-2xl text-white-soft mb-2">{selectedItem.title}</h3>
                <p className="font-poppins text-xs text-nude/60 leading-relaxed">{selectedItem.desc}</p>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t border-white/5">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20interesa%20un%20diseño%20similar%20a%20${encodeURIComponent(selectedItem.title)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs tracking-widest font-semibold justify-center uppercase py-3 px-6 sm:w-auto w-full"
                  >
                    Quiero algo similar
                  </a>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="btn-outline text-xs tracking-widest font-semibold justify-center uppercase py-3 px-6 sm:w-auto w-full"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
