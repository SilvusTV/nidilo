import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ShieldCheck } from 'lucide-react'

export default function MfaSetup({
  secret,
  uri,
  required,
}: {
  secret: string
  uri: string
  required: boolean
}) {
  return (
    <div className="content-stack security-setup">
      <Head title="Configurer la double authentification" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">
            <ShieldCheck /> Sécurité du compte
          </p>
          <h1>Double authentification</h1>
          <p>
            {required
              ? 'Cette protection est obligatoire pour votre rôle administrateur.'
              : 'Ajoutez une protection à votre mot de passe.'}
          </p>
        </div>
      </header>
      <section className="panel security-panel">
        <ol className="security-steps">
          <li>Ouvrez votre application d’authentification.</li>
          <li>Ajoutez un compte avec la clé ci-dessous.</li>
          <li>Saisissez le code à 6 chiffres pour terminer.</li>
        </ol>
        <p className="secret-code" aria-label={`Clé secrète ${secret.split('').join(' ')}`}>
          {secret.match(/.{1,4}/g)?.join(' ')}
        </p>
        <a className="secondary-button" href={uri}>
          Ouvrir l’application d’authentification
        </a>
        <Form route="mfa.confirm" className="login-form mfa-confirm-form">
          {({ processing }) => (
            <>
              <div className="field">
                <label htmlFor="code">Code à 6 chiffres</label>
                <input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              <button className="primary-button" type="submit" disabled={processing}>
                {processing ? 'Activation…' : 'Activer la protection'}
              </button>
            </>
          )}
        </Form>
      </section>
    </div>
  )
}
