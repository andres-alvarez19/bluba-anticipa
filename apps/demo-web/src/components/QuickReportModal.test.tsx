// @vitest-environment jsdom

import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ObservationDraft } from '@bluba/api-client';
import { QuickReportModal } from './QuickReportModal';

const mockApi = vi.hoisted(() => ({
  createTextObservationDraft: vi.fn(),
  createAudioObservationDraft: vi.fn(),
  patchObservationDraft: vi.fn(),
  confirmObservationDraft: vi.fn(),
}));

vi.mock('../demo/api', () => ({ demoApi: mockApi }));

const draft: ObservationDraft = {
  draft_id: 'draft-1',
  child_id: 'child-demo-1',
  context: 'HOME',
  input_type: 'TEXT',
  source_text: 'Durmió poco y amaneció irritable.',
  proposed_variables: [
    { field: 'sleep_hours', value: 5.5 },
    { field: 'wake_state', value: 'irritable_llorando', evidence: 'amaneció irritable' },
    { field: 'routine_change', value: true },
  ],
  status: 'PENDING_CONFIRMATION',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockApi.createTextObservationDraft.mockResolvedValue(draft);
  mockApi.createAudioObservationDraft.mockResolvedValue({ ...draft, input_type: 'AUDIO', transcription: 'Audio transcrito.' });
  mockApi.patchObservationDraft.mockImplementation(async (_draftId, patch) => ({ ...draft, ...patch }));
  mockApi.confirmObservationDraft.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('QuickReportModal text flow', () => {
  it('creates a draft, patches a human correction, confirms and refreshes prediction', async () => {
    const user = userEvent.setup();
    const onConfirmed = vi.fn().mockResolvedValue(undefined);
    renderModal({ initialMode: 'text', onConfirmed });

    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('5.5 horas')).toBeInTheDocument();
    expect(mockApi.createTextObservationDraft).toHaveBeenCalledWith(
      expect.objectContaining({ child_id: 'child-demo-1', context: 'HOME' }),
      { idempotencyKey: expect.any(String) },
    );

    await user.click(document.querySelector('#btn-edit-modal-var-wake_state') as HTMLElement);
    await user.click(screen.getByRole('button', { name: /Tranquilo/ }));
    await waitFor(() => expect(mockApi.patchObservationDraft).toHaveBeenCalledWith('draft-1', {
      proposed_variables: expect.arrayContaining([
        expect.objectContaining({ field: 'wake_state', value: 'tranquilo_alegre' }),
      ]),
    }));

    await user.click(screen.getByRole('button', { name: /Confirmar y actualizar predicción/ }));
    expect(await screen.findByText('El estado preventivo compartido ya está actualizado.')).toBeInTheDocument();
    expect(mockApi.confirmObservationDraft).toHaveBeenCalledWith('draft-1', {}, {
      idempotencyKey: expect.any(String),
    });
    expect(onConfirmed).toHaveBeenCalledOnce();
  });

  it('reuses the text-create key when retrying the same input', async () => {
    const user = userEvent.setup();
    mockApi.createTextObservationDraft.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(draft);
    renderModal({ initialMode: 'text' });

    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByText(/No pudimos procesar el texto/);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByText('5.5 horas');

    const firstKey = mockApi.createTextObservationDraft.mock.calls[0][1].idempotencyKey;
    expect(mockApi.createTextObservationDraft.mock.calls[1][1].idempotencyKey).toBe(firstKey);
  });

  it('uses the same confirm key after an ambiguous failure and does not claim non-persistence', async () => {
    const user = userEvent.setup();
    mockApi.confirmObservationDraft.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({});
    renderModal({ initialMode: 'text' });
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByText('5.5 horas');

    await user.click(screen.getByRole('button', { name: /Confirmar y actualizar predicción/ }));
    expect(await screen.findByText(/No pudimos completar o verificar la actualización/)).toBeInTheDocument();
    expect(screen.queryByText(/no fue incorporado/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await user.click(screen.getByRole('button', { name: /Confirmar y actualizar predicción/ }));

    await screen.findByText('El estado preventivo compartido ya está actualizado.');
    const firstKey = mockApi.confirmObservationDraft.mock.calls[0][2].idempotencyKey;
    expect(mockApi.confirmObservationDraft.mock.calls[1][2].idempotencyKey).toBe(firstKey);
  });
});

describe('QuickReportModal microphone states', () => {
  it('shows an unsupported-browser recovery state', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, value: undefined });
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar grabación de voz' }));
    expect(await screen.findByText(/Este navegador no permite grabar audio/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Escribir en su lugar' })).toBeInTheDocument();
  });

  it('shows a specific permission-denied recovery state', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError')) },
    });
    Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, value: class {} });
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar grabación de voz' }));
    expect(await screen.findByText(/No hay permiso para usar el micrófono/)).toBeInTheDocument();
  });

  it('rejects an empty recording before calling the API', async () => {
    let clock = 0;
    const now = vi.spyOn(Date, 'now').mockImplementation(() => clock);
    const stream = { getTracks: () => [{ stop: vi.fn() }] };
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    installMediaRecorder(false);
    renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar grabación de voz' }));
    clock = 1000;
    await userEvent.click(await screen.findByRole('button', { name: 'Terminar' }));
    expect(await screen.findByText(/La grabación quedó vacía/)).toBeInTheDocument();
    expect(mockApi.createAudioObservationDraft).not.toHaveBeenCalled();
    now.mockRestore();
  });

  it('reuses the audio-create key when resending the same captured blob', async () => {
    let clock = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    });
    installMediaRecorder(true);
    mockApi.createAudioObservationDraft.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({
      ...draft,
      input_type: 'AUDIO',
      transcription: 'Audio transcrito.',
    });
    renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar grabación de voz' }));
    clock = 1000;
    await userEvent.click(await screen.findByRole('button', { name: 'Terminar' }));
    await screen.findByText(/reenviar la misma grabación/);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await screen.findByText('Audio transcrito.');

    const firstKey = mockApi.createAudioObservationDraft.mock.calls[0][1].idempotencyKey;
    expect(mockApi.createAudioObservationDraft.mock.calls[1][1].idempotencyKey).toBe(firstKey);
  });
});

function renderModal(overrides: Partial<React.ComponentProps<typeof QuickReportModal>> = {}) {
  return render(
    <QuickReportModal
      isOpen
      initialMode="voice"
      onClose={vi.fn()}
      onConfirmed={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );
}

function installMediaRecorder(withData: boolean) {
  class FakeMediaRecorder {
    state: RecordingState = 'inactive';
    mimeType = 'audio/webm';
    ondataavailable: ((event: BlobEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onstop: (() => void) | null = null;

    start() {
      this.state = 'recording';
    }

    stop() {
      this.state = 'inactive';
      if (withData) this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) } as BlobEvent);
      this.onstop?.();
    }
  }
  Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, value: FakeMediaRecorder });
}
