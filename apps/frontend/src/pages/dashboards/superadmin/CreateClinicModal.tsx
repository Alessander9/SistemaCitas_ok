import React, { useState } from 'react';
import { ClinicRecord } from './types';
import { IconBuilding } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface CreateClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clinic: Omit<ClinicRecord, 'id' | 'monthlyRevenue' | 'revenueAmount' | 'activeAppointments'>) => void;
}

export const CreateClinicModal: React.FC<CreateClinicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicSlug, setNewClinicSlug] = useState('');
  const [newClinicCity, setNewClinicCity] = useState('');
  const [newClinicAdmin, setNewClinicAdmin] = useState('');
  const [newClinicDoctors, setNewClinicDoctors] = useState(4);
  const [newClinicRooms, setNewClinicRooms] = useState(6);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim() || !newClinicSlug.trim()) return;

    onSubmit({
      name: newClinicName.trim(),
      slug: newClinicSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      city: newClinicCity.trim() || 'Lima, San Borja',
      doctors: Number(newClinicDoctors) || 2,
      consultingRooms: Number(newClinicRooms) || 4,
      status: 'onboarding',
      phone: '+51 (01) 500-1234',
    });

    setNewClinicName('');
    setNewClinicSlug('');
    setNewClinicCity('');
    setNewClinicAdmin('');
    setNewClinicDoctors(4);
    setNewClinicRooms(6);
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', width: '96%', padding: 0, overflow: 'hidden' }}
      >
        <div
          className="modal-header-custom"
          style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ddd6fe',
              }}
            >
              <IconBuilding className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Aprovisionar Nueva Sede Clínica
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Alta de tenant en el clúster multi-tenant con RLS PostgreSQL.
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
            }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: '#f8fafc',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
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

          <div
            className="modal-footer-custom"
            style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'flex-end', gap: '0.65rem' }}
          >
            <button type="button" className="cash-btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="cash-btn primary"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                borderColor: '#7c3aed',
                boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.35)',
                padding: '0.6rem 1.4rem',
              }}
            >
              + Confirmar y Aprovisionar Sede
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
