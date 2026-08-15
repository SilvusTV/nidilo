import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { LockKeyhole } from 'lucide-react'

export default function MfaChallenge() {
  return (
    <main className="auth-simple-page">
      <Head title="Vérification de sécurité">
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <section className="auth-simple-card" aria-labelledby="mfa-title">
        <img className="auth-logo" src="/brand/nidilo-logo.svg" alt="Nidilo" />
        <LockKeyhole className="auth-security-icon" aria-hidden="true" />
        <h1 id="mfa-title">Vérification en deux étapes</h1>
        <p className="muted">
          Saisissez le code de votre application d’authentification ou un code de secours.
        </p>
        <Form route="mfa.verify" className="login-form">
          {({ processing }) => (
            <>
              <div className="field">
                <label htmlFor="code">Code de sécurité</label>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  minLength={6}
                  maxLength={16}
                  required
                  autoFocus
                />
              </div>
              <button className="primary-button" type="submit" disabled={processing}>
                {processing ? 'Vérification…' : 'Vérifier'}
              </button>
            </>
          )}
        </Form>
        <p className="help-text">
          <a href="/login">Recommencer la connexion</a>
        </p>
      </section>
    </main>
  )
}
