import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  LuPlus,
  LuTrash2,
  LuEye,
  LuEyeOff,
  LuUpload,
  LuX,
  LuArrowUp,
  LuArrowDown,
  LuGripVertical,
} from 'react-icons/lu'
import { FaEdit } from 'react-icons/fa'

export default function AdminPortfolio() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  
  // Estados de formulario
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'XV Años',
    description: '',
    status: 'publicado',
    custom_tag: '',
  })

  // Opciones de etiquetas predefinidas
  const presetTags = ['Alta Moda', 'Diseño de Gala', 'Diseño Exclusivo', 'Edición Limitada']
  const [tagOption, setTagOption] = useState('')

  // Opciones de categorías predefinidas y dinámicas
  const defaultCategories = ['XV Años', 'Novia', 'Graduación', 'Personalizados']
  const [categoryOption, setCategoryOption] = useState('XV Años')
  const [customCategory, setCustomCategory] = useState('')

  // Estado para alertas y confirmaciones personalizadas
  const [notification, setNotification] = useState(null) // { type: 'alert' | 'confirm', message: '', onConfirm: () => void }

  const showCustomAlert = (msg) => {
    setNotification({
      type: 'alert',
      message: msg,
    })
  }

  const showCustomConfirm = (msg, onConfirm) => {
    setNotification({
      type: 'confirm',
      message: msg,
      onConfirm,
    })
  }

  // Manejar el cambio de opción del select de etiqueta
  const handleTagOptionChange = (val) => {
    setTagOption(val)
    if (val === 'Otro') {
      setFormData((prev) => ({ ...prev, custom_tag: '' }))
    } else {
      setFormData((prev) => ({ ...prev, custom_tag: val }))
    }
  }

  // Imágenes en el editor
  const [coverImage, setCoverImage] = useState(null) // { file, url, publicId, progress, error, isSimulated }
  const [galleryImages, setGalleryImages] = useState([]) // Array de { id, file, url, publicId, progress, error, isSimulated }
  const [saving, setSaving] = useState(false)

  // Cargar proyectos al montar
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_images(*)')
        .order('orden', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching projects:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()

    // Abrir modal si viene del Dashboard de accesos rápidos
    if (location.state?.openCreate) {
      handleOpenCreate()
    }
  }, [location])

  const handleOpenCreate = () => {
    setEditingProject(null)
    setFormData({
      title: '',
      category: 'XV Años',
      description: '',
      status: 'publicado',
      custom_tag: '',
    })
    setTagOption('')
    setCategoryOption('XV Años')
    setCustomCategory('')
    setCoverImage(null)
    setGalleryImages([])
    setIsModalOpen(true)
  }

  const handleOpenEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      category: project.category,
      description: project.description || '',
      status: project.status,
      custom_tag: project.custom_tag || '',
    })
    
    // Calcular qué opción preseleccionada mostrar en el dropdown
    const isPreset = presetTags.includes(project.custom_tag)
    setTagOption(project.custom_tag ? (isPreset ? project.custom_tag : 'Otro') : '')

    // Calcular qué categoría preseleccionada mostrar
    if (defaultCategories.includes(project.category)) {
      setCategoryOption(project.category)
      setCustomCategory('')
    } else {
      setCategoryOption('Otro')
      setCustomCategory(project.category)
    }
    
    // Cargar imagen de portada existente
    setCoverImage({
      url: project.cover_image_url,
      publicId: 'existing',
      progress: 100,
      isExisting: true,
    })

    // Cargar galería existente ordenada
    const sortedImages = [...(project.project_images || [])].sort(
      (a, b) => a.display_order - b.display_order
    )
    setGalleryImages(
      sortedImages.map((img) => ({
        id: img.id,
        url: img.image_url,
        publicId: img.cloudinary_public_id,
        progress: 100,
        isExisting: true,
      }))
    )
    setIsModalOpen(true)
  }

  // Generar slug del título
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, '-') // Cambiar espacios por guiones
      .replace(/[^\w\-]+/g, '') // Quitar caracteres especiales
      .replace(/\-\-+/g, '-') // Quitar guiones duplicados
      .replace(/^-+/, '') // Quitar guiones al principio
      .replace(/-+$/, '') // Quitar guiones al final
  }

  // Subir imagen a Cloudinary
  const uploadToCloudinary = (file, categoria, onProgress) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    const isConfigured = cloudName && uploadPreset

    return new Promise((resolve, reject) => {
      if (!isConfigured) {
        reject(
          new Error(
            'Cloudinary no está configurado. Por favor, define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en las variables de entorno.'
          )
        )
      } else {
        // --- SUBIDA REAL A CLOUDINARY ---
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        const xhr = new XMLHttpRequest()
        const fd = new FormData()

        xhr.open('POST', url, true)

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            onProgress(percentComplete)
          }
        })

        xhr.addEventListener('readystatechange', () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } else {
              reject(new Error('Failed to upload image to Cloudinary'))
            }
          }
        })

        // Determinar nombre de carpeta en base a categoría
        let folderName = 'otros'
        if (categoria === 'XV Años') folderName = 'xv_anos'
        else if (categoria === 'Novia') folderName = 'novias'
        else if (categoria === 'Graduación') folderName = 'graduaciones'
        else if (categoria === 'Personalizados') folderName = 'personalizados'

        fd.append('upload_preset', uploadPreset)
        fd.append('file', file)
        fd.append('folder', `torriva/${folderName}`)
        xhr.send(fd)
      }
    })
  }

  // Lógica común para subir la portada
  const uploadCoverFile = async (file) => {
    // Validar formato de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    const fileType = file.type || ''
    const isAllowedType = allowedTypes.includes(fileType) || /\.(jpe?g|png|webp)$/i.test(file.name)
    
    if (!isAllowedType) {
      showCustomAlert('Formato no permitido. Solo se admiten imágenes en formato JPG, JPEG, PNG o WEBP.')
      return
    }

    // Validar tamaño máximo (10 MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      showCustomAlert('La imagen es demasiado grande. El límite de tamaño es de 10 MB.')
      return
    }

    const url = URL.createObjectURL(file)
    const newCover = {
      file,
      url,
      progress: 0,
      error: '',
    }
    setCoverImage(newCover)

    try {
      const res = await uploadToCloudinary(file, formData.category, (progress) => {
        setCoverImage((prev) => (prev ? { ...prev, progress } : null))
      })
      setCoverImage((prev) =>
          prev
              ? {
                ...prev,
                url: res.url,
                publicId: res.public_id,
                progress: 100,
                isSimulated: res.isSimulated || false,
              }
              : null
      )
    } catch (err) {
      setCoverImage((prev) =>
          prev ? { ...prev, error: 'Fallo al subir la imagen', progress: 0 } : null
      )
    }
  }

  // Manejar carga de Portada por clic
  const handleCoverSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      uploadCoverFile(file)
      e.target.value = ''
    }
  }

  // Manejar carga de Portada por arrastrar y soltar
  const handleCoverDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      uploadCoverFile(file)
    }
  }

  // Lógica común para subir múltiples imágenes a la galería
  const uploadGalleryFiles = (files) => {
    if (files.length === 0) return

    // Validar formatos y tamaños antes de iniciar la carga
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validFiles = []

    for (const file of files) {
      const fileType = file.type || ''
      const isAllowedType = allowedTypes.includes(fileType) || /\.(jpe?g|png|webp)$/i.test(file.name)
      
      if (!isAllowedType) {
        showCustomAlert(`El archivo "${file.name}" no está permitido. Solo se admiten imágenes JPG, JPEG, PNG o WEBP.`)
        return
      }
      if (file.size > maxSize) {
        showCustomAlert(`La imagen "${file.name}" supera el límite de tamaño permitido (10 MB).`)
        return
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Agregar imágenes locales al estado con progreso 0
    // Usamos prefijo aleatorio + timestamp para evitar colisiones en subidas en lote
    const newImages = validFiles.map((file, idx) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${idx}`
      return {
        id,
        file,
        url: URL.createObjectURL(file),
        progress: 0,
        error: '',
      }
    })

    setGalleryImages((prev) => [...prev, ...newImages])

    // Subir cada imagen de forma asíncrona
    newImages.forEach(async (img) => {
      try {
        const res = await uploadToCloudinary(img.file, formData.category, (progress) => {
          setGalleryImages((prev) =>
            prev.map((item) => (item.id === img.id ? { ...item, progress } : item))
          )
        })
        setGalleryImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  url: res.url,
                  publicId: res.public_id || res.publicId || '',
                  progress: 100,
                  isSimulated: res.isSimulated || false,
                }
              : item
          )
        )
      } catch (err) {
        setGalleryImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? { ...item, error: 'Error al subir', progress: 0 }
              : item
          )
        )
      }
    })
  }

  // Manejar carga múltiple en Galería por clic
  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      uploadGalleryFiles(files)
      e.target.value = ''
    }
  }

  // Manejar carga múltiple en Galería por arrastrar y soltar
  const handleGalleryDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    uploadGalleryFiles(files)
  }

  // Eliminar imagen de galería del estado antes de guardar
  const removeGalleryImage = (id) => {
    setGalleryImages((prev) => prev.filter((item) => item.id !== id))
  }

  // --- Implementación Drag & Drop Nativo HTML5 ---
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // Reordenamiento visual del array temporal
    const temp = [...galleryImages]
    const draggedItem = temp[draggedIndex]
    temp.splice(draggedIndex, 1)
    temp.splice(index, 0, draggedItem)
    
    setDraggedIndex(index)
    setGalleryImages(temp)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Guardar Proyecto CRUD
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!coverImage || coverImage.progress < 100) {
      showCustomAlert('Por favor carga una imagen de portada válida.')
      return
    }

    const unfinishedGallery = galleryImages.some((img) => img.progress < 100)
    if (unfinishedGallery) {
      showCustomAlert('Espera a que todas las imágenes de la galería terminen de cargarse.')
      return
    }

    // Validar que todas las imágenes de la galería tengan un publicId asignado
    // para evitar fallas de restricción de clave primaria nula en la base de datos de Supabase.
    const hasInvalidImages = galleryImages.some((img) => !img.publicId && !img.public_id)
    if (hasInvalidImages) {
      showCustomAlert('Algunas imágenes de la galería no se cargaron correctamente en Cloudinary. Por favor, elimínalas y vuelve a subirlas.')
      return
    }

    setSaving(true)
    try {
      const slug = generateSlug(formData.title)
      
      let projectId = editingProject?.id

      if (editingProject) {
        // 1. Modificar proyecto existente
        const { error } = await supabase
          .from('projects')
          .update({
            title: formData.title,
            slug,
            category: formData.category,
            description: formData.description,
            cover_image_url: coverImage.url,
            status: formData.status,
            custom_tag: formData.custom_tag.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)

        if (error) throw error

        // Eliminar imágenes de la galería vieja en la BD para re-insertarlas ordenadamente
        const { error: deleteImgError } = await supabase
          .from('project_images')
          .delete()
          .eq('project_id', projectId)
          
        if (deleteImgError) throw deleteImgError
      } else {
        // 2. Crear nuevo proyecto
        // Obtener el orden máximo para añadirlo al final
        const maxOrden = projects.reduce((max, p) => (p.orden > max ? p.orden : max), 0)
        
        const { data, error } = await supabase
          .from('projects')
          .insert({
            title: formData.title,
            slug,
            category: formData.category,
            description: formData.description,
            cover_image_url: coverImage.url,
            status: formData.status,
            custom_tag: formData.custom_tag.trim() || null,
            orden: maxOrden + 1,
          })
          .select()
          .single()

        if (error) throw error
        projectId = data.id
      }

      // 3. Insertar galería de imágenes con display_order respetando el Drag & Drop
      if (galleryImages.length > 0) {
        const imageRows = galleryImages.map((img, idx) => ({
          project_id: projectId,
          image_url: img.url,
          cloudinary_public_id: img.publicId || img.public_id || '',
          display_order: idx,
        }))

        const { error: insertError } = await supabase
          .from('project_images')
          .insert(imageRows)

        if (insertError) throw insertError
      }

      fetchProjects()
      setIsModalOpen(false)
      setEditingProject(null)
    } catch (err) {
      showCustomAlert('Error al guardar el proyecto: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Eliminar proyecto
  const handleDeleteProject = (id) => {
    showCustomConfirm(
      '¿Estás seguro de que deseas eliminar este proyecto y todas sus imágenes?',
      async () => {
        try {
          const { error } = await supabase.from('projects').delete().eq('id', id)
          if (error) throw error
          fetchProjects()
        } catch (err) {
          showCustomAlert('Error al eliminar proyecto: ' + err.message)
        }
      }
    )
  }

  // Modificar orden general de los proyectos del portafolio (para la landing page)
  const handleMoveProject = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const tempProjects = [...projects]
    const p1 = tempProjects[index]
    const p2 = tempProjects[targetIndex]

    // Intercambiar ordenes
    try {
      const { error: err1 } = await supabase
        .from('projects')
        .update({ orden: p2.orden })
        .eq('id', p1.id)

      const { error: err2 } = await supabase
        .from('projects')
        .update({ orden: p1.orden })
        .eq('id', p2.id)

      if (err1 || err2) throw new Error('Error al guardar el orden')
      fetchProjects()
    } catch (err) {
      showCustomAlert('No se pudo reordenar: ' + err.message)
    }
  }

  // Publicar o Despublicar rápido
  const handleToggleStatus = async (project) => {
    const nextStatus = project.status === 'publicado' ? 'borrador' : 'publicado'
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', project.id)

      if (error) throw error
      fetchProjects()
    } catch (err) {
      showCustomAlert('Error al actualizar estado: ' + err.message)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in font-poppins text-white-soft">
      {/* Upper Control Bar */}
      <div className="bg-charcoal border border-white/5 p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-xl text-white-soft">Colecciones del Portafolio</h2>
          <p className="text-xs text-nude/40 mt-1">Crea, edita y ordena la visualización en la landing page principal.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary py-2.5 px-5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
        >
          <LuPlus className="w-4 h-4 stroke-[2.5]" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20 bg-charcoal/30 border border-white/5">
          <div className="w-10 h-10 border-2 border-white/5 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-gold animate-pulse">Sincronizando Portafolio</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-charcoal border border-white/5 text-nude/40 rounded-none">
          No hay proyectos registrados en el portafolio.
        </div>
      ) : (
        <div className="bg-charcoal border border-white/5 rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-black-deep/50 text-[10px] text-nude/40 uppercase tracking-widest border-b border-white/5">
                  <th className="p-4 font-semibold w-16">Orden</th>
                  <th className="p-4 font-semibold">Proyecto</th>
                  <th className="p-4 font-semibold">Categoría</th>
                  <th className="p-4 font-semibold">Galería</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((proj, idx) => (
                  <tr key={proj.id} className="hover:bg-black-deep/10 transition-colors duration-200">
                    {/* Reordenador */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveProject(idx, 'up')}
                          className={`p-1.5 border border-white/5 hover:border-gold/30 rounded-none transition-colors ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-nude/50 hover:text-gold'}`}
                          title="Subir de prioridad"
                        >
                          <LuArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === projects.length - 1}
                          onClick={() => handleMoveProject(idx, 'down')}
                          className={`p-1.5 border border-white/5 hover:border-gold/30 rounded-none transition-colors ${idx === projects.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-nude/50 hover:text-gold'}`}
                          title="Bajar de prioridad"
                        >
                          <LuArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    
                    {/* Proyecto */}
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={proj.cover_image_url}
                          alt={proj.title}
                          className="w-12 h-12 object-cover border border-white/10 shrink-0 bg-black-deep"
                        />
                        <div>
                          <p className="font-semibold text-white-soft text-sm">{proj.title}</p>
                          <p className="text-[10px] text-nude/40 mt-0.5 truncate max-w-xs">{proj.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Categoría */}
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider">{proj.category}</span>
                    </td>
                    
                    {/* Galería count */}
                    <td className="p-4 text-xs text-nude/50">
                      📸 {proj.project_images?.length || 0} imágenes
                    </td>
                    
                    {/* Estado */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(proj)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] uppercase tracking-wider font-semibold border transition-all duration-300 ${
                          proj.status === 'publicado'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                            : 'bg-gold/10 text-gold border-gold/20 hover:bg-gold/20'
                        }`}
                        title="Haz clic para cambiar estado"
                      >
                        {proj.status === 'publicado' ? <LuEye className="w-3.5 h-3.5" /> : <LuEyeOff className="w-3.5 h-3.5" />}
                        {proj.status}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-2 border border-white/5 hover:border-gold hover:text-gold transition-colors text-nude/60 shrink-0"
                          title="Editar Proyecto"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-2 border border-white/5 hover:border-red-500/30 hover:text-red-400 transition-colors text-nude/60 shrink-0"
                          title="Eliminar"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CRUD Form Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black-deep/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-charcoal border border-gold/30 p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto rounded-none">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-nude/40 hover:text-gold text-2xl transition-colors"
              aria-label="Cerrar modal"
            >
              <LuX />
            </button>

            <h3 className="font-playfair text-xl md:text-2xl text-white-soft mb-1">
              {editingProject ? 'Editar Diseño' : 'Nuevo Diseño'}
            </h3>
            <p className="text-xs text-gold uppercase tracking-widest mb-6">Atelier Torriva</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-nude/50 uppercase tracking-widest mb-1.5 font-semibold">
                    Título del Diseño
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej. Vestido de Novia Catedral"
                    className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-2.5 text-xs text-white-soft placeholder-nude/25 outline-none transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-nude/50 uppercase tracking-widest mb-1.5 font-semibold">
                    Categoría
                  </label>
                  <select
                    value={categoryOption}
                    onChange={(e) => {
                      const val = e.target.value
                      setCategoryOption(val)
                      if (val !== 'Otro') {
                        setFormData((prev) => ({ ...prev, category: val }))
                      } else {
                        setFormData((prev) => ({ ...prev, category: customCategory }))
                      }
                    }}
                    className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-2.5 text-xs text-white-soft outline-none transition-colors duration-300 cursor-pointer"
                  >
                    {[...new Set([...defaultCategories, ...projects.map(p => p.category).filter(Boolean)])].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Otro">Otro (Escribir nueva categoría...)</option>
                  </select>
                </div>

                {categoryOption === 'Otro' && (
                  <div className="animate-fade-in sm:col-span-2">
                    <label className="block text-[9px] text-gold uppercase tracking-widest mb-1.5 font-semibold">
                      Escribe la nueva categoría
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => {
                        const val = e.target.value
                        setCustomCategory(val)
                        setFormData((prev) => ({ ...prev, category: val }))
                      }}
                      placeholder="Ej. Colección de Verano, Accesorios..."
                      className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-2.5 text-xs text-white-soft placeholder-nude/25 outline-none transition-colors duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] text-nude/50 uppercase tracking-widest mb-1.5 font-semibold">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre costura, encajes, silueta..."
                  rows={2}
                  className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-2.5 text-xs text-white-soft placeholder-nude/25 outline-none resize-none transition-colors duration-300"
                />
              </div>

              {/* Etiqueta Personalizada (Opcional) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-nude/50 uppercase tracking-widest mb-1.5 font-semibold">
                    Etiqueta del Diseño (Opcional)
                  </label>
                  <select
                    value={tagOption}
                    onChange={(e) => handleTagOptionChange(e.target.value)}
                    className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-2.5 text-xs text-white-soft outline-none transition-colors duration-300 cursor-pointer"
                  >
                    <option value="">Ninguna (Sin etiqueta)</option>
                    <option value="Alta Moda">Alta Moda</option>
                    <option value="Diseño de Gala">Diseño de Gala</option>
                    <option value="Diseño Exclusivo">Diseño Exclusivo</option>
                    <option value="Edición Limitada">Edición Limitada</option>
                    <option value="Otro">Otro (Escribir valor personalizado...)</option>
                  </select>
                </div>

                {tagOption === 'Otro' && (
                  <div className="animate-fade-in">
                    <label className="block text-[9px] text-gold uppercase tracking-widest mb-1.5 font-semibold">
                      Escribe la etiqueta personalizada
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.custom_tag}
                      onChange={(e) => setFormData({ ...formData, custom_tag: e.target.value })}
                      placeholder="Ej. Colección de Otoño, Diseño Único..."
                      className="w-full bg-black-deep border border-white/10 focus:border-gold px-4 py-2.5 text-xs text-white-soft placeholder-nude/25 outline-none transition-colors duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Imagen Principal (Obligatoria) */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="block text-[10px] text-nude/50 uppercase tracking-widest font-semibold">
                  Imagen Principal
                </label>
                
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={handleCoverDrop}
                  className="relative group border border-dashed border-white/10 hover:border-gold/40 bg-black-deep/50 w-full min-h-[160px] flex flex-col items-center justify-center p-6 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    onDrop={(e) => e.stopPropagation()}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  
                  {coverImage ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={coverImage.url} alt="Portada preview" className="w-full h-full object-cover" />
                      
                      {/* Overlay para sugerir el reemplazo al hacer hover */}
                      <div className="absolute inset-0 bg-black-deep/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                        <LuUpload className="w-6 h-6 text-gold mb-2" />
                        <span className="text-[10px] text-white-soft uppercase tracking-widest font-semibold">Reemplazar Imagen de Portada</span>
                        <span className="text-[9px] text-nude/40 mt-1">Arrastra una imagen o haz clic para seleccionar</span>
                      </div>

                      {coverImage.progress < 100 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[10px] text-gold font-semibold">{coverImage.progress}%</span>
                        </div>
                      )}
                      {coverImage.isSimulated && (
                        <span className="absolute bottom-2 right-2 bg-gold/80 text-black-deep text-[8px] font-semibold px-2 py-0.5 uppercase tracking-wider">Simulado</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-3 pointer-events-none">
                      <LuUpload className="w-8 h-8 text-nude/30 group-hover:text-gold transition-colors duration-300 mx-auto stroke-[1.2]" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-white-soft uppercase tracking-widest font-semibold">Esta imagen será utilizada como portada en el portafolio.</p>
                        <p className="text-[9px] text-nude/40">Arrastra una fotografía aquí o haz clic para buscar</p>
                      </div>
                    </div>
                  )}
                </div>
                {coverImage && coverImage.error && (
                  <p className="text-[10px] text-red-400 font-semibold">{coverImage.error}</p>
                )}
              </div>

              {/* Galería de Imágenes con Drag & Drop */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] text-nude/50 uppercase tracking-widest font-semibold">
                    Galería de Imágenes
                  </label>
                  <span className="text-[9px] text-nude/40 block mt-0.5">
                    Sube fotografías desde distintos ángulos y detalles de la prenda.
                  </span>
                </div>

                {galleryImages.length === 0 ? (
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleGalleryDrop}
                    className="relative group border border-dashed border-white/10 hover:border-gold/40 bg-black-deep/50 w-full min-h-[160px] flex flex-col items-center justify-center p-6 transition-all duration-300 cursor-pointer text-center"
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGallerySelect}
                      onDrop={(e) => e.stopPropagation()}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <LuUpload className="w-8 h-8 text-nude/30 group-hover:text-gold transition-colors duration-300 mx-auto stroke-[1.2]" />
                    <div className="space-y-1 pointer-events-none">
                      <p className="text-[10px] text-white-soft uppercase tracking-widest font-semibold">Sube fotografías desde distintos ángulos y detalles de la prenda.</p>
                      <p className="text-[9px] text-nude/40">Arrastra múltiples archivos aquí o haz clic para buscar</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleGalleryDrop}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black-deep/20 p-4 border border-white/5 relative"
                  >
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img.id}
                        draggable={img.progress === 100}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`relative w-full aspect-square border bg-black-deep overflow-hidden group rounded-none ${
                          draggedIndex === idx
                            ? 'border-gold opacity-50 scale-95'
                            : 'border-white/10 hover:border-gold/40 cursor-move'
                        } transition-all`}
                      >
                        <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                        
                        {/* Drag indicator icon */}
                        <div className="absolute top-1 left-1 p-1 bg-black/50 text-white-soft/60 rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <LuGripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Progress overlay */}
                        {img.progress < 100 && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-1.5">
                              <div className="bg-gold h-full transition-all" style={{ width: `${img.progress}%` }} />
                            </div>
                            <span className="text-[9px] text-gold font-semibold">{img.progress}%</span>
                          </div>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(img.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          title="Eliminar de galería"
                        >
                          <LuX className="w-3.5 h-3.5" />
                        </button>

                        {img.isSimulated && (
                          <span className="absolute bottom-1 right-1 bg-gold/80 text-black-deep text-[7px] font-semibold px-1 uppercase tracking-wider">Simulado</span>
                        )}
                        {img.error && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2 text-center text-[8px] text-red-400 font-semibold leading-tight">
                            {img.error}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Cajón interactivo final para arrastrar y soltar/hacer clic para agregar más */}
                    <div 
                      className="relative border border-dashed border-white/10 hover:border-gold/40 hover:bg-black-deep/30 aspect-square flex flex-col items-center justify-center p-2 cursor-pointer transition-colors group"
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGallerySelect}
                        onDrop={(e) => e.stopPropagation()}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <LuUpload className="w-5 h-5 text-nude/30 group-hover:text-gold transition-colors duration-300" />
                      <span className="text-[8px] text-nude/40 group-hover:text-gold block mt-2 text-center uppercase tracking-widest font-semibold">Añadir más</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción del Modal */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-white/10 hover:border-gold text-nude/70 hover:text-gold text-xs transition-colors rounded-none uppercase tracking-wider font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !coverImage || coverImage.progress < 100}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-black-deep border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Guardar Diseño'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert/Confirm Notification Modal */}
      {notification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setNotification(null)} className="absolute inset-0 bg-black-deep/80 backdrop-blur-sm animate-fade-in" />
          <div className="relative w-full max-w-md bg-charcoal border border-gold/30 p-6 md:p-8 shadow-2xl z-10 text-center rounded-none animate-fade-in">
            {/* Elegant Logo / Icon Accent */}
            <div className="w-12 h-12 border border-gold/30 flex items-center justify-center mx-auto mb-4 text-gold select-none">
              <span className="font-playfair text-xl italic font-semibold">T</span>
            </div>
            
            <h3 className="font-playfair text-lg text-white-soft mb-3 font-light">
              {notification.type === 'confirm' ? 'Confirmar Acción' : 'Mensaje del Atelier'}
            </h3>
            
            <p className="font-poppins text-xs text-nude/70 leading-relaxed mb-6">
              {notification.message}
            </p>
            
            <div className="flex gap-3 justify-center">
              {notification.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => {
                      notification.onConfirm()
                      setNotification(null)
                    }}
                    className="btn-primary py-2 px-5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setNotification(null)}
                    className="btn-outline py-2 px-5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setNotification(null)}
                  className="btn-primary py-2 px-6 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
