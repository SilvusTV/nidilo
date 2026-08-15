import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { assertChildAccess, getMamContext } from '#services/access_service'

export default class ReportsHistoryController {
  async index({ auth, request, params, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const context = await getMamContext(user)
    if (!context || context.role !== 'parent') return response.forbidden()
    const child = await assertChildAccess(user, context, params.id)
    if (!child) return response.notFound()
    const requested = String(request.input('mois', ''))
    const parsed = /^\d{4}-\d{2}$/.test(requested)
      ? DateTime.fromFormat(requested, 'yyyy-MM', { zone: context.timezone })
      : DateTime.now().setZone(context.timezone).startOf('month')
    const month = parsed.isValid
      ? parsed.startOf('month')
      : DateTime.now().setZone(context.timezone).startOf('month')
    const reports = await db
      .from('daily_reports')
      .where({ child_id: child.id, mam_id: context.mamId, status: 'published' })
      .whereBetween('report_date', [month.toISODate()!, month.endOf('month').toISODate()!])
      .orderBy('report_date')
      .select('report_date as reportDate', 'mood')
    return inertia.render('parents/calendar', {
      child: { id: child.id, firstName: child.first_name, lastName: child.last_name },
      month: month.toFormat('yyyy-MM'),
      reports: reports.map((report) => ({
        ...report,
        reportDate:
          report.reportDate instanceof Date
            ? report.reportDate.toISOString().slice(0, 10)
            : String(report.reportDate).slice(0, 10),
      })),
    })
  }
}
