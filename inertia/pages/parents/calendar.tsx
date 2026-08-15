import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

type Report = { reportDate: string; mood?: string | null }
const moods: Record<string, string> = { great: '🌟', good: '😊', mixed: '🌤️', difficult: '🌧️' }

export default function ParentCalendar({
  child,
  month,
  reports,
}: {
  child: { id: string; firstName: string; lastName: string }
  month: string
  reports: Report[]
}) {
  const [year, monthNumber] = month.split('-').map(Number)
  const first = new Date(Date.UTC(year, monthNumber - 1, 1))
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const offset = (first.getUTCDay() + 6) % 7
  const reportByDate = new Map(reports.map((report) => [report.reportDate, report]))
  const shiftMonth = (delta: number) => {
    const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  }
  const title = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(first)
  return (
    <div className="dashboard-page parent-calendar-page">
      <Head title={`Fiches de ${child.firstName}`} />
      <Link href="/dashboard" className="back-link">
        <ArrowLeft />
        Retour à mon espace
      </Link>
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Fiches journalières</p>
          <h1>Le calendrier de {child.firstName}</h1>
          <p>Seules les fiches publiées par la MAM sont accessibles.</p>
        </div>
      </header>
      <section className="calendar-card">
        <header>
          <Link
            href={`/enfants/${child.id}/calendrier?mois=${shiftMonth(-1)}`}
            aria-label="Mois précédent"
          >
            <ChevronLeft />
          </Link>
          <h2>{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
          <Link
            href={`/enfants/${child.id}/calendrier?mois=${shiftMonth(1)}`}
            aria-label="Mois suivant"
          >
            <ChevronRight />
          </Link>
        </header>
        <div className="calendar-weekdays" aria-hidden="true">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: offset }, (_, index) => (
            <span className="calendar-empty" key={`empty-${index}`} />
          ))}
          {Array.from({ length: days }, (_, index) => {
            const day = index + 1
            const date = `${month}-${String(day).padStart(2, '0')}`
            const report = reportByDate.get(date)
            return report ? (
              <Link
                key={date}
                href={`/enfants/${child.id}/fiche/${date}`}
                className="calendar-day has-report"
                aria-label={`Voir la fiche du ${day} ${title}`}
              >
                <span>{day}</span>
                <strong>{report.mood ? moods[report.mood] : '✓'}</strong>
                <small>Fiche</small>
              </Link>
            ) : (
              <span key={date} className="calendar-day">
                <span>{day}</span>
              </span>
            )
          })}
        </div>
      </section>
      {!reports.length && (
        <div className="empty-state compact-empty">
          <CalendarDays />
          <h3>Aucune fiche ce mois-ci</h3>
          <p>Une fiche apparaîtra ici dès sa publication par la MAM.</p>
        </div>
      )}
    </div>
  )
}
