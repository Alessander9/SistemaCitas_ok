import React, { useState } from 'react';
import { ClinicRecord, DoctorItem } from './types';
import { IconBuilding, IconShield } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface ClinicManagementModalProps {
  clinic: ClinicRecord | null;
  onClose: () => void;
  onSave: (updated: ClinicRecord) => void;
  onSwitchContext: (clinic: ClinicRecord) => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
  onShowToast: (msg: string) => void;
}

export const ClinicManagementModal: React.FC<ClinicManagementModalProps> = ({
  clinic,
  onClose,
  onSave,
  onSwitchContext,
  onOpenClinicConsole,
  onShowToast,
}) => {
  const [managingClinic, setManagingClinic] = useState<ClinicRecord | null>(clinic);
  const [clinicModalTab, setClinicModalTab] = useState<'general' | 'operations' | 'staff' | 'compliance'>('general');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffSpecialtyFilter, setStaffSpecialtyFilter] = useState('all');
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('Fisioterapia y Rehabilitación');
  const [newDocCmp, setNewDocCmp] = useState('');
  const [newDocShift, setNewDocShift] = useState<'Mañana' | 'Tarde' | 'Completo'>('Mañana');
  const [newDocRoom, setNewDocRoom] = useState('Cons. 101');

  // Keep local state in sync if clinic prop changes
  React.useEffect(() => {
    setManagingClinic(clinic);
  }, [clinic]);

  if (!managingClinic) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(managingClinic);
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '96%', padding: 0, overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-custom"
          style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ddd6fe',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)',
              }}
            >
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
                      managingClinic.status === 'active'
                        ? '#dcfce7'
                        : managingClinic.status === 'onboarding'
                        ? '#fef3c7'
                        : managingClinic.status === 'maintenance'
                        ? '#e0f2fe'
                        : '#fee2e2',
                    color:
                      managingClinic.status === 'active'
                        ? '#15803d'
                        : managingClinic.status === 'onboarding'
                        ? '#b45309'
                        : managingClinic.status === 'maintenance'
                        ? '#0369a1'
                        : '#b91c1c',
                  }}
                >
                  {managingClinic.status === 'active'
                    ? '● Operativa'
                    : managingClinic.status === 'onboarding'
                    ? '● En Configuración'
                    : managingClinic.status === 'maintenance'
                    ? 'En Mantenimiento'
                    : 'Suspendida'}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                Identificador Tenant: <code style={{ color: '#7c3aed', fontWeight: 700 }}>{managingClinic.slug}</code> · Sede: {managingClinic.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 120ms ease',
            }}
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

        <form onSubmit={handleFormSubmit}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              maxHeight: '58vh',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* TAB 1: DATOS GENERALES Y UBICACIÓN */}
            {clinicModalTab === 'general' && (
              <>
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
                          onChange={(e) =>
                            setManagingClinic({
                              ...managingClinic,
                              slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

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
                          onClick={() => onShowToast(`R.U.C. ${managingClinic.ruc || '20601928371'} validado exitosamente ante SUNAT.`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16a34a',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
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
                        <span>Enlace Google Maps (Para WhatsApp)</span>
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
                      { id: 'active', label: 'Operativa', desc: 'Atención habilitada', color: '#16a34a', bg: '#f0fdf4' },
                      { id: 'onboarding', label: 'Setup', desc: 'En configuración', color: '#d97706', bg: '#fffbeb' },
                      { id: 'maintenance', label: 'Mantenimiento', desc: 'Pausa técnica', color: '#0284c7', bg: '#f0f9ff' },
                      { id: 'suspended', label: 'Suspendida', desc: 'Atención pausada', color: '#dc2626', bg: '#fef2f2' },
                    ].map((st) => (
                      <div
                        key={st.id}
                        onClick={() =>
                          setManagingClinic({
                            ...managingClinic,
                            status: st.id as typeof managingClinic.status,
                          })
                        }
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

                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title">
                      <MaterialIcon name="local_hospital" size={16} />
                      Consultorios Físicos, Días & Tiempos de Cita
                    </h4>
                    <span className="form-section-badge">AGENDA</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                          onClick={() =>
                            setManagingClinic({
                              ...managingClinic,
                              consultingRooms: Math.max(1, (managingClinic.consultingRooms || 4) - 1),
                            })
                          }
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
                          onClick={() =>
                            setManagingClinic({
                              ...managingClinic,
                              consultingRooms: Math.min(50, (managingClinic.consultingRooms || 4) + 1),
                            })
                          }
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>

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
                              transition: 'all 120ms ease',
                            }}
                          >
                            {dur}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">
                      <span>Días Habilitados para Citas Médicas</span>
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
                              const updated = isSelected ? currentDays.filter((d) => d !== dia) : [...currentDays, dia];
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
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
                    <div className="form-section-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
                      <h4 className="form-section-title">
                        <MaterialIcon name="medical_services" size={16} />
                        Staff Médico Asignado ({filteredDoctors.length} de {managingClinic.assignedDoctorsList?.length ?? 0})
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                              gap: '0.5rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {doc.name.replace('Dr. ', '').replace('Dra. ', '').replace('Lic. ', '').split(' ').map((n) => n[0]).slice(0, 2).join('')}
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
                              <button
                                type="button"
                                onClick={() => {
                                  const newStatus = doc.status === 'Activo' ? 'Vacaciones' : 'Activo';
                                  const updated = (managingClinic.assignedDoctorsList || []).map((d) =>
                                    d.id === doc.id ? { ...d, status: newStatus as typeof d.status } : d,
                                  );
                                  setManagingClinic({ ...managingClinic, assignedDoctorsList: updated });
                                }}
                                style={{
                                  background: doc.status === 'Activo' ? '#dcfce7' : '#fef3c7',
                                  color: doc.status === 'Activo' ? '#15803d' : '#b45309',
                                  border: 'none',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                ● {doc.status}
                              </button>

                              <button
                                type="button"
                                title="Desasignar médico de esta sede"
                                onClick={() => {
                                  const updated = (managingClinic.assignedDoctorsList || []).filter((d) => d.id !== doc.id);
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
                                  fontWeight: 700,
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
                          onChange={(e) => setNewDocShift(e.target.value as typeof newDocShift)}
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
                          onShowToast(`Doctor(a) ${newDoc.name} asignado(a) al ${newDoc.room}.`);
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
              </>
            )}
          </div>

          <div
            className="modal-footer-custom"
            style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'space-between' }}
          >
            <button
              type="button"
              id="btn-open-clinic-console"
              className="cash-btn primary"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderColor: '#0284c7', boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.3)', padding: '0.6rem 1.25rem' }}
              onClick={() => {
                onSwitchContext(managingClinic);
                const clinicToOpen = { id: managingClinic.id, name: managingClinic.name };
                onClose();
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
                onClick={onClose}
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
  );
};
