import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Bell, CalendarDays, ChevronRight, FileHeart, ShieldCheck } from 'lucide-react'

type Child = {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  allergies?: string | null
  reportsCount: number
  latestReportDate?: string | null
}

export default function ParentDashboard({
  mam,
  wards,
  unreadReports,
}: {
  mam: { name: string }
  wards: Child[]
  unreadReports: number
}) {
  return (
    <div className="dashboard-page parent-dashboard">
      <Head title="Espace famille" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">{mam.name} · Espace famille</p>
          <h1>Les journées de votre enfant</h1>
          <p>Retrouvez ses informations et toutes les fiches partagées par la MAM.</p>
        </div>
        {unreadReports > 0 && (
          <Link href="/notifications" className="primary-button compact">
            <Bell />
            {unreadReports} nouvelle{unreadReports > 1 ? 's' : ''} fiche
            {unreadReports > 1 ? 's' : ''}
          </Link>
        )}
      </header>
      <section className="parent-children-grid">
        {wards.map((child, index) => (
          <article className="parent-child-card" key={child.id}>
            <header>
              <span className={`child-avatar avatar-${index % 4}`}>{child.firstName[0]}</span>
              <div>
                <p className="eyebrow">Mon enfant</p>
                <h2>
                  {child.firstName} {child.lastName}
                </h2>
                <span>
                  Date de naissance :{' '}
                  {new Intl.DateTimeFormat('fr-FR').format(new Date(child.birthDate))}
                </span>
              </div>
            </header>
            {child.allergies && (
              <p className="parent-alert">Allergie ou vigilance renseignée dans le dossier</p>
            )}
            <div className="parent-child-actions">
              <Link href={`/enfants/${child.id}/dossier`}>
                <FileHeart />
                <span>
                  <strong>Informations de l’enfant</strong>
                  <small>Santé, habitudes et contacts</small>
                </span>
                <ChevronRight />
              </Link>
              <Link href={`/enfants/${child.id}/calendrier`}>
                <CalendarDays />
                <span>
                  <strong>Fiches journalières</strong>
                  <small>
                    {child.reportsCount} fiche{child.reportsCount > 1 ? 's' : ''} publiée
                    {child.reportsCount > 1 ? 's' : ''}
                  </small>
                </span>
                <ChevronRight />
              </Link>
            </div>
            {child.latestReportDate && (
              <Link
                className="latest-report-link"
                href={`/enfants/${child.id}/fiche/${child.latestReportDate}`}
              >
                Voir la dernière fiche ·{' '}
                {new Intl.DateTimeFormat('fr-FR').format(new Date(child.latestReportDate))}
              </Link>
            )}
          </article>
        ))}
      </section>
      {!wards.length && (
        <section className="empty-state">
          <ShieldCheck />
          <h2>Aucun enfant relié</h2>
          <p>La MAM doit encore rattacher votre compte au dossier de l’enfant.</p>
        </section>
      )}
      <section className="parent-notification-card">
        <Bell />
        <div>
          <h2>Une alerte à chaque nouvelle fiche</h2>
          <p>
            La notification dans Nidilo est automatique. Vous pouvez aussi activer l’e-mail ou le
            SMS dans vos préférences.
          </p>
        </div>
        <Link href="/parametres/notifications" className="secondary-button compact">
          Configurer
        </Link>
      </section>
    </div>
  )
}
