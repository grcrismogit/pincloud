import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa6'
import Logo from '../components/Logo.jsx'
import { apiFetch } from '../utils/helpers.js'

export default function ForgotPassword() {
  const navigate  = useNavigate()
  const [step,       setStep]       = useState('request')
  const [email,      setEmail]      = useState('')
  const [otp,        setOtp]        = useState(['','','','','',''])
  const [resetToken, setResetToken] = useState('')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [alert,      setAlert]      = useState({ type: '', msg: '' })

  function handleOtpChange(i, val, refs) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  async function handleRequest(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!email) { setAlert({ type: 'error', msg: 'Ingresa tu correo.' }); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      setAlert({ type: 'success', msg: 'Código enviado. Revisa tu correo.' })
      setTimeout(() => { setAlert({ type: '', msg: '' }); setStep('verify') }, 1500)
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'No se pudo enviar el correo.' })
    } finally { setLoading(false) }
  }

  async function handleVerifyCode(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    const code = otp.join('')
    if (code.length < 6) { setAlert({ type: 'error', msg: 'Ingresa el código completo.' }); return }
    setLoading(true)
    try {
      const data = await apiFetch('/api/auth/verify-reset-code', { method: 'POST', body: JSON.stringify({ email, code }) })
      setResetToken(data.resetToken)
      setStep('reset')
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Código incorrecto o expirado.' })
    } finally { setLoading(false) }
  }

  async function handleReset(e) {
    e.preventDefault(); setAlert({ type: '', msg: '' })
    if (!password || password.length < 8) { setAlert({ type: 'error', msg: 'La contraseña debe tener al menos 8 caracteres.' }); return }
    if (password !== confirm) { setAlert({ type: 'error', msg: 'Las contraseñas no coinciden.' }); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, resetToken, newPassword: password }) })
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

        {alert.msg && <div className={`modal-alert ${alert.type}`} role="alert" style={{ marginBottom: '1rem' }}>{alert.msg}</div>}

        {step === 'request' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' }}>Recuperar contraseña</h1>
            <p style={{ marginBottom: '1.25rem', color: 'var(--muted)', fontSize: '.9rem' }}>
              Te enviaremos un código de 6 dígitos a tu correo.
            </p>
            <form onSubmit={handleRequest}>
              <label htmlFor="forgot-email" className="sr-only">Correo electrónico</label>
              <input id="forgot-email" className="modal-input" type="email" placeholder="Correo electrónico" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} />
              <button className="btn-modal-primary" type="submit" disabled={loading}>
                {loading ? <><FaSpinner aria-hidden="true" /> Enviando…</> : 'Enviar código'}
              </button>
            </form>
          </>
        )}

        {step === 'verify' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' }}>Ingresa el código</h1>
            <p style={{ marginBottom: '1.25rem', color: 'var(--muted)', fontSize: '.9rem' }}>
              Enviamos un código a <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyCode}>
              <OtpInput otp={otp} onChange={handleOtpChange} />
              <button className="btn-modal-primary" type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? <><FaSpinner aria-hidden="true" /> Verificando…</> : 'Verificar código'}
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '.5rem' }}>Nueva contraseña</h1>
            <p style={{ marginBottom: '1.25rem', color: 'var(--muted)', fontSize: '.9rem' }}>
              Ingresa y confirma tu nueva contraseña.
            </p>
            <form onSubmit={handleReset}>
              <label htmlFor="new-pass" className="sr-only">Nueva contraseña</label>
              <input id="new-pass" className="modal-input" type="password" placeholder="Nueva contraseña (mín. 8 caracteres)" autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)} />
              <label htmlFor="confirm-pass" className="sr-only">Confirmar contraseña</label>
              <input id="confirm-pass" className="modal-input" type="password" placeholder="Confirmar contraseña" autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
              <button className="btn-modal-primary" type="submit" disabled={loading}>
                {loading ? <><FaSpinner aria-hidden="true" /> Actualizando…</> : 'Actualizar contraseña'}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: '1.25rem', fontSize: '.88rem', color: 'var(--muted)', textAlign: 'center' }}>
          <button className="modal-link" onClick={() => navigate('/')} type="button">
            ← Volver al inicio
          </button>
        </p>
      </div>
    </div>
  )
}

function OtpInput({ otp, onChange }) {
  const refs = { current: [] }
  return (
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
          onChange={e => onChange(i, e.target.value, refs)}
          onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus() }}
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </div>
  )
}
