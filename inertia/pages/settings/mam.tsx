import { Head, router } from '@inertiajs/react'
import { Building2, Clock3, ImagePlus, Palette, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  mam: {
    name: string
    themeKey: string
    childRetentionDays: number
    logoKey?: string | null
    logoUrl?: string | null
  }
}
const themes = [
  ['sage', 'Vert sauge'],
  ['rose', 'Rose poudré'],
  ['blue', 'Bleu doux'],
  ['yellow', 'Jaune solaire'],
  ['gray', 'Gris naturel'],
] as const

export default function MamSettings({ mam }: Props) {
  const [name, setName] = useState(mam.name)
  const [themeKey, setTheme] = useState(mam.themeKey)
  const [retention, setRetention] = useState(mam.childRetentionDays)
  const [logo, setLogo] = useState<File | null>(null)
  const logoPreview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : (mam.logoUrl ?? null)),
    [logo, mam.logoUrl]
  )
  useEffect(() => {
    document.documentElement.dataset.brand = themeKey
    return () => {
      document.documentElement.dataset.brand = mam.themeKey
    }
  }, [themeKey, mam.themeKey])
  useEffect(() => {
    if (logoPreview?.startsWith('blob:')) return () => URL.revokeObjectURL(logoPreview)
  }, [logoPreview])
  const save = () =>
    router.put(
      '/parametres/mam',
      { name, themeKey, childRetentionDays: retention },
      { preserveScroll: true }
    )
  const uploadLogo = () => {
    if (!logo) return
    router.post('/parametres/mam/logo', { logo }, { forceFormData: true, preserveScroll: true })
  }
  return (
    <div className="dashboard-page narrow-page">
      <Head title="Personnalisation de la MAM" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">Administration</p>
          <h1>Votre MAM</h1>
          <p>
            Une identité simple et cohérente, automatiquement adaptée aux thèmes clair et sombre.
          </p>
        </div>
      </header>
      <section className="settings-stack">
        <article className="settings-card">
          <div className="settings-card-title">
            <Building2 />
            <div>
              <h2>Identité</h2>
              <p>Le nom apparaît dans l’en-tête et les notifications.</p>
            </div>
          </div>
          <div className="field settings-field">
            <label htmlFor="mam-name">Nom de la MAM</label>
            <input
              id="mam-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={150}
            />
          </div>
          <div className="logo-uploader">
            {logoPreview ? <img src={logoPreview} alt="Aperçu du logo de la MAM" /> : <ImagePlus />}
            <span>
              <strong>Logo personnalisé</strong>
              <small>PNG, JPG, WebP ou AVIF · conversion WebP dans MiniO</small>
            </span>
            <label className="secondary-button compact">
              Choisir une image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
              />
            </label>
            <button
              className="primary-button compact"
              type="button"
              disabled={!logo}
              onClick={uploadLogo}
            >
              Envoyer
            </button>
          </div>
        </article>
        <article className="settings-card">
          <div className="settings-card-title">
            <Palette />
            <div>
              <h2>Palette</h2>
              <p>Cinq palettes contrôlées pour préserver contraste et lisibilité.</p>
            </div>
          </div>
          <div className="theme-grid">
            {themes.map(([key, label]) => (
              <button
                type="button"
                key={key}
                className={`theme-choice theme-${key} ${themeKey === key ? 'selected' : ''}`}
                onClick={() => setTheme(key)}
              >
                <span>
                  <i />
                  <i />
                </span>
                {label}
              </button>
            ))}
          </div>
        </article>
        <article className="settings-card">
          <div className="settings-card-title">
            <Clock3 />
            <div>
              <h2>Archivage des enfants</h2>
              <p>Valeur par défaut : un an après la fin de prise en charge.</p>
            </div>
          </div>
          <div className="field settings-field">
            <label htmlFor="retention">Durée avant purge définitive</label>
            <select
              id="retention"
              value={retention}
              onChange={(event) => setRetention(Number(event.target.value))}
            >
              <option value={180}>6 mois</option>
              <option value={365}>1 an</option>
              <option value={730}>2 ans</option>
            </select>
            <p className="legal-hint">
              Cette durée concerne les transmissions et médias courants. Les futurs documents
              contractuels auront une conservation distincte selon leur obligation légale.
            </p>
          </div>
        </article>
        <button className="primary-button compact save-settings" onClick={save}>
          <Save />
          Enregistrer la MAM
        </button>
      </section>
    </div>
  )
}
