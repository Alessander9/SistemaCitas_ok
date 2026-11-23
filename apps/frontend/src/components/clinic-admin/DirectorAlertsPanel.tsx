import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { OperationalAlert } from './types';

interface DirectorAlertsPanelProps {
  alerts: OperationalAlert[];
  onNavigate: (view: string) => void;
}

const ADMIN_SHORTCUTS = [
  { id: 'cash-register', label: 'Caja Chica', icon: 'point_of_sale', tone: 'emerald' },
  { id: 'inventory', label: 'Inventario', icon: 'inventory_2', tone: 'indigo' },
  { id: 'communications', label: 'Comunicaciones', icon: 'mail', tone: 'sky' },
  { id: 'telegram-bot', label: 'Bot Telegram', icon: 'smart_toy', tone: 'blue' },
];

export const DirectorAlertsPanel: React.FC<DirectorAlertsPanelProps> = ({
  alerts,
  onNavigate,
}) => {
  return (
    <div className="cad-side-stack">
      {/* Alertas accionables */}
      <section className="cad-card" aria-label="Alertas que requieren atención">
        <div className="cad-card-head">
          <div>
            <h2>Requiere tu atención</h2>
            <p>Pendientes operativos prioritarios de la sede</p>
          </div>
        </div>

        <div className="cad-alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`cad-alert-row severity-${alert.severity}`}>
              <div className="cad-alert-text">
                <strong>{alert.title}</strong>
                <span>{alert.detail}</span>
              </div>
              <button
                type="button"
                className="cad-alert-btn"
                onClick={() => onNavigate(alert.targetView)}
              >
                {alert.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Accesos rápidos compactos */}
      <section className="cad-card" aria-label="Accesos de gestión">
        <div className="cad-card-head">
          <h2>Gestión de sede</h2>
        </div>

        <div className="cad-shortcuts-grid">
          {ADMIN_SHORTCUTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="cad-shortcut-btn"
              onClick={() => onNavigate(item.id)}
            >
              <span className={`cad-shortcut-icon ${item.tone}`}>
                <MaterialIcon name={item.icon} size={18} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
