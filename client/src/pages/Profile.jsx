import { useState, useEffect, useCallback } from 'react'
import { FaSpinner, FaImages, FaBookmark } from 'react-icons/fa6'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import PinCard from '../components/PinCard.jsx'
import DetailModal from '../components/DetailModal.jsx'
import UploadModal from '../components/UploadModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch, avatarInitial } from '../utils/helpers.js'

export default function Profile() {
  const { token, user } = useAuth()
  const [pins,       setPins]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [detailPin,  setDetailPin]  = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const fetchSaved = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/pins?saved=true', {}, token)
      setPins(data.pins || [])
    } catch {}
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  function handleDelete(id) {
    setPins(prev => prev.filter(p => p._id !== id))
  }

  const filtered = search.trim()
    ? pins.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : pins

  return (
    <>
      <Sidebar onUpload={() => setShowUpload(true)} />
      <Topbar search={search} onSearch={setSearch} />

      <main className="profile-wrap">
        <div className="profile-header">
          <div className="profile-avatar" aria-hidden="true">
            {avatarInitial(user?.name || '')}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name || 'Usuario'}</h1>
            <p className="profile-username">@{user?.username || ''}</p>
            <p className="profile-email">{user?.email || ''}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <div className="profile-tab active">
            <FaBookmark aria-hidden="true" />
            Pins guardados
            {!loading && <span className="profile-count">{filtered.length}</span>}
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner" role="status" aria-label="Cargando pins guardados">
            <FaSpinner aria-hidden="true" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" role="status">
            <FaImages aria-hidden="true" />
            <h3>{search ? 'Sin resultados' : 'Aún no guardaste ningún pin'}</h3>
            <p>{search ? 'Prueba con otra búsqueda.' : 'Explora la galería y guarda los que te inspiren.'}</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filtered.map(pin => (
              <PinCard
                key={pin._id}
                pin={pin}
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
          onSuccess={fetchSaved}
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
