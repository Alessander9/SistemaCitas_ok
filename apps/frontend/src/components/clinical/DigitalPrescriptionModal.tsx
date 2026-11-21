import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { soundEffects } from '../../utils/soundEffects';

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  prescriptionNumber?: string;
  issueDate?: string;
  patientName: string;
  patientDni?: string;
  patientAge?: number | string;
  doctorName?: string;
  doctorCmp?: string;
  doctorRne?: string;
  specialty?: string;
  diagnosis?: string;
  cie10?: string;
  items: PrescriptionItem[];
  indications?: string;
  nextAppointment?: string;
}

interface DigitalPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrescriptionData;
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundEffects.playPop();
    window.print();
  };

  const rxNumber = data.prescriptionNumber || `RX-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const dateStr = data.issueDate || new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <MaterialIcon name="description" size={20} />
            <div>
              <h3 className="font-bold text-sm">Receta Médica Electrónica Oficial</h3>
              <p className="text-[11px] text-slate-300">Norma Técnica de Salud MINSA - NTS N° 139-MINSA/DGIEM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow flex items-center gap-1.5 transition-all"
            >
              <MaterialIcon name="print" size={16} />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 flex items-center justify-center"
            >
              <MaterialIcon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto print:p-6 text-slate-800 dark:text-slate-100 print:text-black bg-white dark:bg-slate-900 print:bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-primary-600 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-2xl shadow">
                <MaterialIcon name="medical_services" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-primary-700 dark:text-primary-400 print:text-primary-700 uppercase">
                  Clínica VitalSalud
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                  Centro Médico de Especialidades y Cirugía de Día
                </p>
                <p className="text-[11px] text-slate-400">RUC: 20601234567 • Sede Principal: Av. Javier Prado Este 1234, Lima</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded">
                {rxNumber}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Fecha de Emisión: {dateStr}</p>
            </div>
          </div>

          {/* Doctor & Patient Info Grids */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 print:bg-slate-100 border border-slate-200 dark:border-slate-700/60 mb-5 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Médico Tratante</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 print:text-black text-sm">
                Dr(a). {data.doctorName || 'Carlos Mendoza Vega'}
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-700">
                {data.specialty || 'Medicina General y Reumatología'}
              </p>
              <p className="font-mono text-slate-500 text-[11px]">
                CMP: {data.doctorCmp || '054321'} • RNE: {data.doctorRne || '028911'}
              </p>
            </div>

            <div className="space-y-1 border-l pl-4 border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Datos del Paciente</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 print:text-black text-sm">
                {data.patientName}
              </p>
              <div className="flex gap-4 text-slate-600 dark:text-slate-300 print:text-slate-700">
                <span>DNI: {data.patientDni || '72345678'}</span>
                {data.patientAge && <span>Edad: {data.patientAge} años</span>}
              </div>
              {data.diagnosis && (
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Dx: {data.diagnosis} {data.cie10 ? `(${data.cie10})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Prescriptions (Rp.) Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-serif italic font-bold text-primary-700 dark:text-primary-400">Rp.</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Prescripción Farmacológica
              </h2>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Medicamento / Principio Activo</th>
                    <th className="py-2 px-3">Dosis</th>
                    <th className="py-2 px-3">Frecuencia / Duración</th>
                    <th className="py-2 px-3">Indicaciones Especiales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{index + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 print:text-black">
                          {item.medication}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                          {item.dosage}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {item.frequency} x {item.duration}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 italic">
                          {item.instructions || 'Tomar después de los alimentos.'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                        No se registraron medicamentos en esta consulta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Indications */}
          {data.indications && (
            <div className="mb-6 p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <MaterialIcon name="warning" size={16} />
                <span>Indicaciones y Cuidados Generales:</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {data.indications}
              </p>
            </div>
          )}

          {/* Footer: Digital Signature Stamp & QR Code */}
          <div className="pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-6 items-center">
            {/* QR Verification */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-white border border-slate-300 p-1 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                {/* Visual SVG QR Representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect width="100" height="100" fill="white" />
                  <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="currentColor" />
                  <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="currentColor" />
                  <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="currentColor" />
                  <rect x="45" y="15" width="8" height="8" fill="currentColor" />
                  <rect x="45" y="30" width="8" height="15" fill="currentColor" />
                  <rect x="60" y="50" width="12" height="12" fill="currentColor" />
                  <rect x="75" y="55" width="15" height="8" fill="currentColor" />
                  <rect x="50" y="70" width="20" height="15" fill="currentColor" />
                  <rect x="80" y="75" width="10" height="15" fill="currentColor" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                <p className="font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  Validación Electrónica QR
                </p>
                <p>Escanee para validar autenticidad de la receta y dispensación en farmacia.</p>
                <p className="font-mono text-[9px] text-slate-400 mt-1">HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}-CMP</p>
              </div>
            </div>

            {/* Doctor Signature Stamp */}
            <div className="text-center flex flex-col items-center">
              <div className="h-14 flex items-end justify-center mb-1">
                <span className="font-serif italic text-lg text-primary-700/80 dark:text-primary-400/80 font-bold border-b border-slate-400 pb-1 px-8">
                  {data.doctorName || 'Dr. Carlos Mendoza V.'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 print:text-black">
                Firma Digital y Sello Médico
              </p>
              <p className="text-[10px] text-slate-500">
                CMP {data.doctorCmp || '054321'} • RNE {data.doctorRne || '028911'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer info & WhatsApp button */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <MaterialIcon name="lightbulb" size={16} />
            <span>Consejo: Presione Imprimir para generar el PDF listo para entrega física o envío.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
