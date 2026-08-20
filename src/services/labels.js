// Référentiel partagé des attributs terrain (badges, formulaire, markers).

export const SURFACE_LABELS = {
  concrete: { icon: '🧱', label: 'Béton' },
  parquet: { icon: '🪵', label: 'Parquet' },
  synthetic: { icon: '🟦', label: 'Synthétique' },
  sand: { icon: '🏖️', label: 'Sable' },
}

export const CONDITION_LABELS = {
  good: { icon: '✅', label: 'Bon état', color: 'text-ok', hex: '#22C55E' },
  average: { icon: '🟠', label: 'État moyen', color: 'text-warn', hex: '#F59E0B' },
  degraded: { icon: '⛔', label: 'Dégradé', color: 'text-bad', hex: '#EF4444' },
}

export const TRAFFIC_LABELS = {
  quiet: { icon: '🌙', label: 'Tranquille' },
  busy: { icon: '🔥', label: 'Fréquenté' },
  iconic: { icon: '⭐', label: 'Mythique' },
}
