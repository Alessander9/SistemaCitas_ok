import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function reset() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🗑️  Dropping all tables and types via schema reset...');
    await pool.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('✅ Schema reset complete');

    // Re-apply migrations
    console.log('\n🔄 Re-applying migrations...');
    const possibleMigDirs = [
      join(__dirname, 'migrations'),
      join(__dirname, '../../../db/migrations'),
      join(process.cwd(), 'db/migrations'),
      join(process.cwd(), '../../db/migrations'),
    ];
    const migrationsDir = possibleMigDirs.find((d) => {
      try {
        return readdirSync(d).some((f) => f.endsWith('.sql'));
      } catch {
        return false;
      }
    }) || join(__dirname, 'migrations');

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      console.log(`🔄 Applying: ${file}`);
      await pool.query(sql);
      console.log(`✅ Applied: ${file}`);
    }

    // Re-apply seeds
    console.log('\n🌱 Re-applying seeds...');
    const possibleSeedDirs = [
      join(__dirname, 'seeds'),
      join(__dirname, '../../../db/seeds'),
      join(process.cwd(), 'db/seeds'),
      join(process.cwd(), '../../db/seeds'),
    ];
    const seedsDir = possibleSeedDirs.find((d) => {
      try {
        return readdirSync(d).some((f) => f.endsWith('.sql'));
      } catch {
        return false;
      }
    }) || join(__dirname, 'seeds');

    const seedFiles = readdirSync(seedsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      const sql = readFileSync(join(seedsDir, file), 'utf-8');
      console.log(`🌱 Seeding: ${file}`);
      await pool.query(sql);
      console.log(`✅ Seeded: ${file}`);
    }

    console.log('\n🎉 Database reset complete');
  } finally {
    await pool.end();
  }
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
