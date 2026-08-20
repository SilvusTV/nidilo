import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import {
  ArrowRight,
  Baby,
  BellRing,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  HeartHandshake,
  Image,
  Leaf,
  LockKeyhole,
  Mail,
  MessageCircleHeart,
  MoonStar,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
  UsersRound,
  Zap,
} from 'lucide-react'

const faq = [
  {
    question: 'À quoi sert une application de transmission pour MAM ?',
    answer:
      'Nidilo remplace le cahier papier par un espace partagé et sécurisé. Les professionnelles renseignent les repas, les changes, les siestes, les activités et le petit mot du jour. Les responsables autorisés retrouvent ensuite la fiche publiée de leur enfant.',
  },
  {
    question: 'Nidilo fonctionne-t-il sur téléphone et tablette ?',
    answer:
      'Oui. Nidilo est une application web mobile-first : elle fonctionne depuis un navigateur récent sur téléphone, tablette et ordinateur, sans imposer l’installation d’une application.',
  },
  {
    question: 'Les parents voient-ils les informations des autres enfants ?',
    answer:
      'Non. Chaque responsable accède uniquement aux enfants auxquels il est rattaché. Les autorisations sont vérifiées côté serveur pour chaque consultation et chaque action.',
  },
  {
    question: 'Peut-on saisir rapidement un repas, une sieste ou un change ?',
    answer:
      'Oui. L’accès rapide est conçu pour les tablettes partagées dans les espaces de vie. L’heure est préremplie, l’enfant est choisi en quelques gestes et un commentaire peut être ajouté si nécessaire.',
  },
  {
    question: 'Comment les familles sont-elles prévenues ?',
    answer:
      'Une notification apparaît dans Nidilo dès qu’une fiche est publiée. Chaque utilisateur peut aussi choisir de recevoir les alertes par e-mail ou par SMS.',
  },
  {
    question: 'Nidilo gère-t-il les contrats et la paie ?',
    answer:
      'Pas pour le moment. Nidilo se concentre sur ce qui améliore immédiatement la journée : les transmissions, les informations enfant, l’équipe et le lien avec les familles.',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://nidilo.fr/#organization',
      'name': 'Nidilo',
      'url': 'https://nidilo.fr/',
      'logo': 'https://nidilo.fr/brand/nidilo-mark.svg',
      'email': 'contact@nidilo.fr',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nidilo.fr/#website',
      'url': 'https://nidilo.fr/',
      'name': 'Nidilo',
      'inLanguage': 'fr-FR',
      'publisher': { '@id': 'https://nidilo.fr/#organization' },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://nidilo.fr/#application',
      'name': 'Nidilo',
      'url': 'https://nidilo.fr/',
      'applicationCategory': 'CommunicationApplication',
      'operatingSystem': 'Tout appareil disposant d’un navigateur web récent',
      'inLanguage': 'fr-FR',
      'description':
        'Application de cahier de transmission numérique pour les MAM, les assistantes maternelles et les familles.',
      'audience': [
        { '@type': 'Audience', 'audienceType': 'Maisons d’assistants maternels' },
        { '@type': 'Audience', 'audienceType': 'Assistantes maternelles' },
        { '@type': 'Audience', 'audienceType': 'Parents' },
      ],
      'provider': { '@id': 'https://nidilo.fr/#organization' },
    },
    {
      '@type': 'FAQPage',
      'mainEntity': faq.map((item) => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
      })),
    },
  ],
}

function returnToContactForm(errors: Record<string, string>) {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#contact`
  )

  window.requestAnimationFrame(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const firstInvalidField = Object.keys(errors)
      .map((name) => document.querySelector<HTMLElement>(`#contact [name="${name}"]`))
      .find((field) => field !== null)
    firstInvalidField?.focus({ preventScroll: true })
  })
}

export default function Home({ cspNonce, csrfToken }: { cspNonce: string; csrfToken: string }) {
  return (
    <div className="marketing-page">
      <Head>
        <title>Application MAM et cahier de transmission numérique | Nidilo</title>
        <meta
          name="description"
          content="Nidilo simplifie les transmissions quotidiennes entre MAM, assistantes maternelles et familles : repas, siestes, changes, fiches enfant et notifications."
        />
        <meta
          name="keywords"
          content="application MAM, logiciel MAM, cahier de transmission numérique, assistante maternelle, suivi enfant, transmission parents"
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://nidilo.fr/" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Nidilo" />
        <meta property="og:url" content="https://nidilo.fr/" />
        <meta
          property="og:title"
          content="Nidilo — Le cahier de transmission numérique pensé pour les MAM"
        />
        <meta
          property="og:description"
          content="Moins de papier, des transmissions plus rapides et des familles mieux informées."
        />
        <meta property="og:image" content="https://nidilo.fr/brand/nidilo-og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Nidilo, cahier de transmission numérique pour MAM" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nidilo — Application de transmission pour MAM" />
        <meta
          name="twitter:description"
          content="Le quotidien des enfants, simplement partagé avec les bonnes personnes."
        />
        <meta name="twitter:image" content="https://nidilo.fr/brand/nidilo-og.png" />
        <meta
          name="twitter:image:alt"
          content="Nidilo, cahier de transmission numérique pour MAM"
        />
        <script
          nonce={cspNonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <a className="skip-link" href="#contenu-public">
        Aller au contenu
      </a>

      <header className="marketing-header" id="top">
        <a href="#top" className="marketing-brand" aria-label="Nidilo, accueil">
          <img src="/brand/nidilo-logo.svg" alt="Nidilo" />
        </a>
        <nav aria-label="Navigation principale du site">
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#pour-qui">Pour qui ?</a>
          <a href="#securite">Sécurité</a>
          <a href="#faq">Questions</a>
        </nav>
        <div className="marketing-actions">
          <a href="/login" className="marketing-login">
            Se connecter
          </a>
          <a href="#contact" className="marketing-cta compact">
            Demander une démo
          </a>
        </div>
      </header>

      <main id="contenu-public">
        <section className="marketing-hero" aria-labelledby="marketing-title">
          <div className="marketing-hero-copy">
            <p className="marketing-kicker">
              <Sparkles /> Application de transmission pour les MAM
            </p>
            <h1 id="marketing-title">
              Le cahier de transmission numérique qui laisse plus de temps aux enfants.
            </h1>
            <p className="marketing-lead">
              Repas, siestes, changes, activités et petits mots : les professionnelles renseignent
              la journée en quelques gestes. Les familles retrouvent l’essentiel dans un espace
              doux, clair et sécurisé.
            </p>
            <div className="marketing-hero-actions">
              <a href="#contact" className="marketing-cta">
                Découvrir Nidilo <ArrowRight />
              </a>
              <a href="#fonctionnalites" className="marketing-secondary">
                Voir les fonctionnalités
              </a>
            </div>
            <ul className="marketing-reassurance" aria-label="Points clés">
              <li>
                <Check /> Pensé avec une MAM
              </li>
              <li>
                <Check /> Mobile, tablette et ordinateur
              </li>
              <li>
                <Check /> Accès sur invitation
              </li>
            </ul>
          </div>

          <div className="product-stage" aria-label="Aperçu de Nidilo">
            <div className="product-window">
              <div className="product-window-bar">
                <span />
                <span />
                <span />
                <small>app.nidilo.fr</small>
              </div>
              <div className="product-dashboard">
                <aside>
                  <img src="/brand/nidilo-mark.svg" alt="" />
                  <span className="active">
                    <Zap /> Accès rapide
                  </span>
                  <span>
                    <Baby /> Enfants
                  </span>
                  <span>
                    <UsersRound /> Équipe
                  </span>
                </aside>
                <div className="product-main">
                  <div className="product-greeting">
                    <div>
                      <small>Samedi 15 août</small>
                      <strong>Bonjour Marie 👋</strong>
                    </div>
                    <span>4 enfants aujourd’hui</span>
                  </div>
                  <div className="quick-demo-grid">
                    <article className="meal-demo">
                      <span>🥣</span>
                      <strong>Ajouter un repas</strong>
                      <small>Heure préremplie</small>
                    </article>
                    <article className="nap-demo">
                      <span>🌙</span>
                      <strong>Ajouter une sieste</strong>
                      <small>Début et fin</small>
                    </article>
                    <article className="change-demo">
                      <span>✨</span>
                      <strong>Ajouter un change</strong>
                      <small>En deux gestes</small>
                    </article>
                  </div>
                  <div className="child-demo-list">
                    <small>LES ENFANTS</small>
                    {['Alba B.', 'Lina M.', 'Noé P.'].map((name, index) => (
                      <div key={name}>
                        <span>{name[0]}</span>
                        <strong>{name}</strong>
                        <small>{index === 0 ? 'Fiche en cours' : 'Prêt pour la journée'}</small>
                        <ChevronRight />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-notification">
              <BellRing />
              <span>
                <strong>Fiche de Alba publiée</strong>
                <small>Sa famille vient d’être prévenue.</small>
              </span>
            </div>
          </div>
        </section>

        <section className="marketing-proof" aria-label="Les engagements Nidilo">
          <span>
            <TabletSmartphone /> Mobile-first
          </span>
          <span>
            <ShieldCheck /> Données cloisonnées
          </span>
          <span>
            <Zap /> Saisie rapide
          </span>
          <span>
            <Leaf /> Moins de papier
          </span>
          <span>
            <MoonStar /> Thèmes clair et sombre
          </span>
        </section>

        <section className="paper-section marketing-section" id="fonctionnalites">
          <div className="section-intro centered">
            <p className="marketing-kicker">Du cahier papier à un quotidien plus fluide</p>
            <h2>Une information saisie une fois, utile à toutes les bonnes personnes.</h2>
            <p>
              Nidilo ne cherche pas à ajouter de l’administratif. Il simplifie les gestes qui
              reviennent chaque jour et garde une trace lisible pour les professionnelles comme pour
              les familles.
            </p>
          </div>
          <div className="feature-bento">
            <article className="feature-large">
              <span className="feature-icon">
                <Zap />
              </span>
              <p>Sur le terrain</p>
              <h3>Repas, sieste ou change en quelques secondes</h3>
              <p>
                Depuis une tablette dans la pièce de vie, choisissez l’action puis l’enfant. L’heure
                est déjà renseignée et le commentaire reste facultatif.
              </p>
              <div className="mini-flow" aria-hidden="true">
                <span>1. L’action</span>
                <ChevronRight />
                <span>2. L’enfant</span>
                <ChevronRight />
                <span>3. C’est noté</span>
              </div>
            </article>
            <article>
              <span className="feature-icon peach">
                <ClipboardCheck />
              </span>
              <h3>Une fiche quotidienne complète</h3>
              <p>Humeur, chronologie, activités et note riche réunies au même endroit.</p>
            </article>
            <article>
              <span className="feature-icon blue">
                <CalendarDays />
              </span>
              <h3>Un calendrier pour les familles</h3>
              <p>
                Les parents retrouvent chaque transmission publiée, sans chercher dans leurs
                messages.
              </p>
            </article>
            <article>
              <span className="feature-icon lavender">
                <BellRing />
              </span>
              <h3>Des notifications choisies</h3>
              <p>Dans Nidilo systématiquement, puis par e-mail ou SMS selon les préférences.</p>
            </article>
            <article>
              <span className="feature-icon green">
                <Image />
              </span>
              <h3>Des images plus légères</h3>
              <p>Les médias sont convertis en WebP et rangés par structure puis par enfant.</p>
            </article>
          </div>
        </section>

        <section className="audience-section marketing-section" id="pour-qui">
          <div className="section-intro">
            <p className="marketing-kicker">Un espace pour chacun</p>
            <h2>La même journée, avec le bon niveau d’information.</h2>
            <p>
              Chaque rôle dispose d’une interface utile et de droits vérifiés côté serveur. Rien de
              superflu, rien qui ne le concerne pas.
            </p>
          </div>
          <div className="audience-grid">
            <article>
              <div className="audience-number">01</div>
              <UsersRound />
              <h3>Responsables de MAM</h3>
              <p>
                Créez les enfants, invitez les familles, organisez l’équipe et personnalisez votre
                espace.
              </p>
              <ul>
                <li>
                  <Check /> Personnel et rôles
                </li>
                <li>
                  <Check /> Enfants et responsables
                </li>
                <li>
                  <Check /> Archives maîtrisées
                </li>
              </ul>
            </article>
            <article className="featured">
              <div className="audience-number">02</div>
              <Zap />
              <h3>Assistantes maternelles</h3>
              <p>
                Renseignez les événements au moment où ils arrivent et finalisez une fiche claire.
              </p>
              <ul>
                <li>
                  <Check /> Accès rapide sur tablette
                </li>
                <li>
                  <Check /> Enfants affectés ou partagés
                </li>
                <li>
                  <Check /> Éditeur de notes riche
                </li>
              </ul>
            </article>
            <article>
              <div className="audience-number">03</div>
              <HeartHandshake />
              <h3>Parents et proches</h3>
              <p>
                Consultez les journées, complétez les informations utiles et invitez un proche
                autorisé.
              </p>
              <ul>
                <li>
                  <Check /> Calendrier des fiches
                </li>
                <li>
                  <Check /> Habitudes et contacts utiles
                </li>
                <li>
                  <Check /> Alertes personnalisables
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className="family-section marketing-section">
          <div className="family-visual">
            <div className="phone-frame">
              <div className="phone-speaker" />
              <div className="phone-content">
                <img src="/brand/nidilo-mark.svg" alt="" />
                <small>MAM Les Petits Explorateurs</small>
                <h3>La journée de Alba</h3>
                <span className="published-pill">
                  <Check /> Publiée à 17:42
                </span>
                <div className="day-summary">
                  <div>
                    <span>😊</span>
                    <small>Humeur</small>
                    <strong>Sereine</strong>
                  </div>
                  <div>
                    <span>🌙</span>
                    <small>Sieste</small>
                    <strong>1 h 35</strong>
                  </div>
                  <div>
                    <span>🥣</span>
                    <small>Repas</small>
                    <strong>Très bien</strong>
                  </div>
                </div>
                <div className="parent-note">
                  <MessageCircleHeart />
                  <p>
                    <strong>Le petit mot du jour</strong>Alba a adoré la peinture avec les copains.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="family-copy">
            <p className="marketing-kicker">Pour les familles</p>
            <h2>Le soir, l’essentiel est déjà là.</h2>
            <p>
              La fiche publiée rassemble les moments importants de la journée dans un format
              agréable à relire. Les parents sont informés sans interrompre le rythme de la MAM.
            </p>
            <div className="family-points">
              <div>
                <BellRing />
                <span>
                  <strong>Prévenus au bon moment</strong>Une alerte dès que la transmission est
                  prête.
                </span>
              </div>
              <div>
                <CalendarDays />
                <span>
                  <strong>Une histoire qui reste lisible</strong>Les fiches passées sont classées
                  dans un calendrier.
                </span>
              </div>
              <div>
                <HeartHandshake />
                <span>
                  <strong>Les proches bien entourés</strong>Parents et responsables autorisés
                  partagent la bonne information.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="security-section marketing-section" id="securite">
          <div className="security-copy">
            <p className="marketing-kicker light">Sécurité et confidentialité</p>
            <h2>Les données des enfants ne se mélangent jamais.</h2>
            <p>
              Nidilo a été conçu dès le départ autour des structures, des enfants et de leurs
              responsables autorisés. Les contrôles d’accès sont appliqués sur le serveur, pas
              seulement masqués dans l’interface.
            </p>
            <a href="#contact" className="security-link">
              Parler de vos besoins <ArrowRight />
            </a>
          </div>
          <div className="security-grid">
            <article>
              <LockKeyhole />
              <strong>Identifiants UUID</strong>
              <span>Aucun identifiant séquentiel exposé dans les URL.</span>
            </article>
            <article>
              <ShieldCheck />
              <strong>Isolation par MAM</strong>
              <span>Équipe et familles restent dans leur périmètre autorisé.</span>
            </article>
            <article>
              <Image />
              <strong>Stockage privé</strong>
              <span>Objets compartimentés par structure et par enfant.</span>
            </article>
            <article>
              <Clock3 />
              <strong>Archivage prévu</strong>
              <span>Restauration puis purge selon une politique à valider juridiquement.</span>
            </article>
          </div>
        </section>

        <section className="faq-section marketing-section" id="faq">
          <div className="section-intro centered">
            <p className="marketing-kicker">Questions fréquentes</p>
            <h2>Comprendre Nidilo avant de nous contacter.</h2>
          </div>
          <div className="faq-list">
            {faq.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>
                  {item.question}
                  <span>+</span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="contact-section marketing-section" id="contact">
          <div className="contact-copy">
            <p className="marketing-kicker light">Découvrir Nidilo</p>
            <h2>Votre MAM mérite un quotidien plus simple.</h2>
            <p>
              Parlez-nous de votre organisation et de vos habitudes de transmission. Nous vous
              présenterons Nidilo et préparerons un espace adapté à votre équipe.
            </p>
            <div className="contact-promises">
              <span>
                <Check /> Échange sans engagement
              </span>
              <span>
                <Check /> Démonstration adaptée à votre MAM
              </span>
              <span>
                <Check /> Réponse humaine, sans démarchage automatique
              </span>
            </div>
            <a href="mailto:contact@nidilo.fr">
              <Mail /> contact@nidilo.fr
            </a>
          </div>
          <Form
            route="contact.store"
            className="marketing-contact-form"
            resetOnSuccess
            onError={returnToContactForm}
          >
            {({ errors, processing, wasSuccessful }) => (
              <>
                <input type="hidden" name="_csrf" value={csrfToken} />
                <div className="contact-form-heading">
                  <p>Demander une présentation</p>
                  <span>Quelques informations suffisent.</span>
                </div>
                <div className="contact-form-grid">
                  <label>
                    Nom et prénom
                    <input name="fullName" autoComplete="name" required />
                    {errors.fullName && <small>{errors.fullName}</small>}
                  </label>
                  <label>
                    Adresse e-mail
                    <input
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                    />
                    {errors.email && <small>{errors.email}</small>}
                  </label>
                  <label>
                    Téléphone <span>facultatif</span>
                    <input name="phone" type="tel" inputMode="tel" autoComplete="tel" />
                    {errors.phone && <small>{errors.phone}</small>}
                  </label>
                  <label>
                    Nom de la structure <span>facultatif</span>
                    <input name="organization" autoComplete="organization" />
                    {errors.organization && <small>{errors.organization}</small>}
                  </label>
                </div>
                <label>
                  Vous êtes…
                  <select name="role" defaultValue="mam" required>
                    <option value="mam">Responsable de MAM</option>
                    <option value="assistant">Assistant(e) maternel(le)</option>
                    <option value="parent">Parent</option>
                    <option value="partner">Partenaire</option>
                    <option value="other">Autre</option>
                  </select>
                </label>
                <label>
                  Votre message
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Nombre d’enfants, taille de l’équipe, fonctionnement actuel…"
                    required
                  />
                  {errors.message && <small>{errors.message}</small>}
                </label>
                <label className="contact-honeypot" aria-hidden="true">
                  Votre site internet
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                <label className="consent-field">
                  <input name="consent" type="checkbox" value="1" required />
                  <span>
                    J’accepte que Nidilo utilise ces informations pour répondre à ma demande. Elles
                    sont conservées au maximum 12 mois et ne sont pas revendues.{' '}
                    <a href="/confidentialite">En savoir plus</a>.
                  </span>
                </label>
                {errors.consent && <small className="contact-error">{errors.consent}</small>}
                <button
                  className="marketing-cta submit-contact"
                  type="submit"
                  disabled={processing}
                >
                  {processing
                    ? 'Envoi en cours…'
                    : wasSuccessful
                      ? 'Demande envoyée'
                      : 'Envoyer ma demande'}
                  {!processing && <ArrowRight />}
                </button>
              </>
            )}
          </Form>
        </section>
      </main>

      <footer className="marketing-footer">
        <div>
          <img src="/brand/nidilo-logo.svg" alt="Nidilo" />
          <p>Chaque jour compte, dès le premier.</p>
        </div>
        <nav aria-label="Navigation de pied de page">
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#pour-qui">Professionnelles et familles</a>
          <a href="#securite">Sécurité</a>
          <a href="#contact">Contact</a>
          <a href="/confidentialite">Confidentialité</a>
          <a href="/mentions-legales">Mentions légales</a>
          <a href="/cgu">CGU</a>
          <a href="/login">Connexion</a>
        </nav>
        <p>© {new Date().getFullYear()} Nidilo · Conçu avec soin pour les MAM et les familles.</p>
      </footer>
    </div>
  )
}
