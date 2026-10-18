"""Métadonnées issues du contenu réel ; aucun avis, note ou résultat inventé."""
from html.parser import HTMLParser
from pathlib import Path
from html import escape, unescape
import json
import re

ROOT = Path(__file__).resolve().parent.parent
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Node:
    def __init__(self, tag='', attrs=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), []
    def text(self):
        return ' '.join(''.join(c.text() if isinstance(c, Node) else c for c in self.children).split())
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node): yield from child.walk()

class Tree(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root=Node(); self.stack=[self.root]; self.feed(source)
    def handle_starttag(self, tag, attrs):
        node=Node(tag,attrs); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag,attrs)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag: self.stack=self.stack[:i]; break
    def handle_data(self, data): self.stack[-1].children.append(data)

for file in sorted(ROOT.glob('*.html')):
    source=file.read_text()
    # Retirer notre bloc avant de rechercher les données déjà écrites à la main,
    # pour que les exécutions successives produisent le même résultat.
    source=re.sub(r'<script id="page-seo" type="application/ld\+json">[\s\S]*?</script>\n?', '', source)
    # Supprime des fragments de texte parasites dans les anciennes balises image.
    source=re.sub(r'(\bsrc="[^"<>]+\.(?:jpg|png)")[^\s<>][^<>]*?(?=\s+(?:alt|title|style|class|loading|width|height)=)',r'\1',source)
    tree=Tree(source); nodes=list(tree.root.walk())
    title=next((n.text() for n in nodes if n.tag=='title'),'Opalis Solaire')
    description=next((n.attrs.get('content','') for n in nodes if n.tag=='meta' and n.attrs.get('name')=='description'),'')
    canonical='https://opalissolaire.fr/'+('' if file.name=='index.html' else file.stem)
    hero=next((n.attrs.get('src','') for n in nodes if n.tag=='img' and not n.attrs.get('src','').startswith(('http','data:'))),'assets/hero-architecture.webp')
    metas={'og:type':'website','og:locale':'fr_FR','og:site_name':'Opalis Solaire','og:title':title,'og:description':description,'og:url':canonical,'og:image':'https://opalissolaire.fr/'+hero.lstrip('/')}
    for key,value in metas.items():
        tag=f'<meta property="{key}" content="{escape(value,quote=True)}">'
        pattern=r'<meta\s+property="'+re.escape(key)+r'"\s+content="[^"]*"\s*/?>'
        if re.search(pattern,source): source=re.sub(pattern,lambda m:tag,source)
        else: source=source.replace('</head>',tag+'\n</head>')
    if 'name="twitter:card"' not in source: source=source.replace('</head>','<meta name="twitter:card" content="summary_large_image">\n</head>')
    faq=[]
    for container in nodes:
        if not set(container.attrs.get('class','').split()) & {'faq-list','pro-faq'}: continue
        for detail in container.walk():
            if detail.tag!='details': continue
            question=next((n.text() for n in detail.children if isinstance(n,Node) and n.tag=='summary'),'')
            answer=' '.join(n.text() for n in detail.children if isinstance(n,Node) and n.tag!='summary')
            if question and answer: faq.append({'@type':'Question','name':question,'acceptedAnswer':{'@type':'Answer','text':answer}})
    graphs=[]
    if faq: graphs.append({'@type':'FAQPage','@id':canonical+'#questions','mainEntity':faq})
    if file.name!='index.html' and 'BreadcrumbList' not in source:
        graphs.append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Accueil','item':'https://opalissolaire.fr/'},{'@type':'ListItem','position':2,'name':title.split('|')[0].strip(),'item':canonical}]})
    block=''
    if graphs:
        data=json.dumps({'@context':'https://schema.org','@graph':graphs},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
        block=f'<script id="page-seo" type="application/ld+json">{data}</script>'
    if block: source=source.replace('</head>',block+'\n</head>')
    if source!=file.read_text(): file.write_text(source)
print('Métadonnées, partages sociaux, FAQ et fils d’Ariane préparés.')
