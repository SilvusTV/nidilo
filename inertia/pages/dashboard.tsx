import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  Baby,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  MessageCircle,
  Zap,
  ShieldCheck,
  Users,
} from 'lucide-react'

type Child = {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  allergies?: string | null
}
type Props = {
  mam: { id: string; name: string; assignmentMode: 'all' | 'assigned' } | null
  role: string
  wards: Child[]
  stats: { present: number; reports: number; messages: number }
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super-administration',
  admin: 'Administration',
  assistant: 'Assistante maternelle',
  parent: 'Espace famille',
}

export default function Dashboard({ mam, role, wards, stats }: Props) {
  const canWrite = role === 'admin' || role === 'assistant'
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  return (
    <div className="dashboard-page">
      <Head title="Aujourd’hui" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">{mam?.name ?? roleLabel[role] ?? 'Votre espace'}</p>
          <h1>Bonjour 👋</h1>
          <p>{date.charAt(0).toUpperCase() + date.slice(1)} · voici l’essentiel de la journée.</p>
        </div>
        {canWrite && (
          <Link href="/saisie-rapide" className="primary-button compact">
            <Zap />
            Accès rapide
          </Link>
        )}
      </header>

      {!mam && (
        <section className="empty-state">
          <ShieldCheck />
          <h2>Espace prêt à être configuré</h2>
          <p>
            Ce compte n’est pas encore rattaché à une MAM. Le super-administrateur peut créer
            l’établissement et inviter son responsable.
          </p>
        </section>
      )}

      {mam && (
        <>
          <section className="stats-grid" aria-label="Résumé du jour">
            <article>
              <span className="stat-icon peach">
                <Users />
              </span>
              <div>
                <strong>{stats.present}</strong>
                <span>enfants suivis</span>
              </div>
            </article>
            <article>
              <span className="stat-icon green">
                <ClipboardCheck />
              </span>
              <div>
                <strong>
                  {stats.reports}/{stats.present}
                </strong>
                <span>fiches publiées</span>
              </div>
            </article>
            <article>
              <span className="stat-icon blue">
                <MessageCircle />
              </span>
              <div>
                <strong>{stats.messages}</strong>
                <span>nouveaux messages</span>
              </div>
            </article>
          </section>

          <section id="enfants" className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Enfants</p>
                <h2>Les petites journées</h2>
              </div>
              <Link href="/enfants" className="text-button">
                Voir tout <ChevronRight />
              </Link>
            </div>
            {wards.length ? (
              <div className="children-grid">
                {wards.map((child, index) => (
                  <article className="child-card" key={child.id}>
                    <div className={`child-avatar avatar-${index % 4}`} aria-hidden="true">
                      {child.firstName.slice(0, 1)}
                    </div>
                    <div className="child-main">
                      <h3>
                        {child.firstName} {child.lastName.slice(0, 1)}.
                      </h3>
                      <p>
                        <Clock3 /> Arrivée prévue à 8h30
                      </p>
                      {child.allergies && <span className="warning-pill">Allergie renseignée</span>}
                    </div>
                    {canWrite ? (
                      <Link href={`/enfants/${child.id}/fiche`} className="card-action">
                        Remplir la fiche <ChevronRight />
                      </Link>
                    ) : (
                      <Link href={`/enfants/${child.id}/fiche`} className="card-action">
                        Voir la journée <ChevronRight />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <Baby />
                <h3>Aucun enfant pour le moment</h3>
                <p>
                  Les enfants visibles ici dépendent de votre rôle et des affectations définies par
                  la MAM.
                </p>
              </div>
            )}
          </section>

          <section className="two-columns">
            <article className="info-card">
              <span className="stat-icon lavender">
                <CalendarDays />
              </span>
              <div>
                <p className="eyebrow">Prochaine actualité</p>
                <h3>Les nouvelles de la MAM</h3>
                <p>Les administrateurs pourront publier ici fermetures, sorties et temps forts.</p>
              </div>
            </article>
            <article className="info-card">
              <span className="stat-icon green">
                <ShieldCheck />
              </span>
              <div>
                <p className="eyebrow">Confidentialité</p>
                <h3>Chacun voit uniquement ce qui le concerne</h3>
                <p>Les droits sont filtrés côté serveur selon la MAM, l’enfant et le rôle.</p>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
