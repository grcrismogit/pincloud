import { useNavigate } from 'react-router-dom'
import { FaCloudArrowUp, FaImages, FaHeart, FaCompass, FaKey, FaStar, FaCircleCheck } from 'react-icons/fa6'
import PublicNavbar from '../components/PublicNavbar.jsx'

const FEATURES = [
  { icon: <FaCloudArrowUp />, color: '#fff0f3', title: 'Almacenamiento en la nube',  desc: 'Tus imágenes se guardan de forma segura en Amazon S3, accesibles desde cualquier dispositivo.' },
  { icon: <FaImages />,       color: '#f0f5ff', title: 'Galería personalizada',       desc: 'Organiza y visualiza tu colección con un diseño tipo masonry, fluido y responsivo.' },
  { icon: <FaHeart />,        color: '#f0fff5', title: 'Interacción social',          desc: 'Da likes, guarda pins de otros usuarios y comenta en las publicaciones.' },
  { icon: <FaCompass />,      color: '#fff8f0', title: 'Explorar por temáticas',      desc: 'Navega por categorías y etiquetas para descubrir contenido nuevo cada día.' },
  { icon: <FaKey />,          color: '#f5f0ff', title: 'Acceso seguro',               desc: 'Autenticación con JWT y verificación de correo para proteger tu cuenta.' },
  { icon: <FaStar />,         color: '#fffbf0', title: 'Experiencia premium',         desc: 'Interfaz cuidada con animaciones fluidas, glassmorphism y diseño moderno.' },
]

const STEPS = [
  { title: 'Crea tu cuenta',     desc: 'Regístrate gratis con tu correo electrónico en menos de un minuto.' },
  { title: 'Verifica tu email',  desc: 'Confirma tu dirección de correo para activar todas las funciones.' },
  { title: 'Sube tu primer pin', desc: 'Elige una imagen, ponle título y categoría, y publícala.' },
  { title: 'Descubre y guarda',  desc: 'Explora lo que otros usuarios publican y guarda lo que más te inspire.' },
]

export default function Informacion() {
  const navigate = useNavigate()

  return (
    <div className="info-page">
      <PublicNavbar />

      <section className="info-hero">
        <h1>La plataforma visual para <span>guardar tus ideas</span></h1>
        <p>PinCloud es una aplicación web donde puedes subir, organizar y descubrir imágenes con una experiencia moderna y segura.</p>
        <div className="info-hero-btns">
          <button className="btn-lg btn-lg-red" onClick={() => navigate('/')}>Comenzar gratis</button>
          <a href="#como-funciona" className="btn-lg btn-lg-out">Cómo funciona</a>
        </div>
      </section>

      <div className="info-stats">
        <div className="info-stat"><strong>∞</strong><span>Almacenamiento AWS</span></div>
        <div className="info-stat"><strong>100%</strong><span>Gratuito para empezar</span></div>
        <div className="info-stat"><strong>JWT</strong><span>Acceso seguro</span></div>
        <div className="info-stat"><strong>24/7</strong><span>Disponibilidad</span></div>
      </div>

      <section className="info-section">
        <h2 className="info-section-title">¿Qué puedes hacer con PinCloud?</h2>
        <p className="info-section-sub">Una plataforma completa para guardar y compartir lo que te inspira.</p>
        <div className="info-features">
          {FEATURES.map(f => (
            <div key={f.title} className="info-feat-card">
              <div className="info-feat-icon" style={{ background: f.color, color: 'var(--red)' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="info-section" id="como-funciona" style={{ background: '#fafafa', maxWidth: '100%', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 className="info-section-title">¿Cómo funciona?</h2>
          <p className="info-section-sub">En cuatro pasos sencillos puedes empezar a usar PinCloud.</p>
          <div className="info-steps">
            {STEPS.map(s => (
              <div key={s.title} className="info-step">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2 className="info-section-title">Tecnología detrás de PinCloud</h2>
        <p className="info-section-sub">Construido con herramientas modernas y robustas.</p>
        <div className="info-features">
          {[
            { icon: <FaCircleCheck />, color: '#f0fff5', title: 'React + Vite',    desc: 'Frontend rápido con componentes reutilizables y build optimizado.' },
            { icon: <FaCircleCheck />, color: '#f0f5ff', title: 'Node.js + Express', desc: 'Backend RESTful escalable con autenticación JWT segura.' },
            { icon: <FaCircleCheck />, color: '#fff0f3', title: 'MongoDB',          desc: 'Base de datos NoSQL flexible para almacenar usuarios y pins.' },
            { icon: <FaCircleCheck />, color: '#fffbf0', title: 'Amazon S3 + SES',  desc: 'Almacenamiento de imágenes y envío de emails transaccionales.' },
          ].map(f => (
            <div key={f.title} className="info-feat-card">
              <div className="info-feat-icon" style={{ background: f.color, color: '#00a550' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="info-cta">
        <h2>¿Listo para empezar?</h2>
        <p>Crea tu cuenta gratis y comienza a guardar lo que te inspira.</p>
        <button className="btn-white" onClick={() => { sessionStorage.setItem('openModal','register'); navigate('/') }}>
          Crear cuenta gratis
        </button>
      </section>

      <footer className="pub-footer">
        <p>© 2026 PinCloud · <a href="/empresas">Empresas</a></p>
      </footer>
    </div>
  )
}
