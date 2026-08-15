import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <main className="auth-simple-page">
      <Head title="Mot de passe oublié">
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <section className="auth-simple-card" aria-labelledby="forgot-title">
        <a href="/" aria-label="Nidilo, accueil">
          <img className="auth-logo" src="/brand/nidilo-logo.svg" alt="Nidilo" />
        </a>
        <Mail className="auth-security-icon" aria-hidden="true" />
        <h1 id="forgot-title">Retrouver votre accès</h1>
        <p className="muted">
          Indiquez l’adresse liée à votre compte. Le lien reçu sera valable 30 minutes.
        </p>
        <Form route="password.email" className="login-form">
          {({ processing }) => (
            <>
              <div className="field">
                <label htmlFor="email">Adresse e-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
              <button className="primary-button" type="submit" disabled={processing}>
                {processing ? 'Envoi…' : 'Recevoir le lien'}
              </button>
            </>
          )}
        </Form>
        <p className="auth-back-link">
          <a href="/login">
            <ArrowLeft /> Retour à la connexion
          </a>
        </p>
        <div className="secure-login">
          <ShieldCheck />
          <p>La réponse reste identique, qu’un compte existe ou non.</p>
        </div>
      </section>
    </main>
  )
}
