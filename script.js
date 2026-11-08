document.documentElement.classList.add('js');

// ---------- Header: solid background after scrolling ----------
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Mobile menu ----------
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  navLinks.classList.toggle('open', open);
  header.classList.toggle('menu-open', open);
};
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// ---------- Before / after slider ----------
const compare = document.getElementById('compare');
const range = document.getElementById('compare-range');
if (compare && range) {
  range.addEventListener('input', () => compare.style.setProperty('--pos', `${range.value}%`));

  // Switch between real before/after cases
  const tabs = document.querySelectorAll('.ba-tab');
  const imgBefore = document.getElementById('ba-before');
  const imgAfter = document.getElementById('ba-after');
  const caption = document.getElementById('ba-caption');
  const base = 'public/before-after/';

  // Preload all case images so switching is instant
  tabs.forEach((t) => ['prije', 'poslije'].forEach((s) => { new Image().src = `${base}${t.dataset.case}-${s}.jpg`; }));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      tabs.forEach((t) => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
      const name = tab.textContent.trim().toLowerCase();
      compare.classList.add('switching');
      setTimeout(() => {
        imgBefore.src = `${base}${tab.dataset.case}-prije.jpg`;
        imgAfter.src = `${base}${tab.dataset.case}-poslije.jpg`;
        imgBefore.alt = `Prije: ${name}`;
        imgAfter.alt = `Poslije: ${name}`;
        compare.style.setProperty('--img-pos', tab.dataset.pos || 'center');
        caption.textContent = tab.dataset.text;
        const start = tab.dataset.start || 50;
        range.value = start;
        compare.style.setProperty('--pos', `${start}%`);
        compare.classList.remove('switching');
      }, 250);
    });
  });
}

// ---------- Before/after gallery: filters + lightbox ----------
const bagItems = [...document.querySelectorAll('.bag-item')];
const bagCount = document.getElementById('bag-count');
document.querySelectorAll('.bag-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bag-filter').forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    const f = btn.dataset.filter;
    let shown = 0;
    bagItems.forEach((item) => {
      const show = f === 'all' || item.dataset.cat === f;
      item.classList.toggle('hidden', !show);
      if (show) { item.classList.add('in'); shown += 1; }
    });
    if (bagCount) bagCount.textContent = shown;
  });
});

const lightbox = document.getElementById('lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  let current = 0;
  const visible = () => bagItems.filter((i) => !i.classList.contains('hidden'));
  const show = (index) => {
    const list = visible();
    current = (index + list.length) % list.length;
    const item = list[current];
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.innerHTML = '';
    lbCap.append(item.querySelector('b').textContent);
    const hint = document.createElement('span');
    hint.textContent = item.querySelector('figcaption span').textContent;
    lbCap.append(hint);
  };
  bagItems.forEach((item) => {
    item.querySelector('.bag-open').addEventListener('click', () => {
      show(visible().indexOf(item));
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

// ---------- Package buttons preselect the form ----------
const serviceSelect = document.getElementById('f-service');
document.querySelectorAll('[data-package]').forEach((btn) => {
  btn.addEventListener('click', () => { serviceSelect.value = `${btn.dataset.package} paket`; });
});

// ---------- Contact form (demo — not yet connected) ----------
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach((input) => {
    const valid = input.value.trim() !== '';
    input.closest('.field').classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  if (!ok) {
    note.style.color = '#d64545';
    note.textContent = 'Molimo unesite ime i broj telefona.';
    return;
  }
  note.style.color = '';
  note.textContent = 'Hvala! Vaš upit je zaprimljen — javit ćemo vam se uskoro. (Demo forma, još nije povezana.)';
  form.reset();
});

document.getElementById('year').textContent = new Date().getFullYear();
