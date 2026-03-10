// ============================================================
// firebase.js — Firebase Initialization
// Replace YOUR_* placeholders with your real Firebase project values
// ============================================================

const firebaseConfig = {
  apiKey:            "AIzaSyD6QkJMT4BU-no0v71XLJiP6KMKQY72VSg",
  authDomain:        "exhortation-matinale.firebaseapp.com",
  projectId:         "exhortation-matinale",
  storageBucket:     "exhortation-matinale.firebasestorage.app",
  messagingSenderId: "845618059312",
  appId:             "1:845618059312:web:65de353e3c7d6bc04bb5f5",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Utility: format timestamp to French locale date string ──
function formatDate(value) {
  if (!value) return '';
  let date;
  if (value && value.toDate) {
    date = value.toDate();
  } else {
    date = new Date(value);
  }
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });
}

// ── Utility: strip HTML tags ──
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// ── Utility: truncate text ──
function truncate(str, maxLength = 140) {
  if (!str) return '';
  str = stripHtml(str);
  return str.length > maxLength ? str.slice(0, maxLength).trim() + '…' : str;
}

// ── Utility: generate slug from title ──
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Utility: WhatsApp share ──
function buildWhatsAppLink(title, content, url) {
  const excerpt = truncate(content, 200);
  const text = `✨ ${title} ✨\n\n${excerpt}\n\n🔗 Lire en ligne :\n${url}\n\n— Exhortation Prophétique Matinale`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

// ── Intersection Observer for fade-in animations ──
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  
  // Sécurité : rendre tout visible après 800ms quoi qu'il arrive
  setTimeout(() => {
    elements.forEach(el => el.classList.add('visible'));
  }, 800);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ── Mobile navigation ──
function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Set active nav link ──
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  setActiveNav();
  initFadeIn();
});
