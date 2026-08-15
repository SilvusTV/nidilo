import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Bell, Check, ChevronRight, HeartPulse, Mail, ShieldCheck, UserPlus } from 'lucide-react'

type Notification = {
  id: string
  category: string
  title: string
  body?: string | null
  actionUrl?: string | null
  readAt?: string | null
  createdAt: string
}

const icons: Record<string, typeof Bell> = {
  health: HeartPulse,
  guardian_invitation: UserPlus,
  message: Mail,
  system: ShieldCheck,
}

export default function Notifications({ notifications }: { notifications: Notification[] }) {
  const markAsRead = (notification: Notification) => {
    if (!notification.readAt) {
      router.patch(`/notifications/${notification.id}/lire`, {}, { preserveScroll: true })
    }
  }

  return (
    <div className="dashboard-page narrow-page">
      <Head title="Notifications" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Centre de notifications</p>
          <h1>Vos nouvelles</h1>
          <p>Les événements importants restent toujours disponibles ici.</p>
        </div>
        <Link href="/parametres/notifications" className="secondary-button compact">
          Préférences
        </Link>
      </header>
      <section className="notification-list">
        {notifications.length ? (
          notifications.map((notification) => {
            const Icon = icons[notification.category] ?? Bell
            return (
              <article
                key={notification.id}
                className={`notification-card ${notification.readAt ? '' : 'unread'}`}
                onClick={() => markAsRead(notification)}
              >
                <span className="stat-icon green">
                  <Icon />
                </span>
                <div>
                  <div className="notification-title">
                    <h2>{notification.title}</h2>
                    {!notification.readAt && <span>Nouveau</span>}
                  </div>
                  {notification.body && <p>{notification.body}</p>}
                  <time>
                    {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(notification.createdAt))}
                  </time>
                </div>
                {notification.actionUrl ? (
                  <Link href={notification.actionUrl} aria-label={`Ouvrir : ${notification.title}`}>
                    <ChevronRight />
                  </Link>
                ) : notification.readAt ? (
                  <Check />
                ) : null}
              </article>
            )
          })
        ) : (
          <div className="empty-state">
            <Bell />
            <h2>Tout est calme</h2>
            <p>
              Les nouvelles transmissions, messages, informations de santé et invitations
              apparaîtront ici.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
