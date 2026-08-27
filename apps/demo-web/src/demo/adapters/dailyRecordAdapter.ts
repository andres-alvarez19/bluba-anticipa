import type { DailyRecordCreateRequest } from '@bluba/api-client';
import type { SchoolObservationData } from '../../types';

const REGULATION_VALUES = {
  'Regulado / estable': 'excelente',
  'Estable con apoyo': 'estable_con_apoyo',
  'Con dificultades para regularse': 'desregulacion_frecuente',
  'No puedo determinarlo': 'desconocido',
} as const;

const ALERT_VALUES = {
  Bajo: 'bajo',
  Habitual: 'optimo',
  Alto: 'alto',
  'No observado': 'desconocido',
} as const;

const BEHAVIOR_VALUES: Record<string, string> = {
  'Sensibilidad a ruidos': 'ruido_intenso',
  'Sobrecarga sensorial': 'sobrecarga_sensorial',
  Irritabilidad: 'irritabilidad',
};

export function schoolObservationToDailyRecord(
  observation: SchoolObservationData,
  recordedAt: Date = new Date(),
): DailyRecordCreateRequest {
  if (observation.captureMethod !== 'FORM' || observation.isAiInterpreted) {
    throw new Error('La demo E2E persiste únicamente el formulario estructurado confirmado.');
  }

  return {
    recorded_at: recordedAt.toISOString(),
    source: 'SCHOOL',
    context: 'SCHOOL',
    provenance: 'HUMAN_STRUCTURED',
    features: {
      sleep_quality: 'desconocido',
      sleep_hours: null,
      wake_state: 'desconocido',
      regulation_level: observation.regulationState == null
        ? 'desconocido'
        : REGULATION_VALUES[observation.regulationState],
      alert_level: observation.alertLevel == null
        ? 'desconocido'
        : ALERT_VALUES[observation.alertLevel],
      routine_change: observation.hadUnusualChange === 'Sí'
        ? true
        : observation.hadUnusualChange === 'No'
          ? false
          : null,
      gastrointestinal_status: null,
      observed_behavior: observation.observedBehaviors
        .map((behavior) => BEHAVIOR_VALUES[behavior])
        .filter((behavior): behavior is string => Boolean(behavior)),
      exceptional_event: null,
      sensory_profile: [],
    },
    notes: observation.additionalComment || null,
  };
}

