// ============================================================
// exhortations.js — Homepage Dynamic Content
// Loads latest exhortation + recent archive cards from Firestore
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadLatestExhortation();
  loadRecentCards();
  loadTestimonials();
});

// ── Load the single latest exhortation ──────────────────────
async function loadLatestExhortation() {
  const container = document.getElementById('latest-exhortation');
  if (!container) return;

  try {
    const snap = await db.collection('exhortations')
      .orderBy('date', 'desc')
      .limit(1)
      .get();

    if (snap.empty) {
      container.innerHTML = renderEmptyState('Aucune exhortation publiée pour le moment.');
      return;
    }

    const doc  = snap.docs[0];
    const data = doc.data();
    const id   = doc.id;
    const url  = `${window.location.origin}${window.location.pathname.replace('index.html', '')}exhortation.html?id=${id}`;
    const excerpt = truncate(data.contenu, 260);
    const waLink  = buildWhatsAppLink(data.titre, data.contenu, url);

    container.innerHTML = `
      <div class="latest-content fade-in">
        <div class="date-tag">✦ ${formatDate(data.date)}</div>
        <h2>${data.titre}</h2>
        <p class="excerpt">${excerpt}</p>
        <div class="latest-actions">
          <a href="exhortation.html?id=${id}" class="btn btn-primary">
            Lire l'exhortation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Partager
          </a>
        </div>
      </div>
      <div class="latest-visual fade-in">
        <div class="verse-card">
          <div class="quote-mark">"</div>
          <p class="verse-text">${data.verse_du_jour || 'Car la parole de Dieu est vivante et efficace, plus tranchante qu\'une épée quelconque à deux tranchants.'}</p>
          <div class="verse-ref">${data.verse_ref || 'Hébreux 4:12'}</div>
        </div>
      </div>
    `;

    // Reinitialize fade-ins for newly added elements
    setTimeout(initFadeIn, 50);

  } catch (error) {
    console.error('Error loading latest exhortation:', error);
    container.innerHTML = renderEmptyState('Impossible de charger l\'exhortation. Vérifiez votre connexion.');
  }
}

// ── Load recent exhortation cards ───────────────────────────
async function loadRecentCards() {
  const container = document.getElementById('recent-cards');
  if (!container) return;

  container.innerHTML = renderSkeletonCards(3);

  try {
    const snap = await db.collection('exhortations')
      .orderBy('date', 'desc')
      .limit(6)
      .get();

    if (snap.empty) {
      container.innerHTML = renderEmptyState('Aucune exhortation dans l\'archive.');
      return;
    }

    container.innerHTML = '';
    snap.docs.forEach((doc, i) => {
      const data = doc.data();
      const id   = doc.id;
      const card = buildExhortationCard(id, data, i);
      container.appendChild(card);
    });

    setTimeout(initFadeIn, 50);

  } catch (error) {
    console.error('Error loading recent cards:', error);
    container.innerHTML = renderEmptyState('Impossible de charger les exhortations.');
  }
}

// ── Build exhortation card element ──────────────────────────
function buildExhortationCard(id, data, index = 0) {
  const card = document.createElement('div');
  card.className = 'exh-card fade-in';
  card.style.transitionDelay = `${index * 80}ms`;
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

// ── Static testimonials (or load from Firestore) ────────────
function loadTestimonials() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;

  const testimonials = [
    {
      text: 'Ces exhortations matinales ont transformé mes journées. Chaque matin, je commence par lire la Parole publiée ici et cela donne une direction prophétique à toute ma journée.',
      name: 'Marie-Claire K.',
      location: 'Abidjan, Côte d\'Ivoire',
      initial: 'M'
    },
    {
      text: 'Je partage chaque exhortation dans mon groupe WhatsApp d\'église. La communauté est édifiée et plusieurs personnes ont témoigné d\'une rencontre profonde avec Dieu.',
      name: 'Pasteur Emmanuel T.',
      location: 'Douala, Cameroun',
      initial: 'E'
    },
    {
      text: 'Le ministère m\'a trouvé dans une période de sécheresse spirituelle. La fidélité des publications quotidiennes a ravivé ma flamme. Que Dieu bénisse cette équipe.',
      name: 'Rachel N.',
      location: 'Paris, France',
      initial: 'R'
    }
  ];

  container.innerHTML = testimonials.map((t, i) => `
    <div class="testimonial-card fade-in" style="transition-delay:${i * 100}ms">
      <div class="quote-icon">"</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.initial}</div>
        <div class="author-info">
          <div class="name">${t.name}</div>
          <div class="location">${t.location}</div>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(initFadeIn, 50);
}

// ── YouTube embeds ───────────────────────────────────────────
function loadYouTubeSection() {
  const container = document.getElementById('youtube-grid');
  if (!container) return;

  // Replace VIDEO_ID_1, VIDEO_ID_2, VIDEO_ID_3 with real YouTube video IDs
  const videoIds = [
    'VIDEO_ID_1',
    'VIDEO_ID_2',
    'VIDEO_ID_3'
  ];

  container.innerHTML = videoIds.map(vid => `
    <div class="yt-embed-card">
      <iframe
        src="https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1"
        title="Exhortation Prophétique"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy">
      </iframe>
    </div>
  `).join('');
}

// ── Helpers ─────────────────────────────────────────────────
function renderEmptyState(message) {
  return `
    <div class="loader-container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
      <p>${message}</p>
    </div>
  `;
}

function renderSkeletonCards(count) {
  return Array.from({ length: count }).map(() => `
    <div class="exh-card">
      <div class="card-header">
        <div class="skeleton" style="height:12px;width:60%;margin-bottom:10px;"></div>
        <div class="skeleton" style="height:18px;width:90%;"></div>
      </div>
      <div class="card-body">
        <div class="skeleton" style="height:12px;width:100%;margin-bottom:8px;"></div>
        <div class="skeleton" style="height:12px;width:80%;margin-bottom:20px;"></div>
        <div style="display:flex;justify-content:space-between">
          <div class="skeleton" style="height:24px;width:80px;border-radius:100px;"></div>
          <div class="skeleton" style="height:18px;width:24px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadYouTubeSection);
