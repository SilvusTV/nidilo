import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  ArrowLeft,
  Check,
  Cloud,
  Coffee,
  FileHeart,
  MoonStar,
  Save,
  Smile,
  Sparkles,
  Thermometer,
  Toilet,
  UsersRound,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { RichTextEditor } from '~/components/rich_text_editor'

type Item = { time: string; detail: string }
type Report = {
  mood?: string
  naps?: Item[]
  meals?: Item[]
  diapers?: Item[]
  activities?: Item[]
  temperature?: string
  noteHtml?: string
  status?: string
}
type Props = {
  child: { id: string; firstName: string; lastName: string }
  role: string
  reportDate: string
  report: Report | null
  quickEvents: Array<{
    id: string
    kind: 'meal' | 'nap' | 'diaper'
    comment?: string | null
    occurredAt: string
    endedAt?: string | null
    authorName: string
  }>
  healthDataEnabled: boolean
}

const quickEventLabels = { meal: 'Repas', nap: 'Sieste', diaper: 'Change' }

export default function EditReport({
  child,
  role,
  reportDate,
  report,
  quickEvents,
  healthDataEnabled,
}: Props) {
  const readonly = role === 'parent'
  const [mood, setMood] = useState(report?.mood ?? '')
  const [temperature, setTemperature] = useState(report?.temperature ?? '')
  const [noteHtml, setNoteHtml] = useState(report?.noteHtml ?? '')
  const [naps, setNaps] = useState<Item[]>(report?.naps ?? [{ time: '', detail: '' }])
  const [meals, setMeals] = useState<Item[]>(report?.meals ?? [{ time: '', detail: '' }])
  const [diapers, setDiapers] = useState<Item[]>(report?.diapers ?? [{ time: '', detail: '' }])
  const [activities, setActivities] = useState<Item[]>(
    report?.activities ?? [{ time: '', detail: '' }]
  )
  const save = (status: 'draft' | 'published') =>
    router.put(
      `/enfants/${child.id}/fiche`,
      { mood, temperature, noteHtml, naps, meals, diapers, activities, status },
      { preserveScroll: true }
    )

  return (
    <div className="report-page">
      <Head title={`Fiche de ${child.firstName}`} />
      <Link
        href={role === 'parent' ? `/enfants/${child.id}/calendrier` : '/dashboard'}
        className="back-link"
      >
        <ArrowLeft />
        {role === 'parent' ? 'Retour au calendrier' : 'Retour à aujourd’hui'}
      </Link>
      <header className="report-heading">
        <div className="child-avatar avatar-0">{child.firstName[0]}</div>
        <div>
          <p className="eyebrow accent">Transmission quotidienne</p>
          <h1>La journée de {child.firstName}</h1>
          <p>
            {new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: 'UTC',
            }).format(new Date(`${reportDate}T12:00:00Z`))}
          </p>
        </div>
        <span className={`status-pill ${report?.status === 'published' ? 'published' : ''}`}>
          {report?.status === 'published' ? (
            <>
              <Check /> Publiée
            </>
          ) : (
            <>
              <Cloud /> Brouillon
            </>
          )}
        </span>
      </header>
      <div className="report-utility-links">
        <Link href={`/enfants/${child.id}/dossier`} className="secondary-button compact">
          <FileHeart /> Dossier enfant
        </Link>
        {(role === 'admin' || role === 'parent') && (
          <Link href={`/enfants/${child.id}/responsables`} className="secondary-button compact">
            <UsersRound /> Gérer les responsables
          </Link>
        )}
      </div>

      <div className="report-grid">
        {quickEvents.length > 0 && (
          <section className="form-card full">
            <div className="card-title">
              <Zap />
              <div>
                <h2>Saisies rapides</h2>
                <p>Ajoutées depuis la tablette et conservées dans l’historique.</p>
              </div>
            </div>
            <div className="report-quick-events">
              {quickEvents.map((event) => (
                <article key={event.id}>
                  <time dateTime={event.occurredAt}>
                    {new Intl.DateTimeFormat('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(event.occurredAt))}
                    {event.endedAt && (
                      <>
                        {' – '}
                        {new Intl.DateTimeFormat('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(event.endedAt))}
                      </>
                    )}
                  </time>
                  <strong>{quickEventLabels[event.kind]}</strong>
                  <span>{event.comment || 'Sans commentaire'}</span>
                  <small>par {event.authorName}</small>
                </article>
              ))}
            </div>
          </section>
        )}
        <section className="form-card full">
          <div className="card-title">
            <Smile />
            <div>
              <h2>Comment s’est passée la journée ?</h2>
              <p>Une impression générale visible en un coup d’œil.</p>
            </div>
          </div>
          <div className="mood-grid">
            {[
              ['great', 'Rayonnante', '🌟'],
              ['good', 'Sereine', '😊'],
              ['mixed', 'Mitigée', '🌤️'],
              ['difficult', 'Difficile', '🌧️'],
            ].map(([value, label, emoji]) => (
              <button
                key={value}
                type="button"
                disabled={readonly}
                className={mood === value ? 'selected' : ''}
                onClick={() => setMood(value)}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </section>
        <LogCard
          icon={MoonStar}
          title="Siestes"
          color="lavender"
          value={naps}
          onChange={setNaps}
          readonly={readonly}
          placeholder="Ex. 45 min, sommeil calme"
        />
        <LogCard
          icon={Coffee}
          title="Repas"
          color="peach"
          value={meals}
          onChange={setMeals}
          readonly={readonly}
          placeholder="Ex. Purée, tout mangé"
        />
        <LogCard
          icon={Toilet}
          title="Changes"
          color="blue"
          value={diapers}
          onChange={setDiapers}
          readonly={readonly}
          placeholder="Ex. Couche mouillée"
        />
        <LogCard
          icon={Sparkles}
          title="Activités"
          color="green"
          value={activities}
          onChange={setActivities}
          readonly={readonly}
          placeholder="Ex. Peinture, promenade"
        />
        {healthDataEnabled && (
          <section className="form-card full">
            <div className="card-title">
              <Thermometer />
              <div>
                <h2>Santé & température</h2>
                <p>À renseigner seulement si nécessaire.</p>
              </div>
            </div>
            <div className="temperature-field">
              <label htmlFor="temperature">Température</label>
              <div>
                <input
                  id="temperature"
                  type="number"
                  min="34"
                  max="43"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  disabled={readonly}
                />
                <span>°C</span>
              </div>
            </div>
          </section>
        )}
        <section className="form-card full">
          <div className="card-title">
            <Sparkles />
            <div>
              <h2>Le petit mot du jour</h2>
              <p>
                Une note quotidienne sans allergie, traitement ou autre information médicale pendant
                le pilote.
              </p>
            </div>
          </div>
          {readonly ? (
            <div
              className="rich-content rich-preview"
              dangerouslySetInnerHTML={{ __html: noteHtml }}
            />
          ) : (
            <RichTextEditor value={noteHtml} onChange={setNoteHtml} label="Petit mot du jour" />
          )}
        </section>
      </div>

      {!readonly && (
        <footer className="report-actions">
          <button className="secondary-button" onClick={() => save('draft')}>
            <Save />
            Enregistrer le brouillon
          </button>
          <button className="primary-button compact" onClick={() => save('published')}>
            <Check />
            Publier aux responsables
          </button>
        </footer>
      )}
    </div>
  )
}

function LogCard({
  icon: Icon,
  title,
  color,
  value,
  onChange,
  readonly,
  placeholder,
}: {
  icon: typeof MoonStar
  title: string
  color: string
  value: Item[]
  onChange: (items: Item[]) => void
  readonly: boolean
  placeholder: string
}) {
  const update = (index: number, key: keyof Item, next: string) =>
    onChange(value.map((item, i) => (i === index ? { ...item, [key]: next } : item)))
  return (
    <section className="form-card">
      <div className="card-title">
        <span className={`stat-icon ${color}`}>
          <Icon />
        </span>
        <div>
          <h2>{title}</h2>
          <p>Horaires et détails</p>
        </div>
      </div>
      <div className="log-list">
        {value.map((item, index) => (
          <div className="log-row" key={index}>
            <input
              type="time"
              aria-label={`Heure - ${title}`}
              value={item.time}
              onChange={(e) => update(index, 'time', e.target.value)}
              disabled={readonly}
            />
            <input
              type="text"
              aria-label={`Détail - ${title}`}
              placeholder={placeholder}
              value={item.detail}
              onChange={(e) => update(index, 'detail', e.target.value)}
              disabled={readonly}
            />
          </div>
        ))}
      </div>
      {!readonly && (
        <button
          type="button"
          className="text-button add-line"
          onClick={() => onChange([...value, { time: '', detail: '' }])}
        >
          + Ajouter une ligne
        </button>
      )}
    </section>
  )
}
