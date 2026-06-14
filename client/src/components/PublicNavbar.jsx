import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function PublicNavbar({ onLogin, onRegister }) {
  const { pathname } = useLocation()

  return (
    <nav className="pub-navbar">
      <Link to="/" className="pub-nav-logo">
        <div className="pub-logo-icon"><Logo size={18} /></div>
        PinCloud
      </Link>

      <span className="pub-nav-spacer" />

      <Link to="/"            className={`pub-nav-link${pathname === '/' ? ' active' : ''}`}>Inicio</Link>
      <Link to="/informacion" className={`pub-nav-link${pathname === '/informacion' ? ' active' : ''}`}>Información</Link>
      <Link to="/empresas"    className={`pub-nav-link${pathname === '/empresas' ? ' active' : ''}`}>Empresas</Link>

      {onLogin    && <button className="btn-nav btn-nav-outline"  onClick={onLogin}>Iniciar sesión</button>}
      {onRegister && <button className="btn-nav btn-nav-primary"  onClick={onRegister}>Crear cuenta</button>}
    </nav>
  )
}
