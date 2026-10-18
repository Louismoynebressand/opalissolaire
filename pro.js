/* Interactions progressives des pages professionnelles et sécurité. */
(() => {
  'use strict';
  const tablist = document.querySelector('[data-pro-tabs]');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const activate = tab => {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(tabs[next]);
        tabs[next].focus();
        tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    });
    // Les panneaux restent tous lisibles si JavaScript n'est pas disponible.
    activate(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
    const categoryParam = new URLSearchParams(window.location.search).get('categorie');
    const requested = categoryParam === 'anti-graffiti' ? 'antigraffiti' : categoryParam;
    const deepLink = tabs.find(tab => tab.dataset.category === requested);
    if (deepLink) activate(deepLink);
  }
  const safetyArt = document.querySelector('[data-safety-art]');
  const safetyCopy = document.querySelector('[data-safety-copy]');
  const safetyButtons = [...document.querySelectorAll('[data-safety-mode]')];
  if (safetyArt && safetyCopy) {
    const copy = {
      with: 'Le film contribue à maintenir les fragments de verre ensemble après le bris.',
      without: 'Un vitrage non équipé peut laisser se disperser des fragments lors du bris.'
    };
    safetyButtons.forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.safetyMode;
      safetyArt.dataset.mode = mode;
      safetyCopy.textContent = copy[mode];
      safetyButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const filmLabel = safetyArt.querySelector('[data-film-label]');
      if (filmLabel) filmLabel.hidden = mode === 'without';
    }));
  }
})();
