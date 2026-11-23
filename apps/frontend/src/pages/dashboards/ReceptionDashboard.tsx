import React, { useState } from 'react';
import './ReceptionDashboard.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { IconSearch } from '../../components/ui/Icons';
import { WhatsAppReminderModal } from '../../components/reception/WhatsAppReminderModal';
import {
  useReceptionDashboard,
  ReceptionHeader,
  ReceptionStatsBar,
  ReceptionAppointmentTable,
  ReceptionBoardView,
  ReceptionQuickBookingModal,
  ReceptionPaymentModal,
  ReceptionAppointment,
  ReceptionFilter,
} from '../../components/reception';

interface ReceptionDashboardProps {
  onNavigateToBooking: () => void;
  onNavigateToCash: () => void;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({
  onNavigateToBooking,
  onNavigateToCash,
}) => {
  const {
    filteredAppointments,
    counts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    toastMessage,
    clearToast,
    updateStatus,
    registerPayment,
    createBooking,
  } = useReceptionDashboard();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<ReceptionAppointment | null>(null);
  const [whatsAppTarget, setWhatsAppTarget] = useState<ReceptionAppointment | null>(null);

  const filterPills: Array<{ id: ReceptionFilter; label: string; count: number }> = [
    { id: 'all', label: 'Todos', count: counts.total },
    { id: 'pending_arrival', label: 'Por llegar', count: counts.pendingArrival },
    { id: 'waiting', label: 'En espera', count: counts.waiting },
    { id: 'in_consultation', label: 'En consulta', count: counts.inConsultation },
    { id: 'unpaid', label: 'Por cobrar', count: counts.unpaid },
    { id: 'completed', label: 'Finalizados', count: counts.completed },
  ];

  return (
    <div className="rd-shell">
      {/* Toast de confirmación */}
      {toastMessage && (
        <div className="rd-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button type="button" onClick={clearToast} aria-label="Cerrar aviso">
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Header Operativo Limpio */}
      <ReceptionHeader
        totalCashToday={counts.totalCashToday}
        onNewBooking={() => setIsBookingOpen(true)}
        onOpenCash={onNavigateToCash}
        onOpenCalendar={onNavigateToBooking}
      />

      {/* 2. Barra de Resumen Dinámica y Clickeable */}
      <ReceptionStatsBar
        counts={counts}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />

      {/* 3. Área Principal: Buscador + Filtros + Lista/Tablero */}
      <section className="rd-workspace" aria-label="Agenda del día en recepción">
        <div className="rd-toolbar">
          <div className="rd-search-box">
            <span className="rd-search-icon">
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Escribe DNI o Apellidos para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="rd-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                <MaterialIcon name="close" size={15} />
              </button>
            )}
          </div>

          <div className="rd-view-switch" role="group" aria-label="Modo de vista">
            <button
              type="button"
              className={`rd-switch-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <MaterialIcon name="format_list_bulleted" size={16} />
              <span>Lista</span>
            </button>
            <button
              type="button"
              className={`rd-switch-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              <MaterialIcon name="view_kanban" size={16} />
              <span>Tablero</span>
            </button>
          </div>
        </div>

        <div className="rd-filter-row" role="tablist" aria-label="Filtrar citas por estado">
          {filterPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === pill.id}
              className={`rd-filter-pill ${statusFilter === pill.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(pill.id)}
            >
              <span>{pill.label}</span>
              <span className="rd-pill-count">{pill.count}</span>
            </button>
          ))}
        </div>

        {viewMode === 'list' ? (
          <ReceptionAppointmentTable
            appointments={filteredAppointments}
            onUpdateStatus={updateStatus}
            onOpenPayment={setPaymentTarget}
            onOpenWhatsApp={setWhatsAppTarget}
          />
        ) : (
          <ReceptionBoardView
            appointments={filteredAppointments}
            onUpdateStatus={updateStatus}
            onOpenPayment={setPaymentTarget}
            onOpenWhatsApp={setWhatsAppTarget}
          />
        )}
      </section>

      {/* Modales */}
      {isBookingOpen && (
        <ReceptionQuickBookingModal
          onClose={() => setIsBookingOpen(false)}
          onCreate={createBooking}
        />
      )}

      {paymentTarget && (
        <ReceptionPaymentModal
          appointment={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onConfirmPayment={registerPayment}
        />
      )}

      {whatsAppTarget && (
        <WhatsAppReminderModal
          isOpen={true}
          onClose={() => setWhatsAppTarget(null)}
          data={{
            patientName: whatsAppTarget.patientName,
            patientPhone: whatsAppTarget.phone,
            doctorName: whatsAppTarget.doctor,
            timeStr: whatsAppTarget.time,
            serviceType: whatsAppTarget.service,
          }}
        />
      )}
    </div>
  );
};

export default ReceptionDashboard;
