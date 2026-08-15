import { Head, router } from '@inertiajs/react'
import { Bell, Mail, MessageSquareText, MoonStar, Save, Smartphone } from 'lucide-react'
import { useState } from 'react'

type Props = {
  preferences: {
    emailEnabled: boolean
    smsEnabled: boolean
    quietHoursEnabled: boolean
    quietHoursStart?: string | null
    quietHoursEnd?: string | null
    categorySettings?: Record<string, boolean>
  } | null
  contact: { email: string; phone?: string | null }
  healthDataEnabled: boolean
}

const categories = [
  ['daily_report', 'Fiches quotidiennes'],
  ['message', 'Messages'],
  ['health', 'Santé'],
  ['guardian_invitation', 'Invitations'],
  ['establishment', 'Informations de la MAM'],
] as const

export default function NotificationSettings({ preferences, contact, healthDataEnabled }: Props) {
  const [emailEnabled, setEmail] = useState(preferences?.emailEnabled ?? false)
  const [smsEnabled, setSms] = useState(preferences?.smsEnabled ?? false)
  const [quietHoursEnabled, setQuiet] = useState(preferences?.quietHoursEnabled ?? false)
  const [quietHoursStart, setStart] = useState(preferences?.quietHoursStart?.slice(0, 5) ?? '20:00')
  const [quietHoursEnd, setEnd] = useState(preferences?.quietHoursEnd?.slice(0, 5) ?? '07:30')
  const [categorySettings, setCategories] = useState<Record<string, boolean>>(
    preferences?.categorySettings ?? {}
  )
  const save = () =>
    router.put(
      '/parametres/notifications',
      {
        emailEnabled,
        smsEnabled,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        categories: categorySettings,
      },
      { preserveScroll: true }
    )

  return (
    <div className="dashboard-page narrow-page">
      <Head title="Préférences de notification" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Paramètres personnels</p>
          <h1>Notifications</h1>
          <p>
            Les alertes dans le site restent toujours actives. Choisissez les rappels
            complémentaires.
          </p>
        </div>
      </header>
      <section className="settings-stack">
        <article className="settings-card">
          <div className="settings-card-title">
            <Bell />
            <div>
              <h2>Canaux</h2>
              <p>Un e-mail ou SMS complète la notification dans le site.</p>
            </div>
          </div>
          <Toggle
            icon={Mail}
            title="E-mail"
            subtitle={contact.email}
            checked={emailEnabled}
            onChange={setEmail}
          />
          <Toggle
            icon={Smartphone}
            title="SMS"
            subtitle={contact.phone || 'Ajoutez et vérifiez un numéro avant activation'}
            checked={smsEnabled}
            onChange={setSms}
            disabled={!contact.phone}
          />
        </article>
        <article className="settings-card">
          <div className="settings-card-title">
            <MessageSquareText />
            <div>
              <h2>Types d’alertes externes</h2>
              <p>L’historique dans le site reste toujours complet.</p>
            </div>
          </div>
          {categories
            .filter(([key]) => healthDataEnabled || key !== 'health')
            .map(([key, label]) => (
              <Toggle
                key={key}
                title={label}
                checked={categorySettings[key] !== false}
                onChange={(checked) => setCategories({ ...categorySettings, [key]: checked })}
              />
            ))}
        </article>
        <article className="settings-card">
          <div className="settings-card-title">
            <MoonStar />
            <div>
              <h2>Heures calmes</h2>
              <p>Les alertes non urgentes sont différées jusqu’à la fin de cette plage.</p>
            </div>
          </div>
          <Toggle
            title="Activer les heures calmes"
            checked={quietHoursEnabled}
            onChange={setQuiet}
          />
          <div className="time-range">
            <label>
              De{' '}
              <input
                type="time"
                value={quietHoursStart}
                onChange={(event) => setStart(event.target.value)}
                disabled={!quietHoursEnabled}
              />
            </label>
            <label>
              à{' '}
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(event) => setEnd(event.target.value)}
                disabled={!quietHoursEnabled}
              />
            </label>
          </div>
        </article>
        <button className="primary-button compact save-settings" onClick={save}>
          <Save />
          Enregistrer mes préférences
        </button>
      </section>
    </div>
  )
}

function Toggle({
  icon: Icon,
  title,
  subtitle,
  checked,
  onChange,
  disabled,
}: {
  icon?: typeof Bell
  title: string
  subtitle?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className={`toggle-row ${disabled ? 'disabled' : ''}`}>
      <span className="toggle-copy">
        {Icon && <Icon />}
        <span>
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  )
}
