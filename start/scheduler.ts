import PurgeArchivedChildren from '#jobs/purge_archived_children'
import PurgeExpiredContactRequests from '#jobs/purge_expired_contact_requests'
import PurgeSecurityArtifacts from '#jobs/purge_security_artifacts'
import PurgeExpiredPrivacyRecords from '#jobs/purge_expired_privacy_records'

await PurgeArchivedChildren.schedule({}).cron('30 2 * * *').timezone('Europe/Paris')
await PurgeExpiredContactRequests.schedule({}).cron('45 2 * * *').timezone('Europe/Paris')
await PurgeSecurityArtifacts.schedule({}).cron('55 2 * * *').timezone('Europe/Paris')
await PurgeExpiredPrivacyRecords.schedule({}).cron('10 3 * * *').timezone('Europe/Paris')
