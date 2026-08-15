import { Head, router } from '@inertiajs/react'
import { Check, Coffee, MoonStar, Toilet, X, Zap } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState } from 'react'

type Kind = 'meal' | 'nap' | 'diaper'
type Child = { id: string; firstName: string; lastName: string }
type DailyEvent = {
  id: string
  kind: Kind
  comment?: string | null
  occurredAt: string
  endedAt?: string | null
  childFirstName: string
  authorName: string
}

const kinds = [
  { value: 'meal' as const, label: 'Repas', icon: Coffee, hint: 'Biberon, déjeuner, goûter…' },
  {
    value: 'nap' as const,
    label: 'Sieste terminée',
    icon: MoonStar,
    hint: 'Début et fin de la sieste',
  },
  { value: 'diaper' as const, label: 'Change', icon: Toilet, hint: 'Couche et observation utile' },
]

const baseTimes = Array.from({ length: 288 }, (_, index) => {
  const minutes = index * 5
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

const oneHourBefore = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  const total = Math.max(0, hour * 60 + minute - 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function QuickEntry({
  wards,
  recent,
  currentTime,
}: {
  wards: Child[]
  recent: DailyEvent[]
  currentTime: string
}) {
  const [kind, setKind] = useState<Kind | null>(null)
  const [childId, setChildId] = useState('')
  const [time, setTime] = useState(currentTime)
  const [startTime, setStartTime] = useState('')
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)
  const selectedChild = useMemo(() => wards.find((child) => child.id === childId), [childId, wards])
  const config = kinds.find((item) => item.value === kind)

  useEffect(() => {
    if (!kind) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setKind(null)
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', close)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', close)
    }
  }, [kind])

  const open = (next: Kind) => {
    setKind(next)
    setChildId('')
    setComment('')
    setTime(currentTime)
    setStartTime(next === 'nap' ? oneHourBefore(currentTime) : '')
  }
  const submit = () => {
    if (!kind || !childId || processing || (kind === 'nap' && !startTime)) return
    setProcessing(true)
    router.post(
      '/saisie-rapide',
      {
        kind,
        childId,
        time: kind === 'nap' ? startTime : time,
        endTime: kind === 'nap' ? time : null,
        comment,
        requestId: crypto.randomUUID(),
      },
      {
        preserveScroll: true,
        onSuccess: () => setKind(null),
        onFinish: () => setProcessing(false),
      }
    )
  }

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))

  return (
    <div className="quick-entry-page">
      <Head title="Accès rapide" />
      <header className="page-heading quick-heading">
        <div>
          <p className="eyebrow accent">Mode tablette</p>
          <h1>Ajouter en quelques secondes</h1>
          <p>Choisissez une action. Les quelques informations utiles s’ouvrent ensuite.</p>
        </div>
        <span className="quick-badge">
          <Zap /> Accès rapide
        </span>
      </header>

      <section className="quick-entry-card" aria-labelledby="quick-kind-title">
        <div className="quick-step">
          <span>1</span>
          <div>
            <h2 id="quick-kind-title">Que voulez-vous ajouter ?</h2>
            <p>Une fenêtre dédiée évite les erreurs de saisie.</p>
          </div>
        </div>
        {wards.length ? (
          <div className="quick-kind-grid">
            {kinds.map(({ value, label, icon: Icon, hint }) => (
              <button
                type="button"
                key={value}
                className={`quick-kind ${value}`}
                onClick={() => open(value)}
              >
                <Icon />
                <strong>{label}</strong>
                <small>{hint}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="quick-empty">Aucun enfant ne vous est affecté pour le moment.</p>
        )}
      </section>

      <section className="section-block quick-recent" aria-labelledby="recent-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Aujourd’hui</p>
            <h2 id="recent-title">Derniers ajouts</h2>
          </div>
        </div>
        {recent.length ? (
          <div className="quick-recent-list">
            {recent.map((event) => {
              const item = kinds.find((entry) => entry.value === event.kind)!
              const Icon = item.icon
              return (
                <article key={event.id}>
                  <span className={`stat-icon ${event.kind}`}>
                    <Icon />
                  </span>
                  <div>
                    <strong>
                      {item.label.replace(' terminée', '')} · {event.childFirstName}
                    </strong>
                    <p>
                      {event.comment || 'Sans commentaire'} · par {event.authorName}
                    </p>
                  </div>
                  <time dateTime={event.occurredAt}>
                    {formatTime(event.occurredAt)}
                    {event.endedAt ? ` – ${formatTime(event.endedAt)}` : ''}
                  </time>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="quick-empty">Aucune saisie rapide aujourd’hui.</p>
        )}
      </section>

      {kind && config && (
        <div
          className="quick-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setKind(null)}
        >
          <section
            className="quick-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-modal-title"
          >
            <header>
              <span className={`stat-icon ${kind}`}>
                <config.icon />
              </span>
              <div>
                <p className="eyebrow">Nouvelle saisie</p>
                <h2 id="quick-modal-title">{config.label}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setKind(null)}
                aria-label="Fermer"
              >
                <X />
              </button>
            </header>
            <div className="quick-modal-body">
              <fieldset>
                <legend>Quel enfant ?</legend>
                <div className="quick-child-grid">
                  {wards.map((child, index) => (
                    <button
                      type="button"
                      key={child.id}
                      className={childId === child.id ? 'quick-child selected' : 'quick-child'}
                      aria-pressed={childId === child.id}
                      onClick={() => setChildId(child.id)}
                    >
                      <span className={`child-avatar avatar-${index % 4}`}>
                        {child.firstName[0]}
                      </span>
                      <strong>{child.firstName}</strong>
                      <small>{child.lastName.slice(0, 1)}.</small>
                      {childId === child.id && <Check aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className={kind === 'nap' ? 'quick-fields nap-fields' : 'quick-fields'}>
                {kind === 'nap' && (
                  <label>
                    Début de la sieste
                    <TimeSelect
                      value={startTime}
                      max={time}
                      onChange={(event) => setStartTime(event.target.value)}
                      autoFocus
                    />
                  </label>
                )}
                <label>
                  {kind === 'nap' ? 'Fin de la sieste' : 'Heure'}
                  <TimeSelect
                    value={time}
                    min={kind === 'nap' ? startTime : undefined}
                    max={currentTime}
                    onChange={(event) => setTime(event.target.value)}
                    autoFocus={kind !== 'nap'}
                  />
                </label>
                <label className="comment-field">
                  Commentaire <small>(facultatif)</small>
                  <input
                    type="text"
                    maxLength={500}
                    placeholder={
                      kind === 'meal'
                        ? 'Ex. tout mangé'
                        : kind === 'nap'
                          ? 'Ex. sommeil calme'
                          : 'Ex. couche mouillée'
                    }
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </label>
              </div>
            </div>
            <footer>
              <button type="button" className="secondary-button" onClick={() => setKind(null)}>
                Annuler
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={!selectedChild || processing || (kind === 'nap' && !startTime)}
                onClick={submit}
              >
                <Check />
                {selectedChild ? `Ajouter pour ${selectedChild.firstName}` : 'Choisissez un enfant'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}

function TimeSelect({
  value,
  min,
  max,
  onChange,
  autoFocus,
}: {
  value: string
  min?: string
  max?: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  autoFocus?: boolean
}) {
  const options = [...new Set([...baseTimes, value])]
    .sort()
    .filter((time) => (!min || time >= min) && (!max || time <= max))
  return (
    <select value={value} onChange={onChange} autoFocus={autoFocus}>
      {options.map((time) => (
        <option key={time} value={time}>
          {time.replace(':', ' h ')}
        </option>
      ))}
    </select>
  )
}
