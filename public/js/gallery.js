const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) window.location.href = '/';


let allPins = [];
let currentCat = 'all';
let activePinId = null;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const preselect = sessionStorage.getItem('filterCat');
  if (preselect) { sessionStorage.removeItem('filterCat'); currentCat = preselect; }
  loadPins(currentCat);
  setupCategories();
  setupSearch();
  setupDropdown();
  setupUploadModal();
  setupDetailModal();
});

// ── Nav ──
function initNav() {
  const initial = (user.name || user.username || '?')[0].toUpperCase();
  document.getElementById('avatar-initial').textContent = initial;
  document.getElementById('dd-name').textContent  = user.name || user.username || '';
  document.getElementById('dd-email').textContent = user.email || '';
}

function setupDropdown() {
  const btn = document.getElementById('avatar-btn');
  const dd  = document.getElementById('dropdown');
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !dd.classList.contains('hidden');
    dd.classList.toggle('hidden', open);
    dd.setAttribute('aria-hidden', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });
  document.addEventListener('click', () => {
    dd?.classList.add('hidden');
    dd?.setAttribute('aria-hidden', 'true');
    btn?.setAttribute('aria-expanded', 'false');
  });
}

document.getElementById('btn-logout')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = '/';
});

// ── Load pins ──
async function loadPins(cat) {
  const grid = document.getElementById('grid');
  const spin = document.getElementById('spinner');
  const emp  = document.getElementById('empty');
  grid.innerHTML = '';
  spin.classList.remove('hidden');
  emp.classList.add('hidden');

  try {
    const url = cat === 'all' ? '/api/pins' : `/api/pins?category=${cat}`;
    const res  = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (res.ok) {
      const data = await res.json();
      allPins = data.pins || [];
    } else throw new Error();
  } catch {
    allPins = [];
  }

  spin.classList.add('hidden');
  if (!allPins.length) { emp.classList.remove('hidden'); return; }

  allPins.forEach((pin, i) => {
    const card = makeCard(pin, i);
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Pin card ──
function makeCard(pin, index = 0) {
  const card = document.createElement('article');
  card.className = 'pin-card';
  card.dataset.id = pin._id;
  card.style.setProperty('--pin-index', Math.min(index, 20));
  card.setAttribute('role', 'listitem');

  const av       = pin.author?.name?.[0]?.toUpperCase() || pin.author?.username?.[0]?.toUpperCase() || '?';
  const safeTitle = escapeHtml(pin.title || '');
  const safeUser  = escapeHtml(pin.author?.username || '');
  card.innerHTML = `
    <div class="pin-img-wrap">
      <img src="${escapeHtml(pin.imageUrl)}" alt="${safeTitle}" loading="lazy"
        onerror="this.src='https://placehold.co/400x300/efefef/767676?text=Imagen'"/>
      <div class="pin-overlay" aria-hidden="true">
        <div class="pin-ov-top">
          <button class="btn-save-pin ${pin.saved?'saved':''}" data-id="${pin._id}" aria-label="${pin.saved?'Guardado':'Guardar pin'}">${pin.saved?'Guardado':'Guardar'}</button>
        </div>
        <div class="pin-ov-bottom">
          <button class="pin-act-btn ${pin.liked?'liked':''}" data-like="${pin._id}" aria-label="${pin.liked?'Quitar me gusta':'Me gusta'}">
            <i class="fa-${pin.liked?'solid':'regular'} fa-heart" aria-hidden="true"></i>
          </button>
          <button class="pin-act-btn" data-detail="${pin._id}" aria-label="Ver detalle del pin">
            <i class="fa-solid fa-expand" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
    ${pin.title ? `<footer class="pin-info">
      <p class="pin-title">${safeTitle}</p>
      <div class="pin-meta">
        <div class="pin-author">
          <div style="width:22px;height:22px;border-radius:50%;background:#e0e0e0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;" aria-hidden="true">${av}</div>
          <span>${safeUser}</span>
        </div>
        <span class="pin-likes"><i class="fa-solid fa-heart" aria-hidden="true"></i>${pin.likesCount||0}</span>
      </div>
    </footer>` : ''}`;

  card.querySelector('.pin-img-wrap').addEventListener('click', (e) => {
    if (!e.target.closest('button')) openDetail(pin);
  });
  card.querySelector('.btn-save-pin').addEventListener('click', (e) => {
    e.stopPropagation(); toggleSave(pin._id, card);
  });
  card.querySelector('[data-like]').addEventListener('click', (e) => {
    e.stopPropagation(); toggleLike(pin._id, card);
  });
  card.querySelector('[data-detail]')?.addEventListener('click', (e) => {
    e.stopPropagation(); openDetail(pin);
  });
  return card;
}

// ── Save ──
async function toggleSave(pinId, card) {
  const pin = allPins.find(p => p._id === pinId);
  if (!pin) return;
  pin.saved = !pin.saved;
  const btn = card.querySelector('.btn-save-pin');
  btn.classList.toggle('saved', pin.saved);
  btn.textContent = pin.saved ? 'Guardado' : 'Guardar';
  try {
    await fetch(`/api/pins/${pinId}/save`, { method:'POST', headers:{Authorization:'Bearer '+token} });
  } catch { pin.saved = !pin.saved; }
}

// ── Like ──
async function toggleLike(pinId, card) {
  const pin = allPins.find(p => p._id === pinId);
  if (!pin) return;
  pin.liked = !pin.liked;
  pin.likesCount = (pin.likesCount||0) + (pin.liked ? 1 : -1);
  const btn = card.querySelector('[data-like]');
  btn.classList.toggle('liked', pin.liked);
  btn.innerHTML = `<i class="fa-${pin.liked?'solid':'regular'} fa-heart"></i>`;
  const likeEl = card.querySelector('.pin-likes');
  if (likeEl) likeEl.innerHTML = `<i class="fa-solid fa-heart"></i>${pin.likesCount}`;
  // Update detail if open
  if (activePinId === pinId) {
    document.getElementById('d-likes-count').textContent = pin.likesCount;
    document.getElementById('d-like').classList.toggle('liked', pin.liked);
    document.getElementById('d-like').innerHTML = `<i class="fa-${pin.liked?'solid':'regular'} fa-heart"></i>`;
  }
  try {
    await fetch(`/api/pins/${pinId}/like`, { method:'POST', headers:{Authorization:'Bearer '+token} });
  } catch { pin.liked = !pin.liked; }
}

// ── Categories ──
function setupCategories() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    if (btn.dataset.cat === currentCat) {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      loadPins(currentCat);
    });
  });
}

// ── Search ──
function setupSearch() {
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    const q    = e.target.value.toLowerCase().trim();
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const src  = currentCat === 'all' ? allPins : allPins.filter(p => p.category === currentCat);
    const list = q ? src.filter(p => (p.title||'').toLowerCase().includes(q)) : src;
    list.forEach(p => grid.appendChild(makeCard(p)));
    document.getElementById('empty').classList.toggle('hidden', list.length > 0);
  });
}

// ── Upload modal ──
let selectedFile = null;
function openUpload()  { document.getElementById('upload-modal').classList.remove('hidden'); }
function closeUpload() { document.getElementById('upload-modal').classList.add('hidden'); resetUpload(); }

function setupUploadModal() {
  const dz   = document.getElementById('drop-zone');
  const fi   = document.getElementById('file-input');
  const prev = document.getElementById('preview-container');
  document.getElementById('upload-modal').addEventListener('click', (e) => { if (e.target === document.getElementById('upload-modal')) closeUpload(); });
  dz.addEventListener('dragover',  (e) => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', ()  => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fi.addEventListener('change', () => { if (fi.files[0]) handleFile(fi.files[0]); });
  document.getElementById('btn-rm')?.addEventListener('click', resetUpload);

  function handleFile(f) {
    if (!f.type.startsWith('image/')) return upAlert('Solo imágenes.','error');
    if (f.size > 32*1024*1024) return upAlert('Máx. 32 MB.','error');
    selectedFile = f;
    const r = new FileReader();
    r.onload = (e) => { document.getElementById('image-preview').src = e.target.result; dz.classList.add('hidden'); prev.classList.remove('hidden'); };
    r.readAsDataURL(f);
  }

  document.getElementById('btn-up-submit')?.addEventListener('click', async () => {
    if (!selectedFile) return upAlert('Selecciona una imagen.','error');
    const title = document.getElementById('up-title').value.trim();
    const desc  = document.getElementById('up-desc').value.trim();
    const cat   = document.getElementById('up-cat').value;
    if (!title) return upAlert('El título es obligatorio.','error');
    setBtnLoading('btn-up-submit', true);
    document.getElementById('up-progress').classList.remove('hidden');
    try {
      const pRes = await fetch('/api/pins/presign', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({filename:selectedFile.name,contentType:selectedFile.type}) });
      const { uploadUrl, key } = await pRes.json();
      await uploadXHR(uploadUrl, selectedFile, (pct) => { document.getElementById('prog-fill').style.width=pct+'%'; document.getElementById('prog-text').textContent=`Subiendo... ${pct}%`; });
      const sRes = await fetch('/api/pins', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({title,description:desc,category:cat,s3Key:key}) });
      const pin  = await sRes.json();
      closeUpload();
      allPins.unshift(pin);
      document.getElementById('grid').prepend(makeCard(pin));
    } catch { upAlert('Error al subir. Verifica la configuración de AWS.','error'); }
    finally { setBtnLoading('btn-up-submit', false); }
  });
}

function resetUpload() {
  document.getElementById('file-input').value=''; selectedFile=null;
  document.getElementById('preview-container').classList.add('hidden');
  document.getElementById('drop-zone').classList.remove('hidden');
  document.getElementById('up-title').value=''; document.getElementById('up-desc').value=''; document.getElementById('up-cat').value='';
  document.getElementById('up-alert').classList.add('hidden');
  document.getElementById('up-progress').classList.add('hidden');
}
function upAlert(msg,type) { const b=document.getElementById('up-alert'); b.className=`alert-sm ${type}`; b.textContent=msg; b.classList.remove('hidden'); }
function uploadXHR(url,file,onProg) {
  return new Promise((res,rej) => {
    const x=new XMLHttpRequest(); x.open('PUT',url); x.setRequestHeader('Content-Type',file.type);
    x.upload.addEventListener('progress',(e)=>{ if(e.lengthComputable) onProg(Math.round(e.loaded/e.total*100)); });
    x.onload=()=>x.status<300?res():rej(); x.onerror=rej; x.send(file);
  });
}
function setBtnLoading(id,on) {
  const btn=document.getElementById(id); if(!btn)return;
  btn.disabled=on;
  btn.querySelector('.btn-text').classList.toggle('hidden',on);
  btn.querySelector('.spin').classList.toggle('hidden',!on);
}

// ── Detail modal ──
function setupDetailModal() {
  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.getElementById('detail-modal').addEventListener('click', (e) => { if (e.target===document.getElementById('detail-modal')) closeDetail(); });
  document.getElementById('d-save').addEventListener('click', () => {
    const pin = allPins.find(p => p._id === activePinId); if (!pin) return;
    const card = document.querySelector(`.pin-card[data-id="${activePinId}"]`);
    if (card) toggleSave(activePinId, card);
    const btn = document.getElementById('d-save');
    btn.classList.toggle('saved', pin.saved);
    btn.innerHTML = `<i class="fa-solid fa-bookmark"></i> ${pin.saved?'Guardado':'Guardar'}`;
  });
  document.getElementById('d-like').addEventListener('click', () => {
    const card = document.querySelector(`.pin-card[data-id="${activePinId}"]`);
    if (card) toggleLike(activePinId, card);
    else {
      const pin = allPins.find(p => p._id === activePinId); if (!pin) return;
      pin.liked = !pin.liked; pin.likesCount = (pin.likesCount||0)+(pin.liked?1:-1);
      document.getElementById('d-likes-count').textContent = pin.likesCount;
      document.getElementById('d-like').classList.toggle('liked', pin.liked);
      document.getElementById('d-like').innerHTML = `<i class="fa-${pin.liked?'solid':'regular'} fa-heart"></i>`;
    }
  });
  document.getElementById('btn-send-comment').addEventListener('click', sendComment);
  document.getElementById('comment-input').addEventListener('keydown', (e) => { if (e.key==='Enter') sendComment(); });
}

function openDetail(pin) {
  activePinId = pin._id;
  const dImg = document.getElementById('d-img');
  dImg.src = pin.imageUrl;
  dImg.alt = pin.title ? `Pin: ${pin.title}` : 'Imagen del pin';
  document.getElementById('d-title').textContent = pin.title || '';
  document.getElementById('d-desc').textContent  = pin.description || '';
  document.getElementById('d-username').textContent = pin.author?.username || '';
  document.getElementById('d-date').textContent  = pin.createdAt ? new Date(pin.createdAt).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'}) : '';
  document.getElementById('d-likes-count').textContent = pin.likesCount || 0;
  const av = pin.author?.name?.[0]?.toUpperCase() || pin.author?.username?.[0]?.toUpperCase() || '?';
  document.getElementById('d-avatar-initial').textContent = av;
  const saveBtn = document.getElementById('d-save');
  saveBtn.className = `btn-save-detail ${pin.saved?'saved':''}`;
  saveBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i> ${pin.saved?'Guardado':'Guardar'}`;
  const likeBtn = document.getElementById('d-like');
  likeBtn.classList.toggle('liked', pin.liked);
  likeBtn.innerHTML = `<i class="fa-${pin.liked?'solid':'regular'} fa-heart"></i>`;
  renderComments(pin.comments || []);
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('detail-modal').classList.add('hidden');
  activePinId = null;
}

function renderComments(comments) {
  const list = document.getElementById('comment-list');
  if (!comments.length) {
    list.innerHTML = '<li class="no-comments">Sé el primero en comentar.</li>';
    return;
  }
  list.innerHTML = comments.map(c => {
    const av   = escapeHtml(c.user?.username?.[0]?.toUpperCase() || '?');
    const user = escapeHtml(c.user?.username || 'usuario');
    const text = escapeHtml(c.text);
    const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-ES') : '';
    return `<li class="comment-item">
      <div class="comment-avatar" aria-hidden="true">${av}</div>
      <div class="comment-body">
        <strong>${user}</strong>
        <p>${text}</p>
        <time>${date}</time>
      </div>
    </li>`;
  }).join('');
  list.scrollTop = list.scrollHeight;
}

async function sendComment() {
  const input = document.getElementById('comment-input');
  const text  = input.value.trim();
  if (!text || !activePinId) return;
  input.value = '';
  const tempComment = { user:{ username: user.username||'tú' }, text, createdAt: new Date().toISOString() };
  const pin = allPins.find(p => p._id === activePinId);
  if (pin) { pin.comments = [...(pin.comments||[]), tempComment]; renderComments(pin.comments); }
  try {
    const res = await fetch(`/api/pins/${activePinId}/comment`, {
      method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token},
      body: JSON.stringify({ text })
    });
    if (res.ok && pin) {
      const comment = await res.json();
      pin.comments[pin.comments.length-1] = comment;
      renderComments(pin.comments);
    }
  } catch { /* keep temp comment */ }
}
