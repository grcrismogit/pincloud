const CATEGORIES = [
  'Todos', 'Arte', 'Fotografía', 'Moda', 'Arquitectura',
  'Viajes', 'Comida', 'Tecnología', 'Naturaleza', 'Diseño',
  'Ilustración', 'Música', 'Deporte', 'Educación',
]

export default function CategoryBar({ active, onChange }) {
  return (
    <nav className="cat-bar" aria-label="Filtrar por categoría">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={`cat-btn${active === cat ? ' active' : ''}`}
          onClick={() => onChange(cat)}
          aria-current={active === cat ? 'true' : undefined}
        >
          {cat}
        </button>
      ))}
    </nav>
  )
}
