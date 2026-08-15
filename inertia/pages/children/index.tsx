import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Archive, Baby, CalendarDays, FileHeart, Plus, RotateCcw, Trash2 } from 'lucide-react'

type ChildRecord = {
  id: string
  firstName: string
  lastName: string
  active: boolean
  archivedAt?: string | null
  purgeAt?: string | null
}

export default function ChildrenIndex({ records, role }: { records: ChildRecord[]; role: string }) {
  const active = records.filter((record) => record.active)
  const archived = records.filter((record) => !record.active)
  return (
    <div className="dashboard-page">
      <Head title="Gestion des enfants" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">{role === 'admin' ? 'Administration' : 'Mon espace'}</p>
          <h1>Enfants et archives</h1>
          <p>
            {role === 'admin'
              ? 'Un dossier archivé disparaît des transmissions puis est purgé à la date indiquée.'
              : 'Retrouvez uniquement les enfants auxquels votre compte est autorisé à accéder.'}
          </p>
        </div>
        {role === 'admin' && (
          <Link href="/enfants/nouveau" className="primary-button compact">
            <Plus /> Nouvel enfant
          </Link>
        )}
      </header>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">En cours</p>
            <h2>Dossiers actifs</h2>
          </div>
        </div>
        <div className="management-list">
          {active.map((child) => (
            <article key={child.id}>
              <span className="child-avatar avatar-0">{child.firstName[0]}</span>
              <div>
                <h3>
                  {child.firstName} {child.lastName}
                </h3>
                <p>Visible par les professionnels et responsables autorisés.</p>
              </div>
              <div className="management-actions">
                <Link href={`/enfants/${child.id}/dossier`} className="secondary-button compact">
                  <FileHeart /> Dossier
                </Link>
                {role === 'parent' && (
                  <Link
                    href={`/enfants/${child.id}/calendrier`}
                    className="secondary-button compact"
                  >
                    <CalendarDays /> Fiches
                  </Link>
                )}
                {role === 'admin' && (
                  <button
                    className="secondary-button compact"
                    onClick={() => router.post(`/enfants/${child.id}/archiver`)}
                  >
                    <Archive /> Archiver
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      {role === 'admin' && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Conservation limitée</p>
              <h2>Archives</h2>
            </div>
          </div>
          {archived.length ? (
            <div className="management-list">
              {archived.map((child) => (
                <article key={child.id}>
                  <span className="child-avatar avatar-1">
                    <Archive />
                  </span>
                  <div>
                    <h3>
                      {child.firstName} {child.lastName}
                    </h3>
                    <p>
                      <Trash2 /> Suppression automatique le{' '}
                      {child.purgeAt
                        ? new Intl.DateTimeFormat('fr-FR').format(new Date(child.purgeAt))
                        : '—'}
                    </p>
                  </div>
                  <button
                    className="secondary-button compact"
                    onClick={() => router.post(`/enfants/${child.id}/restaurer`)}
                  >
                    <RotateCcw />
                    Restaurer
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <Baby />
              <h3>Aucune archive</h3>
              <p>Les anciens dossiers apparaîtront ici pendant leur période de conservation.</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
