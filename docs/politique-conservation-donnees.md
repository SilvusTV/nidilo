# Politique de conservation des données — Nidilo

> **Statut : projet de travail — validation obligatoire avant mise en production**  
> Version : 0.1 — 15 août 2026  
> Produit : Nidilo — « Chaque jour compte, dès le premier. »

## 1. Objet du document

Ce document définit les règles de conservation à implémenter dans Nidilo. Il sert à préparer :

- le registre des traitements ;
- la politique de confidentialité et les CGU ;
- les contrats de sous-traitance ;
- les procédures d’archivage, d’export et d’effacement ;
- la configuration technique des purges ;
- la validation finale par un professionnel du droit et, si nécessaire, le délégué à la protection des données.

Il ne constitue pas un avis juridique. Les durées indiquées comme **règle produit** sont des choix proposés et doivent être confirmées selon le rôle juridique exact de Nidilo, de la MAM, de chaque assistante maternelle et du particulier employeur.

## 2. Principes retenus

Le RGPD n’impose pas une durée unique. Chaque durée doit être justifiée par la finalité de la donnée, une obligation légale ou un besoin de défense en justice. Les données ne doivent pas être conservées indéfiniment.

Nidilo distingue trois phases :

1. **Base active** : donnée nécessaire au fonctionnement quotidien et accessible aux utilisateurs habilités.
2. **Archive intermédiaire** : donnée qui n’est plus utilisée au quotidien, isolée avec des accès fortement limités pour répondre à une obligation ou un contentieux.
3. **Effacement** : suppression de la base, du stockage objet et, après rotation, des sauvegardes techniques.

Une mesure de mise en attente, ou **gel juridique**, suspend la purge des seules données nécessaires à un contentieux, un contrôle ou une réquisition identifiée. Elle doit être documentée, autorisée et réévaluée.

## 3. Matrice de conservation proposée

| Catégorie                                                               |                                                         Base active |                                                                    Archive intermédiaire proposée | Déclencheur de purge                                      | Accès en archive                                      | Statut                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------: | --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Compte utilisateur et coordonnées                                       |                         Durée du compte et des rattachements actifs | 30 jours après fermeture, puis données strictement nécessaires à un litige séparées jusqu’à 5 ans | Fermeture du dernier rattachement                         | Super-admin habilité uniquement                       | À valider                                  |
| Invitations non acceptées                                               |                                                             7 jours |                              90 jours pour la preuve minimale de l’envoi, sans jeton réutilisable | Expiration ou révocation                                  | Administrateurs de la MAM                             | Règle produit                              |
| Appartenance à une MAM et droits                                        |                                             Durée de l’appartenance |                  1 an après sa fin ; 5 ans si nécessaire à la preuve d’une relation contractuelle | Fin du rattachement                                       | Administration restreinte                             | À valider                                  |
| Identité et dossier courant de l’enfant                                 |                                         Durée de la prise en charge |                                                              1 an après la fin de prise en charge | Archivage de l’enfant                                     | Administrateurs de la MAM ; support exclu par défaut  | Règle produit à valider                    |
| Transmissions quotidiennes : repas, siestes, changes, humeur, activités |                                         Durée de la prise en charge |                                                                                              1 an | Archivage de l’enfant                                     | Administrateurs de la MAM                             | Règle produit                              |
| Messages et notes liés à l’enfant                                       |                                         Durée de la prise en charge |                                                                                              1 an | Archivage de l’enfant                                     | Administrateurs de la MAM                             | Règle produit à valider                    |
| Photos et médias de l’enfant                                            | Durée de la prise en charge ou retrait de l’autorisation applicable |                                                        1 an maximum si une justification subsiste | Archivage, retrait d’autorisation ou demande recevable    | Administrateurs de la MAM                             | À valider selon les autorisations          |
| Santé, allergies, traitements et consignes médicales                    |                   Durée strictement nécessaire à la prise en charge |                                                                 1 an proposé, avec accès renforcé | Archivage de l’enfant ou fin de pertinence de la consigne | Professionnels autorisés et administrateurs habilités | Validation juridique et AIPD requises      |
| Contacts d’urgence et personnes autorisées                              |                                         Durée de la prise en charge |                                                                                      1 an proposé | Archivage de l’enfant ou révocation                       | Professionnels autorisés                              | À valider                                  |
| Autorisations parentales et preuves de consentement                     |                                 Durée de validité de l’autorisation |                                              Jusqu’à 5 ans après sa fin si nécessaire à la preuve | Expiration ou révocation                                  | Administration restreinte                             | À valider                                  |
| Présences, arrivées, départs et planning d’accueil                      |                                         Durée de la prise en charge |                    1 an pour l’opérationnel ; durée distincte si utilisé pour paie ou facturation | Fin de période d’accueil                                  | Administration restreinte                             | À qualifier selon l’usage                  |
| Contrats et avenants de travail                                         |                                                    Durée du contrat |                                                                     5 ans après la fin du contrat | Fin du contrat                                            | Parties au contrat et administration habilitée        | Base légale à confirmer                    |
| Éléments de paie, primes, indemnités et soldes                          |                                                 Durée d’utilisation |                                                                                             5 ans | Clôture ou fin du contrat                                 | Parties au contrat et administration habilitée        | Référence officielle disponible            |
| Décompte des horaires                                                   |                                                 Durée d’utilisation |                                              1 an ; autres décomptes sociaux éventuellement 3 ans | Clôture de la période                                     | Parties au contrat et administration habilitée        | À qualifier précisément                    |
| Contrat électronique avec un consommateur d’au moins 120 €              |                                                    Durée du contrat |                                                                 10 ans à compter de la prestation | Exécution de la prestation                                | Administration habilitée                              | Si Nidilo entre dans ce cas                |
| Factures et pièces comptables                                           |                                                 Durée de l’exercice |                                                                    10 ans à compter de la clôture | Clôture comptable                                         | Personnes chargées de la comptabilité                 | Si Nidilo les héberge                      |
| Notifications internes                                                  |                                                             12 mois |                                                                        Aucune, sauf gel juridique | Date de création                                          | Utilisateur destinataire                              | Règle produit                              |
| Métadonnées d’envoi e-mail/SMS                                          |                                                             12 mois |                                                              Aucune, sauf incident ou contentieux | Date d’envoi                                              | Support habilité ; contenu minimisé                   | Règle produit à valider                    |
| Journaux d’accès, d’administration et de sécurité                       |                                                   12 mois glissants |                                  Jusqu’à 3 ans uniquement si contrôle interne ou risque documenté | Date de l’événement                                       | Équipe sécurité habilitée                             | Conforme à la recommandation CNIL générale |
| Tickets de support                                                      |                                                     Durée du ticket |                                           2 ans après clôture, pièces sensibles retirées plus tôt | Clôture                                                   | Support habilité                                      | Règle produit à valider                    |
| Exports demandés par un utilisateur                                     |                                                             7 jours |                                                                                            Aucune | Création de l’export                                      | Demandeur uniquement                                  | Règle produit                              |
| Fichiers temporaires et téléversements incomplets                       |                                                           24 heures |                                                                                            Aucune | Création                                                  | Service technique                                     | Règle produit                              |
| Choix relatifs aux cookies non nécessaires                              |                                                              6 mois |                                                                                            Aucune | Expression du choix                                       | Service de consentement                               | Bonne pratique CNIL 2026                   |

## 4. Sauvegardes techniques

Proposition pour la production :

- sauvegardes PostgreSQL chiffrées avec rétention glissante de 35 jours ;
- versionnement ou sauvegarde du stockage objet avec la même durée maximale ;
- sauvegardes isolées, non accessibles aux utilisateurs et non utilisées comme archives métier ;
- restauration réservée à un incident, avec rejeu des suppressions sur les données restaurées ;
- disparition définitive d’une donnée au plus tard à l’expiration de la dernière sauvegarde qui la contient ;
- test de restauration documenté au minimum chaque trimestre.

La durée de 35 jours est une **règle technique proposée**, pas une obligation légale.

## 5. Règles de purge à implémenter

Chaque catégorie doit posséder :

- une date d’archivage ;
- une date de purge calculée et affichable ;
- un motif et la règle de conservation appliquée ;
- un éventuel gel juridique avec auteur, justification et date de révision ;
- une tâche automatique idempotente ;
- une preuve de purge ne contenant pas la donnée supprimée ;
- une purge coordonnée de PostgreSQL, S3, index de recherche, caches et files de messages ;
- un mécanisme de rejeu des suppressions après restauration d’une sauvegarde.

Pour un enfant, la purge doit supprimer dans une transaction logique : profil, santé, transmissions, messages, liens vers les responsables, médias S3 et métadonnées associées. Les éléments contractuels ayant une durée distincte doivent être préalablement séparés du dossier courant.

## 6. Données de santé et mineurs

Les allergies, traitements, températures et consignes médicales sont des données sensibles. Nidilo doit :

- ne collecter que ce qui est indispensable à l’accueil ;
- informer les titulaires de l’autorité parentale dans un langage clair ;
- fournir une information adaptée concernant le traitement des données du mineur ;
- éviter de placer une donnée médicale nominative dans le contenu d’un e-mail ou d’un SMS ;
- envoyer seulement une alerte invitant à consulter l’espace sécurisé ;
- limiter l’accès aux personnes qui prennent effectivement l’enfant en charge ;
- journaliser les consultations et modifications sensibles ;
- déterminer avant production si un hébergement certifié HDS est juridiquement requis ;
- réaliser une analyse d’impact relative à la protection des données si l’analyse des risques la rend nécessaire.

## 7. Responsabilités à clarifier

Avant production, un juriste doit déterminer pour chaque traitement :

- si Nidilo est responsable de traitement, responsable conjoint ou sous-traitant ;
- si la MAM, chaque assistante maternelle ou le parent particulier employeur est responsable de traitement ;
- qui signe et conserve les contrats de travail ;
- quelles données la MAM peut consulter lorsqu’un parent est juridiquement l’employeur ;
- la base légale de chaque traitement, notamment pour les données de santé et les photographies ;
- les sous-traitants autorisés : hébergeur, stockage objet, e-mail, SMS, supervision et sauvegardes ;
- les conditions d’exercice des droits d’accès, rectification, opposition, limitation, portabilité et effacement.

## 8. Décisions requises avant mise en production

- [ ] Validation juridique de la matrice complète.
- [ ] Qualification des rôles RGPD de Nidilo et des MAM.
- [ ] Validation de la durée « prise en charge + 1 an » pour les dossiers courants.
- [ ] Durées spécifiques des contrats, présences utilisées pour la paie et documents Pajemploi.
- [ ] Analyse du besoin de certification HDS pour l’hébergement choisi.
- [ ] AIPD ou justification documentée de son absence.
- [ ] Politique de confidentialité, CGU et contrats de sous-traitance.
- [ ] Procédure de réponse aux demandes de droits.
- [ ] Procédure de violation de données et notification sous 72 heures lorsque applicable.
- [ ] Procédure de gel juridique et de levée du gel.
- [ ] Tests automatisés des purges et tests de restauration des sauvegardes.
- [ ] Vérification que les e-mails et SMS ne contiennent aucune donnée de santé détaillée.

## 9. Sources officielles de travail

- CNIL, [Guide pratique — Les durées de conservation](https://www.cnil.fr/sites/default/files/atoms/files/guide_durees_de_conservation.pdf).
- CNIL, [Minimiser les données collectées et automatiser leur effacement](https://www.cnil.fr/fr/minimiser-les-donnees-collectees).
- CNIL, [Tracer les opérations](https://www.cnil.fr/fr/securite-tracer-les-operations).
- CNIL, [Informer les personnes lors d’un traitement de données de santé](https://www.cnil.fr/fr/traitement-de-donnees-de-sante-comment-informer-les-personnes-concernees).
- CNIL, [Risques de la messagerie électronique pour les données de santé](https://www.cnil.fr/fr/donnees-de-sante-messagerie-electronique-et-fax).
- CNIL, [Règles relatives aux cookies et traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi).
- Service Public, [Durées de conservation des documents d’entreprise](https://entreprendre.service-public.fr/vosdroits/F10029).
- Légifrance, [Code civil, article 2224 — prescription de droit commun de cinq ans](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019017112).
- Service Public, [Rupture du contrat d’une assistante maternelle par un particulier employeur](https://www.service-public.fr/particuliers/vosdroits/F16842).

## 10. Historique des validations

| Date       | Version | Validateur    | Décision                                        |
| ---------- | ------- | ------------- | ----------------------------------------------- |
| 15/08/2026 | 0.1     | Équipe projet | Première proposition, non validée juridiquement |
