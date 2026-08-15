import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreate(
      { email: 'superadmin@nidilo.test' },
      {
        fullName: 'Super Admin Nidilo',
        email: 'superadmin@nidilo.test',
        password: 'ChangeMe-Super-2026!',
        globalRole: 'super_admin',
        status: 'active',
      }
    )
    const admin = await User.updateOrCreate(
      { email: 'admin@nidilo.test' },
      {
        fullName: 'Marie Doudou',
        email: 'admin@nidilo.test',
        password: 'ChangeMe-2026!',
        globalRole: 'member',
        status: 'active',
      }
    )
    const parent = await User.updateOrCreate(
      { email: 'parent@nidilo.test' },
      {
        fullName: 'Camille Bernard',
        email: 'parent@nidilo.test',
        password: 'ChangeMe-Parent-2026!',
        globalRole: 'member',
        status: 'active',
      }
    )
    const [mam] = await db
      .table('mams')
      .insert({
        name: 'MAM doudou & moi',
        slug: 'mam-doudou-et-moi',
        email: 'contact@doudou-et-moi.test',
        timezone: 'Europe/Paris',
        assignment_mode: 'all',
        settings: JSON.stringify({}),
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict('slug')
      .merge(['name', 'updated_at'])
      .returning('*')
    await db
      .table('memberships')
      .insert({
        mam_id: mam.id,
        user_id: admin.id,
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict(['mam_id', 'user_id'])
      .ignore()
    const samples = [
      { first_name: 'Lina', last_name: 'Martin', birth_date: '2024-02-12', allergies: null },
      { first_name: 'Noé', last_name: 'Petit', birth_date: '2023-11-03', allergies: 'Œuf' },
      { first_name: 'Alba', last_name: 'Bernard', birth_date: '2024-05-27', allergies: null },
      { first_name: 'Milo', last_name: 'Robert', birth_date: '2023-09-15', allergies: null },
    ]
    for (const child of samples) {
      const exists = await db
        .from('children')
        .where({ mam_id: mam.id, ...child })
        .first()
      if (!exists)
        await db.table('children').insert({
          mam_id: mam.id,
          ...child,
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })
    }

    await db
      .table('memberships')
      .insert({
        mam_id: mam.id,
        user_id: parent.id,
        role: 'parent',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict(['mam_id', 'user_id'])
      .ignore()

    const alba = await db
      .from('children')
      .where({ mam_id: mam.id, first_name: 'Alba', last_name: 'Bernard' })
      .first()
    if (alba) {
      await db
        .table('child_guardians')
        .insert({
          mam_id: mam.id,
          child_id: alba.id,
          user_id: parent.id,
          relationship: 'parent',
          can_invite: true,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .onConflict(['child_id', 'user_id'])
        .ignore()
    }
  }
}
