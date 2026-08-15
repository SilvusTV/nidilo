# Checklist obligatoire avant l’ouverture du pilote

## Identité et contrats

- [ ] Renseigner `LEGAL_PUBLISHER_NAME`, `LEGAL_PUBLISHER_ADDRESS`, `LEGAL_PUBLISHER_EMAIL` et
      `LEGAL_PUBLISHER_PHONE`.
- [ ] Renseigner `LEGAL_HOST_NAME` et `LEGAL_HOST_ADDRESS`.
- [ ] Signer la convention pilote et l’accord de sous-traitance avec chaque établissement.
- [ ] Compléter le contact incident de chaque partie.
- [ ] Faire personnaliser et remettre la notice d’information aux familles et au personnel.
- [ ] Faire déterminer par l’établissement ses bases juridiques et inscrire le traitement à son registre.

## Configuration produit

- [ ] Conserver `HEALTH_DATA_ENABLED=false`.
- [ ] Expliquer aux utilisateurs que les notes libres ne doivent contenir aucune donnée médicale.
- [ ] Vérifier les administrateurs, imposer le MFA et supprimer les comptes de démonstration.
- [ ] Vérifier le domaine, SPF, DKIM, DMARC et le webhook Brevo.
- [ ] Compléter et vérifier la liste publique des sous-traitants.

## Serveur

- [ ] Utiliser le compose de production ; ne pas exposer PostgreSQL, Redis, MinIO ou sa console.
- [ ] Générer des secrets longs et distincts, sans aucune valeur de démonstration.
- [ ] Placer HTTPS devant l’application et renseigner `APP_URL=https://nidilo.fr`.
- [ ] Configurer des sauvegardes chiffrées hors serveur et réaliser un test de restauration.
- [ ] Vérifier la purge à 12 mois des dossiers archivés, notifications, invitations et audits.
- [ ] Tester la procédure d’incident et la révocation des sessions.
