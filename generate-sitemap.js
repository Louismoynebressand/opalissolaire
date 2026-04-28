/**
 * generate-sitemap.js
 * -------------------
 * Scanne tous les fichiers .html à la racine du projet
 * et génère automatiquement un sitemap.xml valide pour Google Search Console.
 *
 * Usage : node generate-sitemap.js
 * Lancé automatiquement par Vercel au build via vercel.json
 *
 * 👉 Changez SITE_URL si vous avez un domaine personnalisé.
 */

const fs = require('fs');
const path = require('path');

// ── CONFIGURATION ──────────────────────────────────────────────────
const SITE_URL = process.env.SITE_URL || 'https://opalissolaire.fr';

// Pages à exclure du sitemap (ex: pages légales peu utiles pour le SEO)
const EXCLUDED_PAGES = [
  // 'legal.html', // décommentez si vous voulez exclure les mentions légales
];

// Priorités et fréquences de changement par page (le reste aura les valeurs par défaut)
const PAGE_CONFIG = {
  'index.html':                   { priority: '1.0', changefreq: 'weekly' },
  'realisations.html':            { priority: '0.9', changefreq: 'weekly' },
  'savoir-faire.html':            { priority: '0.8', changefreq: 'monthly' },
  'legal.html':                   { priority: '0.3', changefreq: 'yearly' },
  // pages projet
  'projet-sas-entree-vitre.html': { priority: '0.7', changefreq: 'monthly' },
  'projet-baie-vitree-salon.html':{ priority: '0.7', changefreq: 'monthly' },
  'projet-batiment-tertiaire.html':{ priority: '0.7', changefreq: 'monthly' },
  'projet-open-space-lyon.html':  { priority: '0.7', changefreq: 'monthly' },
  'projet-velux.html':            { priority: '0.7', changefreq: 'monthly' },
  'projet-verriere-toit.html':    { priority: '0.7', changefreq: 'monthly' },
};

const DEFAULT_CONFIG = { priority: '0.6', changefreq: 'monthly' };
// ───────────────────────────────────────────────────────────────────

const ROOT = __dirname;
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Récupère tous les fichiers .html à la racine
const htmlFiles = fs.readdirSync(ROOT)
  .filter(file => file.endsWith('.html') && !EXCLUDED_PAGES.includes(file))
  .sort((a, b) => {
    // index.html en premier
    if (a === 'index.html') return -1;
    if (b === 'index.html') return 1;
    return a.localeCompare(b);
  });

console.log(`✅ ${htmlFiles.length} pages HTML trouvées :`);
htmlFiles.forEach(f => console.log(`   - ${f}`));

// Génère les entrées XML
const urls = htmlFiles.map(file => {
  const config = PAGE_CONFIG[file] || DEFAULT_CONFIG;
  // index.html → URL racine, les autres → /nom-de-page.html
  const loc = file === 'index.html'
    ? `${SITE_URL}/`
    : `${SITE_URL}/${file}`;

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>`;
}).join('\n');

// Construit le XML final
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>
`;

// Écrit le fichier
const outputPath = path.join(ROOT, 'sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');

console.log(`\n🗺️  sitemap.xml généré avec succès → ${outputPath}`);
console.log(`   Base URL utilisée : ${SITE_URL}`);
console.log(`   Date de modification : ${today}`);
