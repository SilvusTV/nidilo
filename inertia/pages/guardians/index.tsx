import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft, Clock3, Mail, Send, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'

type Props = {
  child: { id: string; firstName: string; lastName: string }
  guardians: Array<{
    id: string
    fullName: string
    email: string
    relationship: string
    canInvite: boolean
  }>
  pending: Array<{ id: string; email: string; relationship: string; expiresAt: string }>
}

const labels: Record<string, string> = {
  parent: 'Parent',
  grandparent: 'Grand-parent',
  nanny: 'Nourrice',
  guardian: 'Responsable légal',
  other: 'Autre proche',
}

export default function GuardiansIndex({ child, guardians, pending }: Props) {
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('parent')
  const [processing, setProcessing] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    router.post(
      `/enfants/${child.id}/responsables/invitations`,
      { email, relationship },
      { onSuccess: () => setEmail(''), onFinish: () => setProcessing(false) }
    )
  }
  return (
    <div className="dashboard-page narrow-page">
      <Head title={`Responsables de ${child.firstName}`} />
      <Link href={`/enfants/${child.id}/fiche`} className="back-link">
        <ArrowLeft /> Retour à la fiche
      </Link>
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Famille de {child.firstName}</p>
          <h1>Responsables autorisés</h1>
          <p>Chaque personne ne voit que les enfants auxquels elle est explicitement rattachée.</p>
        </div>
      </header>
      <section className="settings-card">
        <div className="settings-card-title">
          <Send />
          <div>
            <h2>Inviter un proche</h2>
            <p>
              L’accès est actif dès que la personne accepte son invitation. La MAM est
              automatiquement notifiée.
            </p>
          </div>
        </div>
        <form className="guardian-invite-form" onSubmit={submit}>
          <label>
            Adresse e-mail
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="proche@exemple.fr"
            />
          </label>
          <label>
            Lien avec l’enfant
            <select value={relationship} onChange={(event) => setRelationship(event.target.value)}>
              <option value="parent">Parent</option>
              <option value="grandparent">Grand-parent</option>
              <option value="nanny">Nourrice</option>
              <option value="guardian">Responsable légal</option>
              <option value="other">Autre</option>
            </select>
          </label>
          <button className="primary-button compact" disabled={processing}>
            {processing ? (
              'Envoi…'
            ) : (
              <>
                <Mail /> Envoyer l’invitation
              </>
            )}
          </button>
        </form>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Accès actifs</p>
            <h2>
              {guardians.length} responsable{guardians.length > 1 ? 's' : ''}
            </h2>
          </div>
        </div>
        {guardians.length ? (
          <div className="management-list">
            {guardians.map((guardian) => (
              <article key={guardian.id}>
                <span className="child-avatar avatar-0">
                  <UserRound />
                </span>
                <div>
                  <h3>{guardian.fullName}</h3>
                  <p>
                    {labels[guardian.relationship] ?? labels.other} · {guardian.email}
                  </p>
                </div>
                {guardian.canInvite && (
                  <span className="status-pill published">
                    <ShieldCheck /> Peut inviter
                  </span>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty">
            <UsersRound />
            <h3>Aucun responsable</h3>
            <p>Envoyez la première invitation ci-dessus.</p>
          </div>
        )}
      </section>
      {pending.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">En attente</p>
              <h2>Invitations envoyées</h2>
            </div>
          </div>
          <div className="management-list">
            {pending.map((invite) => (
              <article key={invite.id}>
                <span className="child-avatar avatar-1">
                  <Clock3 />
                </span>
                <div>
                  <h3>{invite.email}</h3>
                  <p>
                    {labels[invite.relationship] ?? labels.other} · expire le{' '}
                    {new Intl.DateTimeFormat('fr-FR').format(new Date(invite.expiresAt))}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
