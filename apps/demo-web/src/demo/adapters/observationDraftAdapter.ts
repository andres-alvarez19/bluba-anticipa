import type { ObservationDraft, ProposedVariable } from '@bluba/api-client';
import type { EditableFieldKey } from '../../components/EditVariableSheet';

const FIELD_LABELS: Record<string, string> = {
  sleep_quality: 'Sueño nocturno',
  sleep_hours: 'Horas de sueño',
  wake_state: 'Estado al despertar',
  routine_change: 'Cambio de rutina',
  observed_behavior: 'Conducta observada',
  regulation_level: 'Regulación',
};

const VALUE_LABELS: Record<string, string> = {
  reparador: 'Reparador',
  interrumpido: 'Interrumpido',
  dificultad_conciliacion: 'Dificultad para conciliar',
  desconocido: 'No lo sé',
  tranquilo_alegre: 'Tranquilo',
  irritable_llorando: 'Irritable',
  cansado_sueno: 'Cansado',
};

export interface PresentedVariable {
  field: string;
  label: string;
  valueLabel: string;
  editableField: EditableFieldKey | null;
}

export function presentDraftVariables(draft: ObservationDraft): PresentedVariable[] {
  return draft.proposed_variables.map((variable) => ({
    field: variable.field,
    label: FIELD_LABELS[variable.field] ?? humanize(variable.field),
    valueLabel: presentValue(variable.field, variable.value),
    editableField: editableFieldFor(variable.field),
  }));
}

export function patchVariableFromEdit(
  variables: ProposedVariable[],
  editableField: EditableFieldKey,
  displayedValue: string,
): ProposedVariable[] {
  const field = contractFieldFor(editableField);
  const nextValue = contractValueFor(editableField, displayedValue);
  const index = variables.findIndex((variable) => variable.field === field);
  const replacement: ProposedVariable = index >= 0
    ? { ...variables[index], value: nextValue }
    : { field, value: nextValue };

  if (index < 0) return [...variables, replacement];
  return variables.map((variable, currentIndex) => currentIndex === index ? replacement : variable);
}

export function currentEditableValue(
  variables: ProposedVariable[],
  editableField: EditableFieldKey,
): string {
  const field = contractFieldFor(editableField);
  const variable = variables.find((candidate) => candidate.field === field);
  return variable ? presentValue(field, variable.value) : 'No lo sé';
}

function editableFieldFor(field: string): EditableFieldKey | null {
  if (field === 'sleep_quality') return 'sleep';
  if (field === 'wake_state') return 'wakeState';
  if (field === 'routine_change') return 'routineChange';
  return null;
}

function contractFieldFor(field: EditableFieldKey): string {
  if (field === 'sleep') return 'sleep_quality';
  if (field === 'wakeState') return 'wake_state';
  if (field === 'routineChange') return 'routine_change';
  return 'context';
}

function contractValueFor(field: EditableFieldKey, value: string): unknown {
  if (field === 'sleep') {
    return ({
      Reparador: 'reparador',
      Interrumpido: 'interrumpido',
      'Dificultad para conciliar': 'dificultad_conciliacion',
      'No lo sé': 'desconocido',
    } as Record<string, string>)[value] ?? value;
  }
  if (field === 'wakeState') {
    return ({
      Tranquilo: 'tranquilo_alegre',
      Irritable: 'irritable_llorando',
      Cansado: 'cansado_sueno',
      'No lo sé': 'desconocido',
    } as Record<string, string>)[value] ?? value;
  }
  if (field === 'routineChange') {
    if (value === 'Sí') return true;
    if (value === 'No') return false;
    return null;
  }
  return value;
}

function presentValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return 'No informado';
  if (field === 'sleep_hours' && typeof value === 'number') return `${value} horas`;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) return value.map((item) => presentValue('', item)).join(', ');
  if (typeof value === 'string') return VALUE_LABELS[value.toLowerCase()] ?? humanize(value);
  return String(value);
}

function humanize(value: string): string {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
