import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PainMapPicker } from './PainMapPicker';
import { PainPoint } from '@citassistema/shared-types';

describe('PainMapPicker Component (Opción C: Zoom Anatómico Jerárquico)', () => {
  it('renders Level 1 body overview with view switches and search button', () => {
    const onChange = vi.fn();
    render(<PainMapPicker initialPoints={[]} onChange={onChange} />);

    expect(screen.getByText(/Mapeo Anatómico del Dolor EVA & Puntos Gatillo/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Posterior/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Lateral/i })).toBeInTheDocument();
    expect(screen.getByText(/Buscar estructura.../i)).toBeInTheDocument();
    expect(screen.getByText(/No se han registrado puntos anatómicos/i)).toBeInTheDocument();
  });

  it('allows switching views between Anterior, Posterior and Lateral', () => {
    render(<PainMapPicker initialPoints={[]} />);

    const lateralTab = screen.getByRole('tab', { name: /Lateral/i });
    fireEvent.click(lateralTab);
    expect(lateralTab).toHaveAttribute('aria-selected', 'true');

    const posteriorTab = screen.getByRole('tab', { name: /Posterior/i });
    fireEvent.click(posteriorTab);
    expect(posteriorTab).toHaveAttribute('aria-selected', 'true');
  });

  it('zooms into a region when clicking a region hitbox and shows structures', () => {
    render(<PainMapPicker initialPoints={[]} />);

    // Click on Shoulder (Hombro) region hitbox
    const shoulderHitbox = screen.getByRole('button', { name: /Región Hombro/i });
    fireEvent.click(shoulderHitbox);

    // Verifies Level 2 zoom view
    expect(screen.getByText(/Detalle con Zoom:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hombro/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Manguito de los Rotadores/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Supraespinoso/i).length).toBeGreaterThan(0);
  });

  it('opens clinical form when selecting a structure and saves point with EVA, trigger point and notes', () => {
    const onChange = vi.fn();
    render(<PainMapPicker initialPoints={[]} onChange={onChange} />);

    // Enter Shoulder
    const shoulderHitbox = screen.getByRole('button', { name: /Región Hombro/i });
    fireEvent.click(shoulderHitbox);

    // Click on Supraespinoso button in structure list
    const supraBtns = screen.getAllByRole('button', { name: /Supraespinoso/i });
    fireEvent.click(supraBtns[0]);

    // Form opened
    expect(screen.getByText(/Escala Visual Análoga \(EVA\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Lateralidad Anatómica:/i)).toBeInTheDocument();

    // Select EVA 8
    const eva8Btn = screen.getByRole('button', { name: '8' });
    fireEvent.click(eva8Btn);

    // Select Trigger Point Activo
    const triggerBtn = screen.getByRole('button', { name: /🎯 Activo/i });
    fireEvent.click(triggerBtn);

    // Fill notes
    const notesInput = screen.getByPlaceholderText(/Banda tensa palpable/i);
    fireEvent.change(notesInput, { target: { value: 'Dolor punzante al test de Jobe positivo' } });

    // Save Point
    const saveBtn = screen.getByRole('button', { name: /Guardar Punto/i });
    fireEvent.click(saveBtn);

    // Should call onChange with 1 point
    expect(onChange).toHaveBeenCalledTimes(1);
    const savedPoints: PainPoint[] = onChange.mock.calls[0][0];
    expect(savedPoints.length).toBe(1);
    expect(savedPoints[0].eva).toBe(8);
    expect(savedPoints[0].triggerPoint).toBe('activo');
    expect(savedPoints[0].notes).toContain('test de Jobe');
    expect(savedPoints[0].structureCode).toBe('HOMBRO.MR.SUPRAESPINOSO');
  });

  it('allows quick search via modal and selects structure directly', () => {
    const onChange = vi.fn();
    render(<PainMapPicker initialPoints={[]} onChange={onChange} />);

    // Open search modal
    const searchTrigger = screen.getByRole('button', { name: /Buscar estructura/i });
    fireEvent.click(searchTrigger);

    expect(screen.getByPlaceholderText(/Buscar músculo, tendón, vértebra o articulación/i)).toBeInTheDocument();

    // Type "L4-L5"
    const searchInput = screen.getByPlaceholderText(/Buscar músculo, tendón, vértebra o articulación/i);
    fireEvent.change(searchInput, { target: { value: 'L4-L5' } });

    // Result appears
    const l4Option = screen.getByRole('option', { name: /L4-L5/i });
    fireEvent.click(l4Option);

    // Enters directly into point form
    expect(screen.getAllByText(/Columna Lumbar Baja \(L4-L5\)/i).length).toBeGreaterThan(0);
  });
});
