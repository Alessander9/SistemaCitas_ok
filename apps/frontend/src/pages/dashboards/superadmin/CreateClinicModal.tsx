import React, { useState, useMemo } from 'react';
import { ClinicRecord } from './types';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import {
  MEDICAL_PRESETS,
  CURATED_PALETTES,
  deriveBrandTheme,
  SpecialtyPreset,
} from '../../../config/clinicPresets';

interface CreateClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    clinic: Omit<ClinicRecord, 'id' | 'monthlyRevenue' | 'revenueAmount' | 'activeAppointments'>,
  ) => Promise<unknown> | void;
}

export const CreateClinicModal: React.FC<CreateClinicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClinicData, setCreatedClinicData] = useState<{
    name: string;
    slug: string;
    adminEmail: string;
    adminPass: string;
  } | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Step 1: Identity & Style
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('policlinico');
  const [clinicName, setClinicName] = useState('');
  const [clinicSlug, setClinicSlug] = useState('');
  const [clinicCity, setClinicCity] = useState('Lima, Perú');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#0284c7');
  const [landingStyle, setLandingStyle] = useState<'modern' | 'editorial' | 'express'>('modern');

  // Step 2: Operations, Landing & AI
  const [phone, setPhone] = useState('+51 987 654 321');
  const [whatsappNumber, setWhatsappNumber] = useState('+51 987 654 321');
  const [aiAssistantName, setAiAssistantName] = useState('Sofía · Asistente IA');
  const [enableSelfBooking, setEnableSelfBooking] = useState(true);
  const [heroTitle, setHeroTitle] = useState(MEDICAL_PRESETS.policlinico.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(MEDICAL_PRESETS.policlinico.heroSubtitle);
  const [heroImageUrl, setHeroImageUrl] = useState(MEDICAL_PRESETS.policlinico.heroImageUrl);
  const [loginTagline, setLoginTagline] = useState(MEDICAL_PRESETS.policlinico.defaultTagline);

  // Step 3: Admin User
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Admin@2026');
  const [adminPhone, setAdminPhone] = useState('');

  // Auto-fill from preset
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const p: SpecialtyPreset | undefined = MEDICAL_PRESETS[key];
    if (p) {
      setBrandColor(p.brandColor);
      setHeroTitle(p.heroTitle);
      setHeroSubtitle(p.heroSubtitle);
      setHeroImageUrl(p.heroImageUrl);
      setLoginTagline(p.defaultTagline);
      setLandingStyle(p.landingStyle);
    }
  };

  const handleNameChange = (val: string) => {
    setClinicName(val);
    if (!clinicSlug || clinicSlug === clinicName.toLowerCase().replace(/\s+/g, '-')) {
      setClinicSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-'),
      );
    }
  };

  const derivedTheme = useMemo(() => deriveBrandTheme(brandColor), [brandColor]);

  if (!isOpen) return null;

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !clinicSlug.trim() || !adminEmail.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<ClinicRecord, 'id' | 'monthlyRevenue' | 'revenueAmount' | 'activeAppointments'> = {
        name: clinicName.trim(),
        slug: clinicSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        city: clinicCity.trim() || 'Lima, Perú',
        phone: phone.trim() || undefined,
        status: 'active',
        doctors: 4,
        consultingRooms: 4,
        logoUrl: logoUrl.trim() || undefined,
        specialtyPreset: selectedPresetKey,
        landingStyle,
        brandColor,
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
        heroImageUrl: heroImageUrl.trim(),
        loginTagline: loginTagline.trim(),
        whatsappNumber: whatsappNumber.trim() || phone.trim(),
        aiAssistantName: aiAssistantName.trim() || 'Asistente IA',
        enableSelfBooking,
        initialAdmin: {
          firstName: adminFirstName.trim() || 'Director',
          lastName: adminLastName.trim() || clinicName.trim(),
          email: adminEmail.trim().toLowerCase(),
          password: adminPassword,
          phone: adminPhone.trim() || undefined,
        },
      };

      await onSubmit(payload);

      setCreatedClinicData({
        name: clinicName.trim(),
        slug: clinicSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPass: adminPassword,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyWhatsAppPayload = () => {
    if (!createdClinicData) return;
    const origin = window.location.origin;
    const text = `🏥 *¡Bienvenido a ${createdClinicData.name}!*
Tu plataforma médica en la nube ya está activa y configurada:

🌐 *Tu Portal Web & Cita Online:*
${origin}/?clinic=${createdClinicData.slug}

🔐 *Acceso Administrativo Privado:*
${origin}/?clinic=${createdClinicData.slug}&view=login

👤 *Usuario:* ${createdClinicData.adminEmail}
🔑 *Contraseña:* ${createdClinicData.adminPass}

*(Por seguridad, te recomendamos cambiar tu contraseña al ingresar).*`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const handleResetAndClose = () => {
    setCurrentStep(1);
    setCreatedClinicData(null);
    setClinicName('');
    setClinicSlug('');
    setAdminEmail('');
    onClose();
  };

  return (
    <div className="modal-overlay-custom" onClick={handleResetAndClose}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '96%',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: '#ffffff',
            borderBottom: '1.5px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: derivedTheme.softBg,
                color: derivedTheme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${derivedTheme.softBorder}`,
              }}
            >
              <MaterialIcon name="domain_add" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Aprovisionar Sede Marca Blanca (White-Label)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Configuración 0-código en 3 pasos con presets médicos y Live Preview.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        {/* Success Card Screen */}
        {createdClinicData ? (
          <div style={{ padding: '2.5rem 2rem', textAlign: 'center', background: '#f8fafc' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px solid #a7f3d0',
              }}
            >
              <MaterialIcon name="check_circle" size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              ¡Sede "{createdClinicData.name}" Creada y Publicada!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
              La sede cuenta con su landing personalizada, portal de citas y usuario administrador activo.
            </p>

            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                maxWidth: '540px',
                margin: '0 auto 1.5rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>URL de la Sede:</span>
                <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, fontFamily: 'monospace' }}>
                  {window.location.origin}/?clinic={createdClinicData.slug}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Administrador:</span>
                <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
                  {createdClinicData.adminEmail}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Contraseña Inicial:</span>
                <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, fontFamily: 'monospace' }}>
                  {createdClinicData.adminPass}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={handleCopyWhatsAppPayload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                <MaterialIcon name="content_copy" size={18} />
                {copiedNotice ? '¡Copiado al Portapapeles!' : 'Copiar Ficha para WhatsApp'}
              </button>
              <a
                href={`/?clinic=${createdClinicData.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.25rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Ver Landing ↗
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Indicators Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: '#f8fafc',
                borderBottom: '1.5px solid #e2e8f0',
                padding: '0.75rem 1.75rem',
                gap: '1rem',
              }}
            >
              {[
                { step: 1, label: '1. Identidad & Estilo', icon: 'palette' },
                { step: 2, label: '2. Operación & IA', icon: 'smart_toy' },
                { step: 3, label: '3. Administrador', icon: 'admin_panel_settings' },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <div
                    key={s.step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      opacity: isActive || isPassed ? 1 : 0.45,
                      borderBottom: isActive ? `2.5px solid ${derivedTheme.primary}` : '2.5px solid transparent',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isActive ? derivedTheme.primary : isPassed ? '#10b981' : '#cbd5e1',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {isPassed ? <MaterialIcon name="check" size={14} /> : s.step}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 600, color: '#0f172a' }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Modal Body: Left Form + Right Live Preview */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.25fr 0.95fr',
                gap: '1.25rem',
                padding: '1.5rem 1.75rem',
                overflowY: 'auto',
                maxHeight: '62vh',
                background: '#ffffff',
              }}
            >
              {/* Form Side */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* STEP 1: Identidad & Marca Blanca */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                        1. Selecciona el Rubro Médico (Autocompleta el 80% de la Landing)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                        {Object.entries(MEDICAL_PRESETS).map(([k, p]) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handleSelectPreset(k)}
                            style={{
                              padding: '0.6rem 0.5rem',
                              borderRadius: '10px',
                              border: selectedPresetKey === k ? `2px solid ${p.brandColor}` : '1.5px solid #e2e8f0',
                              background: selectedPresetKey === k ? `${p.brandColor}12` : '#ffffff',
                              color: '#0f172a',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontSize: '0.75rem',
                              fontWeight: selectedPresetKey === k ? 800 : 600,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.brandColor }} />
                            {p.name.split('/')[0].split('&')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Nombre Comercial <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="ej. Clínica San Mateo"
                          value={clinicName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Slug URL <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="clinica-san-mateo"
                          value={clinicSlug}
                          onChange={(e) => setClinicSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Ciudad / Sede
                        </label>
                        <input
                          type="text"
                          placeholder="Lima, Miraflores"
                          value={clinicCity}
                          onChange={(e) => setClinicCity(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Logo de la Clínica (URL o link)
                        </label>
                        <input
                          type="url"
                          placeholder="https://.../logo.png"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    {/* Paletas de Color */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                        Paleta de Color de Marca
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {CURATED_PALETTES.map((pal) => (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={() => setBrandColor(pal.hex)}
                            title={pal.name}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: pal.hex,
                              border: brandColor === pal.hex ? '3px solid #0f172a' : '2px solid #ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              cursor: 'pointer',
                              transform: brandColor === pal.hex ? 'scale(1.15)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {brandColor}
                        </span>
                      </div>
                    </div>

                    {/* 3 Estilos de Landing */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                        Estilo Visual de la Landing
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {[
                          { id: 'modern', name: 'Clínico Moderno', desc: 'Limpio y tecnológico' },
                          { id: 'editorial', name: 'Editorial Boutique', desc: 'Elegante y refinado' },
                          { id: 'express', name: 'Reserva Express', desc: 'Directo al botón de cita' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setLandingStyle(st.id as 'modern' | 'editorial' | 'express')}
                            style={{
                              padding: '0.65rem 0.5rem',
                              borderRadius: '10px',
                              border: landingStyle === st.id ? `2px solid ${derivedTheme.primary}` : '1.5px solid #e2e8f0',
                              background: landingStyle === st.id ? derivedTheme.softBg : '#ffffff',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{st.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2: Operación & IA */}
                {currentStep === 2 && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Teléfono de Contacto
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          WhatsApp Flotante
                        </label>
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        Nombre del Asistente Virtual IA
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Sofía · Asistente IA"
                        value={aiAssistantName}
                        onChange={(e) => setAiAssistantName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '9px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                          Cita Autogestionada en Landing
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Permite a pacientes agendar directamente desde su web pública.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableSelfBooking}
                        onChange={(e) => setEnableSelfBooking(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        Título de Portada (Hero Title)
                      </label>
                      <input
                        type="text"
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '9px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        Subtítulo Explicativo
                      </label>
                      <textarea
                        rows={2}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '9px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </>
                )}

                {/* STEP 3: Administrador */}
                {currentStep === 3 && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Nombres del Director <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. Roberto"
                          value={adminFirstName}
                          onChange={(e) => setAdminFirstName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Apellidos <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Vargas Ríos"
                          value={adminLastName}
                          onChange={(e) => setAdminLastName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        Correo Electrónico (Login) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="director@clinica.pe"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '9px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Contraseña Inicial <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                          Teléfono Móvil
                        </label>
                        <input
                          type="text"
                          placeholder="+51 999 888 777"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '9px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: LIVE PREVIEW PANEL */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vista Previa en Vivo
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '6px',
                      background: derivedTheme.softBg,
                      color: derivedTheme.primary,
                      border: `1px solid ${derivedTheme.softBorder}`,
                    }}
                  >
                    Estilo: {landingStyle}
                  </span>
                </div>

                {/* Simulated Browser Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Browser Top Bar */}
                  <div
                    style={{
                      background: '#f1f5f9',
                      padding: '0.4rem 0.75rem',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.68rem',
                      color: '#64748b',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                      citassistema.pe/?clinic={clinicSlug || 'tu-sede'}
                    </span>
                  </div>

                  {/* Header Preview */}
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          style={{ height: '24px', maxWidth: '80px', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: derivedTheme.primary,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                          }}
                        >
                          {(clinicName || 'C')[0].toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        {clinicName || 'Nombre de Clínica'}
                      </span>
                    </div>

                    <button
                      type="button"
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        background: derivedTheme.primary,
                        color: derivedTheme.contrastText,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: 'none',
                      }}
                    >
                      Reservar Cita
                    </button>
                  </div>

                  {/* Hero Preview */}
                  <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                    <img
                      src={heroImageUrl}
                      alt="Hero"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 100%)',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <h5 style={{ margin: 0, color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.2 }}>
                        {heroTitle}
                      </h5>
                      <span style={{ color: '#cbd5e1', fontSize: '0.65rem', marginTop: '2px', lineHeight: 1.2 }}>
                        {heroSubtitle.substring(0, 60)}...
                      </span>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div
                    style={{
                      padding: '0.65rem 0.75rem',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.68rem',
                    }}
                  >
                    <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MaterialIcon name="smart_toy" size={14} /> {aiAssistantName}
                    </span>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>
                      WhatsApp: {whatsappNumber}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: 'auto' }}>
                  Esta vista previa se genera automáticamente con los datos en tiempo real.
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                padding: '1rem 1.75rem',
                background: '#ffffff',
                borderTop: '1.5px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((p) => (p - 1) as 1 | 2 | 3)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    ← Atrás
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'transparent',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Cancelar
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((p) => (p + 1) as 1 | 2 | 3)}
                    style={{
                      padding: '0.6rem 1.4rem',
                      background: derivedTheme.primary,
                      border: 'none',
                      borderRadius: '8px',
                      color: derivedTheme.contrastText,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      boxShadow: `0 3px 10px ${derivedTheme.primary}40`,
                    }}
                  >
                    Siguiente: {currentStep === 1 ? 'Operación & IA →' : 'Cuenta Administrador →'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.6rem 1.5rem',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    }}
                  >
                    {isSubmitting ? 'Aprovisionando...' : '✓ Crear y Publicar Sede'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
