import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { IconSearch, IconStethoscope } from '../ui/Icons';
import { DoctorQueueFilter, DoctorQueuePatient } from './types';
import { getEvaTone } from './useDoctorDashboard';

interface DoctorQueueListProps {
  patients: DoctorQueuePatient[];
  counts: {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
  };
  filter: DoctorQueueFilter;
  searchTerm: string;
  onFilterChange: (filter: DoctorQueueFilter) => void;
  onSearchChange: (value: string) => void;
  onOpenQuickNote: (patient: DoctorQueuePatient) => void;
  onCallPatient: (patient: DoctorQueuePatient) => void;
}

export const DoctorQueueList: React.FC<DoctorQueueListProps> = ({
  patients,
  counts,
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onOpenQuickNote,
  onCallPatient,
}) => {
  const pills: Array<{ id: DoctorQueueFilter; label: string; count: number }> = [
    { id: 'all', label: 'Todos', count: counts.total },
    { id: 'waiting', label: 'En espera', count: counts.waiting },
    { id: 'in_progress', label: 'En consulta', count: counts.inProgress },
    { id: 'completed', label: 'Atendidos', count: counts.completed },
  ];

  return (
    <section className="dd-panel" aria-label="Cola de pacientes de hoy">
      <div className="dd-panel-toolbar">
        <div className="dd-filter-pills" role="tablist" aria-label="Filtrar cola de hoy">
          {pills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={filter === pill.id}
              className={`dd-filter-pill ${filter === pill.id ? 'active' : ''}`}
              onClick={() => onFilterChange(pill.id)}
            >
              <span>{pill.label}</span>
              <span className="dd-pill-count">{pill.count}</span>
            </button>
          ))}
        </div>

        <div className="dd-search-box">
          <span className="dd-search-icon">
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar paciente, DNI o motivo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="dd-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
            >
              <MaterialIcon name="close" size={15} />
            </button>
          )}
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="dd-empty-state">
          <MaterialIcon name="person_search" size={26} />
          <p>No se encontraron pacientes con el filtro o búsqueda actual.</p>
        </div>
      ) : (
        <div className="dd-queue-list">
          {patients.map((patient) => {
            const eva = getEvaTone(patient.evaLast);
            const isInProgress = patient.status === 'in_progress';
            const isCompleted = patient.status === 'completed';

            return (
              <article
                key={patient.id}
                className={`dd-queue-row status-${patient.status}`}
              >
                <div className="dd-row-time">
                  <strong>{patient.time}</strong>
                  <span>{patient.room}</span>
                </div>

                <div className="dd-row-main">
                  <div className="dd-row-identity">
                    <span className="dd-row-avatar">{patient.initials}</span>
                    <div>
                      <div className="dd-row-name-line">
                        <h3>{patient.patientName}</h3>
                        <span className="dd-row-age">{patient.age}</span>
                        <span className={`dd-status-tag ${patient.status}`}>
                          {isInProgress
                            ? 'En consulta'
                            : isCompleted
                              ? 'Atendido'
                              : 'En espera'}
                        </span>
                      </div>
                      <p className="dd-row-reason">
                        <strong>{patient.service}</strong> · {patient.reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dd-row-clinical">
                  <span className={`dd-eva-pill ${eva.className}`}>
                    EVA {patient.evaLast}/10
                  </span>
                  <span className="dd-row-session">{patient.sessionLabel}</span>
                </div>

                <div className="dd-row-actions">
                  <button
                    type="button"
                    className="dd-btn-ghost-sm"
                    onClick={() => onOpenQuickNote(patient)}
                  >
                    <MaterialIcon name="edit_note" size={15} />
                    <span>Nota</span>
                  </button>

                  {!isCompleted ? (
                    <button
                      type="button"
                      className={`dd-btn-call-sm ${isInProgress ? 'active' : ''}`}
                      onClick={() => onCallPatient(patient)}
                    >
                      <IconStethoscope className="w-3.5 h-3.5" />
                      <span>{isInProgress ? 'Continuar' : 'Llamar'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="dd-btn-ghost-sm"
                      onClick={() => onCallPatient(patient)}
                    >
                      <span>Ver ficha</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
