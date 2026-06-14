import { useState } from 'react'
import { FaXmark, FaHeart, FaRegHeart, FaPaperPlane, FaSpinner } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch, avatarInitial, timeAgo, normalizePin } from '../utils/helpers.js'

export default function DetailModal({ pin: rawPin, onClose }) {
  const { token } = useAuth()
  const pin = normalizePin(rawPin)

  const [liked,       setLiked]       = useState(rawPin.liked || false)
  const [likes,       setLikes]       = useState(pin.likesCount)
  const [saved,       setSaved]       = useState(rawPin.saved || false)
  const [comments,    setComments]    = useState(rawPin.comments || [])
  const [commentText, setCommentText] = useState('')
  const [sending,     setSending]     = useState(false)
  const [commentErr,  setCommentErr]  = useState('')

  async function toggleLike() {
    if (!token) return
    const next = !liked
    setLiked(next)
    setLikes(l => next ? l + 1 : l - 1)
    try {
      await apiFetch(`/api/pins/${rawPin._id}/like`, { method: 'POST' }, token)
    } catch {
      setLiked(!next)
      setLikes(l => next ? l - 1 : l + 1)
    }
  }

  async function toggleSave() {
    if (!token) return
    setSaved(s => !s)
    try {
      await apiFetch(`/api/pins/${rawPin._id}/save`, { method: 'POST' }, token)
    } catch {
      setSaved(s => !s)
    }
  }

  async function sendComment() {
    if (!commentText.trim() || !token) return
    setSending(true)
    setCommentErr('')
    try {
      const newComment = await apiFetch(
        `/api/pins/${rawPin._id}/comment`,
        { method: 'POST', body: JSON.stringify({ text: commentText.trim() }) },
        token,
      )
      setComments(prev => [...prev, newComment])
      setCommentText('')
    } catch (err) {
      setCommentErr(err.message || 'No se pudo enviar el comentario.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className="modal modal-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="detail-grid">
          <div className="detail-img-side">
            <img src={pin.imageUrl} alt={pin.title} loading="lazy" decoding="async" />
          </div>

          <div className="detail-info-side">
            <button className="modal-close detail-close" onClick={onClose} aria-label="Cerrar detalle">
              <FaXmark aria-hidden="true" />
            </button>

            <div className="detail-top-actions">
              <button
                className={`btn-save-detail${saved ? ' saved' : ''}`}
                onClick={toggleSave}
                aria-pressed={saved}
              >
                {saved ? 'Guardado' : 'Guardar'}
              </button>
              <button
                className={`btn-circ${liked ? ' liked' : ''}`}
                onClick={toggleLike}
                aria-pressed={liked}
                aria-label={liked ? 'Quitar like' : 'Dar like'}
              >
                {liked
                  ? <FaHeart aria-hidden="true" />
                  : <FaRegHeart aria-hidden="true" />}
              </button>
            </div>

            {pin.title && <h2 id="detail-title" className="detail-title">{pin.title}</h2>}
            {pin.description && <p className="detail-desc">{pin.description}</p>}

            {pin.authorName && (
              <div className="detail-author">
                <div className="detail-author-av" aria-hidden="true">
                  {avatarInitial(pin.authorName)}
                </div>
                <div>
                  <strong>{pin.authorName}</strong>
                  {pin.category && <small>{pin.category}</small>}
                </div>
              </div>
            )}

            {likes > 0 && (
              <p className="detail-likes">
                <FaHeart aria-hidden="true" />
                <span>{likes}</span> {likes === 1 ? 'like' : 'likes'}
              </p>
            )}

            <section className="comments-section" aria-label="Comentarios">
              <h3 className="comments-section h4" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                Comentarios ({comments.length})
              </h3>

              {comments.length === 0 ? (
                <p className="no-comments">Sin comentarios aún. ¡Sé el primero!</p>
              ) : (
                <ul className="comment-list">
                  {comments.map((c, i) => {
                    const author = c.user?.username || c.user?.name || 'Usuario'
                    return (
                      <li key={c._id || `comment-${i}`} className="comment-item">
                        <div className="comment-avatar" aria-hidden="true">
                          {avatarInitial(author)}
                        </div>
                        <div className="comment-body">
                          <strong>{author}</strong>
                          <p>{c.text || c.texto}</p>
                          {c.createdAt && (
                            <time dateTime={c.createdAt}>{timeAgo(c.createdAt)}</time>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {commentErr && (
                <p role="alert" style={{ color: 'var(--red-dark)', fontSize: '.8rem', marginTop: '.4rem' }}>
                  {commentErr}
                </p>
              )}

              <div className="comment-input-row">
                <label htmlFor="comment-input" className="sr-only">Escribe un comentario</label>
                <input
                  id="comment-input"
                  className="comment-input"
                  type="text"
                  placeholder="Añade un comentario…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !sending && sendComment()}
                  maxLength={300}
                  aria-invalid={!!commentErr}
                />
                <button
                  className="btn-send"
                  onClick={sendComment}
                  aria-label="Enviar comentario"
                  disabled={sending || !commentText.trim()}
                >
                  {sending
                    ? <FaSpinner aria-hidden="true" style={{ animation: 'spin .9s linear infinite' }} />
                    : <FaPaperPlane aria-hidden="true" />}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
