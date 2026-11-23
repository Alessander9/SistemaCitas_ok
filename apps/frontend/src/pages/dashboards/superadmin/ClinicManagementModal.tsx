import React, { useState, useEffect } from 'react';
import { ClinicRecord } from './types';
import { IconBuilding } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface ClinicManagementModalProps {
  clinic: ClinicRecord | null;
  onClose: () => void;
  onSave: (updated: ClinicRecord) => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
}

export const ClinicManagementModal: React.FC<ClinicManagementModalProps> = ({
  clinic,
  onClose,
  onSave,
  onOpenClinicConsole,
}) => {
  const [form, setForm] = useState<ClinicRecord | null>(clinic);
  const [tab, setTab] = useState<'general' | 'legal'>('general');

  useEffect(() => {
    setForm(clinic);
    setTab('general');
  }, [clinic]);

  if (!form) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95%', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="modal-header-custom"
          style={{ padding: '1.15rem 1.5rem', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ddd6fe',
              }}
            >
              <IconBuilding className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Configurar Sede: {form.name}
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Slug: <code style={{ color: '#7c3aed', fontWeight: 700 }}>{form.slug}</code> · {form.city}
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

        {/* Tabs */}
        <div className="modal-tab-list">
          <button
            type="button"
            className={`modal-tab-btn ${tab === 'general' ? 'active' : ''}`}
            onClick={() => setTab('general')}
          >
            <MaterialIcon name="local_hospital" size={16} />
            <span>Identidad & Contacto</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${tab === 'legal' ? 'active' : ''}`}
            onClick={() => setTab('legal')}
          >
            <MaterialIcon name="verified_user" size={16} />
            <span>Datos Legales & IPRESS</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === 'general' && (
              <div className="form-section-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Nombre Comercial de la Sede *</label>
                  <input
                    type="text"
                    required
                    className="modern-form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Ciudad / Distrito *</label>
                  <input
                    type="text"
                    required
                    className="modern-form-input"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Consultorios Habilitados</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="modern-form-input"
                    value={form.consultingRooms}
                    onChange={(e) => setForm({ ...form, consultingRooms: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </div>

                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Dirección Física</label>
                  <input
                    type="text"
                    className="modern-form-input"
                    placeholder="Av. Javier Prado Este 1234, San Isidro"
                    value={form.address || ''}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Teléfono de Central</label>
                  <input
                    type="text"
                    className="modern-form-input"
                    placeholder="+51 (01) 710-8000"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Correo Institucional</label>
                  <input
                    type="email"
                    className="modern-form-input"
                    placeholder="contacto@clinica.pe"
                    value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            )}

            {tab === 'legal' && (
              <div className="form-section-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Razón Social Jurídica</label>
                  <input
                    type="text"
                    className="modern-form-input"
                    placeholder="VitalSalud Servicios Médicos S.A.C."
                    value={form.legalName || ''}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">R.U.C. (11 dígitos)</label>
                  <input
                    type="text"
                    maxLength={11}
                    className="modern-form-input monospace"
                    placeholder="20601928371"
                    value={form.ruc || ''}
                    onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Código Único RENIPRESS</label>
                  <input
                    type="text"
                    className="modern-form-input monospace"
                    placeholder="00029182"
                    value={form.renipressCode || ''}
                    onChange={(e) => setForm({ ...form, renipressCode: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Categoría IPRESS (SUSALUD)</label>
                  <input
                    type="text"
                    className="modern-form-input"
                    placeholder="Policlínico de Especialidades (I-3)"
                    value={form.ipressCategory || ''}
                    onChange={(e) => setForm({ ...form, ipressCategory: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="modal-footer-custom"
            style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1px solid #f1f5f9', justifyContent: 'space-between' }}
          >
            {onOpenClinicConsole ? (
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => {
                  onClose();
                  onOpenClinicConsole({ id: form.id, name: form.name });
                }}
              >
                Operar Consola de Sede ↗
              </button>
            ) : (
              <span />
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="cash-btn ghost" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="cash-btn primary"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed' }}
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
