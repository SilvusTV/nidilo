import { Head } from '@inertiajs/react'
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'

type Identity = { name: string; address: string; email: string; phone: string }
type Props = {
  page: 'mentions-legales' | 'confidentialite' | 'cgu' | 'sous-traitants'
  publisher: Identity
  host: { name: string; address: string }
  identityComplete: boolean
  updatedAt: string
}

const titles = {
  'mentions-legales': 'Mentions légales',
  'confidentialite': 'Politique de confidentialité',
  'cgu': 'Conditions générales d’utilisation',
  'sous-traitants': 'Sous-traitants de Nidilo',
}

export default function LegalPage(props: Props) {
  const title = titles[props.page]
  return (
    <main className="legal-page">
      <Head title={title}>
        <meta name="description" content={`${title} de Nidilo, service numérique pour les MAM.`} />
      </Head>
      <article className="legal-document">
        <a className="back-link" href="/">
          <ArrowLeft /> Retour à Nidilo
        </a>
        <header>
          <img src="/brand/nidilo-logo.svg" alt="Nidilo" />
          <p className="eyebrow accent">Informations juridiques</p>
          <h1>{title}</h1>
          <p>Version pilote · mise à jour le {props.updatedAt}</p>
        </header>
        {!props.identityComplete && (
          <aside className="legal-warning" role="alert">
            <ShieldCheck />
            <p>
              <strong>Configuration requise avant ouverture au public.</strong>
              <br />
              L’identité complète de l’éditeur et de l’hébergeur doit être renseignée dans
              l’environnement de production.
            </p>
          </aside>
        )}
        {props.page === 'mentions-legales' && <LegalNotices {...props} />}
        {props.page === 'confidentialite' && <Privacy publisher={props.publisher} />}
        {props.page === 'cgu' && <Terms publisher={props.publisher} />}
        {props.page === 'sous-traitants' && <Subprocessors />}
        <nav className="legal-nav" aria-label="Documents juridiques">
          {Object.entries(titles).map(([key, label]) => (
            <a key={key} href={`/${key}`}>
              {label}
            </a>
          ))}
        </nav>
      </article>
    </main>
  )
}

function LegalNotices({ publisher, host }: Props) {
  return (
    <div className="legal-content">
      <Section title="Éditeur et directeur de la publication">
        <p>
          Nidilo est édité en nom propre par{' '}
          <strong>{publisher.name || '[nom légal à renseigner]'}</strong>.
        </p>
        <dl>
          <dt>Adresse</dt>
          <dd>{publisher.address || '[adresse postale à renseigner]'}</dd>
          <dt>E-mail</dt>
          <dd>
            <a href={`mailto:${publisher.email}`}>{publisher.email}</a>
          </dd>
          <dt>Téléphone</dt>
          <dd>{publisher.phone || '[numéro à renseigner]'}</dd>
        </dl>
        <p>Le directeur de la publication est l’éditeur indiqué ci-dessus.</p>
      </Section>
      <Section title="Hébergement">
        <p>
          Le site et les données du pilote sont hébergés par{' '}
          <strong>{host.name || '[hébergeur à renseigner]'}</strong>,{' '}
          {host.address || '[adresse de l’hébergeur à renseigner]'}.
        </p>
      </Section>
      <Section title="Propriété intellectuelle">
        <p>
          La marque, les logos, textes, interfaces et éléments graphiques de Nidilo sont protégés.
          Toute reproduction ou réutilisation non autorisée est interdite, hors exceptions prévues
          par la loi.
        </p>
      </Section>
      <Section title="Contact">
        <p>
          Pour signaler un contenu ou contacter l’éditeur :{' '}
          <a href={`mailto:${publisher.email}`}>{publisher.email}</a>.
        </p>
      </Section>
    </div>
  )
}

function Privacy({ publisher }: { publisher: Identity }) {
  return (
    <div className="legal-content">
      <Section title="Qui est responsable de vos données ?">
        <p>
          <strong>
            Pour les dossiers enfants, transmissions, responsables et membres du personnel
          </strong>
          , l’établissement d’accueil qui utilise Nidilo détermine les finalités et agit comme
          responsable du traitement. L’éditeur de Nidilo agit comme sous-traitant technique,
          uniquement sur les instructions documentées de l’établissement.
        </p>
        <p>
          <strong>
            Pour le formulaire de contact, la sécurité des comptes, l’administration du pilote et la
            relation avec les établissements
          </strong>
          , l’éditeur individuel de Nidilo, {publisher.name || '[nom à renseigner]'}, agit comme
          responsable du traitement.
        </p>
      </Section>
      <Section title="Données utilisées pendant le pilote">
        <ul>
          <li>identité et coordonnées des utilisateurs invités ;</li>
          <li>
            identité de l’enfant, dates d’accueil, habitudes ordinaires et contacts autorisés ;
          </li>
          <li>
            transmissions quotidiennes : repas, siestes, changes, humeur, activités et notes ;
          </li>
          <li>invitations, préférences de notification et historiques de livraison ;</li>
          <li>
            données techniques de sécurité : événements d’accès, compteurs anti-abus et journaux
            d’audit ;
          </li>
          <li>données du formulaire de contact.</li>
        </ul>
        <p>
          <strong>Les fonctions médicales sont désactivées pendant le pilote.</strong> Il est
          interdit d’inscrire allergies, pathologies, traitements, ordonnances ou autres
          informations médicales dans les notes libres.
        </p>
      </Section>
      <Section title="Finalités et bases juridiques">
        <ul>
          <li>
            fournir l’espace de transmission demandé par l’établissement : exécution du contrat ou
            de la convention pilote et instructions de l’établissement ;
          </li>
          <li>
            gérer les comptes, invitations et sécurité : exécution du service et intérêt légitime à
            protéger les accès ;
          </li>
          <li>
            répondre aux demandes de contact : mesures précontractuelles ou intérêt légitime à
            répondre ;
          </li>
          <li>
            respecter une obligation légale et établir la preuve d’une opération lorsque cela est
            nécessaire.
          </li>
        </ul>
        <p>
          L’établissement reste chargé de déterminer et documenter la base juridique applicable aux
          données qu’il fait traiter dans Nidilo et d’informer les familles et son personnel.
        </p>
      </Section>
      <Section title="Personnes pouvant accéder aux données">
        <p>
          Seuls les utilisateurs autorisés de l’établissement, les responsables reliés à l’enfant
          et, lorsque cela est strictement nécessaire, l’éditeur pour la maintenance ou le support
          peuvent y accéder. Les habilitations sont vérifiées côté serveur. Les données ne sont ni
          revendues ni utilisées pour entraîner un modèle publicitaire.
        </p>
      </Section>
      <Section title="Sous-traitants et localisation">
        <p>
          Nidilo utilise des prestataires techniques pour l’hébergement du serveur, l’envoi des
          e-mails et SMS, et éventuellement les sauvegardes. La liste tenue à jour figure sur la
          page <a href="/sous-traitants">Sous-traitants de Nidilo</a>. Les conditions exactes de
          localisation et les garanties du prestataire d’hébergement doivent être renseignées avant
          le pilote.
        </p>
      </Section>
      <Section title="Durées">
        <ul>
          <li>
            dossier enfant : pendant la prise en charge, puis archivage jusqu’à 12 mois avant
            suppression ;
          </li>
          <li>
            comptes et habilitations : pendant la durée de l’accès, puis suppression ou
            anonymisation selon les obligations applicables ;
          </li>
          <li>notifications et journaux d’audit : 12 mois ;</li>
          <li>demandes de contact : 12 mois ;</li>
          <li>
            jetons de sécurité et compteurs anti-abus : quelques minutes à 48 heures selon leur
            fonction.
          </li>
        </ul>
        <p>
          Une durée différente imposée par la loi ou nécessaire à l’établissement d’un droit peut
          conduire à un archivage intermédiaire strictement limité.
        </p>
      </Section>
      <Section title="Vos droits">
        <p>
          Pour les informations concernant un enfant ou l’activité de l’établissement, contactez
          d’abord l’établissement d’accueil, responsable du traitement. Nidilo l’assistera pour
          répondre.
        </p>
        <p>
          Pour les traitements propres à Nidilo, écrivez à{' '}
          <a href={`mailto:${publisher.email}`}>{publisher.email}</a>. Vous pouvez demander l’accès,
          la rectification, l’effacement ou la limitation de vos données et, selon la base
          juridique, vous opposer au traitement ou demander la portabilité. Vous pouvez également
          déposer une réclamation auprès de la{' '}
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">
            CNIL <ExternalLink />
          </a>
          .
        </p>
      </Section>
      <Section title="Cookies et stockage local">
        <p>
          Nidilo utilise uniquement les cookies indispensables à la session, à la protection CSRF et
          à la sécurité de l’authentification. Le choix du thème clair ou sombre est conservé
          localement dans le navigateur. Aucun traceur publicitaire ou de mesure d’audience n’est
          activé pendant le pilote ; aucun bandeau de consentement n’est donc affiché.
        </p>
      </Section>
      <Section title="Sécurité et incidents">
        <p>
          Les accès sont individualisés, protégés contre les tentatives automatisées et soumis à une
          double authentification pour les administrateurs. En cas de violation, Nidilo informe
          l’établissement concerné dans les meilleurs délais afin qu’il puisse évaluer les risques
          et, si nécessaire, accomplir les notifications réglementaires.
        </p>
      </Section>
    </div>
  )
}

function Terms({ publisher }: { publisher: Identity }) {
  return (
    <div className="legal-content">
      <Section title="Objet">
        <p>
          Ces conditions encadrent l’utilisation de la version pilote de Nidilo, service web sur
          invitation destiné aux établissements d’accueil du jeune enfant, à leur personnel et aux
          responsables autorisés.
        </p>
      </Section>
      <Section title="Accès au service">
        <p>
          Chaque compte est personnel. L’utilisateur protège son mot de passe et son second facteur,
          ne partage pas sa session et signale rapidement tout accès suspect. L’établissement
          administre les habilitations de son équipe et des familles.
        </p>
      </Section>
      <Section title="Règles du pilote">
        <ul>
          <li>utiliser Nidilo uniquement dans le cadre de l’établissement pilote ;</li>
          <li>ne saisir que les informations nécessaires aux transmissions quotidiennes ;</li>
          <li>
            ne saisir aucune donnée médicale pendant le pilote, y compris dans les notes libres ;
          </li>
          <li>
            ne pas détourner les accès, tenter de consulter un autre enfant ou extraire massivement
            les données ;
          </li>
          <li>respecter les droits des enfants, familles, collègues et tiers.</li>
        </ul>
      </Section>
      <Section title="Responsabilités respectives">
        <p>
          L’établissement décide des données saisies, informe les personnes, choisit les
          utilisateurs autorisés et reste responsable du traitement métier. Nidilo fournit et
          sécurise l’outil selon la convention pilote et l’accord de sous-traitance. Les
          utilisateurs restent responsables de l’exactitude et de la licéité des contenus qu’ils
          saisissent.
        </p>
      </Section>
      <Section title="Disponibilité et évolution">
        <p>
          La version pilote est susceptible d’évoluer. Des interruptions peuvent intervenir pour
          maintenance, sécurité ou correction urgente. Nidilo met en œuvre des moyens raisonnables
          pour préserver la disponibilité et l’intégrité des données, sans promettre une
          disponibilité continue tant qu’aucun niveau de service spécifique n’a été convenu.
        </p>
      </Section>
      <Section title="Suspension et fin d’accès">
        <p>
          Un accès peut être suspendu en cas de risque de sécurité, usage illicite ou violation
          grave de ces conditions. À la fin du pilote, les données sont restituées ou supprimées
          selon les instructions de l’établissement et les délais prévus par l’accord de
          sous-traitance.
        </p>
      </Section>
      <Section title="Données personnelles">
        <p>
          La politique de confidentialité et l’accord signé avec l’établissement complètent ces
          conditions. Pour toute question :{' '}
          <a href={`mailto:${publisher.email}`}>{publisher.email}</a>.
        </p>
      </Section>
      <Section title="Droit applicable">
        <p>
          Ces conditions sont soumises au droit français. Les parties recherchent d’abord une
          solution amiable avant toute action, sans priver un consommateur des règles impératives
          qui lui sont applicables.
        </p>
      </Section>
    </div>
  )
}

function Subprocessors() {
  return (
    <div className="legal-content">
      <Section title="Liste pour le pilote">
        <div className="legal-table" role="table">
          <div role="row">
            <strong>Prestataire</strong>
            <strong>Fonction</strong>
            <strong>Localisation / garanties</strong>
          </div>
          <div role="row">
            <span>Brevo / Sendinblue SAS</span>
            <span>E-mails et SMS transactionnels</span>
            <span>
              Prestataire français ; conditions et sous-traitants à vérifier dans le compte Brevo
            </span>
          </div>
          <div role="row">
            <span>Hébergeur du serveur</span>
            <span>Application, PostgreSQL, Redis et stockage MinIO</span>
            <span>À compléter avant ouverture du pilote</span>
          </div>
        </div>
      </Section>
      <Section title="Évolution de la liste">
        <p>
          L’établissement donne une autorisation générale au recours aux sous-traitants listés dans
          l’accord pilote. Nidilo l’informe par e-mail avant tout ajout ou remplacement significatif
          et lui laisse un délai raisonnable pour émettre une objection documentée.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}
