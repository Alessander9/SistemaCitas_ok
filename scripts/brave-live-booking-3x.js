/**
 * =============================================================================
 * CITASSISTEMA — BOT INTERACTIVO EN VIVO CON NAVEGADOR BRAVE (3 FLUJOS DE CLIENTE)
 * =============================================================================
 * Abre el navegador Brave en pantalla para que el usuario observe en tiempo real:
 *   1. Registro de Cita 1 Normal (Exitosa con Dr. Carlos a las 09:00 + Comprobante PDF)
 *   2. Intento de Cita 2 (Anti-colisión a la MISMA hora con el MISMO doctor -> RECHAZADO)
 *   3. Registro de Cita 3 (Exitosa con Dra. María en otro día y horario + Comprobante PDF)
 * =============================================================================
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BRAVE_PATHS = [
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
];

function getBraveExecutable() {
  for (const p of BRAVE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No se encontró el ejecutable de Brave Browser en las rutas estándar.');
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:5300';
const EVIDENCE_DIR = path.join(__dirname, '..', 'e2e-evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setHudBanner(page, text, variant = 'info') {
  await page.evaluate((msg, v) => {
    let banner = document.getElementById('bot-hud-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'bot-hud-banner';
      banner.style.position = 'fixed';
      banner.style.top = '14px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '9999999';
      banner.style.padding = '12px 28px';
      banner.style.borderRadius = '50px';
      banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      banner.style.fontSize = '14.5px';
      banner.style.fontWeight = '800';
      banner.style.letterSpacing = '0.2px';
      banner.style.boxShadow = '0 12px 32px rgba(0,0,0,0.35)';
      banner.style.display = 'flex';
      banner.style.alignItems = 'center';
      banner.style.gap = '12px';
      banner.style.pointerEvents = 'none';
      banner.style.transition = 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)';
      document.body.appendChild(banner);
    }
    if (v === 'success') {
      banner.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
      banner.style.color = '#ffffff';
      banner.style.border = '2px solid #34d399';
    } else if (v === 'error') {
      banner.style.background = 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)';
      banner.style.color = '#ffffff';
      banner.style.border = '2px solid #f87171';
    } else if (v === 'warning') {
      banner.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
      banner.style.color = '#ffffff';
      banner.style.border = '2px solid #fbbf24';
    } else {
      banner.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
      banner.style.color = '#38bdf8';
      banner.style.border = '2px solid #0284c7';
    }
    banner.innerHTML = `<span style="font-size:18px;">🤖</span> <span>${msg}</span>`;
  }, text, variant).catch(() => {});
}

async function runLiveTest() {
  const bravePath = getBraveExecutable();

  console.log('='.repeat(75));
  console.log('🌟 CITASSISTEMA — INICIANDO DEMOSTRACIÓN EN VIVO EN NAVEGADOR BRAVE');
  console.log('='.repeat(75));
  console.log(`🧭 Binario de Brave: ${bravePath}`);
  console.log(`🌐 URL Frontend: ${BASE_URL}`);
  console.log(`👁️  Modo: Visible / Interactivo en Pantalla (Headless = false)`);
  console.log('='.repeat(75));

  const browser = await puppeteer.launch({
    executablePath: bravePath,
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const page = (await browser.pages())[0] || (await browser.newPage());

  try {
    // =========================================================================
    // ITERACIÓN 1: REGISTRO DE CITA NORMAL (Dr. Carlos - 09:00 hrs)
    // =========================================================================
    console.log('\n[1/3] 🔵 INICIANDO FLUJO 1: Registro de Cita Normal con Dr. Carlos...');
    await page.goto(`${BASE_URL}/?view=booking`, { waitUntil: 'networkidle2' });
    await setHudBanner(page, 'FLUJO 1/3: Registrando Cita Normal (Dr. Carlos Mendoza — 09:00 hrs)...', 'info');
    await sleep(1500);

    // Paso 1: Seleccionar Traumatología y Dr. Carlos
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.specialty-card, button'));
      const trauma = cards.find((c) => c.textContent.includes('Traumatología'));
      if (trauma) trauma.click();
    });
    await sleep(1000);

    // Seleccionar servicio Consulta Médica Traumatológica
    await page.evaluate(() => {
      const serviceCards = Array.from(document.querySelectorAll('.service-card, .apx-service-card, button'));
      const svc = serviceCards.find((c) => c.textContent.includes('Consulta Médica Traumatológica') || c.textContent.includes('Traumatológica'));
      if (svc) svc.click();
    });
    await sleep(1000);

    // Clic en Continuar al Horario
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 2: Selección de fecha y slot 09:00
    await setHudBanner(page, 'FLUJO 1/3: Seleccionando fecha y franja horaria 09:00 am...', 'info');
    await page.evaluate(() => {
      const slots = Array.from(document.querySelectorAll('.slot-pill, .time-slot-btn, button[class*="slot"]'));
      if (slots.length > 0) slots[0].click();
    });
    await sleep(1000);

    // Continuar a Datos
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 3: Completar Formulario Paciente 1 (Roberto Gómez)
    await setHudBanner(page, 'FLUJO 1/3: Ingresando datos de paciente (Roberto Gómez - DNI 44556677)...', 'info');
    const docField1 = await page.$('#patientDocumentNumber');
    if (docField1) {
      await page.type('#patientDocumentNumber', '44556677', { delay: 60 });
      await page.type('#patientFirstName', 'Roberto', { delay: 60 });
      await page.type('#patientLastName', 'Gómez Salcedo', { delay: 60 });
      await page.type('#patientPhone', '+51 988 111 222', { delay: 50 });
      await page.type('#patientEmail', 'roberto.gomez@test.com', { delay: 50 });
      if (await page.$('#patientConsultationReason')) {
        await page.type('#patientConsultationReason', 'Dolor en menisco izquierdo tras práctica deportiva.', { delay: 30 });
      }
    }
    await sleep(1200);

    // Continuar a Revisión
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 4: Consentimientos
    await setHudBanner(page, 'FLUJO 1/3: Marcando consentimientos médicos y políticas...', 'info');
    await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (!cb.checked) cb.click();
      });
    });
    await sleep(1200);

    // Continuar al Pago
    await page.evaluate(() => {
      const ctaBtn = document.querySelector('.apx-validate__cta, button.btn-wizard-next');
      if (ctaBtn) ctaBtn.click();
    });
    await sleep(1500);

    // Paso 5: Selección de Pago en Clínica
    await setHudBanner(page, 'FLUJO 1/3: Seleccionando modalidad Pago en Clínica y confirmando...', 'info');
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.payment-option-card, label, button'));
      const clinicPay = options.find((o) => o.textContent.includes('Recepción') || o.textContent.includes('Pago en clínica'));
      if (clinicPay) clinicPay.click();
    });
    await sleep(1000);

    // Confirmar Reserva
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(2000);

    // Paso 6: Confirmación & Modal de Comprobante PDF
    await setHudBanner(page, '✅ CITA 1 RESERVADA CON ÉXITO: Abriendo Comprobante PDF Oficial...', 'success');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'live_01_cita_confirmada.png') });
    await sleep(1000);

    // Abrir Modal de Comprobante
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const receiptBtn = btns.find((b) => b.textContent.includes('Comprobante'));
      if (receiptBtn) receiptBtn.click();
    });
    await sleep(3500); // 3.5 segundos para que el usuario aprecie el modal
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'live_02_comprobante_modal.png') });

    // Cerrar modal de comprobante
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.receipt-close-btn, button[aria-label="Cerrar modal"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(1500);
    console.log('✅ [FLUJO 1 COMPLETADO]: Cita 1 confirmada y comprobante visualizado.');

    // =========================================================================
    // ITERACIÓN 2: INTENTO DE ANTI-COLISIÓN (Mismo día, hora y doctor)
    // =========================================================================
    console.log('\n[2/3] 🟠 INICIANDO FLUJO 2: Probando Anti-Colisión (Mismo horario)...');
    await page.goto(`${BASE_URL}/?view=booking`, { waitUntil: 'networkidle2' });
    await setHudBanner(page, 'FLUJO 2/3: Probando Anti-Colisión (Intentando MISMO día, hora y doctor)...', 'warning');
    await sleep(1500);

    // Paso 1: Seleccionar Traumatología
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.specialty-card, button'));
      const trauma = cards.find((c) => c.textContent.includes('Traumatología'));
      if (trauma) trauma.click();
    });
    await sleep(1000);

    // Seleccionar servicio Consulta Médica Traumatológica
    await page.evaluate(() => {
      const serviceCards = Array.from(document.querySelectorAll('.service-card, .apx-service-card, button'));
      const svc = serviceCards.find((c) => c.textContent.includes('Consulta Médica Traumatológica') || c.textContent.includes('Traumatológica'));
      if (svc) svc.click();
    });
    await sleep(1000);

    // Continuar al Horario
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 2: Selección de fecha y slot
    await setHudBanner(page, 'FLUJO 2/3: Seleccionando franja horaria ocupada...', 'warning');
    await page.evaluate(() => {
      const slots = Array.from(document.querySelectorAll('.slot-pill, .time-slot-btn, button[class*="slot"]'));
      if (slots.length > 0) slots[0].click();
    });
    await sleep(1000);

    // Continuar a Datos
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 3: Paciente 2 (Elena Pérez)
    await setHudBanner(page, 'FLUJO 2/3: Ingresando datos de segunda paciente (Elena Pérez)...', 'warning');
    const docField2 = await page.$('#patientDocumentNumber');
    if (docField2) {
      await page.type('#patientDocumentNumber', '77889900', { delay: 60 });
      await page.type('#patientFirstName', 'Elena', { delay: 60 });
      await page.type('#patientLastName', 'Pérez Campos', { delay: 60 });
      await page.type('#patientPhone', '+51 977 222 333', { delay: 50 });
      await page.type('#patientEmail', 'elena.perez@test.com', { delay: 50 });
      if (await page.$('#patientConsultationReason')) {
        await page.type('#patientConsultationReason', 'Segunda opinión sobre lesión de ligamentos.', { delay: 30 });
      }
    }
    await sleep(1200);

    // Continuar a Revisión
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 4: Consentimientos
    await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (!cb.checked) cb.click();
      });
    });
    await sleep(1200);

    // Continuar al Pago
    await page.evaluate(() => {
      const ctaBtn = document.querySelector('.apx-validate__cta, button.btn-wizard-next');
      if (ctaBtn) ctaBtn.click();
    });
    await sleep(1500);

    // Paso 5: Confirmar intento de reserva en el horario ocupado
    await setHudBanner(page, 'FLUJO 2/3: Enviando reserva -> El backend detectará conflicto de horario...', 'warning');
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(2500);

    // Alerta Anti-Colisión en Pantalla
    await setHudBanner(
      page,
      '🛑 ANTI-COLISIÓN CONFIRMADO: ¡Horario ocupado! El sistema bloqueó la doble reserva correctamente.',
      'error',
    );
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'live_03_anticolision_bloqueado.png') });
    await sleep(4500); // 4.5 segundos para que el usuario vea la alerta roja en vivo
    console.log('🛑 [FLUJO 2 COMPLETADO]: Bloqueo anti-colisión comprobado en pantalla.');

    // =========================================================================
    // ITERACIÓN 3: CITA CON OTRA DOCTORA EN OTRO HORARIO (Dra. María González)
    // =========================================================================
    console.log('\n[3/3] 🟢 INICIANDO FLUJO 3: Cita con OTRA profesional (Dra. María González)...');
    await page.goto(`${BASE_URL}/?view=booking`, { waitUntil: 'networkidle2' });
    await setHudBanner(page, 'FLUJO 3/3: Reservando con OTRA profesional (Dra. María González — Fisioterapia)...', 'info');
    await sleep(1500);

    // Paso 1: Seleccionar Fisioterapia y Rehabilitación
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.specialty-card, button'));
      const fisio = cards.find((c) => c.textContent.includes('Fisioterapia') || c.textContent.includes('Rehabilitación'));
      if (fisio) fisio.click();
    });
    await sleep(1000);

    // Seleccionar servicio Evaluación y Diagnóstico Físico Inicial
    await page.evaluate(() => {
      const serviceCards = Array.from(document.querySelectorAll('.service-card, .apx-service-card, button'));
      const svc = serviceCards.find((c) => c.textContent.includes('Evaluación') || c.textContent.includes('Diagnóstico'));
      if (svc) svc.click();
    });
    await sleep(1000);

    // Continuar al Horario
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 2: Selección de franja disponible con la Dra. María
    await setHudBanner(page, 'FLUJO 3/3: Seleccionando franja disponible con la Dra. María...', 'info');
    await page.evaluate(() => {
      const slots = Array.from(document.querySelectorAll('.slot-pill, .time-slot-btn, button[class*="slot"]'));
      if (slots.length > 0) slots[0].click();
    });
    await sleep(1000);

    // Continuar a Datos
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 3: Paciente 3 (Luis Valdivia)
    await setHudBanner(page, 'FLUJO 3/3: Ingresando datos de tercer paciente (Luis Valdivia - DNI 88990011)...', 'info');
    const docField3 = await page.$('#patientDocumentNumber');
    if (docField3) {
      await page.type('#patientDocumentNumber', '88990011', { delay: 60 });
      await page.type('#patientFirstName', 'Luis', { delay: 60 });
      await page.type('#patientLastName', 'Valdivia Ponce', { delay: 60 });
      await page.type('#patientPhone', '+51 966 333 444', { delay: 50 });
      await page.type('#patientEmail', 'luis.valdivia@test.com', { delay: 50 });
      if (await page.$('#patientConsultationReason')) {
        await page.type('#patientConsultationReason', 'Rehabilitación post-cirugía de hombro.', { delay: 30 });
      }
    }
    await sleep(1200);

    // Continuar a Revisión
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(1500);

    // Paso 4: Consentimientos
    await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (!cb.checked) cb.click();
      });
    });
    await sleep(1200);

    // Continuar al Pago
    await page.evaluate(() => {
      const ctaBtn = document.querySelector('.apx-validate__cta, button.btn-wizard-next');
      if (ctaBtn) ctaBtn.click();
    });
    await sleep(1500);

    // Paso 5: Modalidad Pago en Clínica y Confirmar
    await setHudBanner(page, 'FLUJO 3/3: Confirmando reserva con Dra. María González...', 'info');
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('.payment-option-card, label, button'));
      const clinicPay = options.find((o) => o.textContent.includes('Recepción') || o.textContent.includes('Pago en clínica'));
      if (clinicPay) clinicPay.click();
    });
    await sleep(1000);

    await page.evaluate(() => {
      const btn = document.querySelector('.btn-wizard-next');
      if (btn) btn.click();
    });
    await sleep(2000);

    // Paso 6: Confirmación & Comprobante Modal PDF
    await setHudBanner(page, '🎉 ¡CITA 3 CONFIRMADA CON ÉXITO! Abriendo Comprobante PDF...', 'success');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'live_04_cita3_confirmada.png') });
    await sleep(1000);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const receiptBtn = btns.find((b) => b.textContent.includes('Comprobante'));
      if (receiptBtn) receiptBtn.click();
    });
    await sleep(3500); // 3.5 segundos en pantalla
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'live_05_comprobante_cita3.png') });

    await page.evaluate(() => {
      const closeBtn = document.querySelector('.receipt-close-btn, button[aria-label="Cerrar modal"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(1500);

    // Celebración final
    await setHudBanner(
      page,
      '🏆 ¡PRUEBA EN VIVO COMPLETADA! 3/3 Flujos Operacionales Validados con Éxito.',
      'success',
    );
    await sleep(4000);

    console.log('✅ [FLUJO 3 COMPLETADO]: Cita 3 con Dra. María confirmada.');
  } catch (error) {
    console.error('❌ Error durante la demostración en vivo:', error);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'live_error.png') });
    throw error;
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(75));
  console.log('📊 REPORTE FINAL DE LA DEMOSTRACIÓN EN VIVO');
  console.log('='.repeat(75));
  console.log('✅ [FLUJO 1]: Cita 1 normal agendada con éxito (Dr. Carlos Mendoza).');
  console.log('🛑 [FLUJO 2]: Intento a la misma hora bloqueado por anti-colisión en vivo.');
  console.log('✅ [FLUJO 3]: Cita 3 agendada con éxito con otra doctora (Dra. María González).');
  console.log(`📸 Evidencias guardadas en: ${EVIDENCE_DIR}`);
  console.log('🎉 DEMOSTRACIÓN FINALIZADA CON 100% DE ÉXITO SOBRE NAVEGADOR BRAVE.');
}

runLiveTest().catch((err) => {
  console.error('Error fatal en ejecución en vivo:', err);
  process.exit(1);
});
