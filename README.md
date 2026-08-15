# Nidilo

**Chaque jour compte, dès le premier.**

Portail mobile-first pour les maisons d’assistantes maternelles et les familles, développé avec AdonisJS 7, Inertia, React, PostgreSQL et un stockage objet compatible S3.

En local, le stockage S3 est fourni par **MiniO** dans Docker. Le passage en production pourra se faire vers un fournisseur S3 européen sans modifier l’organisation des objets.

La politique de conservation préparatoire est documentée dans [`docs/politique-conservation-donnees.md`](docs/politique-conservation-donnees.md).

## Démarrage local

```bash
docker compose up -d postgres minio redis
npm run migration:run
node ace db:seed
npm run dev
```

Le portail est disponible sur `http://localhost:3333`. Le seeder local crée trois accès de démonstration :

- Super Admin : `superadmin@nidilo.test` / `ChangeMe-Super-2026!`
- Admin de MAM : `admin@nidilo.test` / `ChangeMe-2026!`
- Parent d’Alba : `parent@nidilo.test` / `ChangeMe-Parent-2026!`

Ces mots de passe sont réservés au développement et doivent être remplacés hors environnement local.

En développement, `QUEUE_DRIVER=sync` facilite le débogage. Sans clé Brevo, les envois externes sont ignorés proprement. En production, utiliser `QUEUE_DRIVER=redis` et démarrer le service `worker` fourni par Docker Compose.

Pour exécuter l’ensemble dans Docker :

```bash
docker compose up --build
```

Pour le pilote en production, utiliser `compose.production.yml` et placer les valeurs de
`.env.production.example` dans un fichier `.env` non versionné :

```bash
docker compose -f compose.production.yml up -d --build
```

Cette variante expose uniquement Caddy sur les ports 80/443. PostgreSQL, Redis, MinIO et la console
MinIO restent accessibles seulement sur le réseau Docker interne. `HEALTH_DATA_ENABLED=false` y est
forcé pour empêcher l’activation accidentelle des fonctions médicales pendant le pilote.

## Modèle d’accès

- `super_admin` crée et suspend les MAM et invite leur premier administrateur.
- `admin` gère son établissement, les membres, les enfants et leurs affectations. Une personne peut cumuler les fonctions admin et AM via son rôle d’administration.
- `assistant` renseigne les enfants de sa MAM, soit tous, soit uniquement ceux affectés selon `assignment_mode`.
- `parent` ne lit que les enfants reliés dans `child_guardians`. S’il possède `can_invite`, il peut inviter directement un autre responsable ; la MAM est notifiée sans étape d’approbation.
- Chaque contrôle sensible est refait côté serveur. Un filtrage visuel React n’est jamais considéré comme une autorisation.

Tous les identifiants métier sont des UUID. Le seul identifiant séquentiel est celui du journal d’audit interne, jamais exposé dans les URL.

## Périmètre MVP actuel

- L’admin configure la MAM, crée les dossiers enfants, complète leurs informations et invite les responsables.
- L’admin invite les AM ou d’autres administratrices, modifie leur rôle et peut suspendre leur accès. Le rôle admin inclut toutes les capacités de saisie d’une AM.
- L’admin et les AM remplissent les transmissions quotidiennes.
- La page **Accès rapide** est pensée pour une tablette partagée dans la MAM : Repas, Sieste terminée ou Change ouvrent une modale courte. La sieste contient son heure de début et son heure de fin préremplie.
- Les saisies rapides sont historisées séparément, protégées contre les doubles envois et automatiquement visibles dans la fiche du jour.
- Les parents ne voient les saisies rapides qu’avec une fiche publiée concernant leur enfant.
- Le Super Admin dispose d’une vue dédiée pour créer une MAM, inviter son premier admin, consulter ses effectifs et suspendre ou réactiver l’établissement.
- Le portail parent regroupe les informations de chaque enfant, un calendrier mensuel des fiches publiées et un accès en lecture à chaque transmission historique.
- La publication d’une fiche crée automatiquement une notification dans Nidilo. Chaque parent peut compléter cette alerte par e-mail ou SMS depuis ses préférences.

Les contrats, la paie, la facturation et la gestion comptable sont explicitement hors de ce MVP. Ils ne seront étudiés qu’après validation des usages principaux et de leurs contraintes juridiques.

## Images

`ImageStorageService` valide la taille et le décodage, corrige l’orientation, limite à 1800×1800, convertit en WebP qualité 82 et range les objets sous :

`mams/{mam_uuid}/children/{child_uuid}/{media_uuid}.webp`

Le bucket doit rester privé. Les lectures devront passer par des URL signées de courte durée après contrôle d’autorisation.

Les logos suivent le préfixe `mams/{mam_uuid}/branding/`, sont convertis en WebP puis servis par l’application après contrôle de la session. Les images enfant restent sous leur préfixe dédié.

## Notifications

- Une notification interne est toujours enregistrée, indépendamment des préférences personnelles.
- L’e-mail et le SMS sont optionnels, par utilisateur et par catégorie.
- Les heures calmes retardent les envois externes non urgents.
- Redis porte la file avec reprise sur erreur. Les e-mails et SMS transactionnels utilisent l’API Brevo. La clé `BREVO_API_KEY` reste exclusivement côté serveur.
- Les retours de livraison Brevo sont reçus sur `/webhooks/brevo`, protégé par le jeton Bearer `BREVO_WEBHOOK_TOKEN`.
- Le nom d’expéditeur SMS est configurable avec `BREVO_SMS_SENDER` et vaut `NIDILO` par défaut.
- Les invitations expirent après 7 jours et n’exposent qu’un jeton aléatoire à usage unique. L’acceptation crée ou rattache le compte, donne accès à l’enfant et notifie les administrateurs de la MAM.

### Configuration Brevo

1. Vérifier `nidilo.fr` et l’expéditeur `notifications@nidilo.fr` dans Brevo, puis configurer SPF, DKIM et DMARC dans le DNS.
2. Renseigner `BREVO_API_KEY` uniquement dans l’environnement du serveur.
3. Générer une valeur aléatoire longue pour `BREVO_WEBHOOK_TOKEN`.
4. Créer dans Brevo les webhooks transactionnels e-mail et SMS vers `https://nidilo.fr/webhooks/brevo`, avec une authentification Bearer utilisant ce même jeton.
5. Activer au minimum les événements d’acceptation, livraison, blocage, rejet et rebond. Nidilo les rattache aux envois grâce aux identifiants et tags Brevo.

Les SMS utilisent le type `transactional`, l’expéditeur `NIDILO` et restent sous 160 caractères. Ils ne contiennent aucun détail de la fiche : seulement une invitation à consulter l’espace sécurisé.

## Sécurité des comptes

- Les échecs de connexion sont limités par adresse IP et par compte. Un contrôle anti-robot
  accessible apparaît après trois échecs et un blocage temporaire est appliqué après huit échecs.
- Les invitations, demandes de contact, e-mails et SMS transactionnels ont des plafonds distincts.
- La réinitialisation de mot de passe utilise un lien à usage unique valable 30 minutes. Elle
  révoque automatiquement toutes les sessions du compte.
- La double authentification TOTP est obligatoire pour les super-administrateurs et les
  administrateurs de MAM hors environnement de test. Huit codes de secours à usage unique sont
  présentés lors de son activation.
- L’écran `/parametres/securite` permet à chaque utilisateur de protéger son compte et de révoquer
  tous ses appareils.
- La CSP est active et les scripts rendus par le serveur utilisent un nonce par réponse. Les champs
  sensibles usuels sont masqués dans les logs structurés.

La migration `1761885935177_account_security` doit être appliquée avant le déploiement de cette
version. Après son application, les sessions ouvertes avant la mise à jour seront volontairement
invalidées lors de leur prochain accès à une page protégée.

## Archivage

La durée par défaut des transmissions et médias courants est configurable par MAM et vaut 365 jours après archivage. Les dossiers restent visibles par l’administration jusqu’à la purge quotidienne. Une restauration annule la purge.

Cette valeur est une règle produit à faire valider dans la documentation juridique, pas une durée universelle : contrats, paie, facturation, données de santé et journaux techniques devront posséder leurs propres politiques de conservation.

## RGPD — socle prévu

- minimisation des données et isolation stricte par MAM/enfant ;
- accès sur invitation, comptes désactivables et journal d’audit ;
- chiffrement TLS en transit et chiffrement du stockage en production ;
- archivage, restauration et purge automatique des dossiers enfants ; export et politiques par catégorie restent à compléter ;
- hébergement et sous-traitants à documenter dans le registre de traitement ;
- les fonctions médicales sont désactivées pendant le pilote ; leur activation future exigera une validation juridique et technique dédiée (base légale, analyse de risques, information et hébergement adaptés).

## Étapes métier suivantes

Le modèle de fiche papier permettra d’ajuster les rubriques, vocabulaires et validations sans reproduire sa mise en page. Les prochains blocs à arbitrer sont la messagerie riche, les actualités/fermetures et les présences simples. Les fonctions contractuelles et financières restent volontairement reportées.
