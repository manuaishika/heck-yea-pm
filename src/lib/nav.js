// The one nav list — the icon rail (desktop) and tab bar (mobile) both
// render from this. `short` is the mobile tab label; `label` is the tooltip
// and the desktop label. `to` is where the item opens.
export const RAIL_ITEMS = [
  { key: 'home', label: 'Home', short: 'Home', icon: 'home', to: '/' },
  { key: 'role-skills', label: 'Role & Skills', short: 'Role', icon: 'layers', to: '/role' },
  { key: 'questions', label: 'Questions', short: 'Questions', icon: 'question', to: '/browse' },
  { key: 'companies', label: 'Companies', short: 'Companies', icon: 'briefcase', to: '/companies' },
  {
    key: 'careers-india',
    label: 'Careers & India',
    short: 'Careers',
    icon: 'compass',
    to: '/careers',
  },
  { key: 'ai', label: 'AI for PMs', short: 'AI', icon: 'bot', to: '/ai' },
  { key: 'flashcards', label: 'Flashcards', short: 'Cards', icon: 'card', to: '/flashcards' },
  { key: 'resources', label: 'Resources', short: 'Resources', icon: 'book', to: '/resources' },
  { key: 'account', label: 'Account', short: 'Account', icon: 'user-circle', to: '/login' },
]

/**
 * Which rail item a route belongs to. Each of the five modules — Role &
 * Skills, Questions, Companies, Careers & India, Flashcards — owns a few
 * routes beyond its own entry page, so the right tile stays highlighted
 * across the module instead of only on its landing route.
 */
export function activeKeyFor(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/role') || pathname.startsWith('/skills')) return 'role-skills'
  if (
    pathname.startsWith('/browse') ||
    pathname.startsWith('/methods') ||
    pathname.startsWith('/guesstimates')
  ) {
    return 'questions'
  }
  if (pathname.startsWith('/companies')) return 'companies'
  if (
    pathname.startsWith('/careers') ||
    pathname.startsWith('/india') ||
    pathname.startsWith('/resume')
  ) {
    return 'careers-india'
  }
  if (pathname.startsWith('/ai')) return 'ai'
  if (pathname.startsWith('/flashcards') || pathname.startsWith('/saved')) return 'flashcards'
  if (pathname.startsWith('/resources')) return 'resources'
  if (pathname.startsWith('/login')) return 'account'
  return null
}
