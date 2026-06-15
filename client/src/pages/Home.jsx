import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSpinner, FaXmark } from 'react-icons/fa6'
import PublicNavbar from '../components/PublicNavbar.jsx'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../utils/helpers.js'

const COLLAGE_IMGS = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&auto=format',
  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&auto=format',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&auto=format',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format',
]

const FEATURES = [
  { icon: '📌', color: '#fff0f3', title: 'Guarda tus ideas',    desc: 'Organiza todo lo que te inspira en un solo lugar.' },
  { icon: '🔍', color: '#f0f5ff', title: 'Descubre contenido', desc: 'Explora miles de imágenes organizadas por tema.' },
  { icon: '☁️', color: '#f0fff5', title: 'Almacenamiento AWS',  desc: 'Tus imágenes seguras en la nube de Amazon S3.' },
  { icon: '💬', color: '#fff8f0', title: 'Comunidad activa',    desc: 'Comenta, da likes y conecta con otros creativos.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [modal,   setModal]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]   = useState({ type: '', msg: '' })

  const [loginData,  setLoginData]  = useState({ email: '', password: '' })
  const [regData,    setRegData]    = useState({ name: '', username: '', email: '', password: '' })
  const [forgotEmail, setForgotEmail] = useState('')

  useEffect(() => {
    const pending = sessionStorage.getItem('openModal')
    if (pending) {
      sessionStorage.removeItem('openModal')
      setTimeout(() => setModal(pending), 100)
    }
  }, [])

  function closeModal() { setModal(null); setAlert({ type: '', msg: '' }) }

  async function handleLogin(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!loginData.email || !loginData.password) { setAlert({ type: 'error', msg: 'Completa todos los campos.' }); return }
    setLoading(true)
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      })
      login(data.token, data.user)
      navigate('/gallery')
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Credenciales incorrectas.' })
    } finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!regData.name || !regData.username || !regData.email || !regData.password) { setAlert({ type: 'error', msg: 'Completa todos los campos.' }); return }
    if (regData.password.length < 8) { setAlert({ type: 'error', msg: 'La contraseña debe tener al menos 8 caracteres.' }); return }
    setLoading(true)
    try {
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(regData) })
      sessionStorage.setItem('pendingVerifyEmail', regData.email)
      const msg = data.pendingVerification
        ? 'Ya tienes una cuenta. Te reenviamos el código de verificación.'
        : 'Cuenta creada. Revisa tu email para verificar.'
      setAlert({ type: 'success', msg })
      setTimeout(() => { closeModal(); navigate('/verify-email') }, 2000)
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'No se pudo crear la cuenta.' })
    } finally { setLoading(false) }
  }

  async function handleForgot(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!forgotEmail) { setAlert({ type: 'error', msg: 'Ingresa tu correo.' }); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: forgotEmail }) })
      setAlert({ type: 'success', msg: 'Revisa tu correo con el enlace para restablecer.' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'No se pudo enviar el correo.' })
    } finally { setLoading(false) }
  }

  return (
    <div className="home-page">
      <PublicNavbar
        onLogin={() => setModal('login')}
        onRegister={() => setModal('register')}
      />

      <section className="hero-section">
        <div className="hero-left">
          <h1>Tu tablero de inspiración en la nube</h1>
          <div className="hero-btns">
            <button className="btn-hero-primary" onClick={() => setModal('register')}>Empieza gratis</button>
            <button className="btn-hero-secondary" onClick={() => setModal('login')}>Iniciar sesión</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="collage" aria-hidden="true">
            {COLLAGE_IMGS.map((src, i) => (
              <div key={i} className={`collage-img ci-${i+1}`}>
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-features-inner">
          <h2 className="home-section-title">Todo lo que necesitas para inspirarte</h2>
          <p className="home-section-sub">PinCloud combina el poder de la nube con una experiencia visual única.</p>
          <div className="home-feat-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="home-feat-card">
                <div className="home-feat-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <h2>Únete a miles de creativos</h2>
        <p>Empieza a guardar y compartir tus ideas hoy mismo, es gratis.</p>
        <button className="btn-white" onClick={() => setModal('register')}>Crear cuenta gratis</button>
      </section>

      <footer className="pub-footer">
        <p>© 2026 PinCloud · <a href="/informacion">Información</a> · <a href="/empresas">Empresas</a></p>
      </footer>

      {modal && (
        <div className="home-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="home-modal" role="dialog" aria-modal="true">
            <button className="home-modal-close" onClick={closeModal} aria-label="Cerrar"><FaXmark /></button>
            <div className="modal-logo"><Logo size={22} /></div>

            {alert.msg && (
              <div className={`modal-alert ${alert.type}`} role="alert">{alert.msg}</div>
            )}

            {modal === 'login' && (
              <>
                <h2>Bienvenido de vuelta</h2>
                <form onSubmit={handleLogin} noValidate>
                  <label htmlFor="login-email" className="sr-only">Correo electrónico</label>
                  <input id="login-email" className="modal-input" type="email" placeholder="Correo electrónico" autoComplete="email"
                    value={loginData.email} onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))} />
                  <label htmlFor="login-pass" className="sr-only">Contraseña</label>
                  <input id="login-pass" className="modal-input" type="password" placeholder="Contraseña" autoComplete="current-password"
                    value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))} />
                  <button className="btn-modal-primary" type="submit" disabled={loading}>
                    {loading ? <><FaSpinner aria-hidden="true" /> Entrando…</> : 'Iniciar sesión'}
                  </button>
                </form>
                <div className="modal-divider">o</div>
                <button className="modal-link" onClick={() => { setAlert({ type: '', msg: '' }); setModal('forgot') }}>
                  ¿Olvidaste tu contraseña?
                </button>
                <p className="modal-switch">
                  ¿No tienes cuenta?{' '}
                  <button className="modal-link" onClick={() => { setAlert({ type: '', msg: '' }); setModal('register') }}>Regístrate</button>
                </p>
              </>
            )}

            {modal === 'register' && (
              <>
                <h2>Crea tu cuenta</h2>
                <form onSubmit={handleRegister} noValidate>
                  <label htmlFor="reg-nombre" className="sr-only">Nombre completo</label>
                  <input id="reg-nombre" className="modal-input" type="text" placeholder="Nombre completo" autoComplete="name"
                    value={regData.name} onChange={e => setRegData(p => ({ ...p, name: e.target.value }))} />
                  <label htmlFor="reg-username" className="sr-only">Nombre de usuario</label>
                  <input id="reg-username" className="modal-input" type="text" placeholder="Nombre de usuario (ej: cristopher23)" autoComplete="username"
                    value={regData.username} onChange={e => setRegData(p => ({ ...p, username: e.target.value }))} />
                  <label htmlFor="reg-email" className="sr-only">Correo electrónico</label>
                  <input id="reg-email" className="modal-input" type="email" placeholder="Correo electrónico" autoComplete="email"
                    value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} />
                  <label htmlFor="reg-pass" className="sr-only">Contraseña</label>
                  <input id="reg-pass" className="modal-input" type="password" placeholder="Contraseña (mín. 6 caracteres)" autoComplete="new-password"
                    value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))} />
                  <button className="btn-modal-primary" type="submit" disabled={loading}>
                    {loading ? <><FaSpinner aria-hidden="true" /> Creando cuenta…</> : 'Crear cuenta'}
                  </button>
                </form>
                <p className="modal-switch">
                  ¿Ya tienes cuenta?{' '}
                  <button className="modal-link" onClick={() => { setAlert({ type: '', msg: '' }); setModal('login') }}>Inicia sesión</button>
                </p>
              </>
            )}

            {modal === 'forgot' && (
              <>
                <h2>Recuperar contraseña</h2>
                <form onSubmit={handleForgot} noValidate>
                  <label htmlFor="forgot-email" className="sr-only">Correo electrónico</label>
                  <input id="forgot-email" className="modal-input" type="email" placeholder="Tu correo electrónico" autoComplete="email"
                    value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                  <button className="btn-modal-primary" type="submit" disabled={loading}>
                    {loading ? <><FaSpinner aria-hidden="true" /> Enviando…</> : 'Enviar enlace'}
                  </button>
                </form>
                <p className="modal-switch">
                  <button className="modal-link" onClick={() => { setAlert({ type: '', msg: '' }); setModal('login') }}>← Volver al inicio de sesión</button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
