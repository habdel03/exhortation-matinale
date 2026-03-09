// ============================================================
// archive.js — Archive Page Logic
// Handles pagination, filtering by category, search
// ============================================================

const PAGE_SIZE   = 9;
let   lastVisible = null;
let   firstPage   = null;
let   currentPage = 1;
let   allCategories = new Set();
let   activeCategory = 'all';
let   searchQuery    = '';

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initFilterButtons();
  loadCategoryFilters();
  loadPage(1);
});

// ── Load a page of exhortations ─────────────────────────────
async function loadPage(page = 1) {
  const listEl = document.getElementById('archive-list');
  const countEl = document.getElementById('result-count');
  if (!listEl) return;

  listEl.innerHTML = renderSkeletonCards(PAGE_SIZE);

  try {
    let query = db.collection('exhortations').orderBy('date', 'desc');

    if (activeCategory !== 'all') {
      query = query.where('categorie', '==', activeCategory);
    }

    // Total count for pagination display
    const countSnap = await query.get();
    const total = countSnap.size;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    if (countEl) {
      countEl.textContent = `${total} exhortation${total !== 1 ? 's' : ''}`;
    }

    // Paginated query
    let paginated = query.limit(PAGE_SIZE);
    if (page > 1) {
      // Offset simulation: skip (page-1)*PAGE_SIZE docs
      const skipSnap = await query.limit((page - 1) * PAGE_SIZE).get();
      const lastDoc  = skipSnap.docs[skipSnap.docs.length - 1];
      if (lastDoc) {
        paginated = query.startAfter(lastDoc).limit(PAGE_SIZE);
      }
    }

    const snap = await paginated.get();

    listEl.innerHTML = '';

    if (snap.empty) {
      listEl.innerHTML = `
        <div class="loader-container" style="grid-column:1/-1">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p>Aucune exhortation trouvée.</p>
        </div>
      `;
    } else {
      let docs = snap.docs;

      // Client-side search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        docs = docs.filter(doc => {
          const d = doc.data();
          return (
            (d.titre   && d.titre.toLowerCase().includes(q)) ||
            (d.contenu && stripHtml(d.contenu).toLowerCase().includes(q))
          );
        });
      }

      docs.forEach((doc, i) => {
        const card = buildExhortationCard(doc.id, doc.data(), i);
        listEl.appendChild(card);
      });

      setTimeout(initFadeIn, 50);
    }

    // Render pagination
    renderPagination(currentPage, totalPages);

  } catch (error) {
    console.error('Archive load error:', error);
    listEl.innerHTML = `
      <div class="loader-container" style="grid-column:1/-1">
        <p>Erreur de chargement. Vérifiez votre connexion Firebase.</p>
      </div>
    `;
  }
}

// ── Build card (reuse from exhortations.js if on same page) ─
function buildExhortationCard(id, data, index = 0) {
  const card = document.createElement('div');
  card.className = 'exh-card fade-in';
  card.style.transitionDelay = `${index * 60}ms`;
  card.innerHTML = `
    <div class="card-header">
      <div class="card-date">${formatDate(data.date)}</div>
      <div class="card-title">${data.titre}</div>
    </div>
    <div class="card-body">
      <p class="card-excerpt">${truncate(data.contenu, 120)}</p>
      <div class="card-footer">
        <span class="card-categorie">${data.categorie || 'Général'}</span>
        <span class="card-arrow">→</span>
      </div>
    </div>
  `;
  card.addEventListener('click', () => {
    window.location.href = `exhortation.html?id=${id}`;
  });
  return card;
}

// ── Render pagination controls ───────────────────────────────
function renderPagination(current, total) {
  const el = document.getElementById('pagination');
  if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }

  let html = '';

  html += `<button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="goPage(${current - 1})">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  </button>`;

  for (let i = 1; i <= total; i++) {
    if (total > 7 && Math.abs(i - current) > 2 && i !== 1 && i !== total) {
      if (i === current - 3 || i === current + 3) {
        html += `<span class="page-btn" style="cursor:default">…</span>`;
      }
      continue;
    }
    html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }

  html += `<button class="page-btn" ${current === total ? 'disabled' : ''} onclick="goPage(${current + 1})">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </button>`;

  el.innerHTML = html;
}

function goPage(page) {
  currentPage = page;
  loadPage(page);
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

// ── Category filters ─────────────────────────────────────────
async function loadCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  try {
    const snap = await db.collection('exhortations').get();
    snap.docs.forEach(doc => {
      const cat = doc.data().categorie;
      if (cat) allCategories.add(cat);
    });

    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'Toutes';
    allBtn.dataset.cat = 'all';
    allBtn.addEventListener('click', () => filterByCategory('all', allBtn));
    container.appendChild(allBtn);

    allCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = cat;
      btn.dataset.cat = cat;
      btn.addEventListener('click', () => filterByCategory(cat, btn));
      container.appendChild(btn);
    });

  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function filterByCategory(cat, btn) {
  activeCategory = cat;
  currentPage = 1;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  loadPage(1);
}

function initFilterButtons() {
  // Handled dynamically after category load
}

// ── Search ───────────────────────────────────────────────────
function initSearch() {
  const input  = document.getElementById('search-input');
  const button = document.getElementById('search-btn');
  if (!input) return;

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery  = input.value.trim();
      currentPage  = 1;
      loadPage(1);
    }, 450);
  });

  if (button) {
    button.addEventListener('click', () => {
      searchQuery = input.value.trim();
      currentPage = 1;
      loadPage(1);
    });
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      searchQuery = input.value.trim();
      currentPage = 1;
      loadPage(1);
    }
  });
}

// ── Skeleton ─────────────────────────────────────────────────
function renderSkeletonCards(count) {
  return Array.from({ length: count }).map(() => `
    <div class="exh-card">
      <div class="card-header" style="padding:28px">
        <div class="skeleton" style="height:12px;width:60%;margin-bottom:10px;"></div>
        <div class="skeleton" style="height:18px;width:90%;"></div>
      </div>
      <div class="card-body">
        <div class="skeleton" style="height:12px;width:100%;margin-bottom:8px;"></div>
        <div class="skeleton" style="height:12px;width:80%;margin-bottom:20px;"></div>
        <div style="display:flex;justify-content:space-between">
          <div class="skeleton" style="height:24px;width:80px;border-radius:100px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}
