# Nidilo — audit du service, consentement et mesure produit

Mise à jour : 1er septembre 2026.

## Synthèse du service

Nidilo est une application AdonisJS, React et Inertia destinée aux MAM, à leur personnel et aux responsables légaux. Elle couvre l’authentification avec MFA, la gestion des établissements et des accès, les dossiers enfants, la saisie rapide, les fiches quotidiennes, l’historique, les responsables, les notifications et les réglages de sécurité.

Le service traite des données particulièrement sensibles : identité et date de naissance d’enfants, santé et allergies, autorisations, contacts familiaux, notes quotidiennes, photos et liens entre professionnels et responsables. La télémétrie ne doit donc jamais reproduire le contenu métier ni permettre de retrouver directement une personne.

Points solides observés dans l’application : isolation des données par MAM dans les requêtes, contrôle d’accès centralisé, sessions régénérées après authentification, révocation des sessions, MFA, secrets MFA chiffrés, codes de récupération hachés, CSRF, CSP, limitation des tentatives, captcha progressif, archivage puis purge planifiée des enfants et journaux d’audit.

Points à maintenir sous surveillance : tests récurrents de l’isolation multi-tenant, vérification contractuelle des sous-traitants, revue régulière des durées de conservation, tests de restauration des sauvegardes, suivi des erreurs de stockage média et revue juridique avant ouverture à grande échelle.

## Choix de confidentialité

La mesure est strictement conditionnée à un accord explicite. Le premier niveau propose avec la même visibilité « Tout refuser », « Personnaliser » et « Tout accepter ». Le choix est modifiable depuis le bouton « Cookies » présent sur chaque page et expire après 183 jours.

Catégories proposées :

- fonctionnement essentiel, toujours actif ;
- mesure d’audience et d’usage ;
- rejeu de session protégé, dépendant du consentement analytique.

Avant consentement, le SDK PostHog n’est pas initialisé. Un refus n’empêche aucune fonction. Lors d’un retrait, la capture et le rejeu sont arrêtés, l’identité technique PostHog est réinitialisée et la persistance `nidilo_analytics` est supprimée.

Le système ne transmet à PostHog ni nom, ni e-mail, ni téléphone, ni identifiant utilisateur, MAM ou espace de travail. Aucun profil de personne PostHog n’est créé (`person_profiles: never`). Une catégorie d’acteur générique (`guardian`, `professional_admin`, `professional_assistant`, `super_admin` ou `member`) permet de comparer les usages sans transmettre le rôle exact ni l’identité. La mesure reste anonyme par navigateur et ne permet donc pas une analyse nominative ou multi-appareil, ce qui est volontaire pour réduire le risque associé aux données enfant.

## Protections appliquées aux données

- hébergement PostHog Cloud UE et collecte via les domaines européens ;
- anonymisation IP activée dans le projet PostHog ;
- paramètres de requête et fragments supprimés des URL ;
- identifiants numériques, UUID, dates et jetons normalisés dans les chemins ;
- valeurs des formulaires jamais envoyées ;
- textes et attributs HTML masqués ;
- champs de saisie intégralement masqués dans les replays ;
- zones privées de l’application exclues des replays ;
- corps et en-têtes réseau, console, polices, JSON-LD et canvas non enregistrés ;
- liste de refus de propriétés sensibles et nettoyage final de chaque événement avant envoi ;
- conservation cible : 12 mois pour les événements, 30 jours pour les replays.

## Dictionnaire des événements

Chaque événement porte `app = nidilo` et `environment = prod` ou `environment = local`.

| Événement | Finalité | Propriétés applicatives autorisées |
| --- | --- | --- |
| `$pageview` | audience et navigation | URL normalisée, chemin normalisé, zone fonctionnelle |
| `ui_interaction` | usage des liens et boutons | type d’interaction, chemin cible normalisé, fonctionnalité |
| `form_submitted` | actions abouties | chemin normalisé, méthode HTTP, fonctionnalité ; aucune valeur saisie |
| `consent_updated` | contrôle des activations consenties | catégories activées et version du consentement |
| `$pageleave` | fin de navigation et durée de session | propriétés techniques PostHog nettoyées |
| `$exception` | erreurs du navigateur | métadonnées techniques nettoyées ; messages et contenus sensibles refusés |
| `$web_vitals` | performance perçue | métriques techniques PostHog |
| `$rageclick`, `$dead_click` | points de friction | propriétés techniques PostHog nettoyées |
| `login_succeeded` | authentification réellement aboutie | méthode : mot de passe ou MFA |
| `invitation_accepted` | conversion d’une invitation | catégorie générique, création de compte, parcours d’onboarding |
| `child_created` | activation du dossier enfant | catégorie d’acteur générique |
| `guardian_invited` | mise en relation avec un responsable | catégorie générique de l’émetteur |
| `staff_invited` | développement de l’équipe | catégorie générique invitée |
| `quick_entry_recorded` | adoption de la saisie rapide | type générique de saisie |
| `daily_report_saved` | réalisation de la fiche quotidienne | état générique et première publication |
| `notification_preference_updated` | configuration des notifications | canaux activés sous forme de booléens |
| `mam_created` | activation d’un nouvel établissement | aucune donnée d’établissement |

Les neuf événements métier sont déclenchés uniquement après confirmation du serveur. Ils sont transportés une seule fois jusqu’au navigateur, dédupliqués, puis envoyés seulement si la mesure d’audience est consentie. Aucune valeur saisie ni donnée métier n’entre dans leur charge utile.

Les refus initiaux ne sont pas transmis, puisqu’une mesure de ce refus avant consentement constituerait elle-même une collecte non consentie. Le graphique de consentement mesure donc les activations et modifications reçues, pas un taux global d’acceptation.

## Zones fonctionnelles normalisées

`marketing`, `authentication`, `account_recovery`, `onboarding`, `dashboard`, `quick_entry`, `daily_reports`, `report_history`, `child_profile`, `guardians`, `children`, `staff`, `notifications`, `account_security`, `settings`, `super_admin`, `legal` et `other`.

Ces catégories donnent une lecture produit exploitable sans exposer les identifiants présents dans les URL.

## Tableaux de bord PostHog

- [Nidilo — Pilotage & acquisition](https://eu.posthog.com/project/263106/dashboard/927472) : navigateurs actifs, sessions, pages vues et zones visitées, ventilés par environnement ;
- [Nidilo — Usage produit](https://eu.posthog.com/project/263106/dashboard/927473) : fonctionnalités, interactions, formulaires, parcours de production et rétention hebdomadaire ;
- [Nidilo — Qualité & confidentialité](https://eu.posthog.com/project/263106/dashboard/927474) : erreurs, clics frustrants, Web Vitals et consentements analytiques activés.
- [Nidilo — Conversions métier](https://eu.posthog.com/project/263106/dashboard/927657) : connexion réussie, acceptation d’invitation, création d’enfant suivie d’une invitation responsable, saisie rapide enregistrée et fiche quotidienne sauvegardée.

Les entonnoirs sont ventilés par `environment`, et les dashboards d’usage incluent désormais la catégorie d’acteur ainsi qu’une vue consolidée des succès métier confirmés. Les événements de validation portent `environment = local` et `test_event = true`. Les vues de production restent naturellement vides jusqu’au premier trafic consenti après déploiement.

Les alertes automatiques doivent être activées après l’arrivée d’un volume de production représentatif. Les seuils recommandés sont : hausse des erreurs navigateur, chute des connexions réussies, chute des fiches sauvegardées et dégradation du taux d’acceptation des invitations. Les activer avant trafic réel produirait des alertes trompeuses basées sur les seuls événements de validation locale.

## Exploitation recommandée

1. Comparer chaque semaine les navigateurs actifs, sessions et zones fonctionnelles en filtrant `environment = prod`.
2. Repérer les fonctionnalités très visitées mais peu interactives, puis examiner les parcours et replays consentis correspondants.
3. Surveiller erreurs, clics répétés et clics sans effet avant et après chaque mise en production.
4. Lire la rétention sur plusieurs semaines seulement après un volume suffisant ; ne pas conclure sur quelques navigateurs.
5. Documenter tout nouvel événement avant développement, limiter ses propriétés à une liste blanche et interdire systématiquement les contenus métier.
6. Refaire une revue confidentialité et des tableaux après un mois de trafic réel afin de supprimer les mesures inutiles et d’ajouter uniquement les conversions métier indispensables.

## Mise en production

Les variables publiques suivantes doivent être disponibles au moment de la compilation du client : `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` et `VITE_POSTHOG_UI_HOST`. Les exemples d’environnement contiennent les valeurs du projet européen. La clé de projet PostHog est une clé publique de collecte, pas une clé d’administration.

La CSP autorise uniquement les domaines européens nécessaires à PostHog. Après déploiement, vérifier dans le navigateur qu’aucune requête PostHog n’est émise avant consentement, puis contrôler l’arrivée d’un `$pageview` portant `environment = prod` après acceptation.
