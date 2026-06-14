import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa6'
import Logo from '../components/Logo.jsx'
import { apiFetch } from '../utils/helpers.js'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [alert,    setAlert]    = useState({ type: '', msg: '' })

  async function handleRequest(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!email) { setAlert({ type: 'error', msg: 'Ingresa tu correo.' }); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      setAlert({ type: 'success', msg: 'Revisa tu correo. Hemos enviado el enlace de recuperación.' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'No se pudo enviar el correo.' })
    } finally { setLoading(false) }
  }

  async function handleReset(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!password || password.length < 6) { setAlert({ type: 'error', msg: 'La contraseña debe tener al menos 6 caracteres.' }); return }
    if (password !== confirm) { setAlert({ type: 'error', msg: 'Las contraseñas no coinciden.' }); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
      setAlert({ type: 'success', msg: '¡Contraseña actualizada! Redirigiendo…' })
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Enlace inválido o expirado.' })
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Logo size={22} /></div>

        {token ? (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' }}>Nueva contraseña</h1>
            <p>Ingresa y confirma tu nueva contraseña.</p>
            {alert.msg && <div className={`modal-alert ${alert.type}`} role="alert">{alert.msg}</div>}
            <form onSubmit={handleReset}>
              <label htmlFor="new-pass" className="sr-only">Nueva contraseña</label>
              <input id="new-pass" className="modal-input" type="password" placeholder="Nueva contraseña" autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)} />
              <label htmlFor="confirm-pass" className="sr-only">Confirmar contraseña</label>
              <input id="confirm-pass" className="modal-input" type="password" placeholder="Confirmar contraseña" autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
              <button className="btn-modal-primary" type="submit" disabled={loading}>
                {loading ? <><FaSpinner aria-hidden="true" /> Actualizando…</> : 'Actualizar contraseña'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' }}>Recuperar contraseña</h1>
            <p>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
            {alert.msg && <div className={`modal-alert ${alert.type}`} role="alert">{alert.msg}</div>}
            <form onSubmit={handleRequest}>
              <label htmlFor="forgot-email2" className="sr-only">Correo electrónico</label>
              <input id="forgot-email2" className="modal-input" type="email" placeholder="Correo electrónico" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} />
              <button className="btn-modal-primary" type="submit" disabled={loading}>
                {loading ? <><FaSpinner aria-hidden="true" /> Enviando…</> : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: '1.25rem', fontSize: '.88rem', color: 'var(--muted)' }}>
          <button className="modal-link" onClick={() => navigate('/')} type="button">
            ← Volver al inicio
          </button>
        </p>
      </div>
    </div>
  )
}
