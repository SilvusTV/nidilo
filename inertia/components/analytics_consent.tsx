import { Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  captureAnalytics,
  captureConfirmedAnalyticsEvent,
  capturePageView,
  configureAnalytics,
  createAnalyticsConsent,
  installInteractionTracking,
  readAnalyticsConsent,
  setAnalyticsContext,
  storeAnalyticsConsent,
  type AnalyticsConsent,
  type ConfirmedAnalyticsEvent,
} from '~/lib/analytics'

export default function AnalyticsConsentManager({
  url,
  actorCategory,
  confirmedEvent,
  posthogProjectKey,
}: {
  url: string
  actorCategory?: string | null
  confirmedEvent?: ConfirmedAnalyticsEvent | null
  posthogProjectKey: string | null
}) {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(() => readAnalyticsConsent())
  const [open, setOpen] = useState(() => readAnalyticsConsent() === null)
  const [details, setDetails] = useState(false)
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const [replay, setReplay] = useState(consent?.replay ?? false)

  useEffect(() => {
    configureAnalytics(consent, posthogProjectKey)
    if (consent?.analytics) {
      setAnalyticsContext(actorCategory)
      capturePageView(url)
      captureConfirmedAnalyticsEvent(confirmedEvent)
    }
  }, [actorCategory, confirmedEvent, consent, posthogProjectKey, url])

  useEffect(() => installInteractionTracking(), [])

  const choose = (nextAnalytics: boolean, nextReplay: boolean) => {
    const next = createAnalyticsConsent(nextAnalytics, nextReplay)
    storeAnalyticsConsent(next)
    configureAnalytics(next, posthogProjectKey)
    setConsent(next)
    setAnalytics(next.analytics)
    setReplay(next.replay)
    setOpen(false)
    setDetails(false)
    if (next.analytics) {
      captureAnalytics('consent_updated', {
        analytics_consent: next.analytics,
        replay_consent: next.replay,
        consent_version: next.version,
      })
    }
  }

  const openSettings = () => {
    setAnalytics(consent?.analytics ?? false)
    setReplay(consent?.replay ?? false)
    setDetails(true)
    setOpen(true)
  }

  return (
    <>
      <button className="cookie-settings-button" type="button" onClick={openSettings}>
        <Cookie aria-hidden="true" />
        <span>Cookies</span>
      </button>

      {open && (
        <div className="consent-layer">
          <section
            className="consent-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-description"
          >
            {consent && (
              <button
                className="consent-close icon-button"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer les réglages des cookies"
              >
                <X />
              </button>
            )}
            <div className="consent-heading">
              <span className="consent-icon">
                <ShieldCheck aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow accent">Vos données, votre choix</p>
                <h2 id="consent-title">Nidilo peut-il mesurer votre utilisation ?</h2>
              </div>
            </div>
            <p id="consent-description">
              Les cookies essentiels font fonctionner votre session. Avec votre accord, des mesures
              pseudonymisées par navigateur nous aident à comprendre les parcours et à corriger les
              points de friction. Aucun contenu enfant, nom, e-mail, saisie, identifiant de compte
              ou message n’est envoyé.
            </p>

            {details && (
              <div className="consent-details">
                <article>
                  <div>
                    <strong>Fonctionnement essentiel</strong>
                    <p>Connexion, sécurité, choix du thème et mémorisation de vos préférences.</p>
                  </div>
                  <span className="consent-required">Toujours actif</span>
                </article>
                <label>
                  <div>
                    <strong>Mesure d’audience et d’usage</strong>
                    <p>
                      Pages normalisées, fonctions utilisées, clics, erreurs techniques et
                      performances. Conservation analytique maximale : 12 mois.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => {
                      setAnalytics(event.target.checked)
                      if (!event.target.checked) setReplay(false)
                    }}
                  />
                </label>
                <label>
                  <div>
                    <strong>Rejeu de session protégé</strong>
                    <p>
                      Reconstitution visuelle limitée pour repérer les blocages. Tous les textes,
                      champs et contenus privés sont masqués. Conservation : 30 jours.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={replay}
                    onChange={(event) => {
                      setReplay(event.target.checked)
                      if (event.target.checked) setAnalytics(true)
                    }}
                  />
                </label>
                <p className="consent-provider">
                  Prestataire : PostHog Cloud UE (Francfort). Le choix reste valable six mois sur ce
                  navigateur et peut être modifié à tout moment via « Cookies ».
                </p>
              </div>
            )}

            <div className="consent-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => choose(false, false)}
              >
                Tout refuser
              </button>
              {details ? (
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => choose(analytics, replay)}
                >
                  Enregistrer mes choix
                </button>
              ) : (
                <button className="secondary-button" type="button" onClick={() => setDetails(true)}>
                  <SlidersHorizontal /> Personnaliser
                </button>
              )}
              <button className="primary-button" type="button" onClick={() => choose(true, true)}>
                Tout accepter
              </button>
            </div>
            <p className="consent-links">
              <a href="/confidentialite">Politique de confidentialité</a>
              <span aria-hidden="true">·</span>
              <a href="/sous-traitants">Sous-traitants</a>
            </p>
          </section>
        </div>
      )}
    </>
  )
}
