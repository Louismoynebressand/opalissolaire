/* Fiche PDF locale, sans impression de la page ni appel à un service externe. */
(() => {
  'use strict';
  const accent = [0.714, 0.365, 0.239], ink = [0.133, 0.165, 0.153], muted = [0.38, 0.42, 0.39];
  const win = { 0x20ac:128, 0x2018:145, 0x2019:146, 0x201c:147, 0x201d:148, 0x2022:149, 0x2013:150, 0x2014:151, 0x2026:133, 0x153:156, 0x152:140 };
  const literal = value => [...String(value)].map(char => {
    const code = char.codePointAt(0);
    const c = code < 256 ? char : String.fromCharCode(win[code] || (char === '→' || char === '↗' ? 62 : 63));
    return /[\\()]/.test(c) ? '\\' + c : /[\r\n\t]/.test(c) ? ' ' : c;
  }).join('');
  const bytes = value => Uint8Array.from([...value].map(char => char.charCodeAt(0)));
  window.OpalisProjectPDF = data => {
    const ctx = document.createElement('canvas').getContext('2d');
    const pages = []; let page, y;
    const number = value => Number(value).toFixed(2);
    const text = (value, x, top, size = 10, font = 'F1', color = ink) => {
      page.stream += `BT /${font} ${size} Tf ${color.join(' ')} rg 1 0 0 1 ${number(x)} ${number(841.89 - top)} Tm (${literal(value)}) Tj ET\n`;
    };
    const rect = (x, top, width, height, color) => { page.stream += `${color.join(' ')} rg ${number(x)} ${number(841.89-top-height)} ${number(width)} ${number(height)} re f\n`; };
    const newPage = () => {
      page = { stream:'', links:[] }; pages.push(page); y=131;
      rect(0,0,595.28,6,accent);
      text('opalis solaire',42,47,28,'F3');
      text('CONSEIL, FOURNITURE ET POSE DE FILMS',43,67,8,'F2',muted);
      text('VOTRE FICHE DE PROJET',42,98,16,'F2');
      text(`Établie le ${new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris'}).format(new Date())}`,42,115,9,'F1',muted);
      rect(42,770,511,1,[0.85,0.86,0.82]);
      text('Un conseil ? Appelez-nous au 07 82 85 20 08',42,791,11,'F2',accent);
      text('contact@opalissolaire.fr  |  www.opalissolaire.fr',42,809,10);
      page.links.push({ uri:'tel:+33782852008',rect:[42,41,370,64] },{uri:'mailto:contact@opalissolaire.fr',rect:[42,23,225,41]});
    };
    const ensure = height => { if(y+height>737)newPage(); };
    const wrap = (value,size,width) => {
      ctx.font = `${size}px Arial`;
      const lines=[]; let line='';
      for(const word of String(value).replace(/\s+/g,' ').trim().split(' ')){
        const candidate=line ? line+' '+word : word;
        if(ctx.measureText(candidate).width>width && line){lines.push(line);line=word;}else line=candidate;
      }
      if(line)lines.push(line);return lines;
    };
    const paragraph = (value,size=10,color=ink) => {
      for(const line of wrap(value,size,501)){ensure(size*1.55);text(line,47,y,size,'F1',color);y+=size*1.55;}
      y+=5;
    };
    const heading = title => {ensure(49);y+=5;text(title,42,y,12,'F2',accent);y+=19;};
    newPage();
    rect(42,y-4,511,49,[0.92,0.94,0.89]);
    text('Un premier choix pour préparer votre échange avec Opalis.',51,y+13,11,'F2');
    text('Ce document est une orientation, pas un devis ni un classement du vitrage.',51,y+31,9,'F1',muted);y+=67;
    heading('Votre situation');
    paragraph('Besoin : '+data.need);
    paragraph('Support : '+data.support);
    paragraph('Pendant les travaux : '+data.access);
    heading('La famille à étudier');
    paragraph(data.title,12);
    for(const p of data.details)paragraph(p);
    heading('Organisation de la pose');paragraph(data.organization);
    heading('Vos vitrages relevés');
    if(!data.lots.length)paragraph('Aucun vitrage ajouté au relevé. Vous pourrez compléter les dimensions avec Opalis.');
    else {
      for(const [i,lot] of data.lots.entries()){
        ensure(37);rect(42,y-11,511,29,i%2 ? [0.97,0.97,0.95] : [0.92,0.94,0.89]);
        text(`Lot ${i+1} : ${lot.count} panneau(x) de ${lot.width} × ${lot.height} cm`,50,y,10);
        text(`${(lot.width*lot.height*lot.count/10000).toLocaleString('fr-FR',{maximumFractionDigits:2})} m²`,476,y,10,'F2');y+=35;
      }
      paragraph('Total approximatif : '+data.total.toLocaleString('fr-FR',{maximumFractionDigits:2})+' m². Dimensions visibles, à confirmer avant commande.');
    }
    heading('La suite avec Opalis');
    paragraph('Nous vous conseillons pour choisir le film adapté. Premier contact ou rappel dans la journée ; devis dans la journée ou sous 24 heures lorsque les informations nécessaires sont disponibles.');
    paragraph('Depuis Valence, dans la vallée du Rhône et en Rhône-Alpes. Déplacements plus éloignés étudiés selon le chantier ; frais précisés au devis.',9,muted);
    paragraph('Références, explications et sources : www.opalissolaire.fr/choisir-film-protection-vitrage',9,muted);
    page.links.push({uri:'https://www.opalissolaire.fr/choisir-film-protection-vitrage',rect:[42,Math.max(97,841.89-y),553,Math.max(113,858-y)]});
    pages.forEach((p,i)=>{page=p;text(`${i+1} / ${pages.length}`,515,809,9,'F1',muted);});
    const objects=[null,'<< /Type /Catalog /Pages 2 0 R >>',null,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>'];
    const ids=[];
    for(const p of pages){
      const contentId=objects.length;objects.push(`<< /Length ${p.stream.length} >>\nstream\n${p.stream}endstream`);
      const annotations=p.links.map(link=>{const id=objects.length;objects.push(`<< /Type /Annot /Subtype /Link /Rect [${link.rect.join(' ')}] /Border [0 0 0] /A << /S /URI /URI (${literal(link.uri)}) >> >>`);return id+' 0 R';});
      const id=objects.length;ids.push(id+' 0 R');objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R /Annots [${annotations.join(' ')}] >>`);
    }
    objects[2]=`<< /Type /Pages /Kids [${ids.join(' ')}] /Count ${pages.length} >>`;
    let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';const offsets=[0];
    for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}
    const start=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for(const offset of offsets.slice(1))pdf+=String(offset).padStart(10,'0')+' 00000 n \n';
    pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
    return new Blob([bytes(pdf)],{type:'application/pdf'});
  };
})();
