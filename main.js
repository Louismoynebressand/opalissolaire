// BURGER MENU
function initBurger() {
  const burger = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');
  if (burger && navLinks) {
    // On clone pour enlever les éventuels listeners précédents
    const newBurger = burger.cloneNode(true);
    burger.parentNode.replaceChild(newBurger, burger);
    
    newBurger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      newBurger.querySelectorAll('span').forEach((s, i) => {
        if (navLinks.classList.contains('open')) {
           if(i===0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
           if(i===1) s.style.opacity = '0';
           if(i===2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
           s.style.transform = 'none';
           s.style.opacity = '1';
        }
      });
    });
  }
}

// SCROLL BEHAVIOR
function initScroll() {
  let lastScroll = 0;
  const nav = document.querySelector('nav');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
      nav.classList.remove('hidden');
      return;
    }
    if (currentScroll > lastScroll && !nav.classList.contains('hidden') && currentScroll > 100) {
      nav.classList.add('hidden');
    } else if (currentScroll < lastScroll && nav.classList.contains('hidden')) {
      nav.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  });
}

// FILTRES RÉALISATIONS
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        projectCards.forEach(card => {
          const cat = card.getAttribute('data-cat');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}

// POPUP SIMULATEUR
function initPopup() {
  if (window.location.pathname.includes('simulateur.html')) return;
  if (sessionStorage.getItem('opalisPopupClosed')) return;

  const popupHtml = `
    <div id="sim-popup" style="position:fixed; bottom:20px; left:20px; background:#fff; border:1px solid #e5e7eb; box-shadow:0 10px 25px rgba(0,0,0,0.1); border-radius:12px; padding:1.25rem; z-index:9999; max-width:320px; transform:translateY(150%); transition:transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease; opacity:0; font-family:'Inter', sans-serif;">
      <button id="sim-popup-close" style="position:absolute; top:8px; right:10px; background:none; border:none; font-size:1.2rem; color:#9ca3af; cursor:pointer; line-height:1;">&times;</button>
      <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
        <div style="background:#e8f0fe; color:#1a56db; padding:0.5rem; border-radius:50%; font-size:1.2rem; line-height:1;">📊</div>
        <strong style="font-size:0.95rem; color:#111827; line-height:1.2;">Estimez votre budget</strong>
      </div>
      <p style="font-size:0.85rem; color:#4b5563; margin-bottom:1rem; line-height:1.4;">Obtenez une estimation de prix immédiate pour la pose de films solaires dans vos locaux ou votre habitat.</p>
      <a href="simulateur.html" style="display:block; text-align:center; background:#1a56db; color:#fff; text-decoration:none; padding:0.6rem; border-radius:8px; font-weight:600; font-size:0.85rem; transition:0.2s;" onmouseover="this.style.background='#1240b0'" onmouseout="this.style.background='#1a56db'">Faire une simulation gratuite</a>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', popupHtml);
  
  const popup = document.getElementById('sim-popup');
  const closeBtn = document.getElementById('sim-popup-close');

  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 600px) {
      #sim-popup { bottom: 20px !important; left: 20px !important; right: 20px !important; max-width: none !important; }
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    if(popup) {
      popup.style.transform = 'translateY(0)';
      popup.style.opacity = '1';
    }
  }, 5000);

  if(closeBtn) {
    closeBtn.addEventListener('click', () => {
      popup.style.transform = 'translateY(150%)';
      popup.style.opacity = '0';
      sessionStorage.setItem('opalisPopupClosed', 'true');
      setTimeout(() => popup.remove(), 500);
    });
  }
}

// RUN ALL
document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initScroll();
  initFilters();
  initPopup();
});
// Sécurité si déjà chargé
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initBurger();
  initScroll();
  initFilters();
  initPopup();
}
