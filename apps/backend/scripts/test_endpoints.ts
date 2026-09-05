const BASE_URL = 'http://localhost:3000/api';
const CLINIC_ID = 'a0000000-0000-4000-a000-000000000001';

interface TestResult {
  module: string;
  method: string;
  endpoint: string;
  status: number;
  expectedStatus: number[];
  success: boolean;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  module: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  endpoint: string,
  expectedStatus: number[],
  options?: {
    body?: any;
    token?: string;
    headers?: Record<string, string>;
  },
): Promise<any> {
  const start = Date.now();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-clinic-id': CLINIC_ID,
    ...(options?.headers || {}),
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const durationMs = Date.now() - start;
    const isExpected = expectedStatus.includes(res.status);
    let data: any = null;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    results.push({
      module,
      method,
      endpoint,
      status: res.status,
      expectedStatus,
      success: isExpected,
      message: isExpected ? 'OK' : `Status ${res.status}: ${JSON.stringify(data)}`,
      durationMs,
    });

    return data;
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({
      module,
      method,
      endpoint,
      status: 0,
      expectedStatus,
      success: false,
      message: err.message,
      durationMs,
    });
    return null;
  }
}

async function runAllTests() {
  console.log('=============================================================================');
  console.log('🚀 INICIANDO BATERÍA COMPLETA DE PRUEBAS DE TODOS LOS ENDPOINTS (REST + POSTGRES)');
  console.log('=============================================================================\n');

  // 1. HEALTH MODULE
  console.log('🩺 1. Módulo Health & Estado del Sistema...');
  await testEndpoint('Health', 'GET', '/health', [200]);
  await testEndpoint('Health', 'GET', '/health/database', [200]);

  // 2. AUTH MODULE
  console.log('🔐 2. Módulo Auth (4 Roles + Perfil JWT)...');
  const adminLogin = await testEndpoint('Auth', 'POST', '/auth/login', [200], {
    body: {
      email: 'admin@clinica.pe',
      password: 'Password123!',
      clinicSlug: 'clinica-demo',
    },
  });
  const adminToken = adminLogin?.accessToken;

  const doctorLogin = await testEndpoint('Auth', 'POST', '/auth/login', [200], {
    body: {
      email: 'doctor@clinica.pe',
      password: 'Password123!',
      clinicSlug: 'clinica-demo',
    },
  });
  const doctorToken = doctorLogin?.accessToken;

  const recepLogin = await testEndpoint('Auth', 'POST', '/auth/login', [200], {
    body: {
      email: 'recepcion@clinica.pe',
      password: 'Password123!',
      clinicSlug: 'clinica-demo',
    },
  });
  const recepToken = recepLogin?.accessToken;

  const patientLogin = await testEndpoint('Auth', 'POST', '/auth/login', [200], {
    body: {
      email: 'paciente@clinica.pe',
      password: 'Password123!',
      clinicSlug: 'clinica-demo',
    },
  });
  const patientToken = patientLogin?.accessToken;

  await testEndpoint('Auth', 'GET', '/auth/me', [200], { token: adminToken });

  // 3. SPECIALTIES MODULE
  console.log('📋 3. Módulo Especialidades...');
  const specialties = await testEndpoint('Specialties', 'GET', '/specialties', [200]);
  const specId = (Array.isArray(specialties) ? specialties[0]?.id : specialties?.data?.[0]?.id) || 'c0000000-0000-4000-a000-000000000001';
  await testEndpoint('Specialties', 'GET', `/specialties/${specId}`, [200]);

  const newSpec = await testEndpoint('Specialties', 'POST', '/specialties', [201], {
    token: adminToken,
    body: {
      name: 'Cardiología Preventiva ' + Date.now().toString().slice(-4),
      description: 'Chequeo cardiológico y pruebas de esfuerzo',
      icon: 'heart',
      sortOrder: 10,
    },
  });

  const createdSpecId = newSpec?.id || specId;
  if (newSpec?.id) {
    await testEndpoint('Specialties', 'PATCH', `/specialties/${newSpec.id}`, [200], {
      token: adminToken,
      body: { description: 'Descripción actualizada vía test automatizado' },
    });
  }

  // 4. SERVICES MODULE
  console.log('🩺 4. Módulo Servicios y Tarifario...');
  const services = await testEndpoint('Services', 'GET', '/services', [200]);
  const serviceId = (Array.isArray(services) ? services[0]?.id : services?.data?.[0]?.id) || 'd0000000-0000-4000-a000-000000000001';
  await testEndpoint('Services', 'GET', `/services/${serviceId}`, [200]);

  const newService = await testEndpoint('Services', 'POST', '/services', [201], {
    token: adminToken,
    body: {
      specialtyId: createdSpecId,
      name: 'Electrocardiograma Basal ' + Date.now().toString().slice(-4),
      description: 'Lectura e informe cardiológico completo',
      durationMinutes: 30,
      price: 95.0,
      isActive: true,
    },
  });
  const createdServiceId = newService?.id || serviceId;

  // 5. PROFESSIONALS MODULE
  console.log('👨‍⚕️ 5. Módulo Profesionales...');
  const professionals = await testEndpoint('Professionals', 'GET', '/professionals', [200]);
  const profId = (Array.isArray(professionals) ? professionals[0]?.id : professionals?.data?.[0]?.id) || 'e0000000-0000-4000-a000-000000000001';
  await testEndpoint('Professionals', 'GET', `/professionals/${profId}`, [200]);

  // 6. SCHEDULES MODULE
  console.log('🗓️ 6. Módulo Horarios y Bloqueos...');
  await testEndpoint('Schedules', 'GET', `/schedules/professionals/${profId}`, [200]);
  await testEndpoint('Schedules', 'GET', `/schedules/professionals/${profId}/blocks`, [200]);

  // 7. PATIENTS MODULE
  console.log('👥 7. Módulo Pacientes...');
  const patients = await testEndpoint('Patients', 'GET', '/patients?limit=10', [200], { token: adminToken });
  const uniqueDoc = '7' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7);
  const newPatient = await testEndpoint('Patients', 'POST', '/patients', [201], {
    token: adminToken,
    body: {
      firstName: 'Paciente',
      lastName: 'Prueba Automated',
      email: `paciente.${uniqueDoc}@test.com`,
      phone: '+51 988 776 655',
      dateOfBirth: '1990-05-15',
      gender: 'M',
      address: 'Av. Las Palmeras 123, San Isidro',
      nationalId: uniqueDoc,
      medicalNotes: 'Sin antecedentes relevantes',
      isActive: true,
    },
  });
  const createdPatientId = newPatient?.id || (Array.isArray(patients) ? patients[0]?.id : patients?.data?.[0]?.id);

  if (createdPatientId) {
    await testEndpoint('Patients', 'GET', `/patients/${createdPatientId}`, [200], { token: adminToken });
    await testEndpoint('Patients', 'GET', `/patients/${createdPatientId}/history`, [200], { token: adminToken });
  }

  // 8. APPOINTMENTS MODULE
  console.log('📅 8. Módulo Citas Médicas (CRUD + Availability + State Machine)...');
  await testEndpoint('Appointments', 'GET', '/appointments', [200], { token: adminToken });
  // Find a verified available slot from availability
  let appointmentDate = '2026-09-07';
  let startTime = '10:00';

  for (const testDate of ['2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']) {
    const avail = await testEndpoint('Appointments', 'GET', `/appointments/availability?professionalId=${profId}&serviceId=${createdServiceId}&date=${testDate}`, [200]);
    const slots = Array.isArray(avail) ? avail : avail?.data || [];
    if (slots.length > 0 && slots[0]?.startTime) {
      appointmentDate = testDate;
      startTime = slots[0].startTime;
      break;
    }
  }

  const newAppt = await testEndpoint('Appointments', 'POST', '/appointments', [201], {
    token: recepToken || adminToken,
    body: {
      professionalId: profId,
      serviceId: createdServiceId,
      patientId: createdPatientId,
      appointmentDate,
      startTime,
      notes: 'Cita generada por suite de prueba automatizada',
    },
  });

  const apptId = newAppt?.id;
  if (apptId) {
    await testEndpoint('Appointments', 'GET', `/appointments/${apptId}`, [200], { token: adminToken });
    await testEndpoint('Appointments', 'PATCH', `/appointments/${apptId}/confirm`, [200], { token: adminToken });
    await testEndpoint('Appointments', 'PATCH', `/appointments/${apptId}/check-in`, [200], { token: adminToken });
    await testEndpoint('Appointments', 'PATCH', `/appointments/${apptId}/start`, [200], { token: doctorToken || adminToken });
    await testEndpoint('Appointments', 'PATCH', `/appointments/${apptId}/complete`, [200], { token: doctorToken || adminToken });
    await testEndpoint('Appointments', 'GET', `/appointments/${apptId}/history`, [200], { token: adminToken });
  }

  // 9. CLINICAL MODULE
  console.log('🩺 9. Módulo Historia Clínica, Tratamientos y Prescripciones...');
  if (createdPatientId) {
    const medRecord = await testEndpoint('Clinical', 'POST', '/clinical/records', [201], {
      token: doctorToken || adminToken,
      body: {
        patientId: createdPatientId,
        professionalId: profId,
        appointmentId: apptId,
        chiefComplaint: 'Dolor agudo lumbar post-esfuerzo',
        anamnesis: 'Paciente refiere inicio insidioso hace 48 horas tras levantamiento de carga.',
        physicalExamination: 'Dolor a la palpación L4-L5, sin signos neurológicos deficitarios.',
        diagnosis: 'Lumbalgia mecánica aguda con contractura muscular (M54.5)',
        treatmentPlan: '10 sesiones de fisioterapia y analgesia oral.',
        painScale: 7,
        notes: 'Control en 10 días.',
      },
    });

    await testEndpoint('Clinical', 'GET', `/clinical/records/patient/${createdPatientId}`, [200], { token: doctorToken || adminToken });
    if (medRecord?.id) {
      await testEndpoint('Clinical', 'GET', `/clinical/records/${medRecord.id}`, [200], { token: doctorToken || adminToken });
    }

    const treatment = await testEndpoint('Clinical', 'POST', '/clinical/treatments', [201], {
      token: doctorToken || adminToken,
      body: {
        patientId: createdPatientId,
        professionalId: profId,
        name: 'Protocolo de Rehabilitación Lumbar y Reeducación Postural',
        description: 'Terapia manual descompresiva, termoterapia y ejercicios de fortalecimiento del core.',
        diagnosis: 'Lumbalgia Mecánica',
        goals: 'Alivio del dolor EVA <= 2 y recuperación de movilidad.',
        totalSessions: 10,
        startDate: '2026-09-07',
      },
    });

    if (treatment?.id) {
      await testEndpoint('Clinical', 'GET', `/clinical/treatments/patient/${createdPatientId}`, [200], { token: doctorToken || adminToken });
      await testEndpoint('Clinical', 'GET', `/clinical/treatments/${treatment.id}`, [200], { token: doctorToken || adminToken });

      await testEndpoint('Clinical', 'POST', `/clinical/treatments/${treatment.id}/sessions`, [201], {
        token: doctorToken || adminToken,
        body: {
          sessionDate: '2026-09-07',
          notes: 'Sesión inicial de protocolo de rehabilitación',
          evolution: 'Buena tolerancia al tratamiento, mejoría de rango articular.',
          durationMinutes: 45,
          painScaleBefore: 7,
          painScaleAfter: 4,
          techniquesApplied: ['Terapia manual descompresiva', 'Termoterapia'],
        },
      });

      await testEndpoint('Clinical', 'GET', `/clinical/treatments/${treatment.id}/sessions`, [200], { token: doctorToken || adminToken });
    }

    const prescription = await testEndpoint('Clinical', 'POST', '/clinical/prescriptions', [201], {
      token: doctorToken || adminToken,
      body: {
        patientId: createdPatientId,
        professionalId: profId,
        appointmentId: apptId,
        medications: [
          { medicationName: 'Paracetamol', dose: '500mg', route: 'Oral', frequency: 'Cada 8 horas', duration: '5 días', instructions: 'Tomar después de los alimentos.' },
          { medicationName: 'Complejo B', dose: '1 cápsula', route: 'Oral', frequency: 'Cada 24 horas', duration: '30 días', instructions: 'Por la mañana.' },
        ],
        instructions: 'Aplicar calor local en zona lumbar por 15 minutos en la noche.',
        validUntil: '2026-10-04',
      },
    });

    if (prescription?.id) {
      await testEndpoint('Clinical', 'GET', `/clinical/prescriptions/patient/${createdPatientId}`, [200], { token: doctorToken || adminToken });
      await testEndpoint('Clinical', 'GET', `/clinical/prescriptions/${prescription.id}`, [200], { token: doctorToken || adminToken });
    }
  }

  // 10. CASH / CAJA MODULE
  console.log('💵 10. Módulo Caja y Arqueo...');
  const todayCash = await testEndpoint('Cash', 'GET', '/cash/today', [200], { token: recepToken || adminToken });
  let activeRegisterId = todayCash?.register?.id;

  if (activeRegisterId) {
    // Si ya está abierta, registrar un movimiento y cerrarla para poder abrir una nueva
    await testEndpoint('Cash', 'POST', `/cash/${activeRegisterId}/movements`, [201], {
      token: recepToken || adminToken,
      body: {
        type: 'sale',
        amount: 80.0,
        description: 'Cobro de consulta de fisioterapia',
      },
    });
    await testEndpoint('Cash', 'POST', `/cash/${activeRegisterId}/close`, [200], {
      token: recepToken || adminToken,
      body: {
        closingAmount: 280.0,
        notes: 'Cierre de arqueo para prueba',
      },
    });
  }

  const openedCash = await testEndpoint('Cash', 'POST', '/cash/open', [201], {
    token: recepToken || adminToken,
    body: {
      openingAmount: 200.0,
      name: 'Caja Principal Sede San Isidro ' + Date.now().toString().slice(-4),
      notes: 'Apertura de turno matutino por recepción',
    },
  });

  const currentCashId = openedCash?.id || activeRegisterId;
  if (currentCashId) {
    await testEndpoint('Cash', 'POST', `/cash/${currentCashId}/movements`, [201], {
      token: recepToken || adminToken,
      body: {
        type: 'adjustment',
        amount: 15.0,
        description: 'Ajuste de caja menor',
      },
    });
  }

  await testEndpoint('Cash', 'GET', '/cash/today', [200], { token: recepToken || adminToken });
  await testEndpoint('Cash', 'GET', '/cash/history', [200], { token: adminToken });

  // 11. INVENTORY MODULE
  console.log('📦 11. Módulo Inventario y Kardex...');
  await testEndpoint('Inventory', 'GET', '/inventory', [200], { token: adminToken });
  await testEndpoint('Inventory', 'GET', '/inventory/alerts', [200], { token: adminToken });
  await testEndpoint('Inventory', 'GET', '/inventory/movements', [200], { token: adminToken });

  const product = await testEndpoint('Inventory', 'POST', '/inventory', [201], {
    token: adminToken,
    body: {
      name: 'Gel Conductor Ultrasonido 5L ' + Date.now().toString().slice(-4),
      sku: 'GEL-5L-' + Date.now().toString().slice(-4),
      category: 'INSUMOS_FISIOTERAPIA',
      unit: 'Galón',
      costPrice: 45.0,
      sellPrice: 65.0,
      currentStock: 15,
      minStock: 3,
    },
  });

  if (product?.id) {
    await testEndpoint('Inventory', 'GET', `/inventory/${product.id}`, [200], { token: adminToken });
  }

  // 12. AI MODULE
  console.log('🤖 12. Módulo IA (RAG Chatbot + Base de Conocimiento)...');
  await testEndpoint('AI', 'POST', '/ai/chat', [200, 201], {
    body: {
      message: '¿Cuáles son los horarios de atención y especialistas en dolor?',
      clinicId: CLINIC_ID,
    },
  });
  await testEndpoint('AI', 'GET', `/ai/knowledge?clinicId=${CLINIC_ID}`, [200]);

  // 13. TELEGRAM MODULE
  console.log('📱 13. Módulo Telegram Bot...');
  await testEndpoint('Telegram', 'GET', '/telegram/account', [200], { token: doctorToken || adminToken });
  await testEndpoint('Telegram', 'POST', '/telegram/link-code', [200, 201], {
    token: doctorToken || adminToken,
    body: {
      professionalId: profId,
      role: 'PROFESIONAL',
    },
  });

  // SUMMARY REPORT
  console.log('\n=============================================================================');
  console.log('📊 REPORTE FINAL DE PRUEBAS DE TODOS LOS ENDPOINTS');
  console.log('=============================================================================');
  
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.table(
    results.map((r) => ({
      Módulo: r.module,
      Método: r.method,
      Endpoint: r.endpoint.length > 38 ? r.endpoint.slice(0, 35) + '...' : r.endpoint,
      HTTP: r.status,
      Esperado: r.expectedStatus.join(','),
      Estado: r.success ? '✅ PASS' : '❌ FAIL',
      'Tiempo (ms)': r.durationMs,
    })),
  );

  console.log(`\nTotal Endpoints Evaluados: ${results.length}`);
  console.log(`✅ Exitosos (PASS): ${passed}`);
  console.log(`❌ Fallidos (FAIL): ${failed}`);
  console.log(`Porcentaje de Éxito: ${Math.round((passed / results.length) * 100)}%\n`);

  if (failed > 0) {
    console.error('⚠️ ALGUNOS ENDPOINTS FALLARON. Detalles:');
    results.filter(r => !r.success).forEach(r => {
      console.error(`- [${r.method}] ${r.endpoint}: Status ${r.status} (Esperaba ${r.expectedStatus.join(',')}) -> ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 ¡TODOS LOS ENDPOINTS FUNCIONAN AL 100% CORRECTAMENTE CONECTADOS A POSTGRESQL!');
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
