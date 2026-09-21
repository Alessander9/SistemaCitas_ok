import React from 'react';
import { IconBadgeCheck, IconHandHeart } from './AppointmentIcons';
import { IconShield } from '../ui/Icons';
import './AppointmentStep.css';

interface TrustItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    id: 'certified',
    title: 'Especialistas certificados',
    description: 'Profesionales con experiencia',
    icon: <IconBadgeCheck size={18} />,
  },
  {
    id: 'personalized',
    title: 'Atención personalizada',
    description: 'Tratamientos adaptados a ti',
    icon: <IconHandHeart size={18} />,
  },
  {
    id: 'facilities',
    title: 'Ambiente seguro y moderno',
    description: 'Instalaciones equipadas',
    icon: <IconShield size={18} />,
  },
];

/** Sidebar context: what the clinic guarantees around the reservation. */
export const TrustPanel: React.FC = () => (
  <aside className="apx-trust" aria-label="Atención profesional para tu bienestar">
    <div className="apx-trust__header">
      <span className="apx-trust__icon" aria-hidden="true">
        <IconHandHeart size={22} />
      </span>
      <h3 className="apx-trust__title">Atención profesional para tu bienestar</h3>
    </div>

    <ul className="apx-trust__list">
      {TRUST_ITEMS.map((item) => (
        <li className="apx-trust__item" key={item.id}>
          <span className="apx-trust__item-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="apx-trust__item-text">
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </span>
        </li>
      ))}
    </ul>
  </aside>
);
