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

// RUN ALL
document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initScroll();
  initFilters();
});
// Sécurité si déjà chargé
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initBurger();
  initScroll();
  initFilters();
}
