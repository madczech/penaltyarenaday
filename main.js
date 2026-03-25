/* =============================================
   PENALTY ARENA – Goalies Day 1 · main.js
   ============================================= */

(function () {
  'use strict';

  /* ── Data ───────────────────────────────── */
  const SCENES = [
    { id: 'scena-1',  num: '01', title: 'Potvrzení účasti' },
    { id: 'scena-2',  num: '02', title: 'Příchod na směnu' },
    { id: 'scena-3',  num: '03', title: 'Zápis do docházkové knihy' },
    { id: 'scena-4',  num: '04', title: 'Odevzdání telefonu' },
    { id: 'scena-5',  num: '05', title: 'Respektuj zóny' },
    { id: 'scena-6',  num: '06', title: 'Rozcvičení' },
    { id: 'scena-7',  num: '07', title: 'Oblékání výstroje' },
    { id: 'scena-8',  num: '08', title: 'Kontrola FireBall' },
    { id: 'scena-9',  num: '09', title: 'Průběh session' },
    { id: 'scena-10', num: '10', title: 'Respektuj tým' },
    { id: 'scena-11', num: '11', title: 'Pauza' },
    { id: 'scena-12', num: '12', title: 'Chraň vybavení' },
    { id: 'scena-13', num: '13', title: 'Konec směny' },
    { id: 'scena-14', num: '14', title: 'Zakázané činnosti' },
    { id: 'scena-15', num: '15', title: 'Závěr' },
  ];

  /* ── Elements ───────────────────────────── */
  const progressBar    = document.getElementById('progress-bar');
  const topnav         = document.getElementById('topnav');
  const navScenes      = document.getElementById('nav-scenes');
  const indexList      = document.getElementById('index-list');
  const sidebarList    = document.getElementById('sidebar-list');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const menuBtn        = document.getElementById('menu-btn');
  const sidebarClose   = document.getElementById('sidebar-close');

  /* ── Build nav dots (top bar) ───────────── */
  SCENES.forEach(s => {
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.className = 'nav-dot';
    a.textContent = s.num;
    a.title = s.title;
    a.dataset.target = s.id;
    navScenes.appendChild(a);
  });

  /* ── Build desktop index sidebar ───────── */
  SCENES.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${s.id}" data-target="${s.id}">
      <span class="i-num">${s.num}</span>
      <span>${s.title}</span>
    </a>`;
    indexList.appendChild(li);
  });

  /* ── Build mobile sidebar list ──────────── */
  SCENES.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${s.id}" data-target="${s.id}">
      <span class="s-num">${s.num}</span>
      <span>${s.title}</span>
    </a>`;
    sidebarList.appendChild(li);
  });

  /* ── Mobile sidebar toggle ──────────────── */
  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
  });
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
  }
  sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  sidebarList.addEventListener('click', e => {
    if (e.target.closest('a')) closeSidebar();
  });

  /* ── Scroll: progress bar + nav shadow ──── */
  function onScroll() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
    topnav.classList.toggle('scrolled', scrollTop > 10);
  }

  /* ── Scroll spy ─────────────────────────── */
  const sceneEls = SCENES.map(s => document.getElementById(s.id)).filter(Boolean);

  function getActiveScene() {
    const offset = 120; // px below nav
    let active = null;
    for (const el of sceneEls) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= offset) active = el.id;
    }
    return active;
  }

  function updateActive(activeId) {
    // nav dots
    document.querySelectorAll('.nav-dot').forEach(el => {
      el.classList.toggle('active', el.dataset.target === activeId);
    });
    // desktop index
    document.querySelectorAll('#index-list a').forEach(el => {
      el.classList.toggle('active', el.dataset.target === activeId);
    });
    // mobile sidebar
    document.querySelectorAll('#sidebar-list a').forEach(el => {
      el.classList.toggle('active', el.dataset.target === activeId);
    });
    // scene highlight
    sceneEls.forEach(el => {
      el.classList.toggle('active-scene', el.id === activeId);
    });
    // scroll active nav dot into view
    const activeDot = navScenes.querySelector('.nav-dot.active');
    if (activeDot) {
      activeDot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  let lastActive = null;
  function scrollSpyTick() {
    onScroll();
    const active = getActiveScene();
    if (active !== lastActive) {
      lastActive = active;
      if (active) updateActive(active);
    }
  }

  window.addEventListener('scroll', scrollSpyTick, { passive: true });
  scrollSpyTick(); // run once on load

  /* ── Intersection Observer: fade-in scenes ─ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  sceneEls.forEach(el => io.observe(el));

  /* ── Keyboard navigation ─────────────────── */
  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const currentIdx = SCENES.findIndex(s => s.id === lastActive);

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      const next = SCENES[currentIdx + 1];
      if (next) document.getElementById(next.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      const prev = currentIdx <= 0 ? null : SCENES[currentIdx - 1];
      if (prev) document.getElementById(prev.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'Home') {
      e.preventDefault();
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'End') {
      e.preventDefault();
      sceneEls.at(-1)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ── Smooth scroll for all anchor links ─── */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.id === 'hero' ? 0 : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ── Image placeholder click (future Canva) ─ */
  document.querySelectorAll('.image-placeholder').forEach(el => {
    el.addEventListener('click', () => {
      const slot = el.closest('.scene-image-slot');
      const sceneNum = slot ? slot.dataset.scene : '?';
      // In step 2 this will trigger Canva image insertion
      console.log(`[Canva] Image slot for scene ${sceneNum} clicked – ready for step 2`);
    });
  });

})();
