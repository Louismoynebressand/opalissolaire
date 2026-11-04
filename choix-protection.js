/* Orientation locale : aucun envoi, aucune donnée stockée, aucun classement automatique. */
(() => {
  'use strict';
  const tool = document.querySelector('[data-film-choice]');
  if (!tool) return;
  const need = tool.querySelector('[name="risque"]');
  const support = tool.querySelector('[name="support"]');
  const access = tool.querySelector('[name="public"]');
  const results = [...document.querySelectorAll('[data-choice-result]')];
  const accessResult = tool.querySelector('[data-access-result]');
  const summary = tool.querySelector('[data-choice-summary]');
  const accessTexts = {
    isolable: 'Local ouvert : une intervention par zone peut être envisagée si le public reste hors de l’espace de travail et qu’un cheminement adapté reste disponible. La zone est rendue au public après les opérations nécessaires à sa remise en usage.',
    unique: 'Passage unique : ne pas maintenir le public dans le passage pendant son traitement. Prévoir un autre accès validé ou une période de fermeture de cette zone avec l’exploitant ; les issues nécessaires restent disponibles.',
    ferme: 'Local libéré : prévoir l’accès aux deux faces utiles, retirer les objets proches et vérifier les consignes de remise en usage et d’entretien. Le délai d’adhésion du produit reste distinct de l’occupation du chantier.'
  };
  const update = () => {
    const key = support.value === 'casse' ? 'casse'
      : support.value === 'miroir' ? 'miroir'
      : support.value === 'plastique' ? 'plastique'
      : need.value;
    results.forEach(result => { result.hidden = result.dataset.choiceResult !== key; });
    const selected = results.find(result => !result.hidden);
    accessResult.textContent = accessTexts[access.value];
    summary.textContent = `Orientation : ${selected.querySelector('h3').textContent}. ${accessResult.textContent}`;
  };
  const calculate = () => {
    const width = tool.querySelector('[name="largeur"]');
    const height = tool.querySelector('[name="hauteur"]');
    const count = tool.querySelector('[name="quantite"]');
    const output = tool.querySelector('[data-area-result]');
    if (![width, height, count].every(input => input.value !== '' && input.checkValidity())) {
      output.textContent = 'Renseignez des dimensions positives et un nombre entier de panneaux pour calculer la surface.';
      return;
    }
    const area = Number(width.value) * Number(height.value) * Number(count.value) / 10000;
    output.textContent = `${Number(count.value)} panneau(x) : ${area.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} m² de surface géométrique approximative. Ce résultat ne constitue ni un métrage de film à commander ni une durée de pose.`;
  };
  tool.addEventListener('submit', event => {
    event.preventDefault();
    update();
    const selected = results.find(result => !result.hidden);
    selected.focus({ preventScroll: true });
    selected.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  });
  tool.querySelectorAll('[data-area-input]').forEach(input => input.addEventListener('input', calculate));
  tool.querySelector('[data-print-choice]').addEventListener('click', () => window.print());
  tool.querySelectorAll('[data-choice-control]').forEach(element => { element.hidden = false; });
  update();
  calculate();
})();
