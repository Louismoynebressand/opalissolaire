/* Interactions des réalisations et fiches chantier. Header commun : opalis.js. */
(() => {
  'use strict';
  const init = () => {
    const filters = [...document.querySelectorAll('.filter-btn')];
    const cards = [...document.querySelectorAll('.project-card')];
    filters.forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
      button.addEventListener('click', () => {
        filters.forEach(item => {
          item.classList.toggle('active', item === button);
          item.setAttribute('aria-pressed', String(item === button));
        });
        cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.cat !== button.dataset.filter; });
      });
    });
    document.querySelectorAll('.ba-container').forEach((container, index) => {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';
      const before = container.querySelector('.ba-before');
      const handle = container.querySelector('.ba-handle');
      if (!before || !handle) return;
      const range = document.createElement('input');
      range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50';
      range.className = 'legacy-comparison-range';
      range.setAttribute('aria-label', `Comparer les photos avant et après la pose, vue ${index + 1}`);
      const update = () => {
        before.style.clipPath = `inset(0 ${100 - Number(range.value)}% 0 0)`;
        handle.style.left = `${range.value}%`;
        range.setAttribute('aria-valuetext', `${range.value} % de la photo avant`);
      };
      range.addEventListener('input', update);
      container.appendChild(range);
      update();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
