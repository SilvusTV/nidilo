import { type Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect, useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import {
  Bell,
  Home,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserCog,
  Users,
  Zap,
} from 'lucide-react'

function Brand({ mamBrand }: { mamBrand?: { name: string; logoUrl?: string | null } | null }) {
  const name = mamBrand?.name ?? 'Nidilo'
  return (
    <span className="brand">
      {mamBrand?.logoUrl ? (
        <img className="brand-logo" src={mamBrand.logoUrl} alt="" />
      ) : (
        <img className="brand-logo platform-logo" src="/brand/nidilo-mark.svg" alt="" />
      )}
      <span>{name}</span>
    </span>
  )
}

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, flash } = usePage()
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const user = children.props.user
  const mamBrand = children.props.mamBrand
  const unreadNotifications = children.props.unreadNotifications
  const mamRole = children.props.mamRole
  const isSuperAdmin = user?.globalRole === 'super_admin'
  const isProfessional = mamRole === 'admin' || mamRole === 'assistant'
  const settingsHref = mamRole === 'admin' ? '/parametres/mam' : '/parametres/notifications'
  const isActive = (href: string) => url === href || (href !== '/dashboard' && url.startsWith(href))
  const isPortal =
    url === '/' ||
    url.startsWith('/login') ||
    url.startsWith('/invitations/') ||
    url.startsWith('/mot-de-passe') ||
    url.startsWith('/reinitialiser-mot-de-passe') ||
    url === '/mfa'

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])
  useEffect(() => {
    document.documentElement.dataset.brand = mamBrand?.themeKey ?? 'sage'
  }, [mamBrand?.themeKey])
  useEffect(() => {
    toast.dismiss()
    if (flash.error) toast.error(flash.error)
    if (flash.success) toast.success(flash.success)
  }, [url, flash])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (isPortal)
    return (
      <>
        <button
          className="theme-floating icon-button"
          onClick={toggleTheme}
          aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'}
        >
          {dark ? <Sun /> : <Moon />}
        </button>
        <div className="portal-main">{children}</div>
        <Toaster position="top-center" richColors />
      </>
    )

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <header className="topbar">
        <Link href="/dashboard" aria-label="Tableau de bord">
          <Brand mamBrand={mamBrand} />
        </Link>
        <div className="top-actions">
          <Link
            href="/notifications"
            className="icon-button"
            aria-label={`${unreadNotifications} notification${unreadNotifications > 1 ? 's' : ''} non lue${unreadNotifications > 1 ? 's' : ''}`}
          >
            <Bell />
            {unreadNotifications > 0 && (
              <span className="notification-count">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Link>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'}
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          <span className="avatar" title={user?.fullName ?? ''}>
            {user?.initials}
          </span>
          <Link href="/parametres/securite" className="icon-button" aria-label="Sécurité du compte">
            <ShieldCheck />
          </Link>
          <Form route="session.destroy">
            <button className="icon-button" type="submit" aria-label="Se déconnecter">
              <LogOut />
            </button>
          </Form>
        </div>
      </header>
      <aside className="sidebar" aria-label="Navigation principale">
        <nav>
          {isSuperAdmin ? (
            <Link
              href="/super-admin/mams"
              className={isActive('/super-admin/mams') ? 'nav-active' : ''}
            >
              <Home />
              MAMs
            </Link>
          ) : (
            <Link href="/dashboard" className={isActive('/dashboard') ? 'nav-active' : ''}>
              <Home />
              Aujourd’hui
            </Link>
          )}
          {!isSuperAdmin && isProfessional && (
            <Link href="/saisie-rapide" className={isActive('/saisie-rapide') ? 'nav-active' : ''}>
              <Zap />
              Accès rapide
            </Link>
          )}
          {!isSuperAdmin && (
            <Link href="/enfants" className={isActive('/enfants') ? 'nav-active' : ''}>
              <Users />
              Enfants
            </Link>
          )}
          {!isSuperAdmin && mamRole === 'admin' && (
            <Link href="/personnel" className={isActive('/personnel') ? 'nav-active' : ''}>
              <UserCog />
              Personnel
            </Link>
          )}
          {!isSuperAdmin && (
            <Link href={settingsHref} className={isActive(settingsHref) ? 'nav-active' : ''}>
              <Settings />
              Paramètres
            </Link>
          )}
        </nav>
        <div className="privacy-note">
          <span>●</span>
          <p>
            <strong>Données protégées</strong>
            <br />
            Hébergement UE · accès journalisés
          </p>
        </div>
      </aside>
      <main id="contenu" className="app-main">
        {children}
      </main>
      <nav className="bottom-nav" aria-label="Navigation mobile">
        {isSuperAdmin ? (
          <Link
            href="/super-admin/mams"
            className={isActive('/super-admin/mams') ? 'nav-active' : ''}
          >
            <Home />
            <span>MAMs</span>
          </Link>
        ) : (
          <Link href="/dashboard" className={isActive('/dashboard') ? 'nav-active' : ''}>
            <Home />
            <span>Aujourd’hui</span>
          </Link>
        )}
        {!isSuperAdmin && isProfessional && (
          <Link href="/saisie-rapide" className={isActive('/saisie-rapide') ? 'nav-active' : ''}>
            <Zap />
            <span>Rapide</span>
          </Link>
        )}
        {!isSuperAdmin && (
          <Link href="/enfants" className={isActive('/enfants') ? 'nav-active' : ''}>
            <Users />
            <span>Enfants</span>
          </Link>
        )}
        {!isSuperAdmin && mamRole === 'admin' && (
          <Link href="/personnel" className={isActive('/personnel') ? 'nav-active' : ''}>
            <UserCog />
            <span>Équipe</span>
          </Link>
        )}
        {!isSuperAdmin && (
          <Link href={settingsHref} className={isActive(settingsHref) ? 'nav-active' : ''}>
            <Settings />
            <span>Réglages</span>
          </Link>
        )}
      </nav>
      <Toaster position="top-center" richColors />
    </div>
  )
}
