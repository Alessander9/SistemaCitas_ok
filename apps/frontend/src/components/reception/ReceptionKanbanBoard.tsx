import React, { useState } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';
import { DigitalPrescriptionModal } from '../clinical/DigitalPrescriptionModal';
import { WaitingTimeBadge } from '../common/WaitingTimeBadge';
import './ReceptionKanbanBoard.css';

export interface KanbanAppointment {
  id: string;
  time?: string;
  date?: string;
  patientName?: string;
  patient?: { name?: string; phone?: string; dni?: string };
  doctorName?: string;
  doctor?: { name?: string; specialty?: string };
  service?: string;
  status?: string;
  price?: string;
  paid?: boolean;
}

interface ReceptionKanbanBoardProps {
  appointments: KanbanAppointment[];
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  onSelectAppointment?: (appointment: KanbanAppointment) => void;
}

type KanbanColumnId = 'waiting' | 'in_consultation' | 'pending_payment' | 'completed';

interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  icon: string;
  statusMatch: string[];
  color: string;
  badgeBg: string;
  badgeText: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'waiting',
    title: 'En Sala de Espera',
    icon: '⏳',
    statusMatch: ['WAITING', 'CONFIRMED', 'PENDING', 'PROGRAMADA'],
    color: '#f59e0b',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-800 dark:text-amber-300',
  },
  {
    id: 'in_consultation',
    title: 'En Consulta Médica',
    icon: '🟢',
    statusMatch: ['IN_PROGRESS', 'EN_CONSULTA', 'TRIAJE'],
    color: '#10b981',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
  },
  {
    id: 'pending_payment',
    title: 'Pendiente Cobro en Caja',
    icon: '💵',
    statusMatch: ['PENDING_PAYMENT', 'PENDIENTE_PAGO', 'CAJA'],
    color: '#0ea5e9',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/70',
    badgeText: 'text-sky-800 dark:text-sky-300',
  },
  {
    id: 'completed',
    title: 'Atendido & Alta',
    icon: '✓',
    statusMatch: ['COMPLETED', 'ATENDIDO', 'PAGADO'],
    color: '#8b5cf6',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/70',
    badgeText: 'text-purple-800 dark:text-purple-300',
  },
];

export const ReceptionKanbanBoard: React.FC<ReceptionKanbanBoardProps> = ({
  appointments,
  onStatusChange,
  onSelectAppointment,
}) => {
  // Local state to allow responsive drag and drop and status updates
  const [localStatuses, setLocalStatuses] = useState<Record<string, KanbanColumnId>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<KanbanColumnId | null>(null);

  // WhatsApp & Prescription Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [selectedWaAppt, setSelectedWaAppt] = useState<KanbanAppointment | null>(null);

  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedRxAppt, setSelectedRxAppt] = useState<KanbanAppointment | null>(null);

  // Determine current column for each appointment
  const getApptColumn = (appt: KanbanAppointment): KanbanColumnId => {
    if (localStatuses[appt.id]) {
      return localStatuses[appt.id];
    }
    const rawStatus = (appt.status || '').toUpperCase();
    if (['IN_PROGRESS', 'EN_CONSULTA', 'TRIAJE'].includes(rawStatus)) return 'in_consultation';
    if (['PENDING_PAYMENT', 'PENDIENTE_PAGO', 'CAJA'].includes(rawStatus)) return 'pending_payment';
    if (['COMPLETED', 'ATENDIDO', 'PAGADO'].includes(rawStatus)) return 'completed';
    return 'waiting';
  };

  const moveAppointment = (apptId: string, targetCol: KanbanColumnId) => {
    setLocalStatuses((prev) => ({ ...prev, [apptId]: targetCol }));

    if (targetCol === 'in_consultation') {
      soundEffects.playChime();
      onStatusChange?.(apptId, 'IN_PROGRESS');
    } else if (targetCol === 'pending_payment') {
      soundEffects.playCashRegister();
      onStatusChange?.(apptId, 'PENDING_PAYMENT');
    } else if (targetCol === 'completed') {
      soundEffects.playSuccess();
      onStatusChange?.(apptId, 'COMPLETED');
    } else {
      soundEffects.playPop();
      onStatusChange?.(apptId, 'WAITING');
    }
  };

  const getNextColumn = (currentCol: KanbanColumnId): KanbanColumnId | null => {
    if (currentCol === 'waiting') return 'in_consultation';
    if (currentCol === 'in_consultation') return 'pending_payment';
    if (currentCol === 'pending_payment') return 'completed';
    return null;
  };

  const getNextActionLabel = (currentCol: KanbanColumnId): { label: string; icon: string } | null => {
    if (currentCol === 'waiting') return { label: 'Llamar a Box', icon: '📢' };
    if (currentCol === 'in_consultation') return { label: 'Enviar a Caja', icon: '💳' };
    if (currentCol === 'pending_payment') return { label: 'Cobrar y Finalizar', icon: '✅' };
    return null;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanColumnId) => {
    e.preventDefault();
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: KanbanColumnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      moveAppointment(id, colId);
    }
    setDraggedId(null);
    setActiveDropCol(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setActiveDropCol(null);
  };

  // Group appointments into columns
  const columnData = KANBAN_COLUMNS.map((col) => {
    const items = appointments.filter((appt) => getApptColumn(appt) === col.id);
    return { ...col, items };
  });

  return (
    <div className="kanban-container">
      {/* Kanban Header Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
            Flujo de Atención en Tiempo Real (Triage & Espera)
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            {appointments.length} Pacientes en cola
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>💡 Arrastre las tarjetas o use el botón rápido para avanzar</span>
        </div>
      </div>

      {/* 4 Column Board */}
      <div className="kanban-grid">
        {columnData.map((col) => {
          const isDropActive = activeDropCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`kanban-column ${isDropActive ? 'kanban-column-drop-active' : ''}`}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{col.icon}</span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {col.title}
                  </h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badgeBg} ${col.badgeText}`}>
                  {col.items.length}
                </span>
              </div>

              {/* Column Cards List */}
              <div className="kanban-card-list">
                {col.items.length === 0 ? (
                  <div className="kanban-empty-dropzone">
                    <p className="text-xs text-slate-400 italic">Sin pacientes en este estado</p>
                  </div>
                ) : (
                  col.items.map((appt) => {
                    const patientName = appt.patient?.name || (appt as unknown as { patientName?: string }).patientName || 'Paciente';
                    const docName = appt.doctor?.name || (appt as unknown as { doctorName?: string }).doctorName || 'Médico de Turno';
                    const timeStr = appt.time || (appt.date ? new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM');
                    const nextCol = getNextColumn(col.id);
                    const nextAction = getNextActionLabel(col.id);
                    const isDragging = draggedId === appt.id;

                    return (
                      <div
                        key={appt.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, appt.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectAppointment?.(appt)}
                        className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}
                      >
                        {/* Card Header: Patient Name & Time */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {patientName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight hover:text-primary-600 transition-colors">
                                {patientName}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                👨‍⚕️ {docName}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                            {timeStr}
                          </span>
                        </div>

                        {/* Card Body Details */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
                            {appt.service || 'Consulta Externa'}
                          </span>
                          {col.id === 'waiting' && (
                            <WaitingTimeBadge arrivalTime={appt.time} />
                          )}
                          {col.id === 'in_consultation' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold animate-pulse">
                              📍 Box 101
                            </span>
                          )}
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-1.5">
                          {/* Left Quick Buttons: WhatsApp & Receta */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Enviar recordatorio WhatsApp"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWaAppt(appt);
                                setWaModalOpen(true);
                              }}
                              className="p-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors"
                            >
                              📲
                            </button>
                            <button
                              type="button"
                              title="Ver Receta / Orden Médica"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRxAppt(appt);
                                setRxModalOpen(true);
                              }}
                              className="p-1.5 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-md transition-colors"
                            >
                              📄
                            </button>
                          </div>

                          {/* Right Quick Advance Button */}
                          {nextCol && nextAction && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveAppointment(appt.id, nextCol);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-lg shadow-sm flex items-center gap-1 transition-all"
                            >
                              <span>{nextAction.icon}</span>
                              <span>{nextAction.label}</span>
                            </button>
                          )}
                          {col.id === 'completed' && (
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <span>✓</span>
                              <span>Alta Médica</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Modal */}
      {selectedWaAppt && (
        <WhatsAppReminderModal
          isOpen={waModalOpen}
          onClose={() => {
            setWaModalOpen(false);
            setSelectedWaAppt(null);
          }}
          data={{
            patientName: selectedWaAppt.patient?.name || 'Paciente',
            patientPhone: selectedWaAppt.patient?.phone || '51987654321',
            doctorName: selectedWaAppt.doctor?.name || 'Médico Especialista',
            specialty: selectedWaAppt.doctor?.specialty || 'Medicina General',
            dateStr: selectedWaAppt.date ? new Date(selectedWaAppt.date).toLocaleDateString('es-PE') : undefined,
            timeStr: selectedWaAppt.time || '10:00 AM',
            serviceType: selectedWaAppt.service,
          }}
        />
      )}

      {/* Digital Prescription Modal */}
      {selectedRxAppt && (
        <DigitalPrescriptionModal
          isOpen={rxModalOpen}
          onClose={() => {
            setRxModalOpen(false);
            setSelectedRxAppt(null);
          }}
          data={{
            patientName: selectedRxAppt.patient?.name || 'Paciente',
            patientDni: selectedRxAppt.patient?.dni || '72345678',
            doctorName: selectedRxAppt.doctor?.name || 'Dr. Carlos Mendoza',
            specialty: selectedRxAppt.doctor?.specialty || 'Medicina General',
            diagnosis: 'Lumbago agudo no especificado (M54.5)',
            cie10: 'M54.5',
            items: [
              {
                medication: 'Ibuprofeno 400mg Comprimidos',
                dosage: '1 comprimido (400mg)',
                frequency: 'Cada 8 horas con comida',
                duration: '5 días',
                instructions: 'Tomar con abundante agua después del almuerzo/cena.',
              },
              {
                medication: 'Paracetamol 500mg Tabletas',
                dosage: '1 tableta (500mg)',
                frequency: 'Cada 8 horas en caso de dolor persistente',
                duration: '3 días',
                instructions: 'No exceder de 3 gramos al día.',
              },
            ],
            indications: 'Reposo relativo por 48 horas. Aplicar compresas tibias en zona lumbar por 20 minutos. Acudir a urgencias en caso de parestesias o fiebre.',
          }}
        />
      )}
    </div>
  );
};
