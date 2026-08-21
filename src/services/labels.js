// Référentiel partagé des attributs terrain (badges, formulaire, markers).
// `icon` référence une entrée de components/ui/Icon.vue — jamais un emoji :
// le jeu d'icônes doit garder un trait unique sur toute l'app.
// Les libellés vivent dans i18n/ : ces objets ne portent que la clé, sinon
// le texte serait figé dans une langue au cœur de la logique métier.
import { t } from '../i18n/index.js'

export const SURFACE_LABELS = {
  concrete: { icon: 'concrete', key: 'surface.concrete' },
  parquet: { icon: 'wood', key: 'surface.parquet' },
  synthetic: { icon: 'synthetic', key: 'surface.synthetic' },
  sand: { icon: 'sand', key: 'surface.sand' },
}

export const CONDITION_LABELS = {
  good: { icon: 'checkCircle', key: 'condition.good', color: 'text-ok', hex: '#22C55E' },
  average: { icon: 'half', key: 'condition.average', color: 'text-warn', hex: '#F59E0B' },
  degraded: { icon: 'alert', key: 'condition.degraded', color: 'text-bad-soft', hex: '#EF4444' },
}

export const TRAFFIC_LABELS = {
  quiet: { icon: 'moon', key: 'traffic.quiet' },
  busy: { icon: 'flame', key: 'traffic.busy' },
  iconic: { icon: 'star', key: 'traffic.iconic' },
}

// Raccourci pour les templates : label(SURFACE_LABELS, court.surface)
export function label(dict, key) {
  return dict[key] ? t(dict[key].key) : ''
}
