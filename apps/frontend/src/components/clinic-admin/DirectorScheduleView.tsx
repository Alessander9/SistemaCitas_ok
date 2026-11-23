import React from 'react';
import { IconSearch } from '../ui/Icons';
import { MaterialIcon } from '../ui/MaterialIcon';
import {
  ClinicAppointmentItem,
  ClinicAppointmentStatus,
  ClinicScheduleFilter,
} from './types';

interface DirectorScheduleViewProps {
  appointments: ClinicAppointmentItem[];
  totalCount: number;
  searchFilter: string;
  statusFilter: ClinicScheduleFilter;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (filter: ClinicScheduleFilter) => void;
  onReassignRoom: (appointmentId: string, newRoom: string) => void;
  onOpenBooking: () => void;
}

const STATUS_META: Record<ClinicAppointmentStatus, { label: string; className: string }> = {
  in_consultation: { label: 'En consulta', className: 'green' },
  waiting: { label: 'En espera', className: 'amber' },
  confirmed: { label: 'Confirmada', className: 'sky' },
  attended: { label: 'Atendida', className: 'slate' },
};

const ROOMS = ['Cons. 101', 'Cons. 102', 'Cons. 103', 'Cons. 104'];

export const DirectorScheduleView: React.FC<DirectorScheduleViewProps> = ({
  appointments,
  totalCount,
  searchFilter,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onReassignRoom,
  onOpenBooking,
}) => {
  const filters: Array<{ id: ClinicScheduleFilter; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'in_consultation', label: 'En consulta' },
    { id: 'waiting', label: 'En espera' },
    { id: 'confirmed', label: 'Confirmadas' },
    { id: 'attended', label: 'Atendidas' },
  ];

  return (
    <section className="cad-card" aria-label="Supervisión de agenda del día">
      <div className="cad-schedule-top">
        <div>
          <h2>Supervisión de agenda ({appointments.length} de {totalCount})</h2>
          <p>Revisa el flujo por consultorio o reasigna un box si hay sobrecarga</p>
        </div>

        <button type="button" className="cad-btn-secondary" onClick={onOpenBooking}>
          <MaterialIcon name="calendar_month" size={16} />
          <span>Ir al calendario completo</span>
        </button>
      </div>

      <div className="cad-schedule-toolbar">
        <div className="cad-filter-pills">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`cad-filter-pill ${statusFilter === f.id ? 'active' : ''}`}
              onClick={() => onStatusFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="cad-search-box">
          <span className="cad-search-icon">
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar paciente, doctor o DNI..."
            value={searchFilter}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="cad-table-wrap">
        <table className="cad-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Especialista</th>
              <th>Consultorio</th>
              <th>Pago</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="cad-table-empty">
                  No se encontraron citas con el filtro actual.
                </td>
              </tr>
            ) : (
              appointments.map((apt) => {
                const st = STATUS_META[apt.status];
                return (
                  <tr key={apt.id}>
                    <td className="cad-cell-time">{apt.time}</td>
                    <td>
                      <strong className="cad-cell-main">{apt.patient}</strong>
                      <span className="cad-cell-sub">{apt.service}</span>
                    </td>
                    <td>
                      <strong className="cad-cell-main">{apt.doctor}</strong>
                      <span className="cad-cell-sub">{apt.specialty}</span>
                    </td>
                    <td>
                      <select
                        className="cad-room-select"
                        aria-label={`Consultorio para ${apt.patient}`}
                        value={apt.room}
                        onChange={(e) => onReassignRoom(apt.id, e.target.value)}
                      >
                        {ROOMS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`cad-pay-tag ${apt.paid ? 'paid' : 'pending'}`}>
                        {apt.paid ? `Pagado · ${apt.priceLabel}` : `Pendiente · ${apt.priceLabel}`}
                      </span>
                    </td>
                    <td>
                      <span className={`cad-live-tag ${st.className}`}>
                        <span className="cad-dot" />
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
