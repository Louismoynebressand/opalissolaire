/* Accueil : lumière, carrousel et mouvements progressifs. Aucun curseur personnalisé. */
(() => {
  'use strict';
  const hero = document.querySelector('[data-hero-slider]');
  if (!hero) return;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let reduced = motionPreference.matches;
  document.body.classList.add('home-immersive');

  // Un seul minuteur, suspendu hors écran, pendant la lecture et au clavier.
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const dots = [...hero.querySelectorAll('.hero-dots button')];
  const previous = hero.querySelector('.hero-prev');
  const next = hero.querySelector('.hero-next');
  const play = hero.querySelector('.hero-autoplay');
  const card = hero.querySelector('.glass-note');
  const title = hero.querySelector('[data-slide-title]');
  const note = hero.querySelector('[data-slide-note]');
  const tag = hero.querySelector('.hero-image-tag');
  const status = hero.querySelector('.hero-slide-status');
  const clock = hero.querySelector('.hero-timer>span');
  const delay = 6500;
  let current = 0, timer = 0, noteTimer = 0, changeId = 0;
  let paused = false, hovered = false, focused = false, onScreen = true;
  const stop = () => {
    clearTimeout(timer);
    timer = 0;
    clock.style.transition = 'none';
    clock.style.transform = 'scaleX(0)';
  };
  const arm = () => {
    stop();
    if (reduced || paused || hovered || focused || document.hidden || !onScreen) return;
    timer = setTimeout(() => show(current + 1, false), delay);
    requestAnimationFrame(() => {
      if (!timer || reduced || paused || hovered || focused || document.hidden || !onScreen) return;
      clock.style.transition = `transform ${delay}ms linear`;
      clock.style.transform = 'scaleX(1)';
    });
  };
  const show = async (index, announce = true) => {
    const selected = (index + slides.length) % slides.length;
    const request = ++changeId;
    stop();
    const image = slides[selected].querySelector('img');
    image.loading = 'eager';
    try { if (image.decode) await image.decode(); } catch { arm(); return; }
    if (request !== changeId) return;
    if (selected === current) { arm(); return; }
    current = selected;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-current', String(i === current));
    });
    hero.querySelector('.hero-slide-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    clearTimeout(noteTimer);
    card.classList.add('is-changing');
    noteTimer = setTimeout(() => {
      title.textContent = slides[current].dataset.title;
      note.textContent = slides[current].dataset.note;
      tag.textContent = slides[current].dataset.tag;
      card.classList.remove('is-changing');
    }, reduced ? 0 : 180);
    if (announce) status.textContent = `Photo ${current + 1} sur ${slides.length} : ${image.alt}`;
    arm();
  };
  hero.querySelector('.hero-navigation').hidden = false;
  previous.hidden = false;
  next.hidden = false;
  play.hidden = reduced;
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dots.forEach((button, i) => button.addEventListener('click', () => show(i)));
  play.addEventListener('click', () => {
    paused = !paused;
    play.setAttribute('aria-pressed', String(paused));
    play.setAttribute('aria-label', paused ? 'Reprendre le défilement automatique' : 'Mettre en pause le défilement automatique');
    play.textContent = paused ? '▶' : 'Ⅱ';
    arm();
  });
  hero.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    stop();
  });
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    hero.dataset.pointerSide = event.clientX - box.left < box.width / 2 ? 'left' : 'right';
  });
  hero.addEventListener('pointerleave', () => { hovered = false; delete hero.dataset.pointerSide; arm(); });
  hero.addEventListener('focusin', () => { focused = true; stop(); });
  hero.addEventListener('focusout', event => { focused = hero.contains(event.relatedTarget); arm(); });
  hero.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  let touchStart = null;
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = { x:event.clientX, y:event.clientY };
  });
  hero.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(current + (dx < 0 ? 1 : -1));
  });
  hero.addEventListener('pointercancel', () => { touchStart = null; });
  document.addEventListener('visibilitychange', arm);
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      arm();
    }, { threshold:.15 });
    visibility.observe(hero);
  }
  arm();

  // Le contenu reste lisible sans JS et lorsque les mouvements sont réduits.
  if (!reduced && 'IntersectionObserver' in window) {
    document.querySelectorAll('.need-grid,.range-grid,.projects-grid').forEach(group => {
      [...group.children].forEach((item, i) => item.style.setProperty('--enter-delay', `${(i % 3) * 85}ms`));
    });
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-entered');
        reveal.unobserve(entry.target);
      });
    }, { threshold:.08, rootMargin:'0px 0px -24px 0px' });
    document.querySelectorAll('.reveal,.need-toolbar,.installer-step').forEach(element => {
      element.classList.add('motion-enter');
      reveal.observe(element);
    });
  }
  document.querySelectorAll('[data-space]').forEach(button => button.addEventListener('click', () => {
    if (reduced || !Element.prototype.animate) return;
    [...document.querySelectorAll('.need-card')].filter(card => !card.hidden).forEach((card, i) => {
      card.classList.add('motion-entered');
      card.animate([{ opacity:0, transform:'translateY(14px)' }, { opacity:1, transform:'translateY(0)' }], { duration:450, delay:i * 35, easing:'cubic-bezier(.16,1,.3,1)', fill:'backwards' });
    });
  }));

  // Parallaxe limitée à quelques pixels, mise à jour au rythme de l’écran.
  const copy = document.querySelector('.hero-copy');
  const needSection = document.querySelector('.need-section');
  const media = [...document.querySelectorAll('.shop-visual,.method-image,.audience-image')];
  media.forEach(element => element.classList.add('motion-parallax'));
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const enabled = !reduced && innerWidth > 760;
    const bounds = hero.getBoundingClientRect();
    const shift = enabled ? Math.max(-22, Math.min(22, -bounds.top * .055)) : 0;
    hero.style.setProperty('--hero-parallax', `${shift}px`);
    copy.style.setProperty('--copy-shift', `${enabled ? Math.min(22, scrollY * .045) : 0}px`);
    if (needSection) needSection.style.setProperty('--section-drift', `${enabled ? Math.max(-60, Math.min(60, (innerHeight - needSection.getBoundingClientRect().top) * .06)) : 0}px`);
    media.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (!rect.height || rect.bottom < 0 || rect.top > innerHeight) return;
      const y = enabled ? Math.max(-19, Math.min(19, (innerHeight / 2 - rect.top - rect.height / 2) * .045)) : 0;
      element.style.setProperty('--media-shift', `${y}px`);
    });
  };
  const scheduleScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
  addEventListener('scroll', scheduleScroll, { passive:true });
  addEventListener('resize', scheduleScroll, { passive:true });
  updateScroll();

  // Une lumière diffuse suit le pointeur natif ; seul le texte survolé se reflète.
  if (finePointer.matches && !reduced) {
    const glow = document.createElement('div');
    glow.className = 'opalis-pointer-light';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    document.querySelectorAll('#hero-title,.section-heading').forEach(heading => {
      const reflection = document.createElement('span');
      reflection.className = 'uv-reflection';
      reflection.setAttribute('aria-hidden', 'true');
      reflection.innerHTML = heading.innerHTML;
      heading.classList.add('uv-title');
      heading.appendChild(reflection);
    });
    let x = innerWidth / 2, y = innerHeight / 2, targetX = x, targetY = y, frame = 0, lit = null;
    const follow = () => {
      x += (targetX - x) * .18;
      y += (targetY - y) * .18;
      glow.style.transform = `translate3d(${x}px,${y}px,0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .25 ? requestAnimationFrame(follow) : 0;
    };
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reduced) return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) frame = requestAnimationFrame(follow);
      glow.style.opacity = '1';
      const heading = event.target.closest('.uv-title');
      if (lit && lit !== heading) lit.classList.remove('is-lit');
      lit = heading;
      if (!heading) return;
      const rect = heading.getBoundingClientRect();
      heading.style.setProperty('--uv-x', `${targetX - rect.left}px`);
      heading.style.setProperty('--uv-y', `${targetY - rect.top}px`);
      heading.classList.add('is-lit');
    }, { passive:true });
    const fade = () => { glow.style.opacity = '0'; if (lit) lit.classList.remove('is-lit'); };
    document.documentElement.addEventListener('pointerleave', fade);
    addEventListener('blur', fade);
  }
  motionPreference.addEventListener('change', event => {
    reduced = event.matches;
    play.hidden = reduced;
    if (reduced) document.querySelectorAll('.motion-enter').forEach(element => element.classList.add('motion-entered'));
    scheduleScroll();
    arm();
  });
})();
