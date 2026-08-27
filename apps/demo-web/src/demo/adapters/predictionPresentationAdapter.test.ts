import { describe, expect, it } from 'vitest';
import type { RiskPrediction } from '@bluba/api-client';
import { buildPredictionPresentation } from './predictionPresentationAdapter';

describe('buildPredictionPresentation', () => {
  it('presents the risk level received from the API and only scales its score', () => {
    const presentation = buildPredictionPresentation(prediction({
      risk: { level: 'HIGH', score: 0.74 },
      confidence: { level: 'LOW', score: 0.91 },
    }));

    expect(presentation.risk).toEqual({
      level: 'HIGH',
      label: 'ELEVADO',
      headline: 'RIESGO ELEVADO',
      index: 74,
    });
  });

  it('maps confidence independently from risk', () => {
    const presentation = buildPredictionPresentation(prediction({
      risk: { level: 'LOW', score: 0.1 },
      confidence: { level: 'HIGH', score: 0.82 },
    }));

    expect(presentation.risk?.label).toBe('BAJO');
    expect(presentation.confidence).toEqual({ level: 'HIGH', label: 'ALTA', index: 82 });
  });

  it('keeps INSUFFICIENT_DATA distinct from LOW risk', () => {
    const presentation = buildPredictionPresentation(prediction({
      status: 'INSUFFICIENT_DATA',
      risk: null,
      confidence: { level: 'LOW', score: 0.31 },
    }));

    expect(presentation.status).toBe('INSUFFICIENT_DATA');
    expect(presentation.risk).toBeNull();
  });
});

function prediction(overrides: Partial<RiskPrediction>): RiskPrediction {
  return {
    prediction_id: 'prediction-test',
    child_id: 'child-demo-1',
    prediction_at: '2026-08-26T12:00:00Z',
    window_end_at: '2026-08-27T12:00:00Z',
    horizon_hours: 24,
    model_version: 'baseline-demo-v1',
    feature_schema_version: 'features-mvp-v1',
    status: 'OK',
    risk: { level: 'MEDIUM', score: 0.5 },
    confidence: { level: 'MEDIUM', score: 0.6 },
    top_factors: [],
    data_quality: {
      completeness: 1,
      history_days: 14,
      sources: ['FAMILY'],
      missing_fields: [],
      missing_critical_data: [],
      contains_synthetic_data: true,
    },
    warnings: [],
    required_fields: [],
    ...overrides,
  };
}
