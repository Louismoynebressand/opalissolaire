/* Opalis Solaire — interactions sans dépendance. Les données du comparateur
   proviennent des fiches Solar Screen, sur le même simple vitrage clair 3 mm.
   Voir docs/sources-fournisseur.md. Aucun gain en degrés/euros n'est extrapolé. */
(() => {
  'use strict';

  // Publicité Google Ads : aucun traceur publicitaire n’est chargé avant un choix positif.
  const adsConsentKey = 'opalis-ads-consent-v1';
  const adsId = 'AW-17195022553';
  const getAdsConsent = () => { try { return localStorage.getItem(adsConsentKey); } catch { return null; } };
  const loadAds = () => {
    if (window.gtag || getAdsConsent() !== 'accepted') return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', adsId);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
    document.head.appendChild(script);
  };
  const setAdsConsent = choice => {
    try { localStorage.setItem(adsConsentKey, choice); } catch { /* Le choix reste valable pour la session courante. */ }
    if (choice === 'accepted') loadAds();
    else if (typeof window.gtag === 'function') window.gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  };
  const existingAdsConsent = getAdsConsent();
  if (existingAdsConsent === 'accepted') loadAds();
  if (typeof document.createElement === 'function' && document.body) {
  const cookieRegion = document.createElement('section');
  cookieRegion.className = 'cookie-consent';
  cookieRegion.setAttribute('aria-label', 'Préférences de cookies');
  cookieRegion.setAttribute('aria-live', 'polite');
  cookieRegion.hidden = existingAdsConsent === 'accepted' || existingAdsConsent === 'rejected';
  cookieRegion.innerHTML = '<div class="cookie-consent-copy"><strong>Votre choix de confidentialité</strong><p>Opalis utilise Google Ads pour mesurer les demandes et optimiser sa publicité. Ces traceurs ne sont chargés qu’avec votre accord. Vous pouvez modifier votre choix à tout moment.</p><a href="legal.html#confidentialite">En savoir plus</a></div><div class="cookie-consent-actions"><button type="button" data-cookie-reject>Tout refuser</button><button type="button" data-cookie-accept>Accepter les cookies publicitaires</button></div>';
  document.body.appendChild(cookieRegion);
  cookieRegion.querySelector('[data-cookie-reject]').addEventListener('click', () => { setAdsConsent('rejected'); cookieRegion.hidden = true; });
  cookieRegion.querySelector('[data-cookie-accept]').addEventListener('click', () => { setAdsConsent('accepted'); cookieRegion.hidden = true; });
  document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => { cookieRegion.hidden = false; cookieRegion.querySelector('[data-cookie-reject]').focus(); }));
  }

  // Une arrivée depuis une autre page doit afficher le besoin demandé tout de
  // suite, sans traverser lentement l'ensemble de l'accueil.
  if (location.hash) {
    document.documentElement.style.scrollBehavior = 'auto';
    const alignToSection = () => {
      let target;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* Fragment non valide. */ }
      if (target) target.scrollIntoView({ block: 'start', behavior: 'auto' });
      requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ''; });
    };
    if (document.fonts) document.fonts.ready.then(alignToSection);
    else requestAnimationFrame(alignToSection);
  }

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
  const closeDropdowns = () => dropdowns.forEach(dropdown => { dropdown.open = false; });
  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
    menu.classList.remove('is-open');
    closeDropdowns();
  };
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menu.classList.toggle('is-open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const openDropdown = dropdowns.find(dropdown => dropdown.open);
        if (openDropdown) { closeDropdowns(); openDropdown.querySelector('summary').focus(); }
      }
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        menuButton.focus();
      }
    });
    dropdowns.forEach(dropdown => dropdown.addEventListener('toggle', () => {
      if (dropdown.open) dropdowns.forEach(other => { if (other !== dropdown) other.open = false; });
    }));
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    matchMedia('(min-width: 901px)').addEventListener('change', event => {
      if (event.matches) closeMenu();
    });
    const current = location.pathname.replace(/\.html$/, '').replace(/\/$/, '/index');
    menu.querySelectorAll('a').forEach(link => {
      const url = new URL(link.href);
      if (!url.hash && url.pathname.replace(/\.html$/, '') === current) link.setAttribute('aria-current', 'page');
    });
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  const progress = document.querySelector('.page-progress');
  if (progress) {
    let ticking = false;
    const update = () => {
      const available = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = available > 0 ? `${Math.min(100, scrollY / available * 100)}%` : '0%';
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  document.querySelectorAll('[data-comparison]').forEach(container => {
    const range = container.querySelector('input[type="range"]');
    if (!range) return;
    const update = () => {
      container.style.setProperty('--split', `${range.value}%`);
      range.setAttribute('aria-valuetext', `${range.value} % de l’image ${container.classList.contains('tint-preview') ? 'sans film' : 'de gauche'}`);
    };
    range.addEventListener('input', update);
    update();
  });

  const films = Object.freeze({
    clarity: { name: 'Clair', title: 'La discrétion, en grand.', reference: 'CLARITY 333 XC', light: 71, solar: 50, uv: 99, tint: 'rgba(83, 97, 74, .13)', description: 'Vous voulez garder une pièce lumineuse et l’aspect de vos vitres ? Des films très clairs permettent de travailler le confort sans choisir un effet miroir marqué.', url: 'https://solarscreen.eu/fr/products/clarity-333-xc/' },
    titane: { name: 'Neutre léger', title: 'La lumière, plus douce.', reference: 'TITANE 250 XC', light: 49, solar: 45, uv: 99, tint: 'rgba(65, 78, 67, .32)', description: 'Vous souhaitez atténuer une lumière trop vive sans une façade très réfléchissante ? Une teinte neutre légère peut être un point de départ, à valider pour votre pièce.', url: 'https://solarscreen.eu/fr/products/titane-250-xc/' },
    natural: { name: 'Neutre teinté', title: 'Une présence mesurée.', reference: 'NATURAL 65 XC', light: 35, solar: 62, uv: 99, tint: 'rgba(47, 67, 54, .49)', description: 'Votre vitrage reçoit beaucoup de soleil et vous acceptez une teinte plus présente ? Nous étudions un équilibre entre apports solaires, lumière et aspect du lieu.', url: 'https://solarscreen.eu/fr/products/natural-65-xc/' },
    silver: { name: 'Miroir argent', title: 'Le soleil, autrement.', reference: 'SILVER 80 XC', light: 19, solar: 79, uv: 99, tint: 'rgba(41, 58, 61, .65)', description: 'Vous recherchez un effet miroir en façade et une protection solaire plus marquée ? Ce rendu se choisit avec l’exposition et l’éclairage : l’intimité peut s’inverser la nuit.', url: 'https://solarscreen.eu/fr/products/silver-80-xc/' }
  });
  const filmButtons = [...document.querySelectorAll('[data-film]')];
  if (filmButtons.length) {
    filmButtons.forEach(button => button.addEventListener('click', () => {
      const film = films[button.dataset.film];
      if (!film) return;
      filmButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.getElementById('film-title').textContent = film.title;
      document.getElementById('film-reference').textContent = `Un exemple d’ambiance ${film.name.toLowerCase()}`;
      const technicalReference = document.getElementById('film-tech-reference');
      if (technicalReference) technicalReference.textContent = film.reference;
      document.getElementById('film-light').textContent = `${film.light} %`;
      document.getElementById('film-solar').textContent = `${film.solar} %`;
      document.getElementById('film-uv').textContent = `${film.uv} %`;
      document.getElementById('film-description').textContent = film.description;
      document.getElementById('film-source').href = film.url;
      document.getElementById('preview-film-name').textContent = `Avec film · ${film.name}`;
      document.querySelector('.tint-preview').style.setProperty('--tint', film.tint);
    }));
    document.querySelector('.tint-preview').style.setProperty('--tint', films.clarity.tint);
  }

  const spaceButtons = [...document.querySelectorAll('[data-space]')];
  const needCards = [...document.querySelectorAll('[data-spaces]')];
  const spaceNames = { tous: 'tous les espaces', maison: 'votre maison', boutique: 'votre boutique', locaux: 'vos locaux professionnels' };
  spaceButtons.forEach(button => button.addEventListener('click', () => {
    spaceButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const selected = button.dataset.space;
    needCards.forEach(card => { card.hidden = selected !== 'tous' && !card.dataset.spaces.split(' ').includes(selected); });
    const count = needCards.filter(card => !card.hidden).length;
    document.getElementById('need-summary').textContent = `${count} solutions pour ${spaceNames[selected]}. Nous vous aidons à choisir et nous réalisons la pose.`;
  }));

  const audienceTabs = [...document.querySelectorAll('.segmented-control [role="tab"]')];
  const activateAudience = tab => {
    audienceTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  };
  audienceTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateAudience(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % audienceTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + audienceTabs.length) % audienceTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = audienceTabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activateAudience(audienceTabs[next]);
      audienceTabs[next].focus();
    });
  });
  const impactButton = document.getElementById('impact-button');
  if (impactButton) impactButton.addEventListener('click', () => {
    const active = impactButton.getAttribute('aria-pressed') !== 'true';
    impactButton.setAttribute('aria-pressed', String(active));
    document.getElementById('security-diagram').classList.toggle('is-impacted', active);
    document.getElementById('impact-status').textContent = active ? 'Après un bris : les fragments restent liés au film.' : 'Le film accompagne votre vitrage.';
    impactButton.firstChild.textContent = active ? 'Revenir au vitrage intact ' : 'Visualiser le maintien des fragments ';
  });

  const form = document.getElementById('contact-form');
  if (!form || !form.classList.contains('contact-form')) return;
  const field = id => document.getElementById(id);
  const profileRadios = [...form.querySelectorAll('[name="profil"]')];
  const updateProfile = profile => {
    profileRadios.forEach(radio => { radio.checked = radio.value === profile; });
    if (profile === 'particulier') field('type').value = 'particulier';
    else if (field('type').value === 'particulier') field('type').value = 'bureau';
    field('particulier-options').hidden = profile !== 'particulier';
  };
  profileRadios.forEach(radio => radio.addEventListener('change', () => updateProfile(radio.value)));
  field('type').addEventListener('change', event => {
    const profile = event.target.value === 'particulier' ? 'particulier' : 'professionnel';
    profileRadios.forEach(radio => { radio.checked = radio.value === profile; });
    field('particulier-options').hidden = profile !== 'particulier';
  });
  const chooseNeed = value => {
    const aliases = { 'anti-graffiti': 'antigraffiti', 'securite-vitrage': 'securite', 'anti-uv': 'uv', 'intimite-decoration': 'intimite', 'specialite': 'specialites' };
    const choice = aliases[value] || value;
    if ([...field('besoin').options].some(option => option.value === choice)) field('besoin').value = choice;
  };
  const query = new URLSearchParams(location.search);
  if (['particulier', 'professionnel'].includes(query.get('profil'))) updateProfile(query.get('profil'));
  if (query.has('lieu') && [...field('type').options].some(option => option.value === query.get('lieu'))) {
    field('type').value = query.get('lieu');
  }
  if (query.has('vitrage') && [...field('particulier-sub').options].some(option => option.value === query.get('vitrage'))) field('particulier-sub').value = query.get('vitrage');
  if (query.has('besoin')) chooseNeed(query.get('besoin'));
  const objectives = { 'anti-eclats': 'Je souhaite limiter la dispersion des éclats de verre.', 'protection-renforcee': 'Je souhaite étudier une protection renforcée contre la casse.' };
  if (objectives[query.get('objectif')] && !field('message').value) field('message').value = objectives[query.get('objectif')];
  document.querySelectorAll('[data-profile], [data-need]').forEach(link => link.addEventListener('click', () => {
    if (link.dataset.profile) updateProfile(link.dataset.profile);
    if (link.dataset.need) chooseNeed(link.dataset.need);
  }));

  const calcToggle = field('toggle-calc');
  const closeCalculator = () => {
    field('calculator-box').hidden = true;
    calcToggle.setAttribute('aria-expanded', 'false');
    calcToggle.textContent = 'M’aider à calculer la surface';
  };
  calcToggle.addEventListener('click', () => {
    const open = field('calculator-box').hidden;
    field('calculator-box').hidden = !open;
    calcToggle.setAttribute('aria-expanded', String(open));
    calcToggle.textContent = open ? 'Fermer le calculateur' : 'M’aider à calculer la surface';
    if (open) field('calc-w').focus();
  });
  field('apply-calc').addEventListener('click', () => {
    const inputs = ['calc-nb', 'calc-w', 'calc-h'].map(field);
    if (inputs.some(input => !input.value || !input.checkValidity())) {
      field('calc-feedback').textContent = 'Indiquez un nombre entier de vitres et des dimensions positives en mètres.';
      return;
    }
    const total = inputs.reduce((result, input) => result * Number(input.value), 1);
    if (total < .01 || total > 100000) {
      field('calc-feedback').textContent = 'Vérifiez les dimensions : la surface doit être comprise entre 0,01 et 100 000 m².';
      return;
    }
    field('surface').value = total.toFixed(2);
    field('calc-feedback').textContent = '';
    closeCalculator();
    field('surface').focus();
  });

  let submitting = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity() || field('website').value) return;
    const nom = field('nom').value.trim();
    const telephone = field('telephone').value.trim();
    if (!nom || !telephone) return;
    const profile = form.querySelector('[name="profil"]:checked').value;
    const besoin = field('besoin').value;
    const notes = [besoin ? `Besoin : ${field('besoin').selectedOptions[0].textContent}` : '', `Profil : ${profile}`, field('message').value.trim()].filter(Boolean).join('\n');
    const payload = {
      nom, telephone, email: field('email').value.trim(), type: field('type').value,
      particulier_sub: profile === 'particulier' ? field('particulier-sub').value : '',
      surface: field('surface').value, message: notes, source: 'Site Web Opalis Solaire'
    };
    const button = field('submit-btn');
    const original = button.innerHTML;
    const error = field('form-error');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    error.hidden = true;
    submitting = true;
    button.disabled = true;
    button.textContent = 'Envoi de votre demande…';
    form.setAttribute('aria-busy', 'true');
    try {
      // Conserve le point de contact existant ; les essais automatisés interceptent
      // cette requête et ne créent jamais de prospects sur le webhook réel.
      const response = await fetch('https://n8n.srv903375.hstgr.cloud/webhook/neuraflow-opalis-solaire-new-form', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: 'AW-17195022553/FGiuCKKh6tsaENnxnIdA', value: 1, currency: 'EUR' });
      form.hidden = true;
      field('success-msg').hidden = false;
      field('success-msg').focus();
    } catch {
      error.innerHTML = 'L’envoi n’a pas abouti. Vos informations sont conservées dans le formulaire pour réessayer. Vous pouvez aussi nous appeler au <a href="tel:+33782852008">07 82 85 20 08</a>.';
      error.hidden = false;
      error.setAttribute('tabindex', '-1');
      error.focus();
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
      button.innerHTML = original;
      form.removeAttribute('aria-busy');
    }
  });
})();
