import type { RiskPrediction } from '@bluba/api-client';
import type {
  ChildState,
  ClassroomStudent,
  ConfidenceLevel,
  FactorCategory,
  FactorItem,
  SpecialistConfidenceLabel,
  SpecialistPatient,
  SpecialistRiskLabel,
} from '../../types';
import { DEMO_CHILD_ID, DEMO_CHILD_NAME } from '../constants';

const RISK_LABELS = {
  LOW: 'BAJO',
  MEDIUM: 'MODERADO',
  HIGH: 'ELEVADO',
} as const;

const CONFIDENCE_LABELS = {
  LOW: 'BAJA',
  MEDIUM: 'MEDIA',
  HIGH: 'ALTA',
} as const;

export interface PredictionPresentation {
  status: RiskPrediction['status'];
  risk: null | {
    level: NonNullable<NonNullable<RiskPrediction['risk']>['level']>;
    label: string;
    headline: string;
    index: number;
  };
  confidence: {
    level: RiskPrediction['confidence']['level'];
    label: string;
    index: number;
  };
  predictionId: string;
  predictionAt: string;
  predictionAtLabel: string;
  factors: RiskPrediction['top_factors'];
  dataQuality: RiskPrediction['data_quality'];
  requiredFields: string[];
}

export function buildPredictionPresentation(prediction: RiskPrediction): PredictionPresentation {
  const risk = prediction.risk?.level != null && prediction.risk.score != null
    ? {
        level: prediction.risk.level,
        label: RISK_LABELS[prediction.risk.level],
        headline: `RIESGO ${RISK_LABELS[prediction.risk.level]}`,
        index: Math.round(prediction.risk.score * 100),
      }
    : null;

  return {
    status: prediction.status,
    risk,
    confidence: {
      level: prediction.confidence.level,
      label: CONFIDENCE_LABELS[prediction.confidence.level],
      index: Math.round(prediction.confidence.score * 100),
    },
    predictionId: prediction.prediction_id,
    predictionAt: prediction.prediction_at,
    predictionAtLabel: formatPredictionTime(prediction.prediction_at),
    factors: prediction.top_factors,
    dataQuality: prediction.data_quality,
    requiredFields: prediction.required_fields ?? [],
  };
}

export function toFamilyState(prediction: RiskPrediction, fixture: ChildState): ChildState {
  const presentation = buildPredictionPresentation(prediction);
  const factors = prediction.top_factors.map(toFamilyFactor);
  const insufficient = presentation.status === 'INSUFFICIENT_DATA' || presentation.risk === null;

  return {
    ...fixture,
    id: DEMO_CHILD_ID,
    name: DEMO_CHILD_NAME,
    lastUpdated: presentation.predictionAtLabel,
    predictionStatus: presentation.status,
    predictionAt: presentation.predictionAt,
    riskLevel: insufficient ? 'INSUFFICIENT' : mapFamilyRiskLevel(presentation.risk!.level),
    riskScoreInternal: presentation.risk?.index ?? null,
    riskTextHeadline: insufficient ? 'INFORMACIÓN INSUFICIENTE' : presentation.risk!.headline,
    riskSubtext: insufficient
      ? 'Faltan datos relevantes para emitir una estimación preventiva.'
      : 'Estimación preventiva para las próximas 24 horas basada en evidencia longitudinal.',
    confidenceLevel: presentation.confidence.level as ConfidenceLevel,
    confidenceScoreInternal: presentation.confidence.index,
    confidenceHeadline: `CONFIANZA ${presentation.confidence.label}`,
    confidenceAuxText: confidenceCopy(presentation.confidence.level),
    factors,
    missingData: presentation.requiredFields.map((field) => ({
      id: `missing-${field}`,
      name: field,
      status: 'pending',
      source: 'Calidad de datos',
      impactNote: 'Dato solicitado por el motor para mejorar la evidencia disponible.',
    })),
    preventiveAction: {
      ...fixture.preventiveAction,
      summary: 'Estrategia previamente definida para Mateo por una fuente profesional.',
      tipsForCaregiver: 'Aplicar según el protocolo profesional previamente acordado para Mateo.',
    },
  };
}

export function toSpecialistPatient(prediction: RiskPrediction, fixture: SpecialistPatient): SpecialistPatient {
  const presentation = buildPredictionPresentation(prediction);
  const sources = new Set(prediction.data_quality.sources);
  const insufficient = presentation.status === 'INSUFFICIENT_DATA' || presentation.risk === null;

  return {
    ...fixture,
    id: DEMO_CHILD_ID,
    name: DEMO_CHILD_NAME,
    riskScore: presentation.risk?.index ?? null,
    riskLabel: insufficient ? 'Insuficiente' : specialistRiskLabel(presentation.risk!.level),
    confidenceScore: presentation.confidence.index,
    confidenceLabel: specialistConfidenceLabel(presentation.confidence.level),
    mainDeviation: prediction.top_factors[0]?.label ?? 'Sin factor principal disponible',
    updatedTime: presentation.predictionAtLabel,
    predictionAt: presentation.predictionAt,
    primaryFactors: prediction.top_factors.map((factor) => factor.label),
    dataQuality: [
      sourceQuality('Familia', sources.has('FAMILY')),
      sourceQuality('Escuela', sources.has('SCHOOL')),
      sourceQuality('Profesional', sources.has('PROFESSIONAL')),
    ],
    baselineStatus: {
      state: prediction.data_quality.history_days >= 7 ? 'AVAILABLE' : 'BUILDING',
      label: prediction.data_quality.history_days >= 14
        ? `Disponible · ${prediction.data_quality.history_days} días válidos`
        : `En construcción · ${prediction.data_quality.history_days} días válidos`,
      validDays: prediction.data_quality.history_days,
    },
  };
}

export function toTeacherStudent(prediction: RiskPrediction, fixture: ClassroomStudent): ClassroomStudent {
  const presentation = buildPredictionPresentation(prediction);
  const insufficient = presentation.status === 'INSUFFICIENT_DATA' || presentation.risk === null;
  return {
    ...fixture,
    id: DEMO_CHILD_ID,
    name: DEMO_CHILD_NAME,
    initials: 'MR',
    riskLevel: insufficient ? 'INSUFFICIENT' : mapTeacherRiskLevel(presentation.risk!.level),
    riskScore: presentation.risk?.index ?? 0,
    riskBadgeLabel: insufficient ? 'Información insuficiente' : `Riesgo ${presentation.risk!.label.toLowerCase()}`,
    confidenceScore: presentation.confidence.index,
    confidenceLabel: `Confianza ${presentation.confidence.label.toLowerCase()}`,
    summaryReason: prediction.top_factors[0]?.label ?? 'Sin factores principales disponibles.',
    considerations: prediction.top_factors.length > 0
      ? prediction.top_factors.map((factor) => factor.label)
      : ['No hay factores principales disponibles en la predicción actual.'],
    updatedTime: presentation.predictionAtLabel,
  };
}

function toFamilyFactor(factor: RiskPrediction['top_factors'][number]): FactorItem {
  const category = factorCategory(factor.type);
  return {
    id: factor.code,
    title: factor.label,
    category,
    categoryLabel: categoryLabel(category),
    baselineComparison: {
      baselineLabel: 'Fuente',
      baselineValue: factor.window ?? 'actual',
      currentLabel: 'Dirección',
      currentValue: factor.direction === 'INCREASES_RISK' ? 'Aumenta el índice' : 'Contextual',
    },
    explanation: 'Factor trazable entregado por baseline-demo-v1.',
    iconType: factor.code.includes('SLEEP') ? 'sleep' : factor.code.includes('REGULATION') ? 'regulation' : 'routine',
  };
}

function mapFamilyRiskLevel(level: 'LOW' | 'MEDIUM' | 'HIGH'): ChildState['riskLevel'] {
  return level === 'HIGH' ? 'ELEVATED' : level === 'MEDIUM' ? 'MODERATE' : 'LOW';
}

function mapTeacherRiskLevel(level: 'LOW' | 'MEDIUM' | 'HIGH'): ClassroomStudent['riskLevel'] {
  return level === 'HIGH' ? 'ELEVATED' : level === 'MEDIUM' ? 'MODERATE' : 'LOW';
}

function specialistRiskLabel(level: 'LOW' | 'MEDIUM' | 'HIGH'): SpecialistRiskLabel {
  return level === 'HIGH' ? 'Elevado' : level === 'MEDIUM' ? 'Moderado' : 'Bajo';
}

function specialistConfidenceLabel(level: 'LOW' | 'MEDIUM' | 'HIGH'): SpecialistConfidenceLabel {
  return level === 'HIGH' ? 'Alta' : level === 'MEDIUM' ? 'Media' : 'Baja';
}

function factorCategory(type: RiskPrediction['top_factors'][number]['type']): FactorCategory {
  if (type === 'ACCUMULATION') return 'ACUMULACION';
  if (type === 'DEVIATION') return 'DESVIACION';
  return 'CONTEXTO';
}

function categoryLabel(category: FactorCategory): string {
  if (category === 'ACUMULACION') return 'Acumulación';
  if (category === 'DESVIACION') return 'Desviación';
  return 'Contexto';
}

function confidenceCopy(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  if (level === 'HIGH') return 'La evidencia disponible sostiene una confianza alta independiente del nivel de riesgo.';
  if (level === 'MEDIUM') return 'La estimación es utilizable, aunque puede mejorar con nuevas fuentes.';
  return 'La evidencia disponible es limitada; el nivel de riesgo no se usa para inferir confianza.';
}

function sourceQuality(source: 'Familia' | 'Escuela' | 'Profesional', present: boolean) {
  return {
    source,
    status: present ? 'Incluida en esta predicción' : 'Sin evidencia en esta predicción',
    isMissing: !present,
    lastUpdateLabel: present ? 'Incluida' : 'Pendiente',
  };
}

function formatPredictionTime(value: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
