// Seeds the permissions catalogue and grants role_permissions so non-super_admin
// roles (admin, doctor, ...) see sidebar items and pass permission checks.
// Safe to re-run: uses ON CONFLICT DO NOTHING.
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

const modules = {
  dashboard: ['view'],
  patients: ['view', 'create', 'edit', 'delete', 'export'],
  appointments: ['view', 'create', 'edit', 'delete'],
  emergency: ['view', 'create', 'edit', 'delete'],
  doctors: ['view', 'create', 'edit', 'delete'],
  departments: ['view', 'create', 'edit', 'delete'],
  inventory: ['view', 'create', 'edit', 'delete'],
  pharmacy: ['view', 'create', 'edit', 'delete'],
  laboratory: ['view', 'create', 'edit', 'delete'],
  billing: ['view', 'create', 'edit', 'delete'],
  reports: ['view', 'export'],
  users: ['view', 'create', 'edit', 'delete'],
  settings: ['view', 'edit']
};

// Frontend also checks canCreate('patient') (singular) alongside view_patients (plural).
const extraPermissions = ['create_patient'];

const rolesGrantedEverything = ['admin'];
const doctorViewOnly = ['view_dashboard', 'view_patients', 'view_appointments', 'view_emergency', 'view_doctors'];

(async () => {
  const allNames = [];
  for (const [mod, actions] of Object.entries(modules)) {
    for (const action of actions) allNames.push(`${action}_${mod}`);
  }
  allNames.push(...extraPermissions);

  for (const name of allNames) {
    await pool.query(
      'INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [name, name.replace('_', ' ')]
    );
  }
  console.log(`Seeded ${allNames.length} permissions.`);

  const { rows: permRows } = await pool.query('SELECT id, name FROM permissions');
  const idByName = Object.fromEntries(permRows.map(p => [p.name, p.id]));

  // hospital_id is nullable and NULLs never collide under a UNIQUE constraint,
  // so ON CONFLICT can't dedupe global (hospital_id IS NULL) grants. Re-seed
  // idempotently by clearing existing global grants for these roles first.
  await pool.query(
    `DELETE FROM role_permissions WHERE role = ANY($1) AND hospital_id IS NULL`,
    [[...rolesGrantedEverything, 'doctor']]
  );

  for (const role of rolesGrantedEverything) {
    for (const name of allNames) {
      await pool.query(
        'INSERT INTO role_permissions (role, permission_id) VALUES ($1, $2)',
        [role, idByName[name]]
      );
    }
    console.log(`Granted all ${allNames.length} permissions to role "${role}".`);
  }

  for (const name of doctorViewOnly) {
    if (!idByName[name]) continue;
    await pool.query(
      'INSERT INTO role_permissions (role, permission_id) VALUES ($1, $2)',
      ['doctor', idByName[name]]
    );
  }
  console.log(`Granted ${doctorViewOnly.length} view permissions to role "doctor".`);

  await pool.end();
})().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
