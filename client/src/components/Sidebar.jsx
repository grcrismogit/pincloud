import { Link, useLocation } from 'react-router-dom'
import { FaHouse, FaCompass, FaPlus, FaRightFromBracket } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

export default function Sidebar({ onUpload }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()

  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <Link to="/gallery" className="sb-logo" aria-label="PinCloud — ir a galería">
        <Logo size={20} />
      </Link>

      <Link
        to="/gallery"
        className={`sb-btn${pathname === '/gallery' ? ' active' : ''}`}
        aria-label="Inicio"
        aria-current={pathname === '/gallery' ? 'page' : undefined}
      >
        <FaHouse aria-hidden="true" />
        <span className="tooltip" aria-hidden="true">Inicio</span>
      </Link>

      <Link
        to="/explorar"
        className={`sb-btn${pathname === '/explorar' ? ' active' : ''}`}
        aria-label="Explorar"
        aria-current={pathname === '/explorar' ? 'page' : undefined}
      >
        <FaCompass aria-hidden="true" />
        <span className="tooltip" aria-hidden="true">Explorar</span>
      </Link>

      <button className="sb-btn" onClick={onUpload} aria-label="Subir pin">
        <FaPlus aria-hidden="true" />
        <span className="tooltip" aria-hidden="true">Subir pin</span>
      </button>

      <span className="sb-spacer" />

      <button className="sb-btn" onClick={logout} aria-label="Cerrar sesión">
        <FaRightFromBracket aria-hidden="true" />
        <span className="tooltip" aria-hidden="true">Cerrar sesión</span>
      </button>
    </nav>
  )
}
