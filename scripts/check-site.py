"""Vérifie les liens, ancres, assets, métadonnées et scripts des pages statiques."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import collections
import json
import re
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self,source):
        super().__init__(); self.ids=[]; self.links=[]; self.h1=0; self.title=0; self.canonical=0; self.desc=0; self.feed(source)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='title': self.title+=1
        if tag=='link' and a.get('rel')=='canonical': self.canonical+=1
        if tag=='meta' and a.get('name')=='description': self.desc+=1
        if tag in {'a','link'} and a.get('href'): self.links.append(a['href'])
        if tag in {'img','script','source'} and a.get('src'): self.links.append(a['src'])
    handle_startendtag=handle_starttag
pages={f.name:Page(f.read_text()) for f in ROOT.glob('*.html')}
issues=[]; links=0; scripts=0
for name,page in pages.items():
    for label,value in [('h1',page.h1),('title',page.title),('canonical',page.canonical),('description',page.desc)]:
        if value!=1: issues.append(f'{name}: {value} {label} (attendu : 1)')
    for id,count in collections.Counter(page.ids).items():
        if count>1: issues.append(f'{name}: id dupliqué {id}')
    for href in page.links:
        url=urlsplit(href)
        if url.scheme or url.netloc or href.startswith('//'): continue
        links+=1; pathname=unquote(url.path)
        if not pathname: target=ROOT/name
        elif pathname=='/': target=ROOT/'index.html'
        else:
            target=ROOT/pathname.lstrip('/')
            if not target.suffix: target=target.with_suffix('.html')
        if not target.exists(): issues.append(f'{name}: cible manquante {href}'); continue
        if url.fragment and target.suffix=='.html' and target.name in pages and unquote(url.fragment) not in pages[target.name].ids:
            issues.append(f'{name}: ancre manquante {href}')
    source=(ROOT/name).read_text()
    for match in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>',source,re.I):
        attrs,code=match.groups()
        if not code.strip(): continue
        scripts+=1
        if 'application/ld+json' in attrs:
            try: json.loads(code)
            except Exception as e: issues.append(f'{name}: JSON-LD invalide {e}')
        elif 'src=' not in attrs:
            with tempfile.NamedTemporaryFile(mode='w',suffix='.js') as temp:
                temp.write(code);temp.flush()
                result=subprocess.run(['node','--check',temp.name],capture_output=True,text=True)
                if result.returncode: issues.append(f'{name}: JavaScript inline invalide {result.stderr[:250]}')
for name in ['editorial.js','opalis.js','pro.js','main.js','generate-sitemap.js','scripts/sync-layout.mjs','scripts/preview-server.mjs']:
    result=subprocess.run(['node','--check',str(ROOT/name)],capture_output=True,text=True)
    if result.returncode: issues.append(f'{name}: syntaxe invalide {result.stderr[:250]}')
if issues:
    print('\n'.join(issues)); raise SystemExit(1)
print(f'OK : {len(pages)} pages, {links} liens/assets locaux, {scripts} scripts/JSON-LD. Aucune cible ou ancre manquante, métadonnées uniques, JavaScript valide.')
