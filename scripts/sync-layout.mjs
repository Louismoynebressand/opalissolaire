import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const header = `<!-- OPALIS_HEADER_START -->\n${fs.readFileSync(path.join(root, 'templates/header.html'), 'utf8').trim()}\n<!-- OPALIS_HEADER_END -->`;
const footer = `<!-- OPALIS_FOOTER_START -->\n${fs.readFileSync(path.join(root, 'templates/footer.html'), 'utf8').trim()}\n<!-- OPALIS_FOOTER_END -->`;
let count = 0;
const redirectAliases = new Set(['exemple-vitrine-film-transparent.html', 'exemple-film-solaire-salon.html']);
const phoneIcon = '<svg class="phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.7l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.7-.6l2.8.5a2 2 0 0 1 1.7 2Z"/></svg>';
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html') && !redirectAliases.has(name))) {
  const file = path.join(root, name);
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  if (html.includes('<!-- OPALIS_HEADER_START -->')) html = html.replace(/<!-- OPALIS_HEADER_START -->[\s\S]*?<!-- OPALIS_HEADER_END -->/, header);
  else if (html.includes('<!-- OPALIS_HEADER -->')) html = html.replace('<!-- OPALIS_HEADER -->', header);
  else html = html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/, header);
  if (html.includes('<!-- OPALIS_FOOTER_START -->')) html = html.replace(/<!-- OPALIS_FOOTER_START -->[\s\S]*?<!-- OPALIS_FOOTER_END -->/, footer);
  else if (html.includes('<!-- OPALIS_FOOTER -->')) html = html.replace('<!-- OPALIS_FOOTER -->', footer);
  else html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/, footer);
  if (!html.includes('href="opalis.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="opalis.css">\n<script src="opalis.js" defer></script>\n</head>');
  html = html.replace(/<link[^>]*href="https:\/\/fonts.googleapis.com\/css2\?family=Inter[^"<>]*"[^>]*>/g, '');
  if (!html.includes('family=DM+Sans')) html = html.replace('</head>', '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">\n</head>');
  if (!html.includes('class="opalis-site"') && !html.includes('class="legacy-page"')) html = html.replace(/<body\b([^>]*)>/, '<body$1 class="legacy-page">');
  if (html.includes('<main id="main-content">')) {
    html = html.replace('<div id="main" tabindex="-1"></div>\n', '').replace('<main id="main-content">', '<main id="main">');
  }
  if (!html.includes('id="main"')) html = html.replace('<!-- OPALIS_HEADER_END -->', '<!-- OPALIS_HEADER_END -->\n<div id="main" tabindex="-1"></div>');
  html = html.replace(/getElementById\((['"])nav-burger\1\)\.addEventListener/g, 'getElementById($1nav-burger$1)?.addEventListener');
  html = html.replace(/<a href="\/#contact" class="sticky-call-btn/g, '<a href="tel:+33782852008" class="sticky-call-btn');
  const canonical = name === 'index.html' ? 'https://www.opalissolaire.fr/' : `https://www.opalissolaire.fr/${name.slice(0, -5)}`;
  if (html.includes('rel="canonical"')) html = html.replace(/(<link rel="canonical" href=")[^"]+("\s*\/?>)/, `$1${canonical}$2`);
  else html = html.replace('</head>', `<link rel="canonical" href="${canonical}">\n</head>`);
  html = html.replace(/<a\b([^>]*href="tel:[^"]+"[^>]*)>([\s\S]*?)<\/a>/g, (match, attrs, content) => {
    if (!/aria-label=/.test(attrs)) attrs += ' aria-label="Appeler Opalis Solaire au 07 82 85 20 08"';
    if (!/\bphone-link\b/.test(attrs)) {
      if (/class="/.test(attrs)) attrs = attrs.replace(/class="/, 'class="phone-link ');
      else attrs += ' class="phone-link"';
    }
    if (!content.includes('<svg')) content = phoneIcon + content;
    if (!content.includes('phone-number')) content = content.replace(/07 82 85 20 08/g, '<span class="phone-number">07 82 85 20 08</span>');
    return `<a${attrs}>${content}</a>`;
  });
  if (html !== original) { fs.writeFileSync(file, html); count++; }
}
console.log(`Header, footer et URLs canoniques synchronisés : ${count} pages.`);
