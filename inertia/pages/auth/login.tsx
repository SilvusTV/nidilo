import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowRight, Check, Heart, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

export default function Login({ captcha }: { captcha: { question: string } | null }) {
  return (
    <main className="login-page">
      <Head title="Connexion">
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <section className="login-story" aria-labelledby="welcome-title">
        <div className="story-content">
          <a href="/" className="login-brand-link" aria-label="Retour au site Nidilo">
            <img src="/brand/nidilo-logo.svg" alt="Nidilo" />
          </a>
          <div className="story-copy">
            <p className="eyebrow">
              <Sparkles /> Chaque jour compte, dès le premier.
            </p>
            <h1 id="welcome-title">
              Chaque petite journée
              <br />
              mérite d’être <em>racontée.</em>
            </h1>
            <p>
              Les transmissions, les souvenirs et les informations importantes réunis dans un espace
              doux, simple et sécurisé.
            </p>
            <ul>
              <li>
                <Check /> Des fiches quotidiennes en quelques gestes
              </li>
              <li>
                <Check /> Un échange fluide avec chaque famille
              </li>
              <li>
                <Check /> Moins de papier, plus de temps ensemble
              </li>
            </ul>
          </div>
          <p className="story-quote">
            <Heart /> « Professionnelles et familles, enfin au même endroit. »
          </p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <div className="mobile-brand">
            <img className="login-mobile-logo" src="/brand/nidilo-logo.svg" alt="Nidilo" />
          </div>
          <p className="eyebrow accent">Bienvenue</p>
          <h2 id="login-title">Heureux de vous revoir</h2>
          <p className="muted">Connectez-vous à votre espace personnel.</p>

          <Form route="session.store" className="login-form">
            {({ errors, processing }) => (
              <>
                <div className="field">
                  <label htmlFor="email">Adresse e-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="vous@exemple.fr"
                    data-invalid={errors.email ? 'true' : undefined}
                    required
                    autoFocus
                  />
                  {errors.email && (
                    <p className="field-error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="field">
                  <div className="label-row">
                    <label htmlFor="password">Mot de passe</label>
                    <a href="/mot-de-passe-oublie">Accès oublié ?</a>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    data-invalid={errors.password ? 'true' : undefined}
                    required
                  />
                  {errors.password && (
                    <p className="field-error" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>
                {captcha && (
                  <div className="field">
                    <label htmlFor="captchaAnswer">
                      Contrôle anti-robot : combien font {captcha.question} ?
                    </label>
                    <input
                      id="captchaAnswer"
                      name="captchaAnswer"
                      type="number"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                    />
                  </div>
                )}
                <button className="primary-button" type="submit" disabled={processing}>
                  {processing ? (
                    'Connexion…'
                  ) : (
                    <>
                      Ouvrir mon espace <ArrowRight />
                    </>
                  )}
                </button>
              </>
            )}
          </Form>

          <div className="secure-login">
            <ShieldCheck />
            <p>
              <strong>Votre espace est privé</strong>
              <br />
              Les comptes sont créés uniquement sur invitation.
            </p>
          </div>
          <p className="help-text">
            Un souci pour vous connecter ? <a href="mailto:contact@nidilo.fr">Nous contacter</a>
          </p>
        </div>
        <footer>
          <LockKeyhole /> Données protégées · Conçu avec soin pour les MAM
        </footer>
      </section>
    </main>
  )
}
