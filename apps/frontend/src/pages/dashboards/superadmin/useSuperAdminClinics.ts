import { useState, useEffect, useCallback } from 'react';
import { ClinicRecord } from './types';
import {
  fetchAdminClinics,
  fetchAdminOverview,
  createAdminClinic,
  updateAdminClinic,
  toggleAdminClinicStatus,
  AdminOverview,
} from '../../../services/api/admin.api';

const FALLBACK_CLINICS: ClinicRecord[] = [
  {
    id: 'a0000000-0000-4000-a000-000000000001',
    name: 'Clínica Sanitas Lima',
    legalName: 'Sanitas Salud Integral S.A.C.',
    ruc: '20601928371',
    slug: 'clinica-demo',
    city: 'Lima, San Isidro',
    address: 'Av. Javier Prado Este 1120, San Isidro',
    doctors: 4,
    adminsCount: 1,
    consultingRooms: 10,
    activeAppointments: 0,
    monthAppointments: 0,
    status: 'active',
    isActive: true,
    monthlyRevenue: 'S/ 0.00',
    revenueAmount: 0,
    phone: '+51 (01) 482-9100',
    email: 'admision.lima@sanitas.pe',
    renipressCode: '00029182',
    ipressCategory: 'Policlínico de Especialidades (I-3)',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000002',
    name: 'Centro Médico Arequipa Salud',
    legalName: 'Servicios Médicos Arequipa S.R.L.',
    ruc: '20504829182',
    slug: 'centro-arequipa',
    city: 'Arequipa, Yanahuara',
    address: 'Calle Bolognesi 412, Yanahuara',
    doctors: 2,
    adminsCount: 1,
    consultingRooms: 5,
    activeAppointments: 0,
    monthAppointments: 0,
    status: 'active',
    isActive: true,
    monthlyRevenue: 'S/ 0.00',
    revenueAmount: 0,
    phone: '+51 (054) 251-400',
    email: 'arequipa@sanitas.pe',
    renipressCode: '00034190',
    ipressCategory: 'Centro Médico (I-3)',
  },
];

export function useSuperAdminClinics(onSwitchClinic?: (clinicId: string) => void) {
  const [clinics, setClinics] = useState<ClinicRecord[]>(FALLBACK_CLINICS);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('a0000000-0000-4000-a000-000000000001');
  const [managingClinic, setManagingClinic] = useState<ClinicRecord | null>(null);
  const [isNewClinicModalOpen, setIsNewClinicModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [backendClinics, backendOverview] = await Promise.all([
        fetchAdminClinics(),
        fetchAdminOverview(),
      ]);
      if (backendClinics && backendClinics.length > 0) {
        setClinics(backendClinics as ClinicRecord[]);
      }
      if (backendOverview) {
        setOverview(backendOverview);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const handleSwitchContext = (clinic: ClinicRecord) => {
    setSelectedClinic(clinic.id);
    onSwitchClinic?.(clinic.id);
  };

  const addClinic = async (
    newClinic: Omit<ClinicRecord, 'id' | 'monthlyRevenue' | 'revenueAmount' | 'activeAppointments'>,
  ) => {
    const formattedSlug = newClinic.slug.trim().toLowerCase().replace(/\s+/g, '-');
    try {
      const created = await createAdminClinic({
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
      });
      setClinics((prev) => [...prev, created as ClinicRecord]);
      setSelectedClinic(created.id);
      onSwitchClinic?.(created.id);
      setIsNewClinicModalOpen(false);
      showToast(`Sede "${created.name}" aprovisionada correctamente.`);
      void refreshData();
    } catch (err) {
      showToast((err as Error).message || 'No se pudo aprovisionar la sede.');
    }
  };

  const updateClinic = async (updated: ClinicRecord) => {
    try {
      const saved = await updateAdminClinic(updated.id, {
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
      });
      setClinics((prev) => prev.map((c) => (c.id === saved.id ? (saved as ClinicRecord) : c)));
      setManagingClinic(null);
      showToast(`Configuración de "${saved.name}" guardada en base de datos.`);
    } catch (err) {
      showToast((err as Error).message || 'No se pudo actualizar la sede.');
    }
  };

  const toggleStatus = async (clinic: ClinicRecord) => {
    const nextActive = clinic.status !== 'active';
    try {
      const saved = await toggleAdminClinicStatus(clinic.id, nextActive);
      setClinics((prev) => prev.map((c) => (c.id === saved.id ? (saved as ClinicRecord) : c)));
      showToast(
        nextActive
          ? `Sede "${saved.name}" reactivada.`
          : `Sede "${saved.name}" suspendida temporalmente.`,
      );
      void refreshData();
    } catch (err) {
      showToast((err as Error).message || 'No se pudo cambiar el estado de la sede.');
    }
  };

  const filteredClinics = clinics.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const term = searchFilter.trim().toLowerCase();
    const matchesSearch =
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      c.slug.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const activeClinicsCount = overview?.activeClinics ?? clinics.filter((c) => c.status === 'active').length;
  const totalClinicsCount = overview?.totalClinics ?? clinics.length;
  const totalAppointments = overview?.todayAppointments ?? clinics.reduce((acc, c) => acc + c.activeAppointments, 0);
  const totalRevenue = overview?.monthRevenue ?? clinics.reduce((acc, c) => acc + c.revenueAmount, 0);

  return {
    clinics,
    filteredClinics,
    overview,
    loading,
    selectedClinic,
    managingClinic,
    setManagingClinic,
    isNewClinicModalOpen,
    setIsNewClinicModalOpen,
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    toastMessage,
    setToastMessage,
    showToast,
    refreshData,
    handleSwitchContext,
    addClinic,
    updateClinic,
    toggleStatus,
    activeClinicsCount,
    totalClinicsCount,
    totalAppointments,
    totalRevenue,
  };
}
