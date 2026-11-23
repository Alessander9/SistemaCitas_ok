/* eslint-disable no-console */
import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const possibleDirs = [
      join(__dirname, 'seeds'),
      join(__dirname, '../../../db/seeds'),
      join(process.cwd(), 'db/seeds'),
      join(process.cwd(), '../../db/seeds'),
    ];
    const seedsDir = possibleDirs.find((d) => {
      try {
        return readdirSync(d).some((f) => f.endsWith('.sql'));
      } catch {
        return false;
      }
    }) || join(__dirname, 'seeds');

    const files = readdirSync(seedsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(seedsDir, file), 'utf-8');
      console.log(`🌱 Seeding: ${file}`);
      await pool.query(sql);
      console.log(`✅ Seeded: ${file}`);
    }

    console.log('\n🎉 All seeds applied successfully');
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
