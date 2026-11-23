import React, { useEffect, useState, useCallback } from 'react';
import {
  AdminUser,
  fetchAdminUsers,
  createAdminUser,
  toggleAdminUserStatus,
} from '../../../services/api/admin.api';
import { ClinicRecord } from './types';
import { IconPlus, IconSearch } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface SuperAdminUsersViewProps {
  clinics: ClinicRecord[];
  onShowToast: (msg: string) => void;
}

export const SuperAdminUsersView: React.FC<SuperAdminUsersViewProps> = ({
  clinics,
  onShowToast,
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN_CLINIC' | 'RECEPCION'>('ALL');
  const [showModal, setShowModal] = useState(false);

  // Create form state
  const [clinicId, setClinicId] = useState(clinics[0]?.id || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN_CLINIC' | 'RECEPCION' | 'SUPER_ADMIN'>('ADMIN_CLINIC');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAdminUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!clinicId && clinics.length > 0) {
      setClinicId(clinics[0].id);
    }
  }, [clinics, clinicId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createAdminUser({
        clinicId,
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
        role,
      });
      setUsers((prev) => [created, ...prev]);
      setShowModal(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      onShowToast(`Cuenta ${created.role} creada para ${created.firstName} ${created.lastName}.`);
    } catch (err) {
      onShowToast((err as Error).message || 'No se pudo crear el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUser = async (user: AdminUser) => {
    const nextActive = !user.isActive;
    try {
      await toggleAdminUserStatus(user.id, nextActive);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: nextActive } : u)),
      );
      onShowToast(
        nextActive
          ? `Acceso reactivado para ${user.email}.`
          : `Acceso suspendido para ${user.email}.`,
      );
    } catch (err) {
      onShowToast((err as Error).message || 'Error al actualizar estado.');
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.clinicName.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  const roleBadge = (r: string) => {
    if (r === 'SUPER_ADMIN') return { bg: '#f5f3ff', color: '#7c3aed', label: 'Super Admin' };
    if (r === 'ADMIN_CLINIC') return { bg: '#ecfdf5', color: '#047857', label: 'Admin Sede' };
    return { bg: '#eff6ff', color: '#1d4ed8', label: 'Recepción' };
  };

  return (
    <section className="table-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 className="table-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Administradores y Accesos por Sede
          </h2>
          <p className="table-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
            Crea directores de clínica, asigna sedes y controla los accesos administrativos de toda la red.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            borderColor: '#7c3aed',
          }}
          onClick={() => setShowModal(true)}
        >
          <IconPlus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
          {(
            [
              { id: 'ALL', label: `Todos (${users.length})` },
              { id: 'SUPER_ADMIN', label: 'Super Admin' },
              { id: 'ADMIN_CLINIC', label: 'Admin Sede' },
              { id: 'RECEPCION', label: 'Recepción' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRoleFilter(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: roleFilter === f.id ? '#ffffff' : 'transparent',
                color: roleFilter === f.id ? '#7c3aed' : '#64748b',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '250px' }}>
          <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar nombre, email o sede..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '34px',
              paddingRight: '12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              background: '#f8fafc',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div className="clinical-table-wrapper">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Sede Asignada</th>
              <th>Último Acceso</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Cargando usuarios administrativos...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No se encontraron cuentas administrativas.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const badge = roleBadge(u.role);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="patient-name-cell">
                        {u.firstName} {u.lastName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                        {u.clinicName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString('es-PE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Sin ingresos'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${u.isActive ? 'status-confirmed' : 'status-in_consultation'}`}>
                        <span>●</span> {u.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="table-action-btn"
                        style={{
                          color: u.isActive ? '#b91c1c' : '#15803d',
                          borderColor: u.isActive ? '#fecaca' : '#bbf7d0',
                          background: u.isActive ? '#fef2f2' : '#f0fdf4',
                        }}
                        onClick={() => void handleToggleUser(u)}
                      >
                        {u.isActive ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Admin User Modal */}
      {showModal && (
        <div className="modal-overlay-custom" onClick={() => setShowModal(false)}>
          <div
            className="modal-content-custom"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '94%', padding: 0, overflow: 'hidden' }}
          >
            <div className="modal-header-custom" style={{ padding: '1.15rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Crear Cuenta Administrativa
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={(e) => void handleCreate(e)}>
              <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Sede Asignada *</label>
                  <select
                    required
                    className="modern-form-input"
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Nombres *</label>
                  <input
                    type="text"
                    required
                    className="modern-form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Apellidos *</label>
                  <input
                    type="text"
                    required
                    className="modern-form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    className="modern-form-input"
                    placeholder="director@clinica.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Rol *</label>
                  <select
                    className="modern-form-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN_CLINIC' | 'RECEPCION' | 'SUPER_ADMIN')}
                  >
                    <option value="ADMIN_CLINIC">Admin de Sede</option>
                    <option value="RECEPCION">Recepción</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Teléfono</label>
                  <input
                    type="text"
                    className="modern-form-input"
                    placeholder="999 888 777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="input-field-wrap" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-field-label">Contraseña Inicial (mín. 8 caracteres) *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="modern-form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1px solid #f1f5f9', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="cash-btn ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="cash-btn primary"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed' }}
                >
                  {submitting ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
