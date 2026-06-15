import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa6'
import Logo from '../components/Logo.jsx'
import { apiFetch } from '../utils/helpers.js'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [otp,     setOtp]    = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]  = useState({ type: '', msg: '' })
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
    if (code.length < 6) { setAlert({ type: 'error', msg: 'Ingresa el código completo.' }); return }
    const email = sessionStorage.getItem('pendingVerifyEmail')
    if (!email) { setAlert({ type: 'error', msg: 'Sesión expirada. Vuelve a registrarte.' }); return }
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Logo size={22} /></div>
        <h2>Verifica tu email</h2>
        <p>Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.</p>

        {alert.msg && (
          <div className={`modal-alert ${alert.type}`} role="alert" style={{ marginBottom: '1rem' }}>{alert.msg}</div>
        )}

        <form onSubmit={handleVerify}>
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

        <p style={{ marginTop: '1.25rem', fontSize: '.88rem', color: 'var(--muted)' }}>
          ¿No recibiste el código?{' '}
          <button className="modal-link" onClick={() => navigate('/')} type="button">
            Volver al inicio
          </button>
        </p>
      </div>
    </div>
  )
}
