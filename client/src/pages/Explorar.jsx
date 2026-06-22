import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import UploadModal from '../components/UploadModal.jsx'

const TOPICS = [
  { label: 'Arte',          img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&auto=format&fm=webp&q=75' },
  { label: 'Fotografía',    img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&auto=format&fm=webp&q=75' },
  { label: 'Arquitectura',  img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&auto=format&fm=webp&q=75' },
  { label: 'Moda',          img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format&fm=webp&q=75' },
  { label: 'Naturaleza',    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fm=webp&q=75' },
  { label: 'Viajes',        img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&auto=format&fm=webp&q=75' },
  { label: 'Comida',        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fm=webp&q=75' },
  { label: 'Tecnología',    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fm=webp&q=75' },
  { label: 'Diseño',        img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&auto=format&fm=webp&q=75' },
  { label: 'Ilustración',   img: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&auto=format&fm=webp&q=75' },
  { label: 'Música',        img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fm=webp&q=75' },
  { label: 'Deporte',       img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fm=webp&q=75' },
  { label: 'Educación',     img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fm=webp&q=75' },
]

export default function Explorar() {
  const navigate = useNavigate()
  const [search,     setSearch]     = useState('')
  const [showUpload, setShowUpload] = useState(false)

  function goToCategory(label) {
    navigate('/gallery', { state: { category: label } })
  }

  return (
    <>
      <Sidebar onUpload={() => setShowUpload(true)} />
      <Topbar search={search} onSearch={setSearch} />

      <main className="explore-wrap">
        <div className="explore-hero">
          <h1>Explora ideas</h1>
          <p>Elige un tema y descubre pins de la comunidad</p>
        </div>

        <div className="topic-grid">
          {TOPICS.map(t => (
            <button
              key={t.label}
              className="topic-card"
              onClick={() => goToCategory(t.label)}
              aria-label={`Ver pins de ${t.label}`}
            >
              <img src={t.img} alt="" loading="lazy" />
              <span className="topic-label">{t.label}</span>
            </button>
          ))}
        </div>
      </main>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}
    </>
  )
}
