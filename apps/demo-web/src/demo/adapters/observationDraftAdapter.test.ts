import { describe, expect, it } from 'vitest';
import type { ObservationDraft } from '@bluba/api-client';
import {
  currentEditableValue,
  patchVariableFromEdit,
  presentDraftVariables,
} from './observationDraftAdapter';

const draft: ObservationDraft = {
  draft_id: 'draft-test',
  child_id: 'child-demo-1',
  context: 'HOME',
  input_type: 'TEXT',
  status: 'PENDING_CONFIRMATION',
  proposed_variables: [
    { field: 'sleep_hours', value: 5.5 },
    { field: 'wake_state', value: 'irritable_llorando', evidence: 'amaneció irritable' },
    { field: 'routine_change', value: true },
  ],
};

describe('observationDraftAdapter', () => {
  it('presents only variables returned by the draft', () => {
    expect(presentDraftVariables(draft)).toEqual([
      { field: 'sleep_hours', label: 'Horas de sueño', valueLabel: '5.5 horas', editableField: null },
      { field: 'wake_state', label: 'Estado al despertar', valueLabel: 'Irritable', editableField: 'wakeState' },
      { field: 'routine_change', label: 'Cambio de rutina', valueLabel: 'Sí', editableField: 'routineChange' },
    ]);
  });

  it('preserves evidence and unrelated variables when applying a human correction', () => {
    const patched = patchVariableFromEdit(draft.proposed_variables, 'wakeState', 'Tranquilo');
    expect(patched).toEqual([
      draft.proposed_variables[0],
      { field: 'wake_state', value: 'tranquilo_alegre', evidence: 'amaneció irritable' },
      draft.proposed_variables[2],
    ]);
    expect(currentEditableValue(patched, 'wakeState')).toBe('Tranquilo');
  });

  it('keeps unknown routine information explicitly unknown', () => {
    const patched = patchVariableFromEdit(draft.proposed_variables, 'routineChange', 'No lo sé');
    expect(patched.find(({ field }) => field === 'routine_change')?.value).toBeNull();
  });
});
