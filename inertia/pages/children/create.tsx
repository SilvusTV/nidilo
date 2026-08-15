import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft, ArrowRight, Baby, ShieldCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'

export default function CreateChild({ healthDataEnabled }: { healthDataEnabled: boolean }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    careStartedAt: '',
    allergies: '',
  })
  const [processing, setProcessing] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    router.post('/enfants', form, { onFinish: () => setProcessing(false) })
  }
  return (
    <div className="dashboard-page narrow-page">
      <Head title="Nouvel enfant" />
      <Link href="/enfants" className="back-link">
        <ArrowLeft /> Retour aux enfants
      </Link>
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Administration</p>
          <h1>Créer un dossier enfant</h1>
          <p>
            Commencez par le strict nécessaire. Le dossier détaillé pourra être complété ensuite
            avec la famille.
          </p>
        </div>
      </header>
      <form className="settings-card child-create-form" onSubmit={submit}>
        <div className="settings-card-title">
          <Baby />
          <div>
            <h2>Identité et accueil</h2>
            <p>
              Les identifiants techniques seront générés automatiquement et ne seront jamais
              séquentiels.
            </p>
          </div>
        </div>
        <div className="profile-fields two-fields">
          <label>
            Prénom
            <input
              required
              minLength={2}
              autoComplete="off"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            />
          </label>
          <label>
            Nom
            <input
              required
              minLength={2}
              autoComplete="off"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
            />
          </label>
          <label>
            Date de naissance
            <input
              required
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.birthDate}
              onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
            />
          </label>
          <label>
            Début de l’accueil
            <input
              type="date"
              value={form.careStartedAt}
              onChange={(event) => setForm({ ...form, careStartedAt: event.target.value })}
            />
          </label>
        </div>
        {healthDataEnabled && (
          <label className="profile-label">
            Allergies déjà connues
            <textarea
              rows={3}
              value={form.allergies}
              onChange={(event) => setForm({ ...form, allergies: event.target.value })}
              placeholder="Laissez vide si aucune information n’a encore été transmise."
            />
          </label>
        )}
        {!healthDataEnabled && (
          <div className="pilot-notice" role="note">
            <ShieldCheck />
            <p>
              <strong>Pilote sans données médicales</strong>
              <br />
              Les allergies, traitements et informations de santé restent gérés hors de Nidilo.
            </p>
          </div>
        )}
        <div className="creation-next-step">
          <ShieldCheck />
          <p>
            <strong>Étape suivante : inviter les parents</strong>
            <br />
            Après la création, Nidilo ouvrira directement la gestion des responsables de cet enfant.
          </p>
        </div>
        <button className="primary-button" disabled={processing}>
          {processing ? (
            'Création…'
          ) : (
            <>
              Créer et inviter les parents <ArrowRight />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
