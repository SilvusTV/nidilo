import { Head, router } from '@inertiajs/react'
import { ArrowRight, CheckCircle2, Heart, LockKeyhole, ShieldCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'

type Props = {
  invitation: {
    email: string
    childFirstName: string
    mamName: string
    inviterName: string
    relationship: string
    role: 'parent' | 'assistant' | 'admin' | 'mam_admin'
    isStaff: boolean
  } | null
  state: 'active' | 'accepted' | 'invalid'
  signedInEmail: string | null
  hasAccount: boolean
}

export default function AcceptInvitation({ invitation, state, signedInEmail, hasAccount }: Props) {
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)
  const wrongAccount = Boolean(
    signedInEmail && invitation && signedInEmail.toLowerCase() !== invitation.email.toLowerCase()
  )
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    router.post(
      window.location.pathname,
      { fullName, password },
      { onFinish: () => setProcessing(false) }
    )
  }

  return (
    <main className="invitation-page">
      <Head title={invitation?.isStaff ? 'Invitation professionnelle' : 'Invitation famille'}>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </Head>
      <section className="invitation-card" aria-labelledby="invitation-title">
        <a href="/" className="invitation-brand" aria-label="Nidilo, accueil">
          <img src="/brand/nidilo-logo.svg" alt="Nidilo" />
        </a>
        {state === 'invalid' && (
          <>
            <p className="eyebrow accent">Lien indisponible</p>
            <h1 id="invitation-title">Cette invitation n’est plus valide</h1>
            <p>
              Elle a peut-être expiré. Demandez à la MAM ou à votre proche de vous en envoyer une
              nouvelle.
            </p>
            <a className="primary-button" href="/login">
              Revenir à la connexion
            </a>
          </>
        )}
        {state === 'accepted' && (
          <>
            <CheckCircle2 className="invitation-status-icon" />
            <h1 id="invitation-title">Invitation déjà acceptée</h1>
            <p>Votre accès est prêt. Connectez-vous pour retrouver les informations de l’enfant.</p>
            <a className="primary-button" href="/login">
              Ouvrir mon espace <ArrowRight />
            </a>
          </>
        )}
        {state === 'active' && invitation && (
          <>
            <p className="eyebrow accent">
              {invitation.isStaff ? <ShieldCheck /> : <Heart />}{' '}
              {invitation.isStaff ? 'Invitation professionnelle' : 'Invitation famille'}
            </p>
            <h1 id="invitation-title">
              {invitation.isStaff
                ? `Rejoignez l’équipe de ${invitation.mamName}`
                : `Rejoignez l’espace de ${invitation.childFirstName}`}
            </h1>
            <p>
              <strong>{invitation.inviterName}</strong>{' '}
              {invitation.isStaff
                ? `vous invite comme ${invitation.role === 'admin' || invitation.role === 'mam_admin' ? 'administratrice' : 'assistante maternelle'}.`
                : 'vous invite à suivre les transmissions'}{' '}
              {!invitation.isStaff && (
                <>
                  partagées par <strong>{invitation.mamName}</strong>.
                </>
              )}
            </p>
            <div className="invitation-email">
              <span>Invitation envoyée à</span>
              <strong>{invitation.email}</strong>
            </div>
            {wrongAccount ? (
              <div className="secure-login" role="alert">
                <ShieldCheck />
                <p>
                  Vous êtes connecté avec <strong>{signedInEmail}</strong>. Déconnectez-vous puis
                  ouvrez à nouveau ce lien avec le bon compte.
                </p>
              </div>
            ) : (
              <form className="login-form" onSubmit={submit}>
                {!hasAccount && !signedInEmail && (
                  <div className="field">
                    <label htmlFor="fullName">Prénom et nom</label>
                    <input
                      id="fullName"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      minLength={2}
                    />
                  </div>
                )}
                {!signedInEmail && (
                  <div className="field">
                    <label htmlFor="password">
                      {hasAccount ? 'Mot de passe de votre compte' : 'Choisissez un mot de passe'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete={hasAccount ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={hasAccount ? undefined : 12}
                    />
                    {!hasAccount && <small>12 caractères minimum.</small>}
                  </div>
                )}
                <button className="primary-button" type="submit" disabled={processing}>
                  {processing ? (
                    'Validation…'
                  ) : (
                    <>
                      Accepter l’invitation <ArrowRight />
                    </>
                  )}
                </button>
              </form>
            )}
            <p className="invitation-privacy">
              <LockKeyhole />{' '}
              {invitation.isStaff
                ? 'Votre accès professionnel restera limité à cette MAM.'
                : 'Seules les personnes autorisées accèdent aux informations de l’enfant.'}
            </p>
          </>
        )}
      </section>
    </main>
  )
}
