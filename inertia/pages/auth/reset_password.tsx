import { Head, router } from '@inertiajs/react'
import { ArrowRight, KeyRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'

export default function ResetPassword({ valid }: { valid: boolean }) {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [processing, setProcessing] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    router.post(
      window.location.pathname,
      { password, passwordConfirmation },
      { onFinish: () => setProcessing(false) }
    )
  }
  return (
    <main className="auth-simple-page">
      <Head title="Nouveau mot de passe">
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <section className="auth-simple-card" aria-labelledby="reset-title">
        <a href="/" aria-label="Nidilo, accueil">
          <img className="auth-logo" src="/brand/nidilo-logo.svg" alt="Nidilo" />
        </a>
        <KeyRound className="auth-security-icon" aria-hidden="true" />
        <h1 id="reset-title">Choisir un nouveau mot de passe</h1>
        {!valid ? (
          <>
            <p>Ce lien est invalide, expiré ou a déjà été utilisé.</p>
            <a className="primary-button" href="/mot-de-passe-oublie">
              Demander un nouveau lien
            </a>
          </>
        ) : (
          <form className="login-form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <small>12 caractères minimum.</small>
            </div>
            <div className="field">
              <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
              <input
                id="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                required
              />
            </div>
            <button className="primary-button" type="submit" disabled={processing}>
              {processing ? (
                'Enregistrement…'
              ) : (
                <>
                  Enregistrer <ArrowRight />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
