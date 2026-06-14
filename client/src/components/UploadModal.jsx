import { useState, useRef, useEffect } from 'react'
import { FaCloudArrowUp, FaXmark, FaSpinner } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch, uploadXHR } from '../utils/helpers.js'

const CATEGORIES = [
  'arte','fotografía','moda','arquitectura','viajes',
  'comida','tecnología','naturaleza','diseño','ilustración','música','deporte','educación',
]

export default function UploadModal({ onClose, onSuccess }) {
  const { token } = useAuth()
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [category, setCategory] = useState('')
  const [drag,     setDrag]     = useState(false)
  const [progress, setProgress] = useState(0)
  const [status,   setStatus]   = useState('idle')
  const [errMsg,   setErrMsg]   = useState('')
  const fileRef    = useRef()
  const previewUrl = useRef(null)

  // Revoke object URL on unmount to avoid memory leak
  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    }
  }, [])

  function pickFile(f) {
    if (!f || !f.type.startsWith('image/')) return
    if (f.size > 10 * 1024 * 1024) { setErrMsg('La imagen no puede superar 10 MB.'); return }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    const url = URL.createObjectURL(f)
    previewUrl.current = url
    setFile(f)
    setPreview(url)
    setErrMsg('')
  }

  function removeFile() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    previewUrl.current = null
    setFile(null)
    setPreview(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDrag(false)
    pickFile(e.dataTransfer.files[0])
  }

  async function handleSubmit() {
    if (!file)         { setErrMsg('Selecciona una imagen.'); return }
    if (!title.trim()) { setErrMsg('El título es obligatorio.'); return }
    setStatus('uploading'); setErrMsg(''); setProgress(0)
    try {
      const { uploadUrl, key } = await apiFetch(
        '/api/pins/presign',
        { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type }) },
        token,
      )
      await uploadXHR(uploadUrl, file, pct => setProgress(pct))
      await apiFetch(
        '/api/pins',
        { method: 'POST', body: JSON.stringify({ title: title.trim(), description: desc.trim(), category, s3Key: key }) },
        token,
      )
      setStatus('done')
      onSuccess?.()
      setTimeout(onClose, 900)
    } catch (err) {
      setStatus('error')
      setErrMsg(err.message || 'Error al subir.')
    }
  }

  const busy = status === 'uploading' || status === 'done'

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div className="modal-hd">
          <h2 id="upload-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>Subir pin</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          {!preview ? (
            <div
              className={`drop-zone${drag ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              role="button"
              tabIndex={0}
              aria-label="Zona para soltar imagen"
              onKeyDown={e => e.key === 'Enter' && fileRef.current.click()}
            >
              <FaCloudArrowUp aria-hidden="true" />
              <p>Arrastra tu imagen aquí</p>
              <small>PNG, JPG, WEBP — máx. 10 MB</small>
              {/* Label wraps the hidden input — accessible without extra button */}
              <label className="btn-choose" style={{ marginTop: '.5rem' }}>
                Elegir archivo
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => pickFile(e.target.files[0])}
                />
              </label>
            </div>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Vista previa de la imagen seleccionada" />
              <button className="btn-rm-preview" onClick={removeFile} aria-label="Quitar imagen seleccionada">
                <FaXmark aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="upload-fields">
            <label htmlFor="pin-title" className="sr-only">Título</label>
            <input
              id="pin-title"
              type="text"
              placeholder="Título *"
              maxLength={80}
              value={title}
              onChange={e => setTitle(e.target.value)}
              aria-required="true"
              aria-invalid={!!errMsg && !title.trim()}
            />

            <label htmlFor="pin-desc" className="sr-only">Descripción</label>
            <textarea
              id="pin-desc"
              placeholder="Descripción (opcional)"
              rows={3}
              maxLength={200}
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />

            <label htmlFor="pin-cat" className="sr-only">Categoría</label>
            <select
              id="pin-cat"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Categoría (opcional)</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {status === 'uploading' && (
            <div className="progress-wrap" role="status" aria-label={`Subiendo ${progress}%`}>
              <div className="progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>{progress < 100 ? `Subiendo… ${progress}%` : 'Procesando…'}</small>
            </div>
          )}

          {errMsg && (
            <p className="alert-sm error" role="alert">{errMsg}</p>
          )}
          {status === 'done' && (
            <p className="alert-sm success" role="status">¡Pin publicado!</p>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn-outline-md" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn-red" onClick={handleSubmit} disabled={busy}>
            {status === 'uploading'
              ? <><FaSpinner aria-hidden="true" style={{ animation: 'spin .9s linear infinite' }} /> Subiendo…</>
              : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
