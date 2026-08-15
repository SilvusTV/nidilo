import { Head, router } from '@inertiajs/react'
import { Mail, ShieldCheck, UserCog, UserPlus, UsersRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'

type Member = {
  id: string
  userId: string
  fullName: string
  email: string
  role: 'admin' | 'assistant'
  status: 'active' | 'suspended'
}
type Pending = { id: string; email: string; role: 'admin' | 'assistant'; expiresAt: string }

export default function StaffIndex({
  members,
  pending,
  currentUserId,
}: {
  members: Member[]
  pending: Pending[]
  currentUserId: string
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'assistant'>('assistant')
  const [processing, setProcessing] = useState(false)
  const invite = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    router.post(
      '/personnel/invitations',
      { email, role },
      {
        preserveScroll: true,
        onSuccess: () => setEmail(''),
        onFinish: () => setProcessing(false),
      }
    )
  }
  const update = (member: Member, changes: Partial<Pick<Member, 'role' | 'status'>>) =>
    router.patch(
      `/personnel/${member.id}`,
      { role: member.role, status: member.status, ...changes },
      { preserveScroll: true }
    )

  return (
    <div className="dashboard-page">
      <Head title="Gestion du personnel" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Administration</p>
          <h1>L’équipe de la MAM</h1>
          <p>
            Invitez les professionnelles, choisissez leurs droits et suspendez un accès si
            nécessaire.
          </p>
        </div>
      </header>

      <section className="staff-layout">
        <article className="settings-card staff-invite-card">
          <div className="settings-card-title">
            <UserPlus />
            <div>
              <h2>Inviter une personne</h2>
              <p>Le lien sécurisé reste valable pendant 7 jours.</p>
            </div>
          </div>
          <form className="staff-invite-form" onSubmit={invite}>
            <label>
              Adresse e-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="prenom@exemple.fr"
              />
            </label>
            <label>
              Rôle
              <select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
                <option value="assistant">Assistante maternelle</option>
                <option value="admin">Administratrice</option>
              </select>
            </label>
            <p className="staff-role-hint">
              <ShieldCheck /> Une administratrice peut gérer la MAM et remplir les fiches comme une
              AM.
            </p>
            <button className="primary-button" disabled={processing}>
              <Mail /> {processing ? 'Envoi…' : 'Envoyer l’invitation'}
            </button>
          </form>
        </article>

        <div className="staff-main">
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Accès actifs</p>
                <h2>Personnel</h2>
              </div>
            </div>
            <div className="staff-list">
              {members.map((member) => {
                const self = member.userId === currentUserId
                return (
                  <article
                    key={member.id}
                    className={member.status === 'suspended' ? 'suspended' : ''}
                  >
                    <span className="avatar">
                      {member.fullName
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                    <div className="staff-identity">
                      <strong>
                        {member.fullName}
                        {self ? ' (vous)' : ''}
                      </strong>
                      <span>{member.email}</span>
                    </div>
                    <label>
                      Rôle
                      <select
                        aria-label={`Rôle de ${member.fullName}`}
                        value={member.role}
                        disabled={self}
                        onChange={(event) =>
                          update(member, { role: event.target.value as Member['role'] })
                        }
                      >
                        <option value="assistant">AM</option>
                        <option value="admin">Admin + AM</option>
                      </select>
                    </label>
                    <button
                      className="secondary-button compact"
                      disabled={self}
                      onClick={() =>
                        update(member, {
                          status: member.status === 'active' ? 'suspended' : 'active',
                        })
                      }
                    >
                      <UserCog />
                      {member.status === 'active' ? 'Suspendre' : 'Réactiver'}
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
          {pending.length > 0 && (
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">En attente</p>
                  <h2>Invitations envoyées</h2>
                </div>
              </div>
              <div className="pending-staff-list">
                {pending.map((pendingInvite) => (
                  <article key={pendingInvite.id}>
                    <UsersRound />
                    <div>
                      <strong>{pendingInvite.email}</strong>
                      <p>
                        {pendingInvite.role === 'admin'
                          ? 'Administratrice'
                          : 'Assistante maternelle'}{' '}
                        · expire le{' '}
                        {new Intl.DateTimeFormat('fr-FR').format(new Date(pendingInvite.expiresAt))}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  )
}
