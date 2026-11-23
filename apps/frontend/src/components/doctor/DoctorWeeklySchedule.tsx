import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { WeeklyDaySchedule, WeeklySlot } from './types';

interface DoctorWeeklyScheduleProps {
  days: WeeklyDaySchedule[];
  selectedDayKey: string;
  currentDay: WeeklyDaySchedule;
  stats: {
    occupied: number;
    available: number;
    blocked: number;
    occupancyPct: number;
  };
  onSelectDay: (key: string) => void;
  onOpenBlockModal: () => void;
  onUnblockSlot: (dayKey: string, slotId: string) => void;
  onOpenConsultation: (slot?: WeeklySlot) => void;
}

const ShiftSlotList: React.FC<{
  title: string;
  icon: string;
  slots: WeeklySlot[];
  dayKey: string;
  onUnblock: (dayKey: string, slotId: string) => void;
  onOpenConsultation: (slot?: WeeklySlot) => void;
}> = ({ title, icon, slots, dayKey, onUnblock, onOpenConsultation }) => {
  if (slots.length === 0) return null;

  const occupiedCount = slots.filter((s) => s.status === 'occupied').length;

  return (
    <div className="dd-shift-block">
      <div className="dd-shift-head">
        <span className="dd-shift-title">
          <MaterialIcon name={icon} size={16} />
          <span>{title}</span>
        </span>
        <span className="dd-shift-count">{occupiedCount} cita(s)</span>
      </div>

      <div className="dd-slots-list">
        {slots.map((slot) => (
          <div key={slot.id} className={`dd-slot-row status-${slot.status}`}>
            <div className="dd-slot-time">
              <strong>{slot.time}</strong>
              <span>{slot.room}</span>
            </div>

            <div className="dd-slot-body">
              {slot.status === 'occupied' && (
                <>
                  <strong>{slot.patient}</strong>
                  <span>{slot.service}</span>
                </>
              )}
              {slot.status === 'available' && (
                <>
                  <strong className="tone-free">Horario disponible</strong>
                  <span>{slot.note || 'Espacio libre en agenda'}</span>
                </>
              )}
              {slot.status === 'blocked' && (
                <>
                  <strong className="tone-blocked">Franja bloqueada</strong>
                  <span>{slot.note || 'Pausa o actividad no clínica'}</span>
                </>
              )}
            </div>

            <div className="dd-slot-action">
              {slot.status === 'occupied' && (
                <button
                  type="button"
                  className="dd-btn-call-sm"
                  onClick={() => onOpenConsultation(slot)}
                >
                  <span>Atender</span>
                </button>
              )}
              {slot.status === 'blocked' && (
                <button
                  type="button"
                  className="dd-btn-danger-sm"
                  onClick={() => onUnblock(dayKey, slot.id)}
                >
                  Desbloquear
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DoctorWeeklySchedule: React.FC<DoctorWeeklyScheduleProps> = ({
  days,
  selectedDayKey,
  currentDay,
  stats,
  onSelectDay,
  onOpenBlockModal,
  onUnblockSlot,
  onOpenConsultation,
}) => {
  const morningSlots = currentDay.slots.filter((s) => s.period === 'AM');
  const afternoonSlots = currentDay.slots.filter((s) => s.period === 'PM');

  return (
    <section className="dd-panel" aria-label="Agenda semanal">
      <div className="dd-weekly-top">
        <div className="dd-weekly-stats">
          <span className="dd-stat-chip sky">
            <strong>{stats.occupied}</strong> citas
          </span>
          <span className="dd-stat-chip green">
            <strong>{stats.occupancyPct}%</strong> ocupación
          </span>
          <span className="dd-stat-chip slate">
            <strong>{stats.available}</strong> libres
          </span>
          <span className="dd-stat-chip amber">
            <strong>{stats.blocked}</strong> bloqueos
          </span>
        </div>

        <button
          type="button"
          className="dd-btn-danger-outline"
          onClick={onOpenBlockModal}
        >
          <MaterialIcon name="block" size={16} />
          <span>Bloquear horario</span>
        </button>
      </div>

      {/* Selector de días */}
      <div className="dd-days-grid">
        {days.map((day) => {
          const occupied = day.slots.filter((s) => s.status === 'occupied').length;
          const isSelected = day.key === selectedDayKey;
          return (
            <button
              key={day.key}
              type="button"
              className={`dd-day-btn ${isSelected ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => onSelectDay(day.key)}
            >
              <span className="dd-day-name">{day.dayName}</span>
              <strong className="dd-day-num">{day.dayNum}</strong>
              <span className="dd-day-meta">
                {day.isToday ? `Hoy · ${occupied}` : `${occupied} citas`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Turnos del día seleccionado */}
      <div className="dd-day-detail">
        <h2 className="dd-day-detail-title">{currentDay.date}</h2>
        <ShiftSlotList
          title="Turno Mañana"
          icon="wb_sunny"
          slots={morningSlots}
          dayKey={currentDay.key}
          onUnblock={onUnblockSlot}
          onOpenConsultation={onOpenConsultation}
        />
        <ShiftSlotList
          title="Turno Tarde"
          icon="bedtime"
          slots={afternoonSlots}
          dayKey={currentDay.key}
          onUnblock={onUnblockSlot}
          onOpenConsultation={onOpenConsultation}
        />
      </div>
    </section>
  );
};
