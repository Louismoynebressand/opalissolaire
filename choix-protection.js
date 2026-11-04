/* Choix et relevé de vitrages : calculs locaux, sans stockage ni envoi automatique. */
(() => {
  'use strict';
  const tool=document.querySelector('[data-film-choice]');
  if(!tool)return;
  const need=tool.querySelector('[name="risque"]'),support=tool.querySelector('[name="support"]'),access=tool.querySelector('[name="public"]');
  const results=[...document.querySelectorAll('[data-choice-result]')];
  const accessResult=tool.querySelector('[data-access-result]'),summary=tool.querySelector('[data-choice-summary]');
  const width=tool.querySelector('[name="largeur"]'),height=tool.querySelector('[name="hauteur"]'),count=tool.querySelector('[name="quantite"]');
  const output=tool.querySelector('[data-area-result]'),list=tool.querySelector('[data-glazing-list]');
  const lots=[];
  document.querySelectorAll('[data-film-filter]').forEach(button=>{
    button.hidden=false;
    button.addEventListener('click',()=>{
      const family=button.dataset.filmFilter;
      document.querySelectorAll('[data-film-family]').forEach(row=>{row.hidden=family!=='all'&&!row.dataset.filmFamily.split(' ').includes(family);});
      document.querySelectorAll('[data-film-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    });
  });
  const accessTexts={
    isolable:'Le local peut rester ouvert si la zone de travail est séparée du public et si un passage adapté reste disponible. Les abords du vitrage doivent être libérés pendant la pose.',
    unique:'Si c’est le seul passage, prévoyez un autre accès validé ou un créneau de fermeture de cette zone avec l’exploitant. Les issues nécessaires à l’évacuation restent disponibles.',
    ferme:'Prévoyez l’accès aux faces utiles et retirez les objets proches du vitrage. La remise en usage et le premier nettoyage suivent les consignes du produit, pas seulement la fin de la pose.'
  };
  const total=()=>lots.reduce((sum,lot)=>sum+lot.width*lot.height*lot.count/10000,0);
  const format=n=>n.toLocaleString('fr-FR',{maximumFractionDigits:2});
  const selectedResult=()=>results.find(result=>!result.hidden);
  const updateLinks=()=>{
    const params=new URLSearchParams({profil:'professionnel',besoin:need.value==='tags'?'antigraffiti':'securite',objectif:'choix-film',risque:need.value,support:support.value,passage:access.value});
    if(lots.length)params.set('vitrages',JSON.stringify(lots));
    tool.querySelector('[data-choice-contact]').href='index.html?'+params.toString()+'#contact';
  };
  const update=()=>{
    const key=support.value==='casse'?'casse':support.value==='miroir'?'miroir':support.value==='plastique'?'plastique':need.value;
    results.forEach(result=>{result.hidden=result.dataset.choiceResult!==key;});
    accessResult.textContent=accessTexts[access.value];
    summary.textContent='Votre orientation : '+selectedResult().querySelector('h3').textContent;
    updateLinks();
  };
  const calculate=()=>{
    if(![width,height,count].every(input=>input.value!==''&&input.checkValidity())){
      output.textContent='Indiquez des dimensions positives et un nombre entier de panneaux.';return null;
    }
    const lot={width:Number(width.value),height:Number(height.value),count:Number(count.value)};
    output.textContent=`Ces dimensions représentent ${format(lot.width*lot.height*lot.count/10000)} m². Ajoutez-les au relevé si elles correspondent à vos vitrages.`;
    return lot;
  };
  const renderLots=()=>{
    list.replaceChildren();
    lots.forEach((lot,index)=>{
      const row=document.createElement('li'),label=document.createElement('span'),button=document.createElement('button');
      label.textContent=`Lot ${index+1} : ${lot.count} × ${lot.width} × ${lot.height} cm — ${format(lot.width*lot.height*lot.count/10000)} m²`;
      button.type='button';button.textContent='Retirer';button.setAttribute('aria-label','Retirer le lot '+(index+1));
      button.addEventListener('click',()=>{lots.splice(index,1);renderLots();});
      row.append(label,button);list.append(row);
    });
    tool.querySelector('[data-glazing-total]').textContent=lots.length?`${lots.length} lot(s), ${format(total())} m² au total. Métrage approximatif à confirmer.`:'Aucun vitrage ajouté pour le moment. Le relevé est facultatif.';
    updateLinks();
  };
  tool.addEventListener('submit',event=>{event.preventDefault();update();selectedResult().focus({preventScroll:true});selectedResult().scrollIntoView({block:'nearest',behavior:'auto'});});
  [need,support,access].forEach(input=>input.addEventListener('change',update));
  [width,height,count].forEach(input=>input.addEventListener('input',calculate));
  tool.querySelector('[data-add-glazing]').addEventListener('click',()=>{
    const lot=calculate();
    if(!lot){[width,height,count].find(input=>!input.checkValidity()||input.value==='')?.focus();return;}
    if(lots.length>=20){summary.textContent='Le relevé accepte 20 lots. Regroupez les panneaux identiques ou contactez Opalis pour un relevé plus important.';return;}
    lots.push(lot);renderLots();summary.textContent='Lot ajouté au relevé.';
  });
  tool.querySelector('[data-print-choice]').addEventListener('click',()=>{
    update();
    try{
      const result=selectedResult();
      const blob=window.OpalisProjectPDF({
        need:need.selectedOptions[0].textContent,support:support.selectedOptions[0].textContent,access:access.selectedOptions[0].textContent,
        title:result.querySelector('h3').textContent,
        details:[...result.querySelectorAll('p:not(.ed-source)')].map(p=>p.textContent),
        organization:accessResult.textContent,lots:[...lots],total:total()
      });
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='opalis-solaire-fiche-projet.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
      summary.textContent='Votre fiche PDF a été préparée avec les coordonnées Opalis.';
    }catch{
      summary.textContent='La fiche n’a pas pu être générée. Appelez Opalis au 07 82 85 20 08 ou utilisez le formulaire.';
    }
  });
  tool.querySelectorAll('[data-choice-control]').forEach(element=>{element.hidden=false;});
  update();calculate();renderLots();
})();
