/* Lecture guidée, choix de situation et galerie : sans dépendance. */
(() => {
 'use strict';
 document.querySelectorAll('[data-editorial-tabs]').forEach(group => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const select = tab => tabs.forEach(item => {
   const active = item === tab;
   item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1;
   const panel = document.getElementById(item.getAttribute('aria-controls'));
   if (panel) panel.hidden = !active;
  });
  tabs.forEach((tab,index) => {
   tab.addEventListener('click',()=>select(tab));
   tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
    if(next===undefined)return;event.preventDefault();select(tabs[next]);tabs[next].focus();
   });
  });
  select(tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0]);
 });
 document.querySelectorAll('[data-day-demo]').forEach(demo=>{
  const copy={day:['La journée : un effet de discrétion.','Quand l’extérieur est plus lumineux que l’intérieur, le rendu réfléchissant peut limiter les regards depuis la rue.'],night:['La nuit : le contraste peut s’inverser.','Si l’intérieur est éclairé et l’extérieur sombre, le film miroir ne suffit plus à préserver l’intimité. Un dépoli ou une autre solution se choisit pour une confidentialité permanente.']};
  demo.querySelectorAll('[data-light-mode]').forEach(button=>button.addEventListener('click',()=>{
   const night=button.dataset.lightMode==='night';demo.classList.toggle('is-night',night);
   demo.querySelectorAll('[data-light-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   demo.querySelector('[data-day-title]').textContent=copy[night?'night':'day'][0];
   demo.querySelector('[data-day-copy]').textContent=copy[night?'night':'day'][1];
  }));
 });
 const lightbox=document.querySelector('.ed-lightbox');
 if(lightbox&&typeof lightbox.showModal==='function'){
  document.querySelectorAll('[data-enlarge]').forEach(link=>link.addEventListener('click',event=>{
   event.preventDefault();const image=lightbox.querySelector('img');image.src=link.href;image.alt=link.dataset.caption||link.querySelector('img')?.alt||'Photo du vitrage';lightbox.querySelector('[data-lightbox-caption]').textContent=image.alt;lightbox.showModal();
  }));
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click',()=>lightbox.close());
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
 }
 const localLinks=[...document.querySelectorAll('.page-jumpnav a[href^="#"],.ed-reading-nav a[href^="#"]')];
 if(localLinks.length&&'IntersectionObserver'in window){
  const targets=new Map();localLinks.forEach(link=>{const target=document.getElementById(link.hash.slice(1));if(target)targets.set(target,link.hash);});
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
   if(!visible.length)return;const hash=targets.get(visible[0].target);
   localLinks.forEach(link=>{if(link.hash===hash)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  },{rootMargin:'-15% 0px -55% 0px',threshold:0});
  targets.forEach((hash,target)=>observer.observe(target));
 }
})();
