import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardCheck,
  ContactRound,
  FileHeart,
  HeartPulse,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  Utensils,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { RichTextEditor } from '~/components/rich_text_editor'

type Child = {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  careStartedAt?: string | null
  careEndedAt?: string | null
  allergies?: string | null
  medicalNotesHtml?: string | null
  doctorName?: string | null
  doctorPhone?: string | null
  emergencyInstructionsHtml?: string | null
  dietaryNotesHtml?: string | null
  routinesHtml?: string | null
}
type Contact = {
  id: string
  fullName: string
  relationship: string
  phone?: string | null
  email?: string | null
  emergencyContact: boolean
  authorizedPickup: boolean
}
type Authorization = {
  id: string
  kind: string
  status: string
  validUntil?: string | null
}
type HealthEntry = {
  id: string
  kind: string
  contentHtml: string
  authorName: string
  createdAt: string
}
type Props = {
  child: Child
  role: string
  contacts: Contact[]
  authorizations: Authorization[]
  healthEntries: HealthEntry[]
  permissions: {
    canEditProfile: boolean
    canManageContacts: boolean
    canManageAuthorizations: boolean
    canEditCareDates: boolean
  }
}

const authorizationLabels = [
  ['photo_internal', 'Photos dans l’espace privé'],
  ['photo_external', 'Diffusion extérieure des photos'],
  ['outings', 'Sorties et promenades'],
  ['transport', 'Transport en véhicule'],
  ['emergency_care', 'Soins en cas d’urgence'],
  ['medication', 'Administration de médicaments'],
] as const
const healthLabels: Record<string, string> = {
  health: 'Santé',
  medication: 'Traitement',
  allergy: 'Allergie',
  instruction: 'Consigne',
  other: 'Autre',
}

export default function ChildProfile({
  child,
  role,
  contacts,
  authorizations,
  healthEntries,
  permissions,
}: Props) {
  const [allergies, setAllergies] = useState(child.allergies ?? '')
  const [medicalNotesHtml, setMedicalNotes] = useState(child.medicalNotesHtml ?? '')
  const [emergencyInstructionsHtml, setEmergency] = useState(child.emergencyInstructionsHtml ?? '')
  const [dietaryNotesHtml, setDietary] = useState(child.dietaryNotesHtml ?? '')
  const [routinesHtml, setRoutines] = useState(child.routinesHtml ?? '')
  const [doctorName, setDoctorName] = useState(child.doctorName ?? '')
  const [doctorPhone, setDoctorPhone] = useState(child.doctorPhone ?? '')
  const [careStartedAt, setCareStartedAt] = useState(child.careStartedAt?.slice(0, 10) ?? '')
  const [careEndedAt, setCareEndedAt] = useState(child.careEndedAt?.slice(0, 10) ?? '')
  const saveProfile = () =>
    router.put(
      `/enfants/${child.id}/dossier`,
      {
        allergies,
        medicalNotesHtml,
        emergencyInstructionsHtml,
        dietaryNotesHtml,
        routinesHtml,
        doctorName,
        doctorPhone,
        careStartedAt,
        careEndedAt,
      },
      { preserveScroll: true }
    )

  return (
    <div className="dashboard-page child-profile-page">
      <Head title={`Dossier de ${child.firstName}`} />
      <Link href="/enfants" className="back-link">
        <ArrowLeft /> Retour aux enfants
      </Link>
      <header className="profile-hero">
        <span className="child-avatar avatar-0">{child.firstName[0]}</span>
        <div>
          <p className="eyebrow accent">Dossier enfant</p>
          <h1>
            {child.firstName} {child.lastName}
          </h1>
          <p>
            Né le{' '}
            {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
              new Date(child.birthDate)
            )}
          </p>
        </div>
        <div className="profile-hero-actions">
          <Link href={`/enfants/${child.id}/fiche`} className="secondary-button compact">
            <CalendarDays /> Transmission du jour
          </Link>
          {(role === 'admin' || role === 'parent') && (
            <Link href={`/enfants/${child.id}/responsables`} className="secondary-button compact">
              <ContactRound /> Responsables
            </Link>
          )}
        </div>
      </header>
      <nav className="profile-section-nav" aria-label="Rubriques du dossier">
        <a href="#essentiel">Essentiel</a>
        <a href="#sante">Santé</a>
        <a href="#contacts">Contacts</a>
        <a href="#autorisations">Autorisations</a>
      </nav>

      <section id="essentiel" className="profile-section">
        <SectionTitle eyebrow="Informations stables" title="L’essentiel au quotidien" />
        <div className="profile-grid two-columns">
          {permissions.canEditCareDates && (
            <article className="settings-card">
              <CardTitle
                icon={<CalendarDays />}
                title="Prise en charge"
                subtitle="Ces dates piloteront plus tard l’archivage du dossier."
              />
              <div className="profile-fields two-fields">
                <label>
                  Début d’accueil
                  <input
                    type="date"
                    value={careStartedAt}
                    onChange={(event) => setCareStartedAt(event.target.value)}
                  />
                </label>
                <label>
                  Fin prévue
                  <input
                    type="date"
                    value={careEndedAt}
                    onChange={(event) => setCareEndedAt(event.target.value)}
                  />
                </label>
              </div>
            </article>
          )}
          <article className="settings-card">
            <CardTitle
              icon={<Utensils />}
              title="Alimentation"
              subtitle="Allergies visibles immédiatement, puis habitudes détaillées."
            />
            <label className="profile-label">
              Allergies connues
              <textarea
                value={allergies}
                onChange={(event) => setAllergies(event.target.value)}
                rows={2}
                placeholder="Aucune allergie connue"
              />
            </label>
            <RichTextEditor
              value={dietaryNotesHtml}
              onChange={setDietary}
              label="Habitudes alimentaires"
            />
          </article>
          <article className="settings-card profile-card-full">
            <CardTitle
              icon={<FileHeart />}
              title="Rythmes, habitudes et réconfort"
              subtitle="Sommeil, doudou, signes de fatigue et petites routines utiles."
            />
            <RichTextEditor
              value={routinesHtml}
              onChange={setRoutines}
              label="Rythmes et habitudes"
            />
          </article>
        </div>
      </section>

      <section id="sante" className="profile-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Accès sensible</p>
            <h2>Santé et consignes</h2>
          </div>
          <span className="status-pill">
            <ShieldCheck /> Données protégées
          </span>
        </div>
        <div className="profile-grid two-columns">
          <article className="settings-card">
            <CardTitle
              icon={<HeartPulse />}
              title="Suivi médical"
              subtitle="Les e-mails ne reprennent jamais ces informations."
            />
            <div className="profile-fields two-fields">
              <label>
                Médecin traitant
                <input value={doctorName} onChange={(event) => setDoctorName(event.target.value)} />
              </label>
              <label>
                Téléphone
                <input
                  type="tel"
                  value={doctorPhone}
                  onChange={(event) => setDoctorPhone(event.target.value)}
                />
              </label>
            </div>
            <RichTextEditor
              value={medicalNotesHtml}
              onChange={setMedicalNotes}
              label="Informations médicales permanentes"
            />
          </article>
          <article className="settings-card">
            <CardTitle
              icon={<AlertTriangle />}
              title="En cas d’urgence"
              subtitle="Consignes indispensables et personnes à prévenir."
            />
            <RichTextEditor
              value={emergencyInstructionsHtml}
              onChange={setEmergency}
              label="Consignes d’urgence"
            />
          </article>
        </div>
        <button className="primary-button compact profile-save" onClick={saveProfile}>
          <Save /> Enregistrer le dossier
        </button>
        <HealthTimeline childId={child.id} entries={healthEntries} />
      </section>

      <section id="contacts" className="profile-section">
        <SectionTitle eyebrow="Entourage" title="Contacts utiles" />
        {permissions.canManageContacts && <ContactForm childId={child.id} />}
        {contacts.length ? (
          <div className="management-list profile-list">
            {contacts.map((contact) => (
              <article key={contact.id}>
                <span className="child-avatar avatar-1">
                  <UserRound />
                </span>
                <div>
                  <h3>{contact.fullName}</h3>
                  <p>
                    {contact.relationship}
                    {contact.phone ? ` · ${contact.phone}` : ''}
                    {contact.email ? ` · ${contact.email}` : ''}
                  </p>
                  <div className="contact-badges">
                    {contact.emergencyContact && <span>Urgence</span>}
                    {contact.authorizedPickup && <span>Autorisé à récupérer</span>}
                  </div>
                </div>
                {permissions.canManageContacts && (
                  <button
                    className="icon-button danger-button"
                    aria-label={`Supprimer ${contact.fullName}`}
                    onClick={() => router.delete(`/enfants/${child.id}/contacts/${contact.id}`)}
                  >
                    <Trash2 />
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty">
            <ContactRound />
            <h3>Aucun contact complémentaire</h3>
            <p>Les responsables disposant d’un compte restent gérés séparément.</p>
          </div>
        )}
      </section>

      <section id="autorisations" className="profile-section">
        <SectionTitle eyebrow="Décisions parentales" title="Autorisations" />
        <div className="authorization-list">
          {authorizationLabels.map(([kind, label]) => (
            <AuthorizationRow
              key={kind}
              childId={child.id}
              kind={kind}
              label={label}
              current={authorizations.find((item) => item.kind === kind)}
              editable={permissions.canManageAuthorizations}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>
  )
}
function CardTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="settings-card-title">
      <span className="title-icon">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}
function HealthTimeline({ childId, entries }: { childId: string; entries: HealthEntry[] }) {
  const [kind, setKind] = useState('health')
  const [contentHtml, setContent] = useState('')
  const submit = () =>
    router.post(
      `/enfants/${childId}/sante`,
      { kind, contentHtml },
      { preserveScroll: true, onSuccess: () => setContent('') }
    )
  return (
    <div className="health-timeline">
      <article className="settings-card">
        <CardTitle
          icon={<Plus />}
          title="Ajouter une information"
          subtitle="Les personnes concernées reçoivent une alerte sans contenu médical."
        />
        <label className="profile-label">
          Type
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            {Object.entries(healthLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <RichTextEditor
          value={contentHtml}
          onChange={setContent}
          label="Nouvelle information de santé"
        />
        <button className="primary-button compact" onClick={submit}>
          <Plus /> Ajouter et notifier
        </button>
      </article>
      <div className="timeline-list">
        {entries.map((entry) => (
          <article key={entry.id}>
            <span className="timeline-dot" />
            <div>
              <div className="timeline-meta">
                <strong>{healthLabels[entry.kind] ?? 'Information'}</strong>
                <span>
                  {entry.authorName} ·{' '}
                  {new Intl.DateTimeFormat('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(entry.createdAt))}
                </span>
              </div>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
              />
            </div>
          </article>
        ))}
        {!entries.length && <p className="muted">Aucune information ponctuelle pour le moment.</p>}
      </div>
    </div>
  )
}
function ContactForm({ childId }: { childId: string }) {
  const empty = {
    fullName: '',
    relationship: '',
    phone: '',
    email: '',
    emergencyContact: false,
    authorizedPickup: false,
  }
  const [form, setForm] = useState(empty)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    router.post(`/enfants/${childId}/contacts`, form, {
      preserveScroll: true,
      onSuccess: () => setForm(empty),
    })
  }
  return (
    <form className="settings-card contact-form" onSubmit={submit}>
      <div className="profile-fields contact-fields">
        <label>
          Prénom et nom
          <input
            required
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          />
        </label>
        <label>
          Lien avec l’enfant
          <input
            required
            value={form.relationship}
            onChange={(event) => setForm({ ...form, relationship: event.target.value })}
            placeholder="Grand-parent, voisin…"
          />
        </label>
        <label>
          Téléphone
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
      </div>
      <div className="check-row">
        <label>
          <input
            type="checkbox"
            checked={form.emergencyContact}
            onChange={(event) => setForm({ ...form, emergencyContact: event.target.checked })}
          />{' '}
          Contact d’urgence
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.authorizedPickup}
            onChange={(event) => setForm({ ...form, authorizedPickup: event.target.checked })}
          />{' '}
          Autorisé à récupérer l’enfant
        </label>
      </div>
      <button className="primary-button compact">
        <Plus /> Ajouter le contact
      </button>
    </form>
  )
}
function AuthorizationRow({
  childId,
  kind,
  label,
  current,
  editable,
}: {
  childId: string
  kind: string
  label: string
  current?: Authorization
  editable: boolean
}) {
  const [status, setStatus] = useState(current?.status ?? 'pending')
  const [validUntil, setValidUntil] = useState(current?.validUntil?.slice(0, 10) ?? '')
  const save = () =>
    router.put(
      `/enfants/${childId}/autorisations/${kind}`,
      { status, validUntil },
      { preserveScroll: true }
    )
  const statusLabel =
    status === 'granted'
      ? 'Accordée'
      : status === 'refused'
        ? 'Refusée'
        : status === 'revoked'
          ? 'Révoquée'
          : 'En attente de décision'
  return (
    <article>
      <div className="authorization-title">
        <ClipboardCheck />
        <div>
          <h3>{label}</h3>
          <p>{statusLabel}</p>
        </div>
      </div>
      {editable ? (
        <div className="authorization-controls">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label={`Statut — ${label}`}
          >
            <option value="pending">En attente</option>
            <option value="granted">Accordée</option>
            <option value="refused">Refusée</option>
            <option value="revoked">Révoquée</option>
          </select>
          <input
            type="date"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            aria-label={`Valable jusqu’au — ${label}`}
          />
          <button className="secondary-button compact" onClick={save}>
            <Check /> Enregistrer
          </button>
        </div>
      ) : (
        <span className={`status-pill ${status === 'granted' ? 'published' : ''}`}>
          {statusLabel}
        </span>
      )}
    </article>
  )
}
