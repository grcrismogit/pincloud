import { useState, useRef, useEffect } from 'react'
import { FaMagnifyingGlass, FaUser, FaRightFromBracket } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext.jsx'
import { avatarInitial } from '../utils/helpers.js'

export default function Topbar({ search, onSearch }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="topbar">
      <div className="search-wrap">
        <FaMagnifyingGlass aria-hidden="true" />
        <label htmlFor="gallery-search" className="sr-only">Buscar pins</label>
        <input
          id="gallery-search"
          type="search"
          placeholder="Buscar pins, temas, ideas..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="topbar-right">
        <div className="avatar-wrap" ref={dropRef}>
          <button
            className="avatar-btn"
            onClick={() => setOpen(o => !o)}
            aria-label="Menú de usuario"
            aria-expanded={open}
            aria-haspopup="true"
          >
            {user?.nombre ? avatarInitial(user.nombre) : <FaUser aria-hidden="true" />}
          </button>

          {open && (
            <div className="dropdown" role="menu" aria-label="Opciones de usuario">
              <div className="dropdown-header">
                <strong>{user?.nombre || 'Usuario'}</strong>
                <small>{user?.email || ''}</small>
              </div>
              <button role="menuitem" onClick={logout} className="danger">
                <FaRightFromBracket aria-hidden="true" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
