import { ChildState } from '../types';

export const MATEO_ACTIVE_CASE: ChildState = {
  id: 'child-demo-1',
  name: 'Mateo R.',
  age: '7 años',
  avatarText: 'MR',
  baseline: {
    sleepHoursHabitual: 7.8,
    wakeStateHabitual: 'Tranquilo',
    regulationHabitual: 'Estable'
  },
  lastUpdated: 'Hoy, 08:30 h',
  
  // Rule 1: Risk and Confidence are independent
  riskLevel: 'INSUFFICIENT',
  riskScoreInternal: null,
  riskTextHeadline: 'CARGANDO ESTADO PREVENTIVO',
  riskSubtext: 'La predicción de Mateo se obtiene exclusivamente desde el Backend.',
  
  confidenceLevel: 'LOW',
  confidenceScoreInternal: 0,
  confidenceHeadline: 'CARGANDO CONFIANZA',
  confidenceAuxText: 'La confianza se obtiene independientemente desde el Backend.',
  
  horizonText: 'Próximas 24 horas',
  
  factors: [],
  missingData: [],
  
  preventiveAction: {
    id: 'act-transitions',
    title: 'Anticipar las transiciones de hoy',
    summary: 'Estrategia validada en el historial de Mateo para días con déficit de sueño.',
    badgeText: 'Recomendada por profesional',
    sourceType: 'professional',
    steps: [
      'Avisar con 5 minutos de antelación verbal y visual antes de cambiar de actividad.',
      'Utilizar su panel de secuencia visual para estructurar la llegada del colegio y la merienda.',
      'Ofrecer un espacio de descompresión sensorial de 15 minutos en penumbra tras la jornada escolar.',
      'Evitar sobrecargar con decisiones múltiples o tareas de alta demanda cognitiva esta tarde.'
    ],
    tipsForCaregiver: 'Estrategia previamente definida para Mateo por su equipo profesional.'
  },
  
  recentHistorySummary: {
    dayMinus3: { sleep: 5.5, regulation: 'Estable con apoyo' },
    dayMinus2: { sleep: 5.5, regulation: 'Estable con apoyo' },
    today: { sleep: 5.5, regulation: 'Estable con apoyo', schoolChange: false }
  }
};

export const SOFIA_ACTIVE_CASE: ChildState = {
  id: 'sofia-m',
  name: 'Sofía M.',
  age: '6',
  avatarText: 'SM',
  baseline: {
    sleepHoursHabitual: 8.5,
    wakeStateHabitual: 'Tranquilo',
    regulationHabitual: 'Estable'
  },
  lastUpdated: 'Hoy, 08:15 h',
  riskLevel: 'MODERATE',
  riskScoreInternal: 48,
  riskTextHeadline: 'RIESGO MODERADO',
  riskSubtext: 'Atención a cambios de actividad en la tarde tras jornada escolar.',
  confidenceLevel: 'HIGH',
  confidenceScoreInternal: 88,
  confidenceHeadline: 'CONFIANZA ALTA',
  confidenceAuxText: 'Todos los registros de casa y escuela están al día y alineados.',
  horizonText: 'Próximas 24 horas',
  factors: [
    {
      id: 'f-routine-sofia',
      title: 'Cambio de actividad vespertina',
      category: 'CONTEXTO',
      categoryLabel: 'Contexto',
      iconType: 'routine',
      baselineComparison: {
        baselineLabel: 'Rutina habitual',
        baselineValue: 'Tarde libre en casa',
        currentLabel: 'Hoy',
        currentValue: 'Taller extracurricular'
      },
      explanation: 'La actividad extra genera demanda sensorial y cognitiva agregada.',
      trendDetail: 'Notificado en horario semanal'
    }
  ],
  missingData: [],
  preventiveAction: {
    id: 'act-decompression',
    title: 'Pausa sensorial previa al taller',
    summary: 'Ofrecer 10 minutos de juego tranquilo y merienda sin pantallas antes de la actividad.',
    badgeText: 'Sugerencia preventiva',
    sourceType: 'history',
    steps: [
      'Espacio en silencio antes de salir de casa.',
      'Anticipar el orden del taller con fotos o dibujos.'
    ],
    tipsForCaregiver: 'Mantiene la autorregulación durante transiciones de alta energía.'
  },
  recentHistorySummary: {
    dayMinus3: { sleep: 8.2, regulation: 'Estable' },
    dayMinus2: { sleep: 8.5, regulation: 'Tranquila' },
    today: { sleep: 8.0, regulation: 'Estable', schoolChange: false }
  }
};

export const LUCAS_ACTIVE_CASE: ChildState = {
  id: 'lucas-a',
  name: 'Lucas A.',
  age: '8',
  avatarText: 'LA',
  baseline: {
    sleepHoursHabitual: 8.0,
    wakeStateHabitual: 'Tranquilo',
    regulationHabitual: 'Estable'
  },
  lastUpdated: 'Hoy, 08:00 h',
  riskLevel: 'LOW',
  riskScoreInternal: 18,
  riskTextHeadline: 'RIESGO BAJO',
  riskSubtext: 'Parámetros estables. Rutina habitual sin alteraciones previstas.',
  confidenceLevel: 'HIGH',
  confidenceScoreInternal: 92,
  confidenceHeadline: 'CONFIANZA ALTA',
  confidenceAuxText: 'Datos completos de los últimos 14 días.',
  horizonText: 'Próximas 24 horas',
  factors: [
    {
      id: 'f-stable-lucas',
      title: 'Parámetros en rango habitual',
      category: 'DESVIACION',
      categoryLabel: 'Línea base',
      iconType: 'sleep',
      baselineComparison: {
        baselineLabel: 'Sueño habitual',
        baselineValue: '8,0 h',
        currentLabel: 'Hoy',
        currentValue: '8,1 h'
      },
      explanation: 'Descanso reparador y respuesta matutina regulada y fluida.',
      trendDetail: 'Últimos 5 días estables'
    }
  ],
  missingData: [],
  preventiveAction: {
    id: 'act-continue',
    title: 'Mantener rutina y refuerzo positivo',
    summary: 'Continuar con las pautas habituales y felicitar la autorregulación matutina.',
    badgeText: 'Pauta habitual',
    sourceType: 'catalog',
    steps: [
      'Mantener los horarios acordados de comidas y descanso.',
      'Espacio de conversación habitual al final de la jornada.'
    ],
    tipsForCaregiver: 'Excelente estabilidad en la semana.'
  },
  recentHistorySummary: {
    dayMinus3: { sleep: 8.0, regulation: 'Estable' },
    dayMinus2: { sleep: 8.2, regulation: 'Estable' },
    today: { sleep: 8.1, regulation: 'Estable', schoolChange: false }
  }
};

export const FAMILY_CHILDREN_LIST: ChildState[] = [
  MATEO_ACTIVE_CASE,
  SOFIA_ACTIVE_CASE,
  LUCAS_ACTIVE_CASE,
];

export const MATEO_INSUFFICIENT_CASE: ChildState = {
  ...MATEO_ACTIVE_CASE,
  riskLevel: 'LOW', // will not be displayed on screen 3 per Rule 2
  riskTextHeadline: 'INFORMACIÓN INSUFICIENTE',
  riskSubtext: 'Todavía no contamos con suficientes datos para generar una estimación confiable.',
  confidenceLevel: 'LOW',
  confidenceHeadline: 'CONFIANZA BAJA',
  confidenceAuxText: 'Faltan 2 de las 3 variables críticas para contrastar con su línea base.',
  
  missingData: [
    {
      id: 'm-sleep-qual',
      name: 'Calidad del sueño',
      status: 'pending',
      source: 'Registro matutino familiar',
      impactNote: 'Necesario para calcular la acumulación de fatiga respecto a su baseline (7,8 h).'
    },
    {
      id: 'm-wake-state',
      name: 'Estado al despertar',
      status: 'pending',
      source: 'Registro matutino familiar',
      impactNote: 'Necesario para evaluar la reactividad inicial y tono de regulación del día.'
    }
  ]
};
