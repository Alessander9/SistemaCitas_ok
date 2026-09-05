import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Get applied migrations
    const { rows: applied } = await pool.query('SELECT name FROM _migrations ORDER BY id');
    const appliedSet = new Set(applied.map((r: { name: string }) => r.name));

    // Read migration files
    const possibleDirs = [
      join(__dirname, 'migrations'),
      join(__dirname, '../../../db/migrations'),
      join(process.cwd(), 'db/migrations'),
      join(process.cwd(), '../../db/migrations'),
    ];
    const migrationsDir = possibleDirs.find((d) => {
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
      if (appliedSet.has(file)) {
        console.log(`⏭️  Already applied: ${file}`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      console.log(`🔄 Applying: ${file}`);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ Applied: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed: ${file}`);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('\n🎉 All migrations applied successfully');
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
