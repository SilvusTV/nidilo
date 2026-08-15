# Accord de sous-traitance RGPD — pilote Nidilo

> Modèle à compléter et signer avec chaque établissement avant l’import de données réelles. Il
> constitue l’annexe « protection des données » de la convention pilote. Une validation juridique
> reste recommandée avant commercialisation.

## 1. Parties

**Responsable du traitement — établissement d’accueil**  
Nom : `[MAM / établissement]`  
Forme et représentant : `[à compléter]`  
Adresse et contact RGPD : `[à compléter]`

**Sous-traitant — éditeur individuel de Nidilo**  
Nom légal : `[à compléter]`  
Adresse : `[à compléter]`  
Contact RGPD et incidents : `contact@nidilo.fr`  
Dénommé ci-après « Nidilo ».

## 2. Qualification et objet

L’établissement détermine les finalités du suivi quotidien des enfants, les informations nécessaires,
les personnes autorisées et les durées applicables. Il agit comme **responsable du traitement**.

Nidilo fournit, héberge, maintient et sécurise l’application selon les instructions documentées de
l’établissement. Pour ces opérations, Nidilo agit comme **sous-traitant** au sens de l’article 28 du
RGPD. Nidilo est responsable de ses traitements propres limités à la relation pilote, au formulaire de
contact et à la sécurité de ses systèmes.

## 3. Description du traitement confié

- **Objet et nature :** hébergement, structuration, affichage, transmission, sauvegarde, maintenance
  et suppression des informations du cahier de transmission numérique.
- **Finalités :** permettre aux professionnels autorisés de renseigner le quotidien et aux responsables
  autorisés de consulter les fiches de leur enfant.
- **Durée :** durée de la convention pilote, augmentée des opérations de restitution et suppression.
- **Personnes concernées :** enfants accueillis, responsables légaux et proches invités, personnel de
  l’établissement et administrateurs habilités.
- **Données :** identité, dates d’accueil, habitudes ordinaires, contacts, autorisations non médicales,
  repas, siestes, changes, humeur, activités, notes quotidiennes, comptes, invitations, notifications
  et traces de sécurité.

Les fonctionnalités médicales sont désactivées pendant le pilote. L’établissement s’engage à ne pas
faire saisir d’allergies, pathologies, ordonnances, traitements ou autres données de santé, y compris
dans les champs libres.

## 4. Instructions documentées

Les présentes clauses, la configuration réalisée par les administrateurs de l’établissement et les
demandes écrites adressées à Nidilo constituent les instructions documentées. Nidilo n’utilise pas les
données métier pour son propre compte, la publicité, la prospection ou l’entraînement de modèles.

Si une instruction paraît contraire au RGPD ou au droit applicable, Nidilo en informe immédiatement
l’établissement et suspend son exécution dans la mesure nécessaire.

## 5. Obligations de Nidilo

Nidilo s’engage à :

1. ne traiter les données que sur instruction et pour les finalités convenues ;
2. limiter l’accès aux seules personnes ayant besoin d’intervenir et soumises à confidentialité ;
3. maintenir les mesures de sécurité décrites en annexe ;
4. assister l’établissement pour les demandes d’accès, rectification, limitation, effacement,
   opposition ou portabilité ;
5. assister l’établissement pour ses analyses de risques, consultations et obligations de sécurité ;
6. tenir les informations nécessaires à son registre de sous-traitant ;
7. mettre à disposition les éléments raisonnablement nécessaires pour démontrer le respect du présent
   accord et permettre un audit proportionné, sur préavis et sans compromettre d’autres clients ;
8. informer l’établissement de toute demande juridiquement contraignante d’une autorité, sauf
   interdiction légale.

## 6. Obligations de l’établissement

L’établissement s’engage à :

- disposer d’une base juridique pour chaque finalité et informer clairement familles et personnel ;
- limiter les données au nécessaire, vérifier leur exactitude et gérer les habilitations ;
- désigner au moins un administrateur et retirer sans délai les comptes devenus inutiles ;
- ne pas saisir de donnée médicale pendant le pilote ;
- transmettre à Nidilo des instructions licites et documentées ;
- traiter les demandes des personnes et décider des notifications réglementaires.

## 7. Sous-traitants ultérieurs

L’établissement donne une autorisation générale aux prestataires listés sur
`https://nidilo.fr/sous-traitants`. Au démarrage du pilote :

| Prestataire               | Service                                               | Données concernées                           |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------- |
| Brevo / Sendinblue SAS    | E-mails et SMS transactionnels                        | Coordonnées, contenu minimal de notification |
| `[hébergeur à compléter]` | Serveur, base PostgreSQL, Redis, MinIO et sauvegardes | Ensemble des données hébergées               |

Nidilo informe l’établissement avant tout ajout ou remplacement significatif. L’établissement dispose
de 15 jours pour formuler une objection motivée. Nidilo impose à chaque sous-traitant ultérieur des
obligations au moins équivalentes pour les opérations confiées.

## 8. Localisation et transferts

Le serveur pilote et ses sauvegardes doivent être situés dans l’Union européenne. Tout transfert hors
EEE non couvert par une décision d’adéquation doit reposer sur un mécanisme du chapitre V du RGPD et
des mesures complémentaires appropriées. Nidilo documente les éventuels transferts de ses
sous-traitants.

## 9. Sécurité

Les mesures minimales comprennent : chiffrement TLS, secrets distincts de production, comptes
individuels, UUID non séquentiels, contrôle d’accès par établissement et enfant, CSRF, CSP, limitation
des tentatives, MFA obligatoire pour les administrateurs, journaux d’audit, stockage MinIO privé,
sauvegardes chiffrées et tests de restauration. Les bases PostgreSQL, Redis et MinIO ne doivent pas
être exposées publiquement.

## 10. Violations de données

Nidilo informe le contact incident de l’établissement **sans délai indu et, lorsque possible, dans les
24 heures** après confirmation d’une violation concernant ses données. L’alerte décrit, selon les
informations disponibles, la nature, les personnes et volumes concernés, les conséquences probables,
les mesures prises et le contact de suivi.

L’établissement reste maître de la décision de notifier la CNIL et les personnes concernées. Nidilo
apporte son assistance et conserve les éléments techniques utiles.

## 11. Droits des personnes

Toute demande reçue directement par Nidilo au sujet d’un dossier enfant est transmise à
l’établissement sans réponse sur le fond, sauf instruction contraire. Nidilo fournit les exports ou
effectue les rectifications/suppressions demandées dans un délai permettant à l’établissement de
respecter ses propres échéances.

## 12. Sort des données

Pendant le service, un enfant archivé reste accessible aux seuls administrateurs pour une durée
configurée, fixée à 12 mois pour le pilote, puis son dossier et les données liées sont supprimés.

À la fin de la convention, Nidilo restitue un export raisonnablement exploitable sur demande puis
supprime les données métier dans un délai maximal de 30 jours, sauf instruction écrite plus courte ou
obligation légale. Les sauvegardes isolées sont écrasées selon leur cycle normal et restent
inaccessibles aux usages courants.

## 13. Signatures

Fait le `[date]`, pour la période du `[date]` au `[date]`.

| Pour l’établissement    | Pour Nidilo    |
| ----------------------- | -------------- |
| Nom, qualité, signature | Nom, signature |
|                         |                |
