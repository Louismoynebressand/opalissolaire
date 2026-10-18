const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('simulateur.html', 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).find(code => code.includes('async function submitForm'));
new vm.Script(script);
async function scenario(name, transport, success) {
  const defaults = { 'contact-cp': '26000', 'contact-email': 'essai@example.invalid', 'contact-tel': '7 12 34 56 78', 'contact-nom': 'Test local', 'pro-facture': '' };
  const nodes = new Map();
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, { value: defaults[id] || '', style: {}, disabled: false, textContent: '', innerHTML: '', checkValidity: () => true, addEventListener() {} });
    return nodes.get(id);
  };
  get('result-view').style.display = 'none';
  let events = 0;
  const sandbox = { document: { getElementById: get }, fetch: transport, AbortController, setTimeout, clearTimeout, console, gtag: () => events++ };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  vm.runInContext("profile='pro'; totalSurface=12;", sandbox);
  await vm.runInContext('submitForm()', sandbox);
  assert.equal(get('btn-submit').disabled, false);
  assert.equal(get('loader').style.display, 'none');
  if (success) {
    assert.equal(get('result-view').style.display, 'block');
    assert.equal(get('contact-card').style.display, 'none');
    assert.equal(events, 1);
  } else {
    assert.equal(get('result-view').style.display, 'none');
    assert.notEqual(get('contact-card').style.display, 'none');
    assert.equal(get('err-submit').style.display, 'block');
    assert.equal(get('contact-email').value, defaults['contact-email']);
    assert.equal(events, 0);
  }
  process.stdout.write(name + ': OK\n');
}
(async () => {
  await scenario('HTTP 500 conserve le formulaire sans faux succès', async () => ({ ok: false }), false);
  await scenario('Erreur réseau conserve le formulaire sans conversion', async () => { throw new TypeError('Network'); }, false);
  await scenario('Délai dépassé rend la nouvelle tentative possible', async () => { const error = new Error('Timeout'); error.name = 'AbortError'; throw error; }, false);
  await scenario('HTTP 2xx affiche le résultat et déclenche la conversion', async () => ({ ok: true }), true);
})().catch(error => { console.error(error); process.exitCode = 1; });
