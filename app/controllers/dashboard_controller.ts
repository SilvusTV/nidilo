import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getMamContext } from '#services/access_service'
import { features } from '#config/features'

function isoDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

export default class DashboardController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.isSuperAdmin) return response.redirect('/super-admin/mams')
    const context = await getMamContext(user)

    if (!context) {
      return inertia.render('dashboard', {
        mam: null,
        role: user.globalRole,
        wards: [],
        stats: { present: 0, reports: 0, messages: 0 },
      })
    }

    let childrenQuery = db
      .from('children')
      .where('children.mam_id', context.mamId)
      .where('children.active', true)
      .select(
        'children.id',
        'children.first_name as firstName',
        'children.last_name as lastName',
        'children.birth_date as birthDate'
      )
    if (features.healthData) childrenQuery.select('children.allergies')

    if (context.role === 'parent') {
      childrenQuery = childrenQuery
        .join('child_guardians', 'child_guardians.child_id', 'children.id')
        .where('child_guardians.user_id', user.id)
    } else if (context.role === 'assistant' && context.assignmentMode === 'assigned') {
      childrenQuery = childrenQuery
        .join('child_staff', 'child_staff.child_id', 'children.id')
        .where('child_staff.user_id', user.id)
    }

    const children = await childrenQuery.orderBy('children.first_name')
    if (context.role === 'parent') {
      const childIds = children.map((child) => child.id)
      const [reportCounts, latestReports, unreadReports] = childIds.length
        ? await Promise.all([
            db
              .from('daily_reports')
              .whereIn('child_id', childIds)
              .where('status', 'published')
              .groupBy('child_id')
              .select('child_id as childId')
              .count('* as total'),
            db
              .from('daily_reports')
              .whereIn('child_id', childIds)
              .where('status', 'published')
              .orderBy('report_date', 'desc')
              .select('child_id as childId', 'report_date as reportDate'),
            db
              .from('notifications')
              .where({ user_id: user.id, mam_id: context.mamId, category: 'daily_report' })
              .whereNull('read_at')
              .count('* as total')
              .first(),
          ])
        : [[], [], { total: 0 }]
      const countByChild = new Map(reportCounts.map((row) => [row.childId, Number(row.total)]))
      const latestByChild = new Map<string, string>()
      for (const report of latestReports)
        if (!latestByChild.has(report.childId))
          latestByChild.set(report.childId, isoDate(report.reportDate))
      return inertia.render('parents/dashboard', {
        mam: { name: context.mamName },
        wards: children.map((child) => ({
          ...child,
          reportsCount: countByChild.get(child.id) ?? 0,
          latestReportDate: latestByChild.get(child.id) ?? null,
        })),
        unreadReports: Number(unreadReports?.total ?? 0),
        healthDataEnabled: features.healthData,
      })
    }
    const today = new Date().toISOString().slice(0, 10)
    const published = await db
      .from('daily_reports')
      .where({ mam_id: context.mamId, report_date: today, status: 'published' })
      .count('* as total')
      .first()

    return inertia.render('dashboard', {
      mam: { id: context.mamId, name: context.mamName, assignmentMode: context.assignmentMode },
      role: context.role,
      wards: children,
      stats: { present: children.length, reports: Number(published?.total ?? 0), messages: 0 },
    })
  }
}
