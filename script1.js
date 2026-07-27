/* ============================
   ERIKA GALÁN — PORTFOLIO JS
   ============================ */

// ============================
// I18N SYSTEM
// ============================
const SUPPORTED_LANGS = ['es', 'en', 'ca', 'fr'];
const DEFAULT_LANG = 'es';

function detectInitialLang() {
  const saved = localStorage.getItem('motika-lang');
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  const nav = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(nav)) return nav;
  return DEFAULT_LANG;
}

let currentLang = detectInitialLang();

function t(key) {
  const dict = translations[currentLang] || translations[DEFAULT_LANG];
  return (dict && dict[key] !== undefined) ? dict[key] : (translations[DEFAULT_LANG][key] || key);
}

function refreshMorphTitle(el) {
  const wasVisible = el.classList.contains('morph-visible');
  el.classList.remove('morph-visible');
  splitIntoMorphChars(el);
  if (wasVisible) {
    requestAnimationFrame(() => animateMorphTitle(el));
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
    if (el.classList.contains('morphing-title')) refreshMorphTitle(el);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });

  document.querySelectorAll('.sc-card').forEach(card => {
    const title = card.dataset.title;
    const langData = translations[currentLang] && translations[currentLang]['projects.data'];
    const data = (langData && langData[title]) || (translations[DEFAULT_LANG]['projects.data'][title]);
    if (!data) return;
    const labelEl = card.querySelector('.sc-label');
    const descEl  = card.querySelector('.sc-desc');
    const ctaEl   = card.querySelector('.sc-cta');
    const titleEl = card.querySelector('.sc-title');
    if (labelEl) labelEl.textContent = data.cat;
    if (descEl)  descEl.textContent  = data.desc;
    if (ctaEl)   ctaEl.textContent   = t('project.cta.view');
    if (titleEl) {
      titleEl.dataset.text = data.title;
      const wasVisible = titleEl.classList.contains('title-visible');
      splitCardTitle(titleEl);
      if (wasVisible) titleEl.classList.add('title-visible');
    }
  });

  const titles = {
    es: 'Erika Galán — Diseñadora Gráfica y Editora de Vídeo',
    en: 'Erika Galán — Graphic Designer & Video Editor',
    ca: 'Erika Galán — Dissenyadora Gràfica i Editora de Vídeo',
    fr: 'Erika Galán — Designer Graphique & Monteuse Vidéo'
  };
  document.title = titles[currentLang] || titles[DEFAULT_LANG];

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('motika-lang', lang);
  applyTranslations();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// ── Nav scroll effect ──────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ============================
// MORPHING TITLE ANIMATION
// Letters expand from scaleX(0.1) → scaleX(1) one by one
// ============================
function splitIntoMorphChars(el) {
  const processNode = (node, isItalic) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const chars = node.textContent.split('');
      const frag = document.createDocumentFragment();
      chars.forEach(ch => {
        if (ch === '\n') {
          frag.appendChild(document.createElement('br'));
        } else if (ch === ' ' || ch.trim() === '') {
          frag.appendChild(document.createTextNode('\u00A0'));
        } else {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          if (isItalic) span.style.fontStyle = 'italic';
          frag.appendChild(span);
        }
      });
      return frag;
    }
    return null;
  };

  const children = Array.from(el.childNodes);
  el.innerHTML = '';

  children.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = processNode(child, false);
      if (frag) el.appendChild(frag);
    } else if (child.nodeName === 'EM') {
      const em = document.createElement('em');
      Array.from(child.childNodes).forEach(c => {
        const frag = processNode(c, true);
        if (frag) em.appendChild(frag);
      });
      el.appendChild(em);
    } else if (child.nodeName === 'BR') {
      el.appendChild(document.createElement('br'));
    } else {
      el.appendChild(child.cloneNode(true));
    }
  });
}

// Apply to all .morphing-title headings
document.querySelectorAll('.morphing-title').forEach(el => splitIntoMorphChars(el));

function animateMorphTitle(el) {
  const chars = el.querySelectorAll('.char');
  chars.forEach((ch, i) => {
    // stagger the entrance
    ch.style.transitionDelay = `${i * 38}ms`;
  });
  el.classList.add('morph-visible');
}

// Hero title fires immediately
const heroTitle = document.querySelector('.hero-name.morphing-title');
if (heroTitle) setTimeout(() => animateMorphTitle(heroTitle), 300);

// All other morphing titles trigger on scroll
const morphObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateMorphTitle(entry.target);
      morphObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll('.morphing-title:not(.hero-name)').forEach(el => morphObserver.observe(el));

// ── Project card title split (classic fly-up animation) ───────
function splitCardTitle(titleEl) {
  const text = titleEl.dataset.text || titleEl.textContent;
  titleEl.innerHTML = '';
  text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.transitionDelay = `${i * 35}ms`;
    titleEl.appendChild(span);
  });
}

document.querySelectorAll('.sc-title').forEach(el => splitCardTitle(el));

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('title-visible');
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.sc-card').forEach(card => cardObserver.observe(card));

// ── Scroll reveal ──────────────────────────────────────────────
function addReveal(selector) {
  document.querySelectorAll(selector).forEach(el => el.classList.add('reveal'));
}

addReveal('.about-intro');
addReveal('.about-side');
addReveal('.info-card');
addReveal('.contact-channels');
addReveal('.contact-form-wrap');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Skill bars animate on scroll ───────────────────────────────
const skillFills = document.querySelectorAll('.skill-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
skillFills.forEach(fill => barObserver.observe(fill));

// ── Project category filter ────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const scCards = document.querySelectorAll('.sc-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    scCards.forEach((card, i) => {
      const match = cat === 'all' || card.dataset.cat === cat;
      if (match) {
        card.classList.remove('hidden');
        card.style.transitionDelay = `${(i % 6) * 50}ms`;
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── Project detail panel ───────────────────────────────────────

const detailPanel  = document.getElementById('detailPanel');
const detailBack   = document.getElementById('detailBack');
const detailPrev   = document.getElementById('detailPrev');
const detailNext   = document.getElementById('detailNext');
const detailCounter= document.getElementById('detailCounter');
const detailCat    = document.getElementById('detailCat');
const detailTitle  = document.getElementById('detailTitle');
const detailYear   = document.getElementById('detailYear');
const detailDesc   = document.getElementById('detailDesc');
const detailTags   = document.getElementById('detailTags');
const detailCollage= document.getElementById('detailCollage');
const detailAvatar = document.getElementById('detailAvatar');

const zoomOverlay = document.createElement('div');
zoomOverlay.className = 'zoom-overlay';
zoomOverlay.innerHTML = `
  <div class="zoom-frame">
    <div class="profile-piece-bg"></div>
    <div class="profile-piece-shade"></div>
    <span class="profile-piece-label"></span>
  </div>
`;
document.body.appendChild(zoomOverlay);

const zoomFrame = zoomOverlay.querySelector('.zoom-frame');
const zoomBg = zoomOverlay.querySelector('.profile-piece-bg');
const zoomLabel = zoomOverlay.querySelector('.profile-piece-label');

function openZoom(piece) {
  if (!piece) return;
  zoomBg.style.background = piece.bg;
  zoomLabel.textContent = piece.label;
  zoomOverlay.classList.add('open');
}

function closeZoom() {
  zoomOverlay.classList.remove('open');
}

zoomOverlay.addEventListener('click', (event) => {
  if (event.target === zoomOverlay) closeZoom();
});

zoomFrame.addEventListener('click', (event) => {
  event.stopPropagation();
});

const projectData = {
  'Bloom Café — Brand Identity': {
    cat: 'Branding', year: '2025',
    desc: 'A complete visual identity for a boutique café concept in Barcelona. The project included logotype design, color system, typography selection, packaging for takeaway cups and bags, and brand guidelines.',
    tags: ['Logo Design', 'Packaging', 'Brand Guidelines', 'Typography', 'Color System'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', label: 'Brand Identity' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #FF8E53, #FF6B6B)', label: 'Packaging' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #FFF0EB, #F5C6B0)', label: 'Logo System' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #FF6B6B, #C0392B)', label: 'Signage' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #2C1A10, #5A3020)', label: 'Brand Book' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #FFF0EB, #FFD6C4)', label: 'Business Cards' },
    ]
  },
  'Nova Studio — Visual Identity': {
    cat: 'Branding', year: '2025',
    desc: 'Visual identity for a creative studio, focusing on a modular logo system and a flexible brand toolkit that works across digital and print.',
    tags: ['Visual Identity', 'Brand System', 'Digital', 'Print'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(145deg, #0F2027, #203A43)', label: 'Visual Identity' },
      { cls: 'cp-sq',   bg: 'linear-gradient(135deg, #2C5364, #0F2027)', label: 'Logo' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #203A43, #2C5364)', label: 'Stationery' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #A8D8EA, #2C5364)', label: 'Digital Assets' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #0F2027, #203A43)', label: 'Brand Guide' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #A8D8EA, #FFFFFF)', label: 'Mock-up' },
    ]
  },
  'Mara Skincare — Social Media Campaign': {
    cat: 'Social Media', year: '2025',
    desc: 'Instagram feed design and content strategy for a skincare brand targeting Gen Z. Includes carousel format system, story templates, and a consistent visual grid.',
    tags: ['Instagram', 'Feed Design', 'Stories', 'Carousels', 'Gen Z'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(120deg, #E0C3FC 0%, #8EC5FC 100%)', label: 'Feed Grid' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #F3E7FF, #E0C3FC)', label: 'Stories' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #8EC5FC, #6C3FC8)', label: 'Carousel' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #6C3FC8, #E0C3FC)', label: 'Reels Cover' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #1A0050, #6C3FC8)', label: 'Highlights' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #F3E7FF, #8EC5FC)', label: 'Product Shot' },
    ]
  },
  'Forma Magazine — Editorial Design': {
    cat: 'Editorial', year: '2024',
    desc: 'A 48-page editorial project exploring contemporary design culture. Designed the full layout, typography hierarchy, and visual language from scratch.',
    tags: ['Editorial', 'Layout', 'Typography', 'Print', '48 pages'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', label: 'Cover' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #F8F0FF, #C9B3F5)', label: 'Spread' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #764BA2, #667EEA)', label: 'Typography' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #2D1B69, #764BA2)', label: 'Interior' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #667EEA, #F8F0FF)', label: 'Detail' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #2D1B69, #667EEA)', label: 'Contents' },
    ]
  },
  'Arrel — Book Design': {
    cat: 'Editorial', year: '2024',
    desc: 'Book design for a short poetry collection. The visual concept responds to the word "Arrel" (root in Catalan) through organic shapes, earthy tones, and a warm typographic feel.',
    tags: ['Book Design', 'Cover', 'Interior Layout', 'Poetry', 'Print'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(110deg, #F6D365 0%, #FDA085 100%)', label: 'Cover' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #FFF3E0, #F6D365)', label: 'Typography' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #FDA085, #8B4513)', label: 'Interior' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #F6D365, #3E1F00)', label: 'Spine' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #FFF3E0, #FDA085)', label: 'Detail' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #3E1F00, #8B4513)', label: 'Texture' },
    ]
  },
  'Nit de Disseny — Event Branding': {
    cat: 'Events', year: '2024',
    desc: 'Brand system for a fictional design festival in Barcelona. Includes a modular poster system, wayfinding signage, event programme booklet, and digital assets.',
    tags: ['Event Branding', 'Poster', 'Signage', 'Programme', 'Festival'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(135deg, #1A001E 0%, #7B0045 100%)', label: 'Key Visual' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #7B0045, #FF006E)', label: 'Poster' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #FF006E, #FFD600)', label: 'Signage' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #1A001E, #7B0045)', label: 'Programme' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #FFD600, #FF006E)', label: 'Badge' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #7B0045, #1A001E)', label: 'Digital' },
    ]
  },
  'Botanical Series — Illustration': {
    cat: 'Illustration', year: '2024',
    desc: 'A series of six botanical illustrations exploring ink texture and digital colour. Originally created for a limited print run.',
    tags: ['Digital Illustration', 'Print', 'Series', 'Botanical', 'Limited Edition'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(160deg, #F9A8D4 0%, #EC4899 50%, #9333EA 100%)', label: 'Series Overview' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #FFF0FA, #F9A8D4)', label: 'Piece 01' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #EC4899, #9333EA)', label: 'Piece 02' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #9333EA, #F9A8D4)', label: 'Print Detail' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #1A0030, #9333EA)', label: 'Piece 03' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #F9A8D4, #EC4899)', label: 'Piece 04' },
    ]
  },
  'Quiet Hours — Short Film': {
    cat: 'Multimedia', year: '2025',
    desc: 'A 4-minute short film shot and edited in Barcelona. Responsible for full post-production: cut, colour grade, sound design, and titles.',
    tags: ['Short Film', 'Video Editing', 'Colour Grade', 'Sound Design', 'Post-production'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(160deg, #0D0D0D 0%, #1A2A1A 60%, #2E5038 100%)', label: 'Film Still' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #2E5038, #1A2A1A)', label: 'Colour Grade' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #1A2A1A, #0D0D0D)', label: 'Scene' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #0D0D0D, #2E5038)', label: 'Titles' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #6EC97F, #2E5038)', label: 'Credit' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #1A2A1A, #6EC97F)', label: 'Still' },
    ]
  },
  'Pulse Music — Content Strategy': {
    cat: 'Social Media', year: '2025',
    desc: 'Motion-led social content for a music distribution platform. Designed Reels cover templates, animated stories, and a system for consistent weekly releases.',
    tags: ['Content Design', 'Reels', 'Stories', 'Motion', 'Music'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', label: 'Reels Cover' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #FF9068, #FF416C)', label: 'Stories' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #FF4B2B, #1A0010)', label: 'Feed Post' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #1A0010, #FF416C)', label: 'Template' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #FF9068, #FF4B2B)', label: 'Highlight' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #FF416C, #FF9068)', label: 'Motion' },
    ]
  },
  'Character Design — Personal': {
    cat: 'Illustration', year: '2023–2024',
    desc: 'An ongoing personal project exploring character archetypes and visual personalities. Mixing flat illustration with textured techniques.',
    tags: ['Character Design', 'Personal Project', 'Illustration', 'Texture', 'Flat Design'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)', label: 'Character Set' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #D4FFF1, #38EF7D)', label: 'Char. 01' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #11998E, #004D3A)', label: 'Char. 02' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #38EF7D, #11998E)', label: 'Char. 03' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #004D3A, #11998E)', label: 'Sketches' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #D4FFF1, #11998E)', label: 'Detail' },
    ]
  },
  'Marca Viva — Motion Graphics': {
    cat: 'Multimedia', year: '2025',
    desc: 'Animated brand assets for a live event brand. Includes logo animations, lower thirds, countdown timers, and transition sequences.',
    tags: ['Motion Graphics', 'Brand Animation', 'Lower Thirds', 'Logo Animation', 'Events'],
    collage: [
      { cls: 'cp-hero', bg: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 100%)', label: 'Logo Anim.' },
      { cls: 'cp-sq',   bg: 'linear-gradient(145deg, #533483, #1A1A2E)', label: 'Lower Third' },
      { cls: 'cp-port', bg: 'linear-gradient(160deg, #0F3460, #533483)', label: 'Countdown' },
      { cls: 'cp-wide', bg: 'linear-gradient(120deg, #E94560, #0F3460)', label: 'Transition' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #16213E, #E94560)', label: 'Bumper' },
      { cls: 'cp-sm',   bg: 'linear-gradient(135deg, #533483, #E94560)', label: 'Still' },
    ]
  }
};

let visibleTitles = [];
let currentIndex  = 0;
let collagePieces = [];
let activeCarouselIndex = 0;

function getVisibleTitles() {
  return Array.from(document.querySelectorAll('.sc-card:not(.hidden)'))
    .map(c => c.dataset.title);
}

function buildCollage(pieces) {
  detailCollage.innerHTML = '';
  const visiblePieces = pieces.slice(0, 6);
  collagePieces = visiblePieces;
  activeCarouselIndex = 0;

  const gallery = document.createElement('div');
  gallery.className = 'detail-gallery';

  const grid = document.createElement('div');
  grid.className = 'detail-gallery-grid';

  collagePieces.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = `profile-piece-card ${i === 0 ? 'feature' : ''}`;
    card.innerHTML = `
      <div class="profile-piece-bg" style="background:${p.bg}"></div>
      <div class="profile-piece-shade"></div>
      <span class="profile-piece-label">${p.label}</span>
    `;
    card.addEventListener('click', () => openZoom(p));
    grid.appendChild(card);
  });

  gallery.appendChild(grid);
  detailCollage.appendChild(gallery);
}

function getTranslatedProjectData(title) {
  const base = projectData[title];
  if (!base) return null;
  const langData = translations[currentLang] && translations[currentLang]['projects.data'];
  const tr = (langData && langData[title]) || (translations[DEFAULT_LANG]['projects.data'][title]) || {};
  return {
    cat: tr.cat || base.cat,
    year: base.year,
    desc: tr.detailDesc || base.desc,
    tags: tr.tags || base.tags,
    collage: base.collage,
    displayTitle: tr.title || title.split(' — ')[0]
  };
}

function openDetail(title) {
  const data = getTranslatedProjectData(title);
  if (!data) return;

  visibleTitles = getVisibleTitles();
  currentIndex  = visibleTitles.indexOf(title);

  detailCat.textContent   = data.cat;
  detailTitle.textContent = data.displayTitle;
  detailYear.textContent  = data.year;
  detailDesc.textContent  = data.desc;
  detailAvatar.textContent = (data.displayTitle || title)
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase() || 'EG';

  detailTags.innerHTML = data.tags.map(tag =>
    `<span class="detail-tag">${tag}</span>`
  ).join('');

  detailCounter.textContent = `${currentIndex + 1} / ${visibleTitles.length}`;

  buildCollage(data.collage);

  detailPanel.classList.add('open');
  detailPanel.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  detailCollage.scrollTop = 0;
}

function closeDetail() {
  detailPanel.classList.remove('open');
  detailPanel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function navigateDetail(dir) {
  const newIndex = (currentIndex + dir + visibleTitles.length) % visibleTitles.length;
  detailPanel.querySelector('.detail-body').style.opacity = '0';
  setTimeout(() => {
    openDetail(visibleTitles[newIndex]);
    detailPanel.querySelector('.detail-body').style.opacity = '';
  }, 200);
}

document.querySelectorAll('.sc-card').forEach(card => {
  card.addEventListener('click', () => openDetail(card.dataset.title));
});

detailBack.addEventListener('click', closeDetail);
detailPrev.addEventListener('click', () => navigateDetail(-1));
detailNext.addEventListener('click', () => navigateDetail(1));

document.getElementById('detailCta').addEventListener('click', closeDetail);

document.addEventListener('keydown', (e) => {
  if (zoomOverlay.classList.contains('open')) {
    if (e.key === 'Escape') closeZoom();
    return;
  }
  if (!detailPanel.classList.contains('open')) return;
  if (e.key === 'Escape')       closeDetail();
  if (e.key === 'ArrowRight')   navigateDetail(1);
  if (e.key === 'ArrowLeft')    navigateDetail(-1);
});

// ── Contact form ───────────────────────────────────────────────
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('.form-submit');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const endpoint = form.action || 'https://formsubmit.co/contacto.motika@gmail.com';
  const payload = new FormData(form);

  fetch(endpoint, {
    method: 'POST',
    body: payload,
    mode: 'no-cors',
  }).then(() => {
    formNote.textContent = '✓ Message sent! I\'ll get back to you soon.';
    form.reset();
  }).catch(() => {
    formNote.textContent = 'Something went wrong. Please try again or email me directly.';
  }).finally(() => {
    btn.textContent = 'Send Message →';
    btn.disabled = false;
  });
});

// ── Draggable floating windows (hero only) ─────────────────────
function makeDraggable(el) {
  let isDragging = false, startX, startY, origX, origY;
  const bar = el.querySelector('.window-bar') || el;
  bar.style.cursor = 'grab';

  bar.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    el.style.position = 'fixed';
    el.style.left = origX + 'px'; el.style.top = origY + 'px';
    el.style.right = 'auto'; el.style.bottom = 'auto';
    el.style.zIndex = '10';
    bar.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    el.style.left = (origX + e.clientX - startX) + 'px';
    el.style.top  = (origY + e.clientY - startY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; bar.style.cursor = 'grab'; document.body.style.userSelect = ''; }
  });
}

const win1 = document.getElementById('win1');
const win2 = document.getElementById('win2');
if (win1) makeDraggable(win1);
if (win2) makeDraggable(win2);

// ── Apply initial translations ──────────────────────────────────
applyTranslations();
