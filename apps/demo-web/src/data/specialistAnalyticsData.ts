import {
  TimeWindow,
  FactorRankingItem,
  AccumulationCardItem,
  TimelineSourceItem
} from '../types';

export interface LongitudinalMetrics {
  sleepBaseline: number; // 7.8
  sleepRecentDays: { dayLabel: string; value: number; diffHours: number }[];
  sleepRecentAvg: number; // 6.1
  
  regulationBaseline: number; // 78
  regulationRecentDays: { dayLabel: string; value: number; status: string }[];
  regulationCurrentDiffPercent: number; // -28%
  
  wakeupBaselineLabel: string; // "Tranquilo / Disposición habitual"
  wakeupRecentDays: { dayLabel: string; label: string; state: 'alert' | 'warning' | 'calm' }[];
}

export const MATEO_LONGITUDINAL_DATA: Record<TimeWindow, LongitudinalMetrics> = {
  '72h': {
    sleepBaseline: 7.8,
    sleepRecentDays: [
      { dayLabel: 'Hace 2 días', value: 6.3, diffHours: -1.5 },
      { dayLabel: 'Ayer', value: 6.0, diffHours: -1.8 },
      { dayLabel: 'Hoy', value: 5.9, diffHours: -1.9 },
    ],
    sleepRecentAvg: 6.1,
    regulationBaseline: 78,
    regulationRecentDays: [
      { dayLabel: 'Hace 2 días', value: 72, status: 'Leve descenso' },
      { dayLabel: 'Ayer', value: 62, status: 'Sensibilidad alta' },
      { dayLabel: 'Hoy', value: 56, status: 'Desviación relevante' },
    ],
    regulationCurrentDiffPercent: -28,
    wakeupBaselineLabel: 'Tranquilo · Disposición estándar',
    wakeupRecentDays: [
      { dayLabel: 'Hace 2 días', label: 'Neutro', state: 'warning' },
      { dayLabel: 'Ayer', label: 'Quejumbroso', state: 'warning' },
      { dayLabel: 'Hoy', label: 'Irritable / Agitado', state: 'alert' },
    ],
  },
  '24h': {
    sleepBaseline: 7.8,
    sleepRecentDays: [
      { dayLabel: 'Noche anterior', value: 5.9, diffHours: -1.9 },
    ],
    sleepRecentAvg: 5.9,
    regulationBaseline: 78,
    regulationRecentDays: [
      { dayLabel: 'Registro matutino', value: 56, status: 'Desviación relevante' },
    ],
    regulationCurrentDiffPercent: -28,
    wakeupBaselineLabel: 'Tranquilo · Disposición estándar',
    wakeupRecentDays: [
      { dayLabel: 'Hoy al despertar', label: 'Irritable / Agitado', state: 'alert' },
    ],
  },
  '7d': {
    sleepBaseline: 7.8,
    sleepRecentDays: [
      { dayLabel: 'D-6', value: 8.0, diffHours: +0.2 },
      { dayLabel: 'D-5', value: 7.7, diffHours: -0.1 },
      { dayLabel: 'D-4', value: 7.9, diffHours: +0.1 },
      { dayLabel: 'D-3', value: 7.6, diffHours: -0.2 },
      { dayLabel: 'D-2', value: 6.3, diffHours: -1.5 },
      { dayLabel: 'Ayer', value: 6.0, diffHours: -1.8 },
      { dayLabel: 'Hoy', value: 5.9, diffHours: -1.9 },
    ],
    sleepRecentAvg: 6.9,
    regulationBaseline: 78,
    regulationRecentDays: [
      { dayLabel: 'D-6', value: 80, status: 'Estable' },
      { dayLabel: 'D-5', value: 77, status: 'Estable' },
      { dayLabel: 'D-4', value: 79, status: 'Estable' },
      { dayLabel: 'D-3', value: 76, status: 'Estable' },
      { dayLabel: 'D-2', value: 72, status: 'Leve baja' },
      { dayLabel: 'Ayer', value: 62, status: 'Baja' },
      { dayLabel: 'Hoy', value: 56, status: 'Por debajo del baseline' },
    ],
    regulationCurrentDiffPercent: -28,
    wakeupBaselineLabel: 'Tranquilo · Disposición estándar',
    wakeupRecentDays: [
      { dayLabel: 'D-4', label: 'Tranquilo', state: 'calm' },
      { dayLabel: 'D-3', label: 'Tranquilo', state: 'calm' },
      { dayLabel: 'D-2', label: 'Neutro', state: 'warning' },
      { dayLabel: 'Ayer', label: 'Quejumbroso', state: 'warning' },
      { dayLabel: 'Hoy', label: 'Irritable', state: 'alert' },
    ],
  },
};

export const MATEO_ACCUMULATIONS: AccumulationCardItem[] = [
  {
    id: 'acc-1',
    title: 'Sueño alterado',
    durationLabel: '3 días',
    description: '3 noches consecutivas por debajo de su umbral (5,9 h a 6,3 h vs. 7,8 h baseline).',
    severity: 'high',
  },
  {
    id: 'acc-2',
    title: 'Regulación descendente',
    durationLabel: '2 días',
    description: 'Tendencia a la baja sostenida en check-ins de hogar.',
    severity: 'high',
  },
  {
    id: 'acc-3',
    title: 'Cambio de rutina',
    durationLabel: 'Hoy',
    description: 'Modificación en la sala de talleres matutina y acompañamiento.',
    severity: 'context',
  },
];

export const MATEO_FACTORS_RANKING: FactorRankingItem[] = [
  {
    id: 'fact-1',
    rank: 1,
    title: 'Sueño alterado durante 3 días',
    tag: 'ACUMULACIÓN',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
    evidenceSummary: 'Déficit acumulado sostenido que erosiona la ventana de tolerancia sensorial.',
    baselineComparison: 'Baseline habitual: 7,8 h | Promedio reciente: 6,1 h',
    details: {
      baselineValue: '7,8 h (± 0,4 h)',
      recentValue: '6,1 h promedio (5,9 h hoy)',
      note: 'Déficit acumulado estimado de 5,1 horas en 72 h. Factor con mayor peso en el modelo de riesgo actual.',
    },
  },
  {
    id: 'fact-2',
    rank: 2,
    title: 'Regulación inferior al baseline',
    tag: 'DESVIACIÓN',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    evidenceSummary: 'Capacidad de autorregulación matutina por debajo de su patrón habitual.',
    baselineComparison: 'El registro matutino se encuentra por debajo del baseline habitual.',
    details: {
      baselineValue: '78 / 100 (Estable)',
      recentValue: '56 / 100 (Baja)',
      note: 'Mayor irritabilidad al despertar y resistencia a transiciones familiares rutinarias.',
    },
  },
  {
    id: 'fact-3',
    rank: 3,
    title: 'Cambio de sala',
    tag: 'CONTEXTO',
    tagColor: 'bg-sky-100 text-sky-800 border-sky-200',
    evidenceSummary: 'Reubicación temporal a sala de música con mayor reverberación acústica.',
    baselineComparison: 'Entorno base: Aula 1° Básico B | Entorno actual: Sala de talleres',
    details: {
      baselineValue: 'Sala 1° Básico B (control acústico)',
      recentValue: 'Sala de talleres / Música',
      note: 'Contexto ambiental con mayor demanda de procesamiento auditivo y lumínico.',
    },
  },
];

export const MATEO_TIMELINE_SOURCES: TimelineSourceItem[] = [
  {
    id: 'src-1',
    timeLabel: '07:35',
    actor: 'Familia',
    actionLabel: 'Check-in matutino',
    evidenceNature: 'PERSON_RECORDED',
    evidenceLabel: 'Dato registrado por persona',
  },
  {
    id: 'src-2',
    timeLabel: '08:10',
    actor: 'Familia',
    actionLabel: 'Observación confirmada',
    evidenceNature: 'AI_STRUCTURED_CONFIRMED',
    evidenceLabel: 'Dato estructurado mediante IA y confirmado',
  },
  {
    id: 'src-3',
    timeLabel: 'Ayer 16:20',
    actor: 'Escuela',
    actionLabel: 'Registro de salida de jornada',
    evidenceNature: 'PERSON_RECORDED',
    evidenceLabel: 'Dato registrado por persona',
  },
  {
    id: 'src-4',
    timeLabel: 'Hace 2 días',
    actor: 'Profesional',
    actionLabel: 'Sesión terapéutica presencial',
    evidenceNature: 'PERSON_RECORDED',
    evidenceLabel: 'Dato registrado por persona',
  },
  {
    id: 'src-5',
    timeLabel: '08:45',
    actor: 'Sistema',
    actionLabel: 'Inferencia de riesgo temporal',
    evidenceNature: 'SYSTEM_INFERENCE',
    evidenceLabel: 'Inferencia calculada por sistema',
  },
];
