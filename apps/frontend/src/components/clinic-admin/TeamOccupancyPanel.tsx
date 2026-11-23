import React from 'react';
import { ProfessionalStatusItem } from './types';
import { formatPen } from './useClinicAdminDashboard';

interface TeamOccupancyPanelProps {
  team: ProfessionalStatusItem[];
  onOpenSchedule: () => void;
}

const LIVE_STATUS_META: Record<
  ProfessionalStatusItem['liveStatus'],
  { label: string; className: string }
> = {
  in_consultation: { label: 'En consulta', className: 'green' },
  waiting_patient: { label: 'Paciente en sala', className: 'amber' },
  available: { label: 'Disponible', className: 'sky' },
};

export const TeamOccupancyPanel: React.FC<TeamOccupancyPanelProps> = ({
  team,
  onOpenSchedule,
}) => {
  return (
    <section className="cad-card" aria-label="Equipo y consultorios hoy">
      <div className="cad-card-head">
        <div>
          <h2>Equipo y consultorios hoy</h2>
          <p>Ocupación en tiempo real e ingresos generados por especialista</p>
        </div>
        <button type="button" className="cad-link" onClick={onOpenSchedule}>
          Ver agenda →
        </button>
      </div>

      <div className="cad-team-list">
        {team.map((prof) => {
          const pct = Math.round((prof.bookedSlots / Math.max(1, prof.totalSlots)) * 100);
          const status = LIVE_STATUS_META[prof.liveStatus];

          return (
            <div key={prof.id} className="cad-team-row">
              <div className="cad-team-identity">
                <span className="cad-team-avatar">{prof.initials}</span>
                <div>
                  <div className="cad-team-name-line">
                    <strong>{prof.name}</strong>
                    <span className="cad-room-pill">{prof.room}</span>
                  </div>
                  <span className="cad-team-spec">{prof.specialty}</span>
                </div>
              </div>

              <div className="cad-team-progress">
                <div className="cad-team-progress-head">
                  <span className={`cad-live-tag ${status.className}`}>
                    <span className="cad-dot" />
                    {status.label}
                  </span>
                  <span className="cad-slots-text">
                    {prof.bookedSlots}/{prof.totalSlots} ({pct}%)
                  </span>
                </div>
                <div className="cad-progress-track">
                  <div className="cad-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="cad-team-revenue">
                <strong>{formatPen(prof.revenueToday)}</strong>
                <span>Hoy</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
