import React, { useState } from 'react';
import './ClinicalDashboard.css';
import {
  IconBuilding,
  IconPlus,
  IconFileText,
  IconCalendar,
  IconCash,
  IconShield,
  IconArrowRight,
  IconChart,
  IconSearch,
} from '../../components/ui/Icons';
import { MaterialIcon } from '../../components/ui/MaterialIcon';

interface SuperAdminDashboardProps {
  onSwitchClinic?: (clinicId: string) => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
  onNavigate?: (view: string) => void;
}

interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  cmp: string;
  shift?: 'Mañana' | 'Tarde' | 'Completo';
  room?: string;
  status: 'Activo' | 'Vacaciones' | 'Licencia';
}

interface ClinicRecord {
  id: string;
  name: string;
  legalName?: string;
  ruc?: string;
  slug: string;
  city: string;
  address?: string;
  mapsUrl?: string;
  phone?: string;
  email?: string;
  operatingDays?: string[];
  toleranceMinutes?: number;
  directorName?: string;
  directorCmp?: string;
  licenseExpiry?: string;
  renipressCode?: string;
  ipressCategory?: string;
  openingHours?: string;
  slotDuration?: number;
  doctors: number;
  consultingRooms: number;
  activeAppointments: number;
  status: 'active' | 'onboarding' | 'suspended' | 'maintenance';
  monthlyRevenue: string;
  revenueAmount: number;
  assignedDoctorsList?: DoctorItem[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onSwitchClinic,
  onOpenClinicConsole,
  onNavigate,
}) => {
  const [selectedClinic, setSelectedClinic] = useState('a0000000-0000-0000-0000-000000000001');
  const [isNewClinicModalOpen, setIsNewClinicModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Clinic Management Modal state
  const [managingClinic, setManagingClinic] = useState<ClinicRecord | null>(null);

  // Clinic Finance Modal state
  const [financeClinic, setFinanceClinic] = useState<ClinicRecord | null>(null);

  // Table Filter & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'suspended'>('all');

  // Form state for new clinic
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicSlug, setNewClinicSlug] = useState('');
  const [newClinicCity, setNewClinicCity] = useState('');
  const [newClinicAdmin, setNewClinicAdmin] = useState('');
  const [newClinicDoctors, setNewClinicDoctors] = useState(4);
  const [newClinicRooms, setNewClinicRooms] = useState(6);

  // Clinic Modal Tab & Staff Search states
  const [clinicModalTab, setClinicModalTab] = useState<'general' | 'operations' | 'staff' | 'compliance'>('general');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffSpecialtyFilter, setStaffSpecialtyFilter] = useState('all');
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('Fisioterapia y Rehabilitación');
  const [newDocCmp, setNewDocCmp] = useState('');
  const [newDocShift, setNewDocShift] = useState<'Mañana' | 'Tarde' | 'Completo'>('Mañana');
  const [newDocRoom, setNewDocRoom] = useState('Cons. 101');

  // Clinics dynamic state
  const [clinics, setClinics] = useState<ClinicRecord[]>([
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Clínica Sanitas Lima',
      legalName: 'Sanitas Salud Integral S.A.C.',
      ruc: '20601928371',
      slug: 'clinica-demo',
      city: 'Lima, San Isidro',
      address: 'Av. Javier Prado Este 1120, San Isidro',
      doctors: 4,
      consultingRooms: 10,
      activeAppointments: 48,
      status: 'active',
      monthlyRevenue: 'S/ 48,920.00',
      revenueAmount: 48920,
      phone: '+51 (01) 482-9100',
      email: 'admision.lima@sanitas.pe',
      renipressCode: '00029182',
      ipressCategory: 'Policlínico de Especialidades (I-3)',
      openingHours: 'Lunes a Sábado · 07:00 a 20:00',
      slotDuration: 30,
      assignedDoctorsList: [
        { id: 'doc-1', name: 'Dr. Carlos Torres Vega', specialty: 'Traumatología y Ortopedia', cmp: 'CMP 48291', status: 'Activo' },
        { id: 'doc-2', name: 'Dra. María González Silva', specialty: 'Fisioterapia y Rehabilitación', cmp: 'CMP 51928', status: 'Activo' },
        { id: 'doc-3', name: 'Lic. Roberto Ramos Prado', specialty: 'Terapia Manual & Kinesiología', cmp: 'CTMP 19283', status: 'Activo' },
        { id: 'doc-4', name: 'Dra. Elena Castro Ortiz', specialty: 'Medicina Física', cmp: 'CMP 60124', status: 'Activo' },
      ],
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      name: 'Centro Médico Arequipa Salud',
      legalName: 'Servicios Médicos Arequipa S.R.L.',
      ruc: '20504829182',
      slug: 'centro-arequipa',
      city: 'Arequipa, Yanahuara',
      address: 'Calle Bolognesi 412, Yanahuara',
      doctors: 2,
      consultingRooms: 5,
      activeAppointments: 22,
      status: 'active',
      monthlyRevenue: 'S/ 24,150.00',
      revenueAmount: 24150,
      phone: '+51 (054) 251-400',
      email: 'arequipa@sanitas.pe',
      renipressCode: '00034190',
      ipressCategory: 'Centro Médico (I-3)',
      openingHours: 'Lunes a Viernes · 08:00 a 19:00',
      slotDuration: 45,
      assignedDoctorsList: [
        { id: 'doc-5', name: 'Dr. Jorge Paredes Salas', specialty: 'Rehabilitación y Deporte', cmp: 'CMP 39182', status: 'Activo' },
        { id: 'doc-6', name: 'Dra. Claudia Valdivia', specialty: 'Fisioterapia Neurológica', cmp: 'CMP 44102', status: 'Activo' },
      ],
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Policlínico Cusco Norte',
      legalName: 'Consorcio Médico del Sur S.A.C.',
      ruc: '20491827461',
      slug: 'policlinico-cusco',
      city: 'Cusco, Wanchaq',
      address: 'Av. De la Cultura 780, Wanchaq',
      doctors: 1,
      consultingRooms: 4,
      activeAppointments: 15,
      status: 'onboarding',
      monthlyRevenue: 'S/ 9,400.00',
      revenueAmount: 9400,
      phone: '+51 (084) 229-310',
      email: 'cusco@sanitas.pe',
      renipressCode: '00041289',
      ipressCategory: 'Policlínico (I-2)',
      openingHours: 'Lunes a Viernes · 08:00 a 18:00',
      slotDuration: 30,
      assignedDoctorsList: [
        { id: 'doc-7', name: 'Dr. Walter Quispe Huamán', specialty: 'Traumatología General', cmp: 'CMP 50192', status: 'Activo' },
      ],
    },
  ]);

  const auditEvents = [
    { id: 'aud-1', time: '13:40:12', user: 'admin@clinica.pe', action: 'LOGIN_SUCCESS', tenant: 'clinica-demo', ip: '190.235.14.82', status: 'Verificado' },
    { id: 'aud-2', time: '13:35:05', user: 'doctor@clinica.pe', action: 'EVA_SCORE_UPDATE', tenant: 'clinica-demo', ip: '190.235.14.82', status: 'Verificado' },
    { id: 'aud-3', time: '13:20:30', user: 'recepcion@clinica.pe', action: 'APPOINTMENT_CHECKIN', tenant: 'clinica-demo', ip: '190.235.14.82', status: 'Verificado' },
    { id: 'aud-4', time: '12:55:18', user: 'superadmin@citassistema.pe', action: 'TENANT_METRICS_READ', tenant: 'global', ip: '200.12.90.11', status: 'Verificado' },
  ];

  // Dynamic totals
  const totalAppointments = clinics.reduce((acc, c) => acc + c.activeAppointments, 0);
  const totalRevenue = clinics.reduce((acc, c) => acc + c.revenueAmount, 0);

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim() || !newClinicSlug.trim()) return;

    const formattedSlug = newClinicSlug.trim().toLowerCase().replace(/\s+/g, '-');
    const newEntry: ClinicRecord = {
      id: `a0000000-0000-0000-0000-${String(clinics.length + 1).padStart(12, '0')}`,
      name: newClinicName.trim(),
      slug: formattedSlug,
      city: newClinicCity.trim() || 'Lima, San Borja',
      doctors: Number(newClinicDoctors) || 2,
      consultingRooms: Number(newClinicRooms) || 4,
      activeAppointments: 0,
      status: 'onboarding',
      monthlyRevenue: 'S/ 0.00',
      revenueAmount: 0,
      phone: '+51 (01) 500-1234',
    };

    setClinics((prev) => [...prev, newEntry]);
    setSelectedClinic(newEntry.id);
    onSwitchClinic?.(newEntry.id);
    setIsNewClinicModalOpen(false);

    // Reset fields
    setNewClinicName('');
    setNewClinicSlug('');
    setNewClinicCity('');
    setNewClinicAdmin('');
    setNewClinicDoctors(4);
    setNewClinicRooms(6);

    showToast(`¡Nueva clínica "${newEntry.name}" aprovisionada exitosamente en el clúster multi-tenant con slug [${formattedSlug}]!`);
  };

  const handleSwitchContext = (clinic: ClinicRecord) => {
    setSelectedClinic(clinic.id);
    onSwitchClinic?.(clinic.id);
  };

  const handleSaveClinicChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingClinic) return;

    setClinics((prev) =>
      prev.map((c) => (c.id === managingClinic.id ? managingClinic : c))
    );
    showToast(`¡Configuración de "${managingClinic.name}" actualizada con éxito!`);
    setManagingClinic(null);
  };

  // Filter clinics
  const filteredClinics = clinics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-canvas">
      {/* Dynamic Toast Feedback Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: '14px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.84rem',
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Header & Context */}
      <header className="dashboard-header">
        <div>
          <div className="clinic-badge" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#7c3aed', display: 'inline-block' }} />
            Master Multi-Tenant · Red Global de Clínicas
          </div>
          <h1 className="dashboard-title">
            Panel de Control Global de Clínicas (Super Admin)
          </h1>
          <p className="dashboard-subtitle">
            Supervisión centralizada de infraestructura, sedes médicas y cumplimiento normativo (Ley N° 29733).
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsAuditModalOpen(true)}
          >
            <IconFileText className="w-4 h-4 text-purple-600" />
            <span>Auditoría Ley 29733</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed', boxShadow: '0 4px 10px -2px rgba(124, 58, 237, 0.35)' }}
            onClick={() => setIsNewClinicModalOpen(true)}
          >
            <IconPlus className="w-4 h-4" />
            <span>+ Nueva Clínica (Tenant)</span>
          </button>
        </div>
      </header>

      {/* Nivel 1: Tarjetas KPI de la Red */}
      <section className="kpi-grid">
        {/* KPI 1: Sedes */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Sedes Conectadas</span>
            <div className="kpi-icon-wrap kpi-icon-purple">
              <IconBuilding className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{clinics.length} / {clinics.length}</div>
          <div className="kpi-footer">
            <span className="kpi-trend">
              ● 100% Uptime
            </span>
            <span style={{ color: '#94a3b8' }}>Clúster Salud OK</span>
          </div>
        </div>

        {/* KPI 2: Citas Red */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Citas Activas Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-sky">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{totalAppointments} Citas</div>
          <div className="kpi-footer">
            <span className="kpi-trend">
              ↑ En curso
            </span>
            <span style={{ color: '#94a3b8' }}>En toda la red</span>
          </div>
        </div>

        {/* KPI 3: Facturación Consolidada */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Facturación Global</span>
            <div className="kpi-icon-wrap kpi-icon-emerald">
              <IconCash className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">S/ {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-footer">
            <span style={{ color: '#16a34a', fontWeight: 600 }}>● Liquidaciones al día</span>
            <span style={{ color: '#94a3b8' }}>{clinics.length} sedes</span>
          </div>
        </div>

        {/* KPI 4: Seguridad & RLS */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Aislamiento & Seguridad</span>
            <div className="kpi-icon-wrap kpi-icon-teal">
              <IconShield className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#0d9488' }}>0 Brechas</div>
          <div className="kpi-footer">
            <span>Aislamiento RLS PostgreSQL</span>
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Seguro</span>
          </div>
        </div>
      </section>

      {/* Banner de Infraestructura y Respaldo */}
      <div className="table-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', background: 'linear-gradient(90deg, #faf5ff 0%, #ffffff 50%, #f0fdfa 100%)', borderColor: '#e9d5ff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)' }}>
              <IconShield className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Infraestructura Cloud Salud Perú · RLS & Respaldo Automático
                </h4>
                <span className="status-pill status-confirmed" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
                  ● Nodo Activo
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                PostgreSQL con Row-Level Security por <code style={{ color: '#7c3aed', fontWeight: 700 }}>clinic_id</code> inmutable. Backups automáticos cifrados cada 24 horas.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
              <span style={{ color: '#64748b', display: 'block' }}>Latencia Clúster</span>
              <strong style={{ color: '#16a34a' }}>1.8 ms (Lima-Norte)</strong>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
              onClick={() => alert('Diagnóstico de infraestructura: Servidor de base de datos operativo. Conexiones pool: 14/100. Espacio disponible: 88.4%.')}
            >
              Comprobar Red
            </button>
          </div>
        </div>
      </div>

      {/* Nivel 2: Directorio de Sedes y Clínicas Multi-Tenant */}
      <section className="table-card" style={{ marginBottom: '2rem' }}>
        {/* Fila 1: Título y Botón Principal de Aprovisionamiento */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1.25rem',
          borderBottom: '1.5px solid #f1f5f9',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 className="table-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Directorio de Sedes y Clínicas de la Red
            </h2>
            <p className="table-subtitle" style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              Administración centralizada de infraestructura, staff médico asignado y estados operativos en tiempo real.
            </p>
          </div>

          <button
            type="button"
            className="cash-btn primary"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              borderColor: '#7c3aed',
              boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '12px'
            }}
            onClick={() => setIsNewClinicModalOpen(true)}
          >
            <span>+ Aprovisionar Nueva Sede</span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fila 2: Barra de Filtros y Búsqueda */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.15rem 0 1.25rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Filtro Segmentado por Estado */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                color: statusFilter === 'all' ? '#7c3aed' : '#64748b',
                boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              Todas ({clinics.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'active' ? '#ffffff' : 'transparent',
                color: statusFilter === 'active' ? '#15803d' : '#64748b',
                boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              ● Operativas ({clinics.filter(c => c.status === 'active').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('onboarding')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'onboarding' ? '#ffffff' : 'transparent',
                color: statusFilter === 'onboarding' ? '#b45309' : '#64748b',
                boxShadow: statusFilter === 'onboarding' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease'
              }}
            >
              ● En Setup ({clinics.filter(c => c.status === 'onboarding').length})
            </button>
          </div>

          {/* Buscador y Contador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                <IconSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por sede, ciudad o slug..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              Mostrando {filteredClinics.length} de {clinics.length} sedes
            </span>
          </div>
        </div>

        <div className="clinical-table-wrapper">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Clínica / Sede</th>
                <th>Ubicación</th>
                <th>Staff Médico</th>
                <th>Citas Activas</th>
                <th>Facturación Mes</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No se encontraron sedes clínicas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredClinics.map((c) => (
                  <tr
                    key={c.id}
                    style={selectedClinic === c.id ? { backgroundColor: '#f5f3ff' } : undefined}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconBuilding className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="patient-name-cell">{c.name}</div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{c.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>{c.city}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{c.doctors} profesionales</span>
                    </td>
                    <td>
                      <span className="time-badge">{c.activeAppointments} citas</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.monthlyRevenue}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${c.status === 'active' ? 'status-confirmed' : c.status === 'suspended' ? 'status-in_consultation' : 'status-waiting'}`}>
                        <span>●</span> {c.status === 'active' ? 'Operativa' : c.status === 'suspended' ? 'Suspendida' : 'En Configuración'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {/* Action 1: Operate Sede Console directly */}
                        {onOpenClinicConsole && (
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', borderColor: '#7c3aed', fontWeight: 800 }}
                            onClick={() => onOpenClinicConsole(c)}
                            title="Operar y supervisar consola médica de esta sede"
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MaterialIcon name="verified_user" size={15} />
                              <span>Operar Sede ↗</span>
                            </span>
                          </button>
                        )}

                        {/* Action 2: Manage Clinic Modal */}
                        <button
                          type="button"
                          className="table-action-btn"
                          style={selectedClinic === c.id ? { background: '#f5f3ff', color: '#7c3aed', borderColor: '#c4b5fd', fontWeight: 700 } : undefined}
                          onClick={() => {
                            handleSwitchContext(c);
                            setManagingClinic(c);
                          }}
                          title="Gestionar configuración, staff y consultorios de esta sede"
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MaterialIcon name="settings" size={15} />
                            <span>Gestionar Sede</span>
                          </span>
                        </button>

                        {/* Action 3: Finances Breakdown Modal */}
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => setFinanceClinic(c)}
                          title="Supervisar desglose financiero y liquidación de esta sede"
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MaterialIcon name="account_balance" size={15} />
                            <span>Finanzas</span>
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nivel 3: Módulos de Supervisión Global (Super Admin) */}
      <section>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>
          Módulos de Gestión Master
        </h2>
        <div className="modules-grid">
          {/* Módulo 1: Tenants */}
          <div
            onClick={() => setIsNewClinicModalOpen(true)}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-purple">
                <IconBuilding className="w-6 h-6" />
              </div>
              <h3 className="module-title">Aprovisionamiento de Sedes</h3>
              <p className="module-desc">
                Alta de nuevas clínicas médicas, asignación de slugs únicos, cuotas de consultorios y credenciales maestras de director.
              </p>
            </div>
            <span className="module-link" style={{ color: '#7c3aed' }}>
              <span>Aprovisionar Sede</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Módulo 2: Auditoría Ley 29733 */}
          <div
            onClick={() => setIsAuditModalOpen(true)}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-teal">
                <IconShield className="w-6 h-6" />
              </div>
              <h3 className="module-title">Auditoría Ley N° 29733</h3>
              <p className="module-desc">
                Registro inmutable de trazabilidad sobre datos sensibles de salud, accesos de staff médico y exportación pericial en PDF.
              </p>
            </div>
            <span className="module-link" style={{ color: '#0d9488' }}>
              <span>Ver Registros de Seguridad</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Módulo 3: Finanzas Consolidadas */}
          <div
            onClick={() => {
              const active = clinics.find(c => c.id === selectedClinic) || clinics[0];
              setFinanceClinic(active);
            }}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-emerald">
                <IconCash className="w-6 h-6" />
              </div>
              <h3 className="module-title">Liquidación & Finanzas</h3>
              <p className="module-desc">
                Facturación global de la red, conciliación de pagos electrónicos (Yape/Plin/POS) y liquidación de comisiones de doctores.
              </p>
            </div>
            <span className="module-link" style={{ color: '#059669' }}>
              <span>Supervisar Finanzas</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Módulo 4: Infraestructura y DB */}
          <div
            onClick={() => alert('Verificación de integridad de base de datos PostgreSQL: Todos los nodos saludables. Latencia: 1.8ms. Réplicas sincronizadas.')}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-sky">
                <IconChart className="w-6 h-6" />
              </div>
              <h3 className="module-title">Monitor de Backups & DB</h3>
              <p className="module-desc">
                Estado de aislamiento de clúster PostgreSQL, políticas de retención de respaldos y monitoreo de disponibilidad en la nube.
              </p>
            </div>
            <span className="module-link" style={{ color: '#0284c7' }}>
              <span>Ver Estado del Clúster</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Modal 1: + Nueva Clínica (Tenant) */}
      {isNewClinicModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsNewClinicModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', width: '96%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #ddd6fe' }}>
                  <IconBuilding className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Aprovisionar Nueva Sede Clínica</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Alta de tenant en el clúster multi-tenant con RLS PostgreSQL.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClinicModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClinic}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Tarjeta 1: Identidad Comercial */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title">
                      <MaterialIcon name="local_hospital" size={16} />
                      Identidad Comercial & Slug de Acceso
                    </h4>
                    <span className="form-section-badge">TENANT ID</span>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">
                      <span>Nombre Comercial de la Sede</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><MaterialIcon name="local_hospital" size={16} /></span>
                      <input
                        type="text"
                        required
                        placeholder="ej. Centro Médico San Borja"
                        className="modern-form-input"
                        value={newClinicName}
                        onChange={(e) => {
                          setNewClinicName(e.target.value);
                          if (!newClinicSlug) {
                            setNewClinicSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                    <div className="input-field-wrap">
                      <label className="input-field-label">
                        <span>Slug de Acceso (Subdominio)</span>
                        <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="input-with-icon">
                        <span className="input-icon-left"><MaterialIcon name="link" size={16} /></span>
                        <input
                          type="text"
                          required
                          placeholder="centro-san-borja"
                          className="modern-form-input monospace"
                          value={newClinicSlug}
                          onChange={(e) => setNewClinicSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        />
                      </div>
                    </div>

                    <div className="input-field-wrap">
                      <label className="input-field-label">
                        <span>Ciudad / Distrito</span>
                        <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div className="input-with-icon">
                        <span className="input-icon-left"><MaterialIcon name="location_city" size={16} /></span>
                        <input
                          type="text"
                          required
                          placeholder="Lima, San Borja"
                          className="modern-form-input"
                          value={newClinicCity}
                          onChange={(e) => setNewClinicCity(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Infraestructura */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title">
                      <MaterialIcon name="settings" size={16} />
                      Infraestructura & Capacidad Inicial
                    </h4>
                    <span className="form-section-badge">DIMENSIONAMIENTO</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-field-wrap">
                      <label className="input-field-label">
                        <span>Consultorios Físicos</span>
                        <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem' }}>{newClinicRooms} salas</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setNewClinicRooms(Math.max(1, newClinicRooms - 1))}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          className="modern-form-input"
                          style={{ textAlign: 'center', fontWeight: 800, padding: 0 }}
                          value={newClinicRooms}
                          onChange={(e) => setNewClinicRooms(Number(e.target.value))}
                        />
                        <button
                          type="button"
                          onClick={() => setNewClinicRooms(Math.min(30, newClinicRooms + 1))}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="input-field-wrap">
                      <label className="input-field-label">
                        <span>Staff Médico Inicial</span>
                        <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.72rem' }}>{newClinicDoctors} profesionales</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setNewClinicDoctors(Math.max(1, newClinicDoctors - 1))}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          className="modern-form-input"
                          style={{ textAlign: 'center', fontWeight: 800, padding: 0 }}
                          value={newClinicDoctors}
                          onChange={(e) => setNewClinicDoctors(Number(e.target.value))}
                        />
                        <button
                          type="button"
                          onClick={() => setNewClinicDoctors(Math.min(50, newClinicDoctors + 1))}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 3: Administrador */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title">
                      <MaterialIcon name="person" size={16} />
                      Cuenta del Administrador Local
                    </h4>
                    <span className="form-section-badge">LOGIN</span>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">
                      <span>Correo Electrónico del Administrador</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon-left"><MaterialIcon name="mail" size={16} /></span>
                      <input
                        type="email"
                        required
                        placeholder="director@sanborja.pe"
                        className="modern-form-input"
                        value={newClinicAdmin}
                        onChange={(e) => setNewClinicAdmin(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="cash-btn ghost"
                  onClick={() => setIsNewClinicModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cash-btn primary"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed', boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.35)', padding: '0.6rem 1.4rem' }}
                >
                  + Confirmar y Aprovisionar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Gestión Integral de Sede y Configuración */}
      {managingClinic && (
        <div className="modal-overlay-custom" onClick={() => setManagingClinic(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '96%', padding: 0, overflow: 'hidden' }}>
            {/* Modal Header */}
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #ddd6fe', boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)' }}>
                  <IconBuilding className="w-6 h-6" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {managingClinic.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.6rem',
                        borderRadius: '999px',
                        background:
                          managingClinic.status === 'active' ? '#dcfce7' :
                          managingClinic.status === 'onboarding' ? '#fef3c7' :
                          managingClinic.status === 'maintenance' ? '#e0f2fe' : '#fee2e2',
                        color:
                          managingClinic.status === 'active' ? '#15803d' :
                          managingClinic.status === 'onboarding' ? '#b45309' :
                          managingClinic.status === 'maintenance' ? '#0369a1' : '#b91c1c',
                      }}
                    >
                      {managingClinic.status === 'active' ? '● Operativa' :
                       managingClinic.status === 'onboarding' ? '● En Configuración' :
                       managingClinic.status === 'maintenance' ? 'En Mantenimiento' : 'Suspendida'}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                    Identificador Tenant: <code style={{ color: '#7c3aed', fontWeight: 700 }}>{managingClinic.slug}</code> · Sede: {managingClinic.city}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingClinic(null)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms ease' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="modal-tab-list">
              <button
                type="button"
                className={`modal-tab-btn ${clinicModalTab === 'general' ? 'active' : ''}`}
                onClick={() => setClinicModalTab('general')}
              >
                <MaterialIcon name="local_hospital" size={16} />
                <span>Datos & Ubicación</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${clinicModalTab === 'operations' ? 'active' : ''}`}
                onClick={() => setClinicModalTab('operations')}
              >
                <MaterialIcon name="settings" size={16} />
                <span>Operaciones & Turnos</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${clinicModalTab === 'staff' ? 'active' : ''}`}
                onClick={() => setClinicModalTab('staff')}
              >
                <MaterialIcon name="medical_services" size={16} />
                <span>Staff Médico ({managingClinic.assignedDoctorsList?.length ?? managingClinic.doctors})</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${clinicModalTab === 'compliance' ? 'active' : ''}`}
                onClick={() => setClinicModalTab('compliance')}
              >
                <MaterialIcon name="shield" size={16} />
                <span>Normativa & SUSALUD</span>
              </button>
            </div>

            <form onSubmit={handleSaveClinicChanges}>
              <div style={{ padding: '1.25rem 1.5rem', maxHeight: '58vh', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* TAB 1: DATOS GENERALES Y UBICACIÓN */}
                {clinicModalTab === 'general' && (
                  <>
                    {/* Tarjeta 1: Identidad Comercial y Tenant */}
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="local_hospital" size={16} />
                          Identidad de la Sede & Tenant Multi-Clínica
                        </h4>
                        <span className="form-section-badge">PÚBLICO</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.85rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Nombre Comercial de la Sede</span>
                            <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="local_hospital" size={16} /></span>
                            <input
                              type="text"
                              required
                              className="modern-form-input"
                              placeholder="ej. Clínica Sanitas Lima"
                              value={managingClinic.name}
                              onChange={(e) => setManagingClinic({ ...managingClinic, name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Identificador Slug (Subdominio)</span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Único</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="link" size={16} /></span>
                            <input
                              type="text"
                              required
                              className="modern-form-input monospace"
                              placeholder="clinica-lima"
                              value={managingClinic.slug}
                              onChange={(e) => setManagingClinic({ ...managingClinic, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta 2: Datos Fiscales SUNAT */}
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="business_center" size={16} />
                          Razón Social & Facturación Electrónica (SUNAT)
                        </h4>
                        <span className="form-section-badge">LEGAL PERÚ</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.85rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Razón Social Jurídica Registrada</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="apartment" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input"
                              placeholder="Sanitas Salud Integral S.A.C."
                              value={managingClinic.legalName || ''}
                              onChange={(e) => setManagingClinic({ ...managingClinic, legalName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-field-label">
                              <span>R.U.C. Empresarial (11 Dígitos)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => showToast(`R.U.C. ${managingClinic.ruc || '20601928371'} validado exitosamente ante SUNAT.`)}
                              style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <MaterialIcon name="check" size={13} />
                              <span>Validar SUNAT</span>
                            </button>
                          </div>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="description" size={16} /></span>
                            <input
                              type="text"
                              maxLength={11}
                              className="modern-form-input monospace"
                              placeholder="20601928371"
                              value={managingClinic.ruc || ''}
                              onChange={(e) => setManagingClinic({ ...managingClinic, ruc: e.target.value.replace(/\D/g, '') })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta 3: Ubicación y Canales de Contacto */}
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="location_on" size={16} />
                          Ubicación Física & Canales de Contacto Directo
                        </h4>
                        <span className="form-section-badge">ATENCIÓN</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.85rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Dirección Física de la Sede</span>
                            <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="location_on" size={16} /></span>
                            <input
                              type="text"
                              required
                              className="modern-form-input"
                              placeholder="Av. Javier Prado Este 1120, San Isidro"
                              value={managingClinic.address || ''}
                              onChange={(e) => setManagingClinic({ ...managingClinic, address: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Ciudad / Distrito</span>
                            <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="location_city" size={16} /></span>
                            <input
                              type="text"
                              required
                              className="modern-form-input"
                              placeholder="Lima, San Isidro"
                              value={managingClinic.city}
                              onChange={(e) => setManagingClinic({ ...managingClinic, city: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.1fr', gap: '0.85rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Enlace Google Maps (Para WhatsApp del Paciente)</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="map" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input"
                              placeholder="https://maps.google.com/?q=..."
                              value={managingClinic.mapsUrl || ''}
                              onChange={(e) => setManagingClinic({ ...managingClinic, mapsUrl: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Teléfono & WhatsApp</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="phone" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input"
                              placeholder="+51 (01) 482-9100"
                              value={managingClinic.phone || ''}
                              onChange={(e) => setManagingClinic({ ...managingClinic, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Correo de Admisión</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="mail" size={16} /></span>
                            <input
                              type="email"
                              className="modern-form-input"
                              placeholder="admision.lima@sanitas.pe"
                              value={managingClinic.email || ''}
                              onChange={(e) => setManagingClinic({ ...managingClinic, email: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: OPERACIONES & TURNOS */}
                {clinicModalTab === 'operations' && (
                  <>
                    {/* Tarjeta 1: Estado Operativo con Opciones Visuales */}
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="settings" size={16} />
                          Estado Operativo de la Sede
                        </h4>
                        <span className="form-section-badge">EN TIEMPO REAL</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                        {[
                          { id: 'active', label: 'Operativa', desc: 'Atención habilitada', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                          { id: 'onboarding', label: 'Setup', desc: 'En configuración', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                          { id: 'maintenance', label: 'Mantenimiento', desc: 'Pausa técnica', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
                          { id: 'suspended', label: 'Suspendida', desc: 'Atención pausada', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                        ].map((st) => (
                          <div
                            key={st.id}
                            onClick={() => setManagingClinic({ ...managingClinic, status: st.id as any })}
                            style={{
                              padding: '0.75rem 0.6rem',
                              borderRadius: '10px',
                              border: `1.5px solid ${managingClinic.status === st.id ? st.color : '#e2e8f0'}`,
                              background: managingClinic.status === st.id ? st.bg : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 120ms ease',
                              textAlign: 'center',
                              boxShadow: managingClinic.status === st.id ? `0 2px 8px ${st.color}20` : 'none',
                            }}
                          >
                            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: managingClinic.status === st.id ? st.color : '#0f172a' }}>
                              ● {st.label}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                              {st.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tarjeta 2: Consultorios Físicos & Turnos */}
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="local_hospital" size={16} />
                          Consultorios Físicos, Días & Tiempos de Cita
                        </h4>
                        <span className="form-section-badge">AGENDA</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Stepper de Consultorios */}
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Consultorios Físicos Disponibles</span>
                            <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>
                              {managingClinic.consultingRooms || 4} Consultorios
                            </span>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setManagingClinic({ ...managingClinic, consultingRooms: Math.max(1, (managingClinic.consultingRooms || 4) - 1) })}
                              style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              className="modern-form-input"
                              style={{ textAlign: 'center', fontWeight: 800, padding: 0 }}
                              value={managingClinic.consultingRooms || 4}
                              onChange={(e) => setManagingClinic({ ...managingClinic, consultingRooms: Number(e.target.value) })}
                            />
                            <button
                              type="button"
                              onClick={() => setManagingClinic({ ...managingClinic, consultingRooms: Math.min(50, (managingClinic.consultingRooms || 4) + 1) })}
                              style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Duración de Turno en Chips */}
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Duración por Turno Médico</span>
                            <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                              {managingClinic.slotDuration || 30} minutos
                            </span>
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                            {[15, 30, 45, 60].map((dur) => (
                              <button
                                key={dur}
                                type="button"
                                onClick={() => setManagingClinic({ ...managingClinic, slotDuration: dur })}
                                style={{
                                  height: '40px',
                                  borderRadius: '8px',
                                  border: `1.5px solid ${(managingClinic.slotDuration || 30) === dur ? '#7c3aed' : '#cbd5e1'}`,
                                  background: (managingClinic.slotDuration || 30) === dur ? '#f5f3ff' : '#ffffff',
                                  color: (managingClinic.slotDuration || 30) === dur ? '#7c3aed' : '#475569',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  transition: 'all 120ms ease'
                                }}
                              >
                                {dur}m
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Días de Atención Semanal */}
                      <div className="input-field-wrap">
                        <label className="input-field-label">
                          <span>Días Habilitados para Citas Médicas</span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Clic para activar/desactivar</span>
                        </label>
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => {
                            const isSelected = (managingClinic.operatingDays || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']).includes(dia);
                            return (
                              <button
                                key={dia}
                                type="button"
                                onClick={() => {
                                  const currentDays = managingClinic.operatingDays || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                  const updated = isSelected ? currentDays.filter(d => d !== dia) : [...currentDays, dia];
                                  setManagingClinic({ ...managingClinic, operatingDays: updated });
                                }}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  border: `1.5px solid ${isSelected ? '#7c3aed' : '#cbd5e1'}`,
                                  background: isSelected ? '#f5f3ff' : '#ffffff',
                                  color: isSelected ? '#7c3aed' : '#64748b',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  transition: 'all 120ms ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    <MaterialIcon name="check" size={13} />
                                    <span>{dia}</span>
                                  </>
                                ) : dia}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.85rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Horario de Atención</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="schedule" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input"
                              placeholder="Lunes a Sábado · 07:00 a 20:00"
                              value={managingClinic.openingHours || 'Lunes a Sábado · 07:00 a 20:00'}
                              onChange={(e) => setManagingClinic({ ...managingClinic, openingHours: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Tolerancia de Retraso</span>
                          </label>
                          <select
                            className="modern-form-input"
                            style={{ paddingLeft: '0.85rem' }}
                            value={managingClinic.toleranceMinutes || 10}
                            onChange={(e) => setManagingClinic({ ...managingClinic, toleranceMinutes: Number(e.target.value) })}
                          >
                            <option value={5}>5 minutos (Estricto)</option>
                            <option value={10}>10 minutos (Recomendado)</option>
                            <option value={15}>15 minutos (Flexible)</option>
                          </select>
                        </div>
                      </div>

                      {/* Capacidad proyectada */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.15rem', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1.5px solid #ddd6fe', borderRadius: '12px' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.84rem', color: '#5b21b6' }}>
                            Capacidad Operativa Máxima Proyectada
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: '#6d28d9' }}>
                            Basado en {managingClinic.consultingRooms || 4} consultorios y turnos de {managingClinic.slotDuration || 30}m:
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed' }}>
                            ~{((managingClinic.consultingRooms || 4) * (60 / (managingClinic.slotDuration || 30)) * 12).toFixed(0)} Citas
                          </span>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#5b21b6', fontWeight: 700 }}>Por Día</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 3: STAFF MÉDICO */}
                {clinicModalTab === 'staff' && (() => {
                  const filteredDoctors = (managingClinic.assignedDoctorsList || []).filter((doc) => {
                    const matchesSearch =
                      doc.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                      doc.specialty.toLowerCase().includes(staffSearch.toLowerCase()) ||
                      doc.cmp.toLowerCase().includes(staffSearch.toLowerCase());
                    const matchesSpecialty =
                      staffSpecialtyFilter === 'all' || doc.specialty === staffSpecialtyFilter;
                    return matchesSearch && matchesSpecialty;
                  });

                  return (
                    <>
                      <div className="form-section-card">
                        {/* Cabecera con Buscador y Filtro por Especialidad */}
                        <div className="form-section-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
                          <h4 className="form-section-title">
                            <MaterialIcon name="medical_services" size={16} />
                            Staff Médico Asignado ({filteredDoctors.length} de {managingClinic.assignedDoctorsList?.length ?? 0})
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* Buscador de Médicos */}
                            <div style={{ position: 'relative', width: '210px' }}>
                              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                <MaterialIcon name="search" size={15} />
                              </span>
                              <input
                                type="text"
                                placeholder="Buscar médico o CMP..."
                                value={staffSearch}
                                onChange={(e) => setStaffSearch(e.target.value)}
                                style={{ width: '100%', height: '32px', paddingLeft: '28px', paddingRight: '10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.76rem', background: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                              />
                            </div>

                            {/* Filtro por Especialidad */}
                            <select
                              value={staffSpecialtyFilter}
                              onChange={(e) => setStaffSpecialtyFilter(e.target.value)}
                              style={{ height: '32px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.74rem', background: '#ffffff', padding: '0 0.5rem', outline: 'none' }}
                            >
                              <option value="all">Todas las especialidades</option>
                              <option value="Traumatología y Ortopedia">Traumatología</option>
                              <option value="Fisioterapia y Rehabilitación">Fisioterapia</option>
                              <option value="Terapia Manual & Kinesiología">Terapia Manual</option>
                              <option value="Medicina Física">Medicina Física</option>
                            </select>
                          </div>
                        </div>

                        {/* Listado de Médicos con scroll suave */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                          {filteredDoctors.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                              No se encontraron médicos con el filtro actual.
                            </div>
                          ) : (
                            filteredDoctors.map((doc) => (
                              <div
                                key={doc.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.65rem 0.85rem',
                                  background: '#ffffff',
                                  borderRadius: '10px',
                                  border: '1.5px solid #e2e8f0',
                                  flexWrap: 'wrap',
                                  gap: '0.5rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {doc.name.replace('Dr. ', '').replace('Dra. ', '').replace('Lic. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                    <strong style={{ color: '#0f172a', fontSize: '0.84rem' }}>{doc.name}</strong>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.specialty}</span>
                                      <code style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem' }}>{doc.cmp}</code>
                                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <MaterialIcon name="schedule" size={12} />
                                        <span>{doc.shift || 'Mañana'}</span>
                                      </span>
                                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <MaterialIcon name="meeting_room" size={12} />
                                        <span>{doc.room || 'Cons. 101'}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  {/* Botón interactivo para alternar Activo / Vacaciones */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newStatus = doc.status === 'Activo' ? 'Vacaciones' : 'Activo';
                                      const updated = (managingClinic.assignedDoctorsList || []).map(d =>
                                        d.id === doc.id ? { ...d, status: newStatus as any } : d
                                      );
                                      setManagingClinic({ ...managingClinic, assignedDoctorsList: updated });
                                    }}
                                    title="Clic para cambiar estado del profesional"
                                    style={{
                                      background: doc.status === 'Activo' ? '#dcfce7' : '#fef3c7',
                                      color: doc.status === 'Activo' ? '#15803d' : '#b45309',
                                      border: 'none',
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '999px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ● {doc.status}
                                  </button>

                                  <button
                                    type="button"
                                    title="Desasignar médico de esta sede"
                                    onClick={() => {
                                      const updated = (managingClinic.assignedDoctorsList || []).filter(d => d.id !== doc.id);
                                      setManagingClinic({
                                        ...managingClinic,
                                        assignedDoctorsList: updated,
                                        doctors: updated.length,
                                      });
                                    }}
                                    style={{
                                      background: '#fee2e2',
                                      border: 'none',
                                      color: '#b91c1c',
                                      cursor: 'pointer',
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.85rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    <MaterialIcon name="close" size={14} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Tarjeta para Agregar Médico */}
                      <div className="form-section-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                        <div className="form-section-header" style={{ borderColor: '#dcfce7' }}>
                          <h4 className="form-section-title" style={{ color: '#166534' }}>
                            <MaterialIcon name="add" size={16} />
                            Asignar Nuevo Profesional a esta Sede
                          </h4>
                          <span className="form-section-badge" style={{ background: '#dcfce7', color: '#15803d' }}>NUEVO INGRESO</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '0.65rem' }}>
                          <div className="input-field-wrap">
                            <label className="input-field-label" style={{ color: '#166534' }}>Nombre Completo</label>
                            <div className="input-with-icon">
                              <span className="input-icon-left"><MaterialIcon name="person" size={16} /></span>
                              <input
                                type="text"
                                placeholder="Dra. Lucía Mendoza"
                                className="modern-form-input"
                                style={{ height: '38px', background: '#ffffff', borderColor: '#86efac' }}
                                value={newDocName}
                                onChange={(e) => setNewDocName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="input-field-wrap">
                            <label className="input-field-label" style={{ color: '#166534' }}>Especialidad</label>
                            <select
                              className="modern-form-input"
                              style={{ height: '38px', background: '#ffffff', borderColor: '#86efac', paddingLeft: '0.75rem' }}
                              value={newDocSpecialty}
                              onChange={(e) => setNewDocSpecialty(e.target.value)}
                            >
                              <option value="Fisioterapia y Rehabilitación">Fisioterapia y Rehab.</option>
                              <option value="Traumatología y Ortopedia">Traumatología</option>
                              <option value="Terapia Manual & Kinesiología">Terapia Manual</option>
                              <option value="Medicina General">Medicina General</option>
                              <option value="Neurología">Neurología</option>
                            </select>
                          </div>

                          <div className="input-field-wrap">
                            <label className="input-field-label" style={{ color: '#166534' }}>CMP / Colegiatura</label>
                            <div className="input-with-icon">
                              <span className="input-icon-left"><MaterialIcon name="badge" size={16} /></span>
                              <input
                                type="text"
                                placeholder="CMP 71829"
                                className="modern-form-input monospace"
                                style={{ height: '38px', background: '#ffffff', borderColor: '#86efac' }}
                                value={newDocCmp}
                                onChange={(e) => setNewDocCmp(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.65rem', alignItems: 'flex-end', marginTop: '0.35rem' }}>
                          <div className="input-field-wrap">
                            <label className="input-field-label" style={{ color: '#166534' }}>Turno Asignado</label>
                            <select
                              className="modern-form-input"
                              style={{ height: '38px', background: '#ffffff', borderColor: '#86efac', paddingLeft: '0.75rem' }}
                              value={newDocShift}
                              onChange={(e) => setNewDocShift(e.target.value as any)}
                            >
                              <option value="Mañana">Mañana (08:00 - 13:00)</option>
                              <option value="Tarde">Tarde (14:00 - 19:00)</option>
                              <option value="Completo">Jornada Completa</option>
                            </select>
                          </div>

                          <div className="input-field-wrap">
                            <label className="input-field-label" style={{ color: '#166534' }}>Consultorio Físico</label>
                            <select
                              className="modern-form-input"
                              style={{ height: '38px', background: '#ffffff', borderColor: '#86efac', paddingLeft: '0.75rem' }}
                              value={newDocRoom}
                              onChange={(e) => setNewDocRoom(e.target.value)}
                            >
                              {Array.from({ length: managingClinic.consultingRooms || 4 }).map((_, i) => (
                                <option key={i} value={`Cons. ${101 + i}`}>Consultorio {101 + i}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            className="cash-btn primary"
                            style={{ height: '38px', padding: '0 1.25rem', background: '#16a34a', borderColor: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}
                            onClick={() => {
                              if (!newDocName.trim()) return;
                              const newDoc: DoctorItem = {
                                id: `doc-${Date.now()}`,
                                name: newDocName.trim(),
                                specialty: newDocSpecialty,
                                cmp: newDocCmp.trim() || 'CMP ' + Math.floor(10000 + Math.random() * 80000),
                                shift: newDocShift,
                                room: newDocRoom,
                                status: 'Activo',
                              };
                              const updated = [...(managingClinic.assignedDoctorsList || []), newDoc];
                              setManagingClinic({
                                ...managingClinic,
                                assignedDoctorsList: updated,
                                doctors: updated.length,
                              });
                              setNewDocName('');
                              setNewDocCmp('');
                              showToast(`Doctor(a) ${newDoc.name} asignado(a) al ${newDoc.room}.`);
                            }}
                          >
                            + Asignar Profesional
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* TAB 4: NORMATIVA & SUSALUD */}
                {clinicModalTab === 'compliance' && (
                  <>
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="assignment" size={16} />
                          Acreditación Sanitaria Nacional (SUSALUD / MINSA)
                        </h4>
                        <span className="form-section-badge">OBLIGATORIO</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.85rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Código Único RENIPRESS</span>
                            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MaterialIcon name="check" size={12} />
                              <span>Verificado</span>
                            </span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="account_balance" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input monospace"
                              placeholder="00029182"
                              value={managingClinic.renipressCode || '00029182'}
                              onChange={(e) => setManagingClinic({ ...managingClinic, renipressCode: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Categorización IPRESS (MINSA)</span>
                          </label>
                          <select
                            className="modern-form-input"
                            style={{ paddingLeft: '0.85rem' }}
                            value={managingClinic.ipressCategory || 'Policlínico de Especialidades (I-3)'}
                            onChange={(e) => setManagingClinic({ ...managingClinic, ipressCategory: e.target.value })}
                          >
                            <option value="Consultorio Médico (I-1)">I-1 · Consultorio Médico General</option>
                            <option value="Policlínico de Especialidades (I-2)">I-2 · Consultorio de Especialidad</option>
                            <option value="Policlínico de Especialidades (I-3)">I-3 · Policlínico de Especialidades</option>
                            <option value="Centro Médico Ambulatorio (I-4)">I-4 · Centro Médico con Hospital de Día</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.85rem', marginTop: '0.5rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Director Médico Responsable (CMP)</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="medical_services" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input"
                              placeholder="Dr. Alessander Torres (CMP 51928)"
                              value={managingClinic.directorName || 'Dr. Alessander Torres (CMP 51928)'}
                              onChange={(e) => setManagingClinic({ ...managingClinic, directorName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-field-wrap">
                          <label className="input-field-label">
                            <span>Vencimiento Licencia Municipal</span>
                          </label>
                          <div className="input-with-icon">
                            <span className="input-icon-left"><MaterialIcon name="calendar_today" size={16} /></span>
                            <input
                              type="text"
                              className="modern-form-input"
                              placeholder="31/12/2028 · Vigente"
                              value={managingClinic.licenseExpiry || '31/12/2028 · Vigente'}
                              onChange={(e) => setManagingClinic({ ...managingClinic, licenseExpiry: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-section-card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                      <div className="form-section-header" style={{ borderColor: '#a7f3d0' }}>
                        <h4 className="form-section-title" style={{ color: '#065f46' }}>
                          <IconShield className="w-4 h-4 text-emerald-600" />
                          Aislamiento Criptográfico PostgreSQL (Ley N° 29733)
                        </h4>
                        <span className="form-section-badge" style={{ background: '#d1fae5', color: '#047857' }}>RLS ACTIVO</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#065f46', lineHeight: 1.5 }}>
                        Todas las historias clínicas, recetas y notas de evolución de esta sede están aisladas a nivel de motor de base de datos bajo políticas <code>tenant_id = '{managingClinic.id}'</code> con cifrado AES-256 en reposo.
                      </p>
                    </div>

                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title">
                          <MaterialIcon name="draw" size={16} />
                          Firma Digital Colegiada (Ley N° 27269)
                        </h4>
                        <span className="form-section-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>HABILITADA</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                        Permite a los médicos colegiados de esta sede firmar recetas electrónicas y certificados médicos con validez legal ante el Colegio Médico del Perú y farmacias del país.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer with Actions */}
              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  id="btn-open-clinic-console"
                  className="cash-btn primary"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderColor: '#0284c7', boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.3)', padding: '0.6rem 1.25rem' }}
                  onClick={() => {
                    handleSwitchContext(managingClinic);
                    const clinicToOpen = { id: managingClinic.id, name: managingClinic.name };
                    setManagingClinic(null);
                    onOpenClinicConsole?.(clinicToOpen);
                  }}
                  title="Abrir la consola operativa de esta sede en modo supervisión"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MaterialIcon name="open_in_new" size={16} />
                    <span>Abrir Consola de Sede</span>
                  </span>
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    className="cash-btn ghost"
                    style={{ padding: '0.6rem 1.25rem' }}
                    onClick={() => setManagingClinic(null)}
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="cash-btn primary"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed', boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.35)', padding: '0.6rem 1.4rem' }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Liquidación & Finanzas de Sede */}
      {financeClinic && (
        <div className="modal-overlay-custom" onClick={() => setFinanceClinic(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCash className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Finanzas & Liquidación: {financeClinic.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                    Sede: {financeClinic.city} · Facturación del período actual
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFinanceClinic(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div className="modal-body-custom">
              {/* Financial Big Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Facturación Bruta Mensual</span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
                    {financeClinic.monthlyRevenue}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>● {financeClinic.activeAppointments} citas atendidas</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Margen Red (20%)</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    S/ {(financeClinic.revenueAmount * 0.2).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Liquidación médicos: 80%</span>
                </div>
              </div>

              {/* Breakdown by Payment Method */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem' }}>
                  Desglose de Recaudación por Canal de Cobro:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="pref-row" style={{ padding: '0.65rem 0.85rem' }}>
                    <div className="pref-info">
                      <h4 style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MaterialIcon name="credit_card" size={16} />
                        <span>Tarjetas Débito / Crédito (Niubiz & Izipay)</span>
                      </h4>
                      <p>48% de las transacciones</p>
                    </div>
                    <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                      S/ {(financeClinic.revenueAmount * 0.48).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="pref-row" style={{ padding: '0.65rem 0.85rem' }}>
                    <div className="pref-info">
                      <h4 style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MaterialIcon name="smartphone" size={16} />
                        <span>Billeteras Digitales (Yape & Plin)</span>
                      </h4>
                      <p>35% de las transacciones</p>
                    </div>
                    <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                      S/ {(financeClinic.revenueAmount * 0.35).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="pref-row" style={{ padding: '0.65rem 0.85rem' }}>
                    <div className="pref-info">
                      <h4 style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MaterialIcon name="payments" size={16} />
                        <span>Efectivo en Caja Chica (Ventanilla)</span>
                      </h4>
                      <p>17% de las transacciones</p>
                    </div>
                    <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                      S/ {(financeClinic.revenueAmount * 0.17).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => {
                  handleSwitchContext(financeClinic);
                  setFinanceClinic(null);
                  onNavigate?.('cash-register');
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MaterialIcon name="account_balance_wallet" size={15} />
                  <span>Ver Caja Chica de esta Sede →</span>
                </span>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="cash-btn ghost"
                  onClick={() => setFinanceClinic(null)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="cash-btn primary"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderColor: '#059669' }}
                  onClick={() => {
                    alert(`Generando balance contable y liquidación médica para "${financeClinic.name}" (Ref: LIQ-${new Date().getFullYear()}-09). Descarga iniciada.`);
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="description" size={15} />
                    <span>Descargar Reporte (PDF)</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Auditoría Global Ley 29733 */}
      {isAuditModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsAuditModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconFileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Registro Inmutable de Auditoría (Ley N° 29733)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                    Trazabilidad de accesos y tratamientos de datos clínicos sensibles.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div className="modal-body-custom">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {auditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'monospace', color: '#64748b', marginRight: '0.5rem' }}>{evt.time}</span>
                      <strong style={{ color: '#0f172a' }}>{evt.user}</strong>
                      <span style={{ marginLeft: '0.5rem', color: '#7c3aed', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        [{evt.action}]
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>IP: {evt.ip}</span>
                      <span className="status-pill status-confirmed" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <MaterialIcon name="lock" size={14} />
                <span>Registros criptográficamente firmados</span>
              </span>
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => setIsAuditModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
