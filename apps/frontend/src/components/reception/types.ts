export type ReceptionStatus =
  | 'pending_arrival'
  | 'waiting'
  | 'in_consultation'
  | 'completed';

export type PaymentMethod = 'Yape' | 'Plin' | 'POS Tarjeta' | 'Efectivo';

export type ReceptionFilter = 'all' | ReceptionStatus | 'unpaid';

export interface ReceptionAppointment {
  id: string;
  time: string;
  patientName: string;
  dni: string;
  phone?: string;
  doctor: string;
  service: string;
  priceAmount: number;
  priceLabel: string;
  status: ReceptionStatus;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  room?: string;
  urgent?: boolean;
}

export interface CreateReceptionBookingInput {
  dni: string;
  patientName: string;
  phone?: string;
  email?: string;
  service: string;
  doctor: string;
  time: string;
  priceAmount: number;
  paidNow: boolean;
  paymentMethod?: PaymentMethod;
  urgent?: boolean;
}
