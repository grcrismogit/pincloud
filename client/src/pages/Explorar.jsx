import { FaFire } from 'react-icons/fa6'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { useState } from 'react'

const TOPICS = [
  { label: 'Arte Digital',   img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&auto=format' },
  { label: 'Fotografía',     img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&auto=format' },
  { label: 'Arquitectura',   img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&auto=format' },
  { label: 'Moda',           img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format' },
  { label: 'Naturaleza',     img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format' },
  { label: 'Viajes',         img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&auto=format' },
  { label: 'Comida',         img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format' },
  { label: 'Tecnología',     img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format' },
  { label: 'Diseño',         img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&auto=format' },
  { label: 'Ilustración',    img: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&auto=format' },
]

const TRENDING = [
  'minimalismo','paisajes','retratos','collage','acuarela','street photography',
  'diseño ui','ilustración digital','arquitectura moderna','gastronomía',
  'retrowave','tipografía','puesta de sol','bosques','cafés',
]

export default function Explorar() {
  const [search, setSearch] = useState('')

  return (
    <>
      <Sidebar />
      <Topbar search={search} onSearch={setSearch} />

      <main className="explore-wrap">
        <div className="explore-hero">
          <h1>Explora ideas</h1>
          <p>Descubre los temas más populares de la comunidad</p>
        </div>

        <section className="trending-section" aria-labelledby="trending-title">
          <h2 id="trending-title" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <FaFire style={{ color: 'var(--red)' }} aria-hidden="true" /> Tendencias
          </h2>
          <ul className="trending-tags">
            {TRENDING.map(tag => (
              <li key={tag}>
                <a href={`/gallery?q=${encodeURIComponent(tag)}`} className="tag">#{tag}</a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="topics-title">
          <h2 id="topics-title" className="sr-only">Temas</h2>
          <div className="topic-grid">
            {TOPICS.map(t => (
              <a
                key={t.label}
                href={`/gallery?category=${encodeURIComponent(t.label.toLowerCase())}`}
                className="topic-card"
              >
                <img src={t.img} alt="" loading="lazy" />
                <span className="topic-label">{t.label}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
