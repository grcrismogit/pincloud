import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCircleCheck, FaXmark, FaStar, FaRegStar, FaLocationDot, FaBell, FaChartLine, FaUsers, FaImages } from 'react-icons/fa6'
import PublicNavbar from '../components/PublicNavbar.jsx'

const WHY = [
  { icon: <FaImages />,     title: 'Vitrina visual',    desc: 'Sube tu catálogo fotográfico y llega a clientes que buscan inspiración.' },
  { icon: <FaUsers />,      title: 'Comunidad real',    desc: 'Conéctate con una audiencia activa de creativos y consumidores locales.' },
  { icon: <FaChartLine />,  title: 'Visibilidad',       desc: 'Tus publicaciones aparecen en los resultados de búsqueda de PinCloud.' },
  { icon: <FaBell />,       title: 'Notificaciones',    desc: 'Recibe alertas cuando usuarios interactúan con tu contenido.' },
  { icon: <FaLocationDot />,title: 'Contexto local',    desc: 'Destaca como empresa ecuatoriana ante una audiencia cercana a ti.' },
  { icon: <FaCircleCheck />,title: 'Sin complicaciones', desc: 'Configura tu perfil en minutos y empieza a publicar de inmediato.' },
]

const PLANS = [
  {
    name: 'Gratuito', price: '$0', period: '/mes',
    desc: 'Para empezar y explorar la plataforma.',
    features: ['Hasta 20 pins al mes', '1 usuario', 'Galería pública', 'Soporte por email'],
    missing: ['Analytics', 'Pins ilimitados', 'Prioridad en búsqueda'],
    cta: 'Empezar gratis', style: 'btn-plan-out', popular: false,
  },
  {
    name: 'Profesional', price: '$19', period: '/mes',
    desc: 'Para negocios que quieren crecer en la plataforma.',
    features: ['Pins ilimitados', 'Hasta 5 usuarios', 'Analytics básico', 'Insignia de empresa', 'Soporte prioritario'],
    missing: ['Prioridad en búsqueda'],
    cta: 'Elegir Profesional', style: 'btn-plan-red', popular: true,
  },
  {
    name: 'Empresarial', price: '$49', period: '/mes',
    desc: 'Máxima visibilidad para marcas establecidas.',
    features: ['Pins ilimitados', 'Usuarios ilimitados', 'Analytics completo', 'Prioridad en búsqueda', 'API access', 'Gerente de cuenta'],
    missing: [],
    cta: 'Contactar ventas', style: 'btn-plan-out', popular: false,
  },
]

const TESTIMONIALS = [
  {
    text: 'Subimos nuestros looks y en tres semanas notamos un aumento real en consultas. La galería se ve profesional.',
    name: 'Sofía M.', role: 'Fundadora, ClosetEC', color: '#e74c3c', stars: 5,
  },
  {
    text: 'Nos ayudó a mostrar nuestros proyectos de branding de una forma que Instagram no permite. Muy recomendado.',
    name: 'Andrés V.', role: 'Director, Kakao Studio', color: '#8e44ad', stars: 4,
  },
  {
    text: 'Sencillo de usar y el equipo responde rápido. Todavía esperamos más funciones de analytics, pero vamos bien.',
    name: 'Daniela R.', role: 'Fotógrafa, Lente Quito', color: '#27ae60', stars: 4,
  },
]

function Stars({ count }) {
  return (
    <div className="emp-stars">
      {[1,2,3,4,5].map(i => i <= count
        ? <FaStar key={i} aria-hidden="true" />
        : <FaRegStar key={i} aria-hidden="true" />
      )}
    </div>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Empresas() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ nombre: '', empresa: '', email: '', plan: '', mensaje: '' })
  const [errMsg,  setErrMsg]  = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setErrMsg('')
    if (!form.nombre.trim())  { setErrMsg('El nombre es obligatorio.'); return }
    if (!form.empresa.trim()) { setErrMsg('El nombre de empresa es obligatorio.'); return }
    if (!EMAIL_RE.test(form.email)) { setErrMsg('Ingresa un correo válido.'); return }
    if (!form.plan)           { setErrMsg('Selecciona un plan.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setSuccess(true)
    } catch {
      setErrMsg('No se pudo enviar el mensaje. Intenta más tarde.')
    } finally { setLoading(false) }
  }

  return (
    <div className="emp-page">
      <PublicNavbar onRegister={() => { sessionStorage.setItem('openModal','register'); navigate('/') }} />

      <section className="emp-hero">
        <div className="emp-badge">Para empresas</div>
        <h1>Haz crecer tu marca con <span>PinCloud</span></h1>
        <p>Lleva el catálogo visual de tu empresa a miles de usuarios creativos en Ecuador. Sube, organiza y destaca tu contenido.</p>
        <div className="info-hero-btns">
          <button className="btn-lg btn-lg-red" onClick={() => { sessionStorage.setItem('openModal','register'); navigate('/') }}>
            Empieza gratis
          </button>
          <a href="#planes" className="btn-lg btn-lg-out">Ver planes</a>
        </div>
      </section>

      <div className="emp-logos-bar">
        <p>Empresas que confían en PinCloud</p>
        <ul className="emp-logos">
          {['Kakao Studio','CreativaEC','Lente Quito','ClosetEC','DevCuenca','Tierra Viva'].map(n => (
            <li key={n} className="emp-logo-pill">{n}</li>
          ))}
        </ul>
      </div>

      <section className="emp-section">
        <h2 className="emp-section-title">¿Por qué elegir PinCloud para tu empresa?</h2>
        <p className="emp-section-sub">Herramientas pensadas para que tu negocio destaque visualmente.</p>
        <div className="emp-why-grid">
          {WHY.map(w => (
            <div key={w.title} className="emp-why-card">
              <div className="emp-why-icon">{w.icon}</div>
              <div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="emp-section" id="planes" style={{ background: '#fafafa', maxWidth: '100%', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 className="emp-section-title">Planes y precios</h2>
          <p className="emp-section-sub">Elige el plan que mejor se adapta a tu negocio. Sin permanencia.</p>
          <div className="emp-plans">
            {PLANS.map(p => (
              <div key={p.name} className={`emp-plan${p.popular ? ' popular' : ''}`}>
                {p.popular && <span className="emp-plan-badge">Más popular</span>}
                <div className="emp-plan-name">{p.name}</div>
                <div className="emp-plan-price">{p.price}<small>{p.period}</small></div>
                <p className="emp-plan-desc">{p.desc}</p>
                <ul>
                  {p.features.map(f => (
                    <li key={f}><FaCircleCheck style={{ color: '#00a550' }} aria-hidden="true" />{f}</li>
                  ))}
                  {p.missing.map(f => (
                    <li key={f} className="off"><FaXmark aria-hidden="true" />{f}</li>
                  ))}
                </ul>
                <button
                  className={`btn-plan ${p.style}`}
                  onClick={() => { sessionStorage.setItem('openModal','register'); navigate('/') }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="emp-section">
        <h2 className="emp-section-title">Lo que dicen nuestros clientes</h2>
        <p className="emp-section-sub">Empresas ecuatorianas ya usan PinCloud para mostrar su trabajo.</p>
        <div className="emp-testi-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="emp-testi">
              <Stars count={t.stars} />
              <p className="emp-testi-text">"{t.text}"</p>
              <div className="emp-testi-author">
                <div className="emp-testi-avatar" style={{ background: t.color }}>{t.name.charAt(0)}</div>
                <div>
                  <div className="emp-testi-name">{t.name}</div>
                  <div className="emp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="emp-section">
        <h2 className="emp-section-title">Contacta con ventas</h2>
        <p className="emp-section-sub">¿Tienes preguntas sobre el plan Empresarial o quieres una demo? Escríbenos.</p>
        <div className="emp-contact-wrap">
          <h3>Envíanos un mensaje</h3>
          <p>Respondemos en menos de 24 horas.</p>

          {success ? (
            <div className="emp-form-success">
              <FaCircleCheck style={{ fontSize: '2.5rem', color: '#00a550', display: 'block', margin: '0 auto 1rem' }} />
              <h4>Mensaje enviado</h4>
              <p>Te contactaremos pronto. ¡Gracias por tu interés!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="emp-form-row">
                <div className="emp-form-field">
                  <label htmlFor="emp-nombre">Nombre *</label>
                  <input id="emp-nombre" className="emp-form-input" type="text" placeholder="Tu nombre" value={form.nombre} onChange={set('nombre')} />
                </div>
                <div className="emp-form-field">
                  <label htmlFor="emp-empresa">Empresa *</label>
                  <input id="emp-empresa" className="emp-form-input" type="text" placeholder="Nombre de la empresa" value={form.empresa} onChange={set('empresa')} />
                </div>
              </div>
              <div className="emp-form-row">
                <div className="emp-form-field">
                  <label htmlFor="emp-email">Correo *</label>
                  <input id="emp-email" className="emp-form-input" type="email" placeholder="empresa@ejemplo.com" value={form.email} onChange={set('email')} />
                </div>
                <div className="emp-form-field">
                  <label htmlFor="emp-plan">Plan de interés *</label>
                  <select id="emp-plan" className="emp-form-select" value={form.plan} onChange={set('plan')}>
                    <option value="">Selecciona un plan</option>
                    <option value="Gratuito">Gratuito</option>
                    <option value="Profesional">Profesional</option>
                    <option value="Empresarial">Empresarial</option>
                  </select>
                </div>
              </div>
              <div className="emp-form-field">
                <label htmlFor="emp-mensaje">Mensaje</label>
                <textarea id="emp-mensaje" className="emp-form-textarea" placeholder="Cuéntanos sobre tu empresa y lo que buscas..." value={form.mensaje} onChange={set('mensaje')} />
              </div>
              {errMsg && <div className="emp-form-error" role="alert">{errMsg}</div>}
              <button className="btn-red" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="emp-cta">
        <h2>¿Listo para destacar?</h2>
        <p>Únete a las empresas ecuatorianas que ya confían en PinCloud.</p>
        <button className="btn-white" onClick={() => { sessionStorage.setItem('openModal','register'); navigate('/') }}>
          Crear cuenta gratis
        </button>
      </section>

      <footer className="pub-footer">
        <p>© 2026 PinCloud · <a href="/informacion">Información</a></p>
      </footer>
    </div>
  )
}
