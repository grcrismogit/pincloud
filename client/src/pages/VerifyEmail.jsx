import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa6'
import Logo from '../components/Logo.jsx'
import { apiFetch } from '../utils/helpers.js'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const savedEmail = sessionStorage.getItem('pendingVerifyEmail') || ''
  const [email,   setEmail]   = useState(savedEmail)
  const [otp,     setOtp]     = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]   = useState({ type: '', msg: '' })
  const refs = useRef([])

  function handleOtpChange(i, val) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  async function handleVerify(e) {
    e.preventDefault()
    const code = otp.join('')
    if (!email) { setAlert({ type: 'error', msg: 'Ingresa tu correo electrónico.' }); return }
    if (code.length < 6) { setAlert({ type: 'error', msg: 'Ingresa el código completo.' }); return }
    setLoading(true); setAlert({ type: '', msg: '' })
    try {
      await apiFetch('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) })
      sessionStorage.removeItem('pendingVerifyEmail')
      setAlert({ type: 'success', msg: '¡Email verificado! Redirigiendo…' })
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Código incorrecto.' })
    } finally { setLoading(false) }
  }

  async function handleResend() {
    if (!email) { setAlert({ type: 'error', msg: 'Ingresa tu correo primero.' }); return }
    setLoading(true); setAlert({ type: '', msg: '' })
    try {
      await apiFetch('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })
      setAlert({ type: 'success', msg: 'Código reenviado. Revisa tu correo.' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'No se pudo reenviar.' })
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Logo size={22} /></div>
        <h2>Verifica tu email</h2>
        <p>Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.</p>

        {alert.msg && (
          <div className={`modal-alert ${alert.type} alert-mb`} role="alert">{alert.msg}</div>
        )}

        <form onSubmit={handleVerify}>
          {!savedEmail && (
            <>
              <label htmlFor="verify-email-input" className="sr-only">Correo electrónico</label>
              <input
                id="verify-email-input"
                className="modal-input"
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="modal-input input-mb"
              />
            </>
          )}
          <div className="otp-row">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className="otp-in"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </div>
          <button className="btn-modal-primary" type="submit" disabled={loading}>
            {loading ? <><FaSpinner /> Verificando…</> : 'Verificar código'}
          </button>
        </form>

        <p className="auth-footer-link">
          ¿No recibiste el código?{' '}
          <button className="modal-link" onClick={handleResend} type="button" disabled={loading}>
            Reenviar código
          </button>
        </p>
        <p className="auth-footer-link">
          <button className="modal-link" onClick={() => navigate('/')} type="button">
            Volver al inicio
          </button>
        </p>
      </div>
    </div>
  )
}
