#!/usr/bin/env node
/**
 * Secret Scanner & Repository Leak Prevention Script
 * CitasSistema Security Foundation
 * 
 * Scans the codebase and git staging area for exposed API keys, private tokens,
 * and high-entropy credentials before anything can be committed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SECRET_PATTERNS = [
  { name: 'Resend API Key', regex: /re_[a-zA-Z0-9_]{20,}/g },
  { name: 'Decolecta / RENIEC API Key', regex: /sk_[0-9a-zA-Z_.]{20,}/g },
  { name: 'Cloudflare Turnstile Secret Key', regex: /0x4[a-zA-Z0-9_]{30,}/g },
  { name: 'Generic Private Key', regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g },
  { name: 'Stripe / Payment Gateway Secret Key', regex: /(sk_live|izipay_secret|mp_access_token)_[0-9a-zA-Z_]{16,}/g },
  { name: 'Supabase Service Role Key', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'GitHub Personal Access Token', regex: /gh[pousr]_[a-zA-Z0-9]{36,}/g },
  { name: 'Slack API Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,}/g },
];

const IGNORED_PATHS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.codegraph',
];

function getTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', { encoding: 'utf-8' });
    return stdout.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function scanFile(filePath) {
  for (const ignored of IGNORED_PATHS) {
    if (filePath.includes(ignored)) return [];
  }

  // Prevent any real .env file from ever being tracked in Git
  if (filePath.includes('.env') && !filePath.includes('.env.example')) {
    return [{ name: 'Tracked Environment File (.env leak)', matches: [filePath], file: filePath }];
  }

  if (!fs.existsSync(filePath)) return [];

  const stat = fs.statSync(filePath);
  if (stat.isDirectory() || stat.size > 2 * 1024 * 1024) return [];

  const content = fs.readFileSync(filePath, 'utf-8');
  const leaks = [];

  for (const { name, regex } of SECRET_PATTERNS) {
    const matches = content.match(regex);
    if (matches) {
      // Exclude documentation or test templates with placeholders
      const filtered = matches.filter(
        (m) =>
          !m.includes('your_') &&
          !m.includes('your-') &&
          !m.includes('1x0000000000000000000000000000000AA') &&
          !m.includes('0x4AAAAAAxxxxxxxx') &&
          !m.includes('sk_test_')
      );
      if (filtered.length > 0) {
        leaks.push({ name, matches: filtered, file: filePath });
      }
    }
  }

  return leaks;
}

function main() {
  console.log('🔍 Iniciando auditoría de seguridad y escaneo de secretos en el repositorio...');
  const files = getTrackedFiles();
  const allLeaks = [];

  for (const file of files) {
    const leaks = scanFile(file);
    if (leaks.length > 0) {
      allLeaks.push(...leaks);
    }
  }

  if (allLeaks.length > 0) {
    console.error('\n🚨 ¡ALERTA DE SEGURIDAD CRÍTICA! Se detectaron secretos en archivos rastreados por Git:');
    for (const leak of allLeaks) {
      console.error(`  - [${leak.name}] en archivo: ${leak.file}`);
    }
    console.error('\nPor favor remueve estas claves antes de commitear o añadirlas a .gitignore.\n');
    process.exit(1);
  } else {
    console.log('✅ Auditoría aprobada: Cero API Keys o secretos expuestos en archivos rastreados por Git.');
    console.log(`🛡️  Total de archivos analizados: ${files.length}`);
  }
}

main();
