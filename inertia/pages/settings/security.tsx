import { Form, Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react'

export default function Security({
  mfaEnabled,
  mfaRequired,
  recoveryCodes,
}: {
  mfaEnabled: boolean
  mfaRequired: boolean
  recoveryCodes: string[] | null
}) {
  return (
    <div className="content-stack">
      <Head title="Sécurité du compte" />
      <header className="page-heading">
        <div>
          <p className="eyebrow accent">
            <ShieldCheck /> Compte
          </p>
          <h1>Sécurité du compte</h1>
          <p>Protégez votre accès et déconnectez les appareils que vous ne reconnaissez pas.</p>
        </div>
      </header>
      {recoveryCodes && (
        <section className="panel recovery-panel" aria-labelledby="recovery-title">
          <h2 id="recovery-title">Enregistrez vos codes de secours</h2>
          <p>Chaque code ne fonctionne qu’une fois. Conservez-les hors de Nidilo.</p>
          <ul className="recovery-codes">
            {recoveryCodes.map((code) => (
              <li key={code}>
                <code>{code}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="panel security-row">
        <div>
          <h2>
            <KeyRound /> Double authentification
          </h2>
          <p>
            {mfaEnabled
              ? 'Activée sur votre compte.'
              : mfaRequired
                ? 'Obligatoire pour les comptes administrateurs.'
                : 'Recommandée pour protéger votre compte.'}
          </p>
        </div>
        {mfaEnabled ? (
          <span className="status-pill active">Activée</span>
        ) : (
          <Link className="primary-button compact" route="mfa.setup">
            Configurer
          </Link>
        )}
      </section>
      <section className="panel security-row danger-zone">
        <div>
          <h2>
            <LogOut /> Révoquer toutes les sessions
          </h2>
          <p>Déconnecte immédiatement ce navigateur et tous les autres appareils.</p>
        </div>
        <Form route="security.sessions.revoke">
          {({ processing }) => (
            <button className="secondary-button" type="submit" disabled={processing}>
              Tout déconnecter
            </button>
          )}
        </Form>
      </section>
    </div>
  )
}
