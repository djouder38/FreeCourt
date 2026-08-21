import { computed, ref } from 'vue'
import fr from './fr.js'
import en from './en.js'

// i18n maison : le besoin tient en quelques lignes (deux langues, pas de
// pluriels complexes, pas de formats de dates régionaux), et vue-i18n
// pèserait ~40 Ko dans un bundle déjà lourd.
const MESSAGES = { fr, en }
const LOCALES = Object.keys(MESSAGES)
const STORAGE_KEY = 'freecourt:locale'

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LOCALES.includes(saved)) return saved
  } catch {
    /* stockage indisponible : on retombe sur la langue du navigateur */
  }
  const nav = (navigator.language || 'fr').slice(0, 2).toLowerCase()
  return LOCALES.includes(nav) ? nav : 'fr'
}

const locale = ref(detect())

// Chemin pointé : t('court.addTitle'). Une clé absente renvoie la clé
// elle-même — visible en test, jamais un écran vide en production.
function resolve(dict, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict)
}

export function t(path, vars) {
  // Une cle absente ou mal typee ne doit jamais casser un rendu complet :
  // le pire acceptable est un libelle manquant, pas un ecran blanc.
  if (typeof path !== 'string') return ''
  const raw = resolve(MESSAGES[locale.value], path) ?? resolve(MESSAGES.fr, path) ?? path
  if (!vars || typeof raw !== 'string') return raw
  return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

// Lecture réactive : un composant qui appelle currentLocale() se re-rend
// quand la langue change, comme s'il lisait t() directement.
export function currentLocale() {
  return locale.value
}

export function setLocale(next) {
  if (!LOCALES.includes(next)) return
  locale.value = next
  document.documentElement.lang = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* navigation privée : la langue vaut pour la session */
  }
}

export function useI18n() {
  return {
    t,
    locale: computed(() => locale.value),
    setLocale,
    locales: LOCALES,
  }
}

// La langue du document doit suivre la locale dès le départ : les lecteurs
// d'écran choisissent leur voix dessus.
export function mountI18n() {
  document.documentElement.lang = locale.value
}
