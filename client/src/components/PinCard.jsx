import { useState } from 'react'
import { FaHeart, FaRegHeart, FaExpand, FaTrash } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch, avatarInitial, normalizePin } from '../utils/helpers.js'

export default function PinCard({ pin: rawPin, onOpen, onDelete }) {
  const { token, user } = useAuth()
  const pin = normalizePin(rawPin)

  const [liked,    setLiked]    = useState(pin.liked || false)
  const [likes,    setLikes]    = useState(pin.likesCount)
  const [saved,    setSaved]    = useState(pin.saved || false)
  const [imgError, setImgError] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = user?.id && rawPin.author?._id
    ? rawPin.author._id === user.id
    : false

  async function toggleLike(e) {
    e.stopPropagation()
    if (!token) return
    const next = !liked
    setLiked(next)
    setLikes(l => next ? l + 1 : l - 1)
    try {
      await apiFetch(`/api/pins/${pin._id}/like`, { method: 'POST' }, token)
    } catch {
      setLiked(!next)
      setLikes(l => next ? l - 1 : l + 1)
    }
  }

  async function toggleSave(e) {
    e.stopPropagation()
    if (!token) return
    setSaved(s => !s)
    try {
      await apiFetch(`/api/pins/${pin._id}/save`, { method: 'POST' }, token)
    } catch {
      setSaved(s => !s)
    }
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm('¿Eliminar este pin?')) return
    setDeleting(true)
    try {
      await apiFetch(`/api/pins/${pin._id}`, { method: 'DELETE' }, token)
      onDelete?.(pin._id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div
      className="pin-card"
      onClick={() => onOpen(rawPin)}
    >
      <div className="pin-img-wrap">
        {imgError ? (
          <div className="pin-img-error" aria-label="Imagen no disponible">
            <span>🖼️</span>
          </div>
        ) : (
          <img
            src={pin.imageUrl}
            alt={pin.title}
            loading="lazy"
            decoding="async"
            style={{ display: 'block', minHeight: '120px', background: 'var(--gray)' }}
            onError={() => setImgError(true)}
          />
        )}
        <div className="pin-overlay">
          <div className="pin-ov-top">
            <button
              className={`btn-save-pin${saved ? ' saved' : ''}`}
              onClick={toggleSave}
              aria-label={saved ? 'Quitar de guardados' : 'Guardar pin'}
            >
              {saved ? 'Guardado' : 'Guardar'}
            </button>
            {isOwner && (
              <button
                className="pin-act-btn pin-delete-btn"
                onClick={handleDelete}
                aria-label="Eliminar pin"
                disabled={deleting}
              >
                <FaTrash aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="pin-ov-bottom">
            <button
              className={`pin-act-btn${liked ? ' liked' : ''}`}
              onClick={toggleLike}
              aria-label={liked ? 'Quitar like' : 'Dar like'}
            >
              {liked ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
            </button>
            <button
              className="pin-act-btn"
              onClick={e => { e.stopPropagation(); onOpen(rawPin) }}
              aria-label="Ver detalle del pin"
            >
              <FaExpand aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {(pin.title || pin.authorName) && (
        <div className="pin-info">
          {pin.title && <p className="pin-title">{pin.title}</p>}
          <div className="pin-meta">
            {pin.authorName && (
              <div className="pin-author">
                <div className="pin-author-av" aria-hidden="true">{avatarInitial(pin.authorName)}</div>
                <span>{pin.authorName}</span>
              </div>
            )}
            {likes > 0 && (
              <span className="pin-likes">
                <FaHeart aria-hidden="true" /> {likes}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
