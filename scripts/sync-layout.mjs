import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const header = `<!-- OPALIS_HEADER_START -->\n${fs.readFileSync(path.join(root, 'templates/header.html'), 'utf8').trim()}\n<!-- OPALIS_HEADER_END -->`;
const footer = `<!-- OPALIS_FOOTER_START -->\n${fs.readFileSync(path.join(root, 'templates/footer.html'), 'utf8').trim()}\n<!-- OPALIS_FOOTER_END -->`;
let count = 0;
const redirectAliases = new Set(['exemple-vitrine-film-transparent.html', 'exemple-film-solaire-salon.html']);
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
  const canonical = name === 'index.html' ? 'https://opalissolaire.fr/' : `https://opalissolaire.fr/${name.slice(0, -5)}`;
  if (html.includes('rel="canonical"')) html = html.replace(/(<link rel="canonical" href=")[^"]+("\s*\/?>)/, `$1${canonical}$2`);
  else html = html.replace('</head>', `<link rel="canonical" href="${canonical}">\n</head>`);
  if (html !== original) { fs.writeFileSync(file, html); count++; }
}
console.log(`Header, footer et URLs canoniques synchronisés : ${count} pages.`);
