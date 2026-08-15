import { Head, router } from '@inertiajs/react'
import { Building2, Mail, Plus, Power, ShieldCheck, UsersRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'

type Mam = {
  id: string
  name: string
  slug: string
  email?: string | null
  active: boolean
  createdAt: string
  childrenCount: string | number
  staffCount: string | number
  adminsCount: string | number
}
type Pending = { id: string; email: string; mamId: string }

export default function SuperAdminMams({ mams, pending }: { mams: Mam[]; pending: Pending[] }) {
  const [name, setName] = useState('')
  const [adminEmail, setEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const create = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    router.post(
      '/super-admin/mams',
      { name, adminEmail },
      {
        preserveScroll: true,
        onSuccess: () => {
          setName('')
          setEmail('')
        },
        onFinish: () => setProcessing(false),
      }
    )
  }
  return (
    <div className="dashboard-page super-admin-page">
      <Head title="Super-administration" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Nidilo · Super Admin</p>
          <h1>Gestion des MAM</h1>
          <p>
            Créez les établissements, invitez leur premier administrateur et contrôlez leur accès.
          </p>
        </div>
        <span className="super-admin-badge">
          <ShieldCheck /> Accès plateforme
        </span>
      </header>
      <section className="super-admin-layout">
        <article className="settings-card super-admin-create">
          <div className="settings-card-title">
            <Plus />
            <div>
              <h2>Nouvelle MAM</h2>
              <p>Le responsable recevra une invitation de 7 jours.</p>
            </div>
          </div>
          <form onSubmit={create}>
            <label>
              Nom de la MAM
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Les Petits Explorateurs"
              />
            </label>
            <label>
              E-mail du premier admin
              <input
                type="email"
                value={adminEmail}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="direction@mam.fr"
              />
            </label>
            <button className="primary-button" disabled={processing}>
              <Building2 />
              {processing ? 'Création…' : 'Créer et inviter'}
            </button>
          </form>
        </article>
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plateforme</p>
              <h2>
                {mams.length} MAM{mams.length > 1 ? 's' : ''}
              </h2>
            </div>
          </div>
          <div className="mams-management-list">
            {mams.map((mam) => {
              const invitation = pending.find((item) => item.mamId === mam.id)
              return (
                <article key={mam.id} className={!mam.active ? 'suspended' : ''}>
                  <div className="mam-management-icon">
                    <Building2 />
                  </div>
                  <div className="mam-management-main">
                    <div>
                      <h3>{mam.name}</h3>
                      <span>nidilo.fr/{mam.slug}</span>
                    </div>
                    <div className="mam-management-stats">
                      <span>
                        <UsersRound /> {mam.staffCount} pro
                      </span>
                      <span>
                        {mam.childrenCount} enfant{Number(mam.childrenCount) > 1 ? 's' : ''}
                      </span>
                      {invitation && (
                        <span className="pending-pill">
                          <Mail /> Invitation en attente
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={mam.active ? 'status-pill published' : 'status-pill'}>
                    {mam.active ? 'Active' : 'Suspendue'}
                  </span>
                  <button
                    className="secondary-button compact"
                    onClick={() =>
                      router.patch(
                        `/super-admin/mams/${mam.id}`,
                        { active: !mam.active },
                        { preserveScroll: true }
                      )
                    }
                  >
                    <Power />
                    {mam.active ? 'Suspendre' : 'Réactiver'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      </section>
    </div>
  )
}
