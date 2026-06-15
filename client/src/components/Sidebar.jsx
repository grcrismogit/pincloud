import { Link, useLocation } from 'react-router-dom'
import { FaHouse, FaCompass, FaPlus, FaRightFromBracket, FaUser } from 'react-icons/fa6'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

export default function Sidebar({ onUpload }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const links = [
    { to: '/gallery',  icon: <FaHouse aria-hidden="true" />,   label: 'Inicio' },
    { to: '/explorar', icon: <FaCompass aria-hidden="true" />, label: 'Explorar' },
    { to: '/profile',  icon: <FaUser aria-hidden="true" />,    label: 'Mi perfil' },
  ]

  return (
    <>
      <nav className="sidebar" aria-label="Navegación principal">
        <Link to="/gallery" className="sb-logo" aria-label="PinCloud — ir a galería">
          <Logo size={20} />
        </Link>

        {links.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sb-btn${pathname === to ? ' active' : ''}`}
            aria-label={label}
            aria-current={pathname === to ? 'page' : undefined}
          >
            {icon}
            <span className="tooltip" aria-hidden="true">{label}</span>
          </Link>
        ))}

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

      <nav className="mobile-nav" aria-label="Navegación móvil">
        {links.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`mobile-nav-btn${pathname === to ? ' active' : ''}`}
            aria-label={label}
            aria-current={pathname === to ? 'page' : undefined}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
        <button className="mobile-nav-btn" onClick={onUpload} aria-label="Subir pin">
          <FaPlus aria-hidden="true" />
          <span>Subir</span>
        </button>
        <button className="mobile-nav-btn" onClick={logout} aria-label="Cerrar sesión">
          <FaRightFromBracket aria-hidden="true" />
          <span>Salir</span>
        </button>
      </nav>
    </>
  )
}
