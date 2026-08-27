import { describe, expect, it } from 'vitest';
import type { SchoolObservationData } from '../../types';
import { schoolObservationToDailyRecord } from './dailyRecordAdapter';

describe('schoolObservationToDailyRecord', () => {
  it('maps a confirmed adverse school report to canonical contract values', () => {
    const record = schoolObservationToDailyRecord(observation(), new Date('2026-08-26T12:05:00Z'));

    expect(record).toEqual({
      recorded_at: '2026-08-26T12:05:00.000Z',
      source: 'SCHOOL',
      context: 'SCHOOL',
      provenance: 'HUMAN_STRUCTURED',
      features: {
        sleep_quality: 'desconocido',
        sleep_hours: null,
        wake_state: 'desconocido',
        regulation_level: 'desregulacion_frecuente',
        alert_level: 'alto',
        routine_change: true,
        gastrointestinal_status: null,
        observed_behavior: ['ruido_intenso', 'sobrecarga_sensorial'],
        exceptional_event: null,
        sensory_profile: [],
      },
      notes: 'Sobrecarga por ruido durante una transición.',
    });
  });

  it('preserves unknown values and omits unrecognized open-vocabulary aliases', () => {
    const record = schoolObservationToDailyRecord(observation({
      regulationState: 'No puedo determinarlo',
      alertLevel: 'No observado',
      hadUnusualChange: 'No estoy seguro',
      observedBehaviors: ['Etiqueta visual no canónica'],
    }));

    expect(record.features.regulation_level).toBe('desconocido');
    expect(record.features.alert_level).toBe('desconocido');
    expect(record.features.routine_change).toBeNull();
    expect(record.features.observed_behavior).toEqual([]);
  });

  it('rejects an AI-interpreted draft because this slice only persists structured human input', () => {
    expect(() => schoolObservationToDailyRecord(observation({
      captureMethod: 'TEXT',
      isAiInterpreted: true,
    }))).toThrow(/formulario estructurado confirmado/);
  });
});

function observation(overrides: Partial<SchoolObservationData> = {}): SchoolObservationData {
  return {
    studentId: 'child-demo-1',
    studentName: 'Mateo R.',
    courseName: '1º Básico B',
    timestamp: 'Hoy · 09:05',
    captureMethod: 'FORM',
    isAiInterpreted: false,
    regulationState: 'Con dificultades para regularse',
    alertLevel: 'Alto',
    observedBehaviors: ['Sensibilidad a ruidos', 'Sobrecarga sensorial'],
    hadUnusualChange: 'Sí',
    unusualChangeCategories: ['Ruido o aglomeración'],
    additionalComment: 'Sobrecarga por ruido durante una transición.',
    connectionState: 'online',
    isSynced: true,
    ...overrides,
  };
}
