import { useState, useEffect } from 'react';
import { ClinicRecord } from './types';
import { fetchAdminClinics, createAdminClinic, updateAdminClinic } from '../../../services/api';

const DEFAULT_CLINICS: ClinicRecord[] = [
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
];

export function useSuperAdminClinics(onSwitchClinic?: (clinicId: string) => void) {
  const [clinics, setClinics] = useState<ClinicRecord[]>(DEFAULT_CLINICS);
  const [selectedClinic, setSelectedClinic] = useState('a0000000-0000-0000-0000-000000000001');
  const [managingClinic, setManagingClinic] = useState<ClinicRecord | null>(null);
  const [financeClinic, setFinanceClinic] = useState<ClinicRecord | null>(null);
  const [isNewClinicModalOpen, setIsNewClinicModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'suspended'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync from backend if available
  useEffect(() => {
    let isMounted = true;
    fetchAdminClinics()
      .then((backendClinics) => {
        if (isMounted && backendClinics && backendClinics.length > 0) {
          setClinics(backendClinics as ClinicRecord[]);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSwitchContext = (clinic: ClinicRecord) => {
    setSelectedClinic(clinic.id);
    onSwitchClinic?.(clinic.id);
  };

  const addClinic = (newClinic: Omit<ClinicRecord, 'id' | 'monthlyRevenue' | 'revenueAmount' | 'activeAppointments'>) => {
    const formattedSlug = newClinic.slug.trim().toLowerCase().replace(/\s+/g, '-');
    const localId = `a0000000-0000-0000-0000-${String(clinics.length + 1).padStart(12, '0')}`;
    const newEntry: ClinicRecord = {
      ...newClinic,
      id: localId,
      slug: formattedSlug,
      activeAppointments: 0,
      monthlyRevenue: 'S/ 0.00',
      revenueAmount: 0,
    };

    setClinics((prev) => [...prev, newEntry]);
    setSelectedClinic(newEntry.id);
    onSwitchClinic?.(newEntry.id);
    setIsNewClinicModalOpen(false);
    showToast(`¡Nueva clínica "${newEntry.name}" aprovisionada exitosamente con slug [${formattedSlug}]!`);

    // Persist asynchronously to backend if available
    void createAdminClinic({
      name: newClinic.name,
      slug: formattedSlug,
      city: newClinic.city,
      address: newClinic.address,
      phone: newClinic.phone,
      email: newClinic.email,
      ruc: newClinic.ruc,
      legalName: newClinic.legalName,
      renipressCode: newClinic.renipressCode,
      ipressCategory: newClinic.ipressCategory,
      consultingRooms: newClinic.consultingRooms,
    })
      .then((created) => {
        setClinics((prev) =>
          prev.map((c) => (c.id === localId ? ({ ...c, ...(created as ClinicRecord) }) : c)),
        );
      })
      .catch(() => {});
  };

  const updateClinic = (updated: ClinicRecord) => {
    setClinics((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`¡Configuración de "${updated.name}" actualizada con éxito!`);
    setManagingClinic(null);

    void updateAdminClinic(updated.id, {
      name: updated.name,
      city: updated.city,
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      ruc: updated.ruc,
      legalName: updated.legalName,
      renipressCode: updated.renipressCode,
      ipressCategory: updated.ipressCategory,
      consultingRooms: updated.consultingRooms,
    }).catch(() => {});
  };

  const filteredClinics = clinics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAppointments = clinics.reduce((acc, c) => acc + c.activeAppointments, 0);
  const totalRevenue = clinics.reduce((acc, c) => acc + c.revenueAmount, 0);

  return {
    clinics,
    filteredClinics,
    selectedClinic,
    managingClinic,
    setManagingClinic,
    financeClinic,
    setFinanceClinic,
    isNewClinicModalOpen,
    setIsNewClinicModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    toastMessage,
    setToastMessage,
    showToast,
    handleSwitchContext,
    addClinic,
    updateClinic,
    totalAppointments,
    totalRevenue,
  };
}
