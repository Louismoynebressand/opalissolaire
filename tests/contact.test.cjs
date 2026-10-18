const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const script = fs.readFileSync('opalis.js', 'utf8');

function fixture(transport, search = '') {
  const nodes = new Map();
  const profiles = ['particulier', 'professionnel'].map(value => ({ value, checked: value === 'particulier', addEventListener() {} }));
  const defaults = { nom:'Essai local', telephone:'0612345678', email:'essai@example.invalid', type:'particulier', surface:'12', message:'Un projet de test local.', website:'', 'particulier-sub':'baie', 'calc-nb':'2', 'calc-w':'1.2', 'calc-h':'1.5' };
  const create = id => ({
    id, value:defaults[id] || '', hidden: ['success-msg','form-error','calculator-box'].includes(id), disabled:false,
    innerHTML: id === 'submit-btn' ? 'Envoyer' : '', textContent:'', style:{}, attributes:{}, handlers:{},
    classList:{ contains: name => id === 'contact-form' && name === 'contact-form' },
    addEventListener(name, handler) { this.handlers[name] = handler; },
    setAttribute(name,value) { this.attributes[name] = value; }, removeAttribute(name) { delete this.attributes[name]; }, focus() { this.focused = true; },
    checkValidity() { return this.value !== '' && Number(this.value) > 0 && (id !== 'calc-nb' || Number.isInteger(Number(this.value))); },
    reportValidity() { return true; },
    querySelectorAll(selector) { return selector === '[name="profil"]' ? profiles : []; },
    querySelector(selector) { return selector === '[name="profil"]:checked' ? profiles.find(p => p.checked) : null; }
  });
  const get = id => { if (!nodes.has(id)) nodes.set(id, create(id)); return nodes.get(id); };
  get('besoin').options = ['', 'solaire','uv','securite','antigraffiti','intimite','specialites'].map(value => ({ value }));
  Object.defineProperty(get('besoin'), 'selectedOptions', { get() { return [{ textContent:get('besoin').value }]; } });
  get('type').options = ['particulier','bureau','commerce','etablissement','autre'].map(value => ({ value }));
  get('particulier-sub').options = ['', 'fenetre', 'baie', 'veranda', 'velux', 'autre'].map(value => ({ value }));
  get('message').value = search ? '' : defaults.message;
  let requests = 0, conversions = 0, payload;
  const sandbox = {
    document:{ getElementById:get, querySelector:() => null, querySelectorAll:() => [] },
    window:{ gtag:() => conversions++ }, location:{ search, pathname:'/index.html' },
    matchMedia:() => ({ matches:true }), URLSearchParams, AbortController, setTimeout, clearTimeout,
    fetch: async (...args) => { requests++; payload = JSON.parse(args[1].body); return transport(...args); }
  };
  vm.runInNewContext(script, sandbox);
  return { get, profiles, submit:() => get('contact-form').handlers.submit({ preventDefault() {} }), requests:() => requests, conversions:() => conversions, payload:() => payload };
}

for (const [label, transport] of [
  ['HTTP 500', async () => ({ ok:false, status:500 })],
  ['réseau indisponible', async () => { throw new TypeError('Network'); }],
  ['délai dépassé', async () => { const e = new Error('Timeout'); e.name = 'AbortError'; throw e; }]
]) test(`Contact : ${label} conserve les saisies, permet de réessayer et ne déclenche pas la conversion`, async () => {
  const f = fixture(transport); await f.submit();
  assert.equal(f.get('success-msg').hidden, true);
  assert.equal(f.get('contact-form').hidden, false);
  assert.equal(f.get('form-error').hidden, false);
  assert.equal(f.get('telephone').value, '0612345678');
  assert.equal(f.get('submit-btn').disabled, false);
  assert.equal(f.conversions(), 0);
});
test('Contact : succès seulement après réponse HTTP 2xx, payload n8n conservé', async () => {
  const f = fixture(async () => ({ ok:true, status:200 })); await f.submit();
  assert.equal(f.get('contact-form').hidden, true);
  assert.equal(f.get('success-msg').hidden, false);
  assert.equal(f.conversions(), 1);
  assert.deepEqual(Object.keys(f.payload()).sort(), ['nom','telephone','email','type','particulier_sub','surface','message','source'].sort());
});
test('Contact : double clic pendant l’envoi ne crée pas deux demandes', async () => {
  let release;
  const f = fixture(() => new Promise(resolve => { release = resolve; }));
  const pending = f.submit(); await f.submit();
  assert.equal(f.requests(), 1); assert.equal(f.get('submit-btn').disabled, true);
  release({ ok:true, status:200 }); await pending;
});
test('Parcours boutique : profil, lieu, sécurité et objectif préremplis', () => {
  const f = fixture(async () => ({ ok:true }), '?profil=professionnel&lieu=commerce&besoin=securite&objectif=anti-eclats');
  assert.equal(f.profiles.find(p => p.checked).value, 'professionnel');
  assert.equal(f.get('type').value, 'commerce');
  assert.equal(f.get('besoin').value, 'securite');
  assert.equal(f.get('particulier-options').hidden, true);
  assert.match(f.get('message').value, /éclats/);
});
test('Calculateur de surface : nombre × largeur × hauteur en m²', () => {
  const f = fixture(async () => ({ ok:true }));
  f.get('apply-calc').handlers.click(); assert.equal(f.get('surface').value, '3.60');
  f.get('calc-nb').value = '1.5'; f.get('surface').value = '';
  f.get('apply-calc').handlers.click(); assert.equal(f.get('surface').value, '');
});
test('Contact : formulaire invalide ou champ anti-spam rempli, aucun envoi', async () => {
  const f = fixture(async () => ({ ok:true }));
  f.get('contact-form').reportValidity = () => false; await f.submit(); assert.equal(f.requests(), 0);
  f.get('contact-form').reportValidity = () => true; f.get('website').value = 'robot'; await f.submit(); assert.equal(f.requests(), 0);
});

for (const vitrage of ['veranda','velux']) test(`Parcours toiture : demande préremplie pour ${vitrage}`, async () => {
  const f = fixture(async () => ({ ok:true }), `?profil=particulier&besoin=solaire&vitrage=${vitrage}`);
  assert.equal(f.get('particulier-options').hidden, false);
  assert.equal(f.get('particulier-sub').value, vitrage);
  assert.equal(f.get('besoin').value, 'solaire');
  await f.submit();
  assert.equal(f.payload().particulier_sub, vitrage);
});
