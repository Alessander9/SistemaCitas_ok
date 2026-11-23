import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5300';

const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

function findBrowserExecutable() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error('No se encontró Brave, Chrome ni Edge en el sistema. Define CHROME_PATH.');
}

async function clickByText(page, textRegex, selector = 'button, a') {
  const clicked = await page.evaluate(
    ({ pattern, flags, sel }) => {
      const re = new RegExp(pattern, flags);
      const els = Array.from(document.querySelectorAll(sel));
      const target = els.find((el) => re.test((el.textContent || '').trim()) && el.offsetParent !== null);
      if (target) {
        target.click();
        return true;
      }
      return false;
    },
    { pattern: textRegex.source, flags: textRegex.flags, sel: selector },
  );
  if (!clicked) {
    throw new Error(`No se encontró elemento clickeable con texto ${textRegex}`);
  }
}

async function waitForText(page, textRegex, timeout = 12000) {
  await page.waitForFunction(
    ({ pattern, flags }) => new RegExp(pattern, flags).test(document.body.innerText || ''),
    { timeout },
    { pattern: textRegex.source, flags: textRegex.flags },
  );
}

async function loginAs(page, email, password = 'Password123!') {
  await page.goto(`${BASE_URL}/?view=login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.evaluate(() => {
    const e = document.querySelector('input[type="email"]');
    const p = document.querySelector('input[type="password"]');
    if (e) e.value = '';
    if (p) p.value = '';
  });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  await clickByText(page, /Iniciar Sesi[oó]n|Ingresar/i, 'button[type="submit"], button');
}

async function run() {
  const executablePath = findBrowserExecutable();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const api404s = [];
  const pageErrors = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('response', (res) => {
      if (res.url().includes('/api/') && res.status() === 404) {
        api404s.push(`${res.status()} ${res.url()}`);
      }
    });

    // 1. Landing & BookingWizard (sin 404 en /api/appointments/availability)
    console.log('1/3 Verificando Landing Pública y BookingWizard...');
    await page.goto(`${BASE_URL}/?view=booking`, { waitUntil: 'networkidle2' });
    await waitForText(page, /Especialidad|Fisioterapia|Reservar/i);
    console.log('   OK: BookingWizard renderizado sin errores.');

    // 2. Flujo Médico Real: Login -> DoctorDashboard -> ClinicalConsultationView -> Guardar
    console.log('2/3 Verificando flujo médico (Login -> Cola -> Consulta -> Briefing -> Kardex -> Resumen -> Guardar)...');
    await loginAs(page, 'doctor@clinica.pe');
    await waitForText(page, /Abrir Ficha Cl[ií]nica/i);
    await clickByText(page, /Abrir Ficha Cl[ií]nica/i);
    await waitForText(page, /Briefing R[aá]pido \(10s\)/i);

    await clickByText(page, /\+ Agregar Insumo/i);
    await waitForText(page, /Agujas de punci[oó]n seca/i);

    await clickByText(page, /Generar Resumen Claro/i);
    await waitForText(page, /Enviar por WhatsApp/i);

    await clickByText(page, /Guardar Ficha y Evoluci[oó]n/i);
    await waitForText(page, /Atenci[oó]n m[eé]dica y evoluci[oó]n registradas exitosamente/i);
    console.log('   OK: Consulta clínica completa guardada en navegador real.');

    // 3. Flujo Admin Clínica: Login -> Panel de Conocimiento Médico IA (4 pestañas reales desde PostgreSQL)
    console.log('3/3 Verificando panel ADMIN_CLINIC (Conocimiento Médico IA desde PostgreSQL)...');
    await loginAs(page, 'admin@clinica.pe');
    await waitForText(page, /Conocimiento M[eé]dico IA/i);
    await clickByText(page, /Conocimiento M[eé]dico IA/i);
    await waitForText(page, /1\. Protocolos Cl[ií]nicos/i);
    await waitForText(page, /Lumbalgia mec[aá]nica aguda/i);
    await clickByText(page, /2\. Vadem[eé]cum & Alergias/i);
    await waitForText(page, /Ibuprofeno 400mg/i);
    await clickByText(page, /3\. Macros & Nombre de Invocaci[oó]n/i);
    await waitForText(page, /Chanfainita/i);
    await clickByText(page, /4\. Auditor[ií]a de Alertas/i);
    console.log('   OK: Panel de Conocimiento Médico IA (4 pestañas) verificado contra PostgreSQL real.');

    if (api404s.length > 0) {
      throw new Error(`Se detectaron endpoints 404 en /api/: ${api404s.join(', ')}`);
    }
    if (pageErrors.length > 0) {
      throw new Error(`Errores de runtime en navegador: ${pageErrors.join(' | ')}`);
    }

    console.log('\n✅ E2E BROWSER SMOKE PASS (3/3 flujos reales en Chromium sin errores)');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('\n❌ E2E BROWSER SMOKE FAILED:', err.message);
  process.exit(1);
});
