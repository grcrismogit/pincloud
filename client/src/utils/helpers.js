export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Normalize backend pin fields to consistent shape used by all components
export function normalizePin(pin) {
  return {
    ...pin,
    imageUrl:    pin.imageUrl   || pin.url        || '',
    title:       pin.title      || pin.titulo      || '',
    description: pin.description || pin.descripcion || '',
    category:    pin.category   || pin.categoria   || '',
    authorName:  pin.author?.username || pin.author?.name || pin.autor || '',
    likesCount:  pin.likesCount ?? (Array.isArray(pin.likes) ? pin.likes.length : (pin.likes || 0)),
  }
}

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)   return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  return `${Math.floor(diff / 86400)} d`
}

export function avatarInitial(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`)
  return data
}

export function uploadXHR(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload  = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload failed ${xhr.status}`))
    xhr.onerror = () => reject(new Error('Upload error'))
    xhr.send(file)
  })
}
