import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { FaImages, FaSpinner, FaPlus } from 'react-icons/fa6'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import CategoryBar from '../components/CategoryBar.jsx'
import PinCard from '../components/PinCard.jsx'
import UploadModal from '../components/UploadModal.jsx'
import DetailModal from '../components/DetailModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../utils/helpers.js'

export default function Gallery() {
  const { token } = useAuth()
  const location = useLocation()
  const [pins,       setPins]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState(location.state?.category || 'Todos')
  const [showUpload, setShowUpload] = useState(false)
  const [detailPin,  setDetailPin]  = useState(null)

  const fetchPins = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim())        params.set('q',       search.trim())
      if (category !== 'Todos') params.set('category', category.toLowerCase())
      const data = await apiFetch(`/api/pins?${params}`, {}, token)
      const list = data.pins || data || []
      setPins(search.trim() ? list : [...list].sort(() => Math.random() - 0.5))
    } catch {}
    finally { setLoading(false) }
  }, [search, category, token])

  useEffect(() => {
    const id = setTimeout(fetchPins, 300)
    return () => clearTimeout(id)
  }, [fetchPins])

  function handleDelete(id) {
    setPins(prev => prev.filter(p => p._id !== id))
  }

  return (
    <>
      <Sidebar onUpload={() => setShowUpload(true)} />
      <Topbar search={search} onSearch={setSearch} />
      <CategoryBar active={category} onChange={setCategory} />

      <main className="gallery-wrap">
        {loading ? (
          <div className="loading-spinner" role="status" aria-label="Cargando pins">
            <FaSpinner aria-hidden="true" />
          </div>
        ) : pins.length === 0 ? (
          <div className="empty-state" role="status">
            <FaImages aria-hidden="true" />
            <h3>{search ? 'Sin resultados' : 'Aún no hay pins aquí'}</h3>
            <p>{search ? 'Prueba con otra búsqueda.' : 'Sé el primero en publicar algo.'}</p>
            {!search && (
              <button className="btn-red" style={{ marginTop: '1rem' }} onClick={() => setShowUpload(true)}>
                <FaPlus aria-hidden="true" /> Subir primer pin
              </button>
            )}
          </div>
        ) : (
          <div className="masonry-grid">
            {pins.map((pin, i) => (
              <PinCard
                key={pin._id}
                pin={pin}
                index={i}
                onOpen={setDetailPin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={fetchPins}
        />
      )}

      {detailPin && (
        <DetailModal
          pin={detailPin}
          onClose={() => setDetailPin(null)}
        />
      )}
    </>
  )
}
