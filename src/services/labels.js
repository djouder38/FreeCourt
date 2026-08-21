// Référentiel partagé des attributs terrain (badges, formulaire, markers).
// `icon` référence une entrée de components/ui/Icon.vue — jamais un emoji :
// le jeu d'icônes doit garder un trait unique sur toute l'app.

export const SURFACE_LABELS = {
  concrete: { icon: 'concrete', label: 'Béton' },
  parquet: { icon: 'wood', label: 'Parquet' },
  synthetic: { icon: 'synthetic', label: 'Synthétique' },
  sand: { icon: 'sand', label: 'Sable' },
}

export const CONDITION_LABELS = {
  good: { icon: 'checkCircle', label: 'Bon état', color: 'text-ok', hex: '#22C55E' },
  average: { icon: 'half', label: 'État moyen', color: 'text-warn', hex: '#F59E0B' },
  degraded: { icon: 'alert', label: 'Dégradé', color: 'text-bad-soft', hex: '#EF4444' },
}

export const TRAFFIC_LABELS = {
  quiet: { icon: 'moon', label: 'Tranquille' },
  busy: { icon: 'flame', label: 'Fréquenté' },
  iconic: { icon: 'star', label: 'Mythique' },
}
