export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'INSUFFICIENT';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FactorCategory = 'ACUMULACION' | 'DESVIACION' | 'CONTEXTO';

export interface FactorItem {
  id: string;
  title: string;
  category: FactorCategory;
  categoryLabel: string;
  baselineComparison: {
    baselineLabel: string;
    baselineValue: string;
    currentLabel: string;
    currentValue: string;
  };
  explanation: string;
  trendDetail?: string;
  iconType: 'sleep' | 'regulation' | 'routine';
}

export interface MissingDataItem {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  source: string;
  impactNote: string;
}

export interface PreventiveAction {
  id: string;
  title: string;
  summary: string;
  badgeText: string;
  sourceType: 'professional' | 'history' | 'catalog';
  steps: string[];
  tipsForCaregiver: string;
}

export interface BaselineProfile {
  sleepHoursHabitual: number;
  wakeStateHabitual: string;
  regulationHabitual: string;
}

export interface ChildState {
  id: string;
  name: string;
  age: string;
  avatarText: string;
  baseline: BaselineProfile;
  lastUpdated: string;
  
  riskLevel: RiskLevel;
  riskScoreInternal: number | null;
  predictionStatus?: 'OK' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_DATA' | 'ERROR';
  predictionAt?: string;
  riskTextHeadline: string;
  riskSubtext: string;
  
  confidenceLevel: ConfidenceLevel;
  confidenceScoreInternal: number;
  confidenceHeadline: string;
  confidenceAuxText: string;
  
  horizonText: string;
  
  factors: FactorItem[];
  missingData: MissingDataItem[];
  preventiveAction: PreventiveAction;
  
  recentHistorySummary: {
    dayMinus3: { sleep: number; regulation: string };
    dayMinus2: { sleep: number; regulation: string };
    today: { sleep: number; regulation: string; schoolChange: boolean };
  };
}

export type ActiveScreen = 'FAM_01_TODAY' | 'COMMON_02_ALERT_DETAIL' | 'COMMON_03_INSUFFICIENT_INFO';

// Capture Flow Types
export type SleepOption = 'Bien' | 'Interrumpido' | 'Poco' | 'No lo sé';
export type WakeOption = 'Tranquilo' | 'Irritable' | 'Cansado' | 'Más sensible' | 'No lo sé';
export type RegulationOption = 'Como siempre' | 'Algo diferente' | 'Muy diferente' | 'No lo sé';

export interface CheckInAnswers {
  sleep: SleepOption | null;
  wake: WakeOption | null;
  regulation: RegulationOption | null;
}

export interface ExtractedVariables {
  sleep: SleepOption;
  wakeState: WakeOption;
  routineChange: 'Sí' | 'No' | 'No lo sé';
  context: 'Escolar' | 'Hogar' | 'Social' | 'Terapia' | 'Ninguno';
}

export type CaptureScreen = 'FAM_02_CHECKIN' | 'CAP_01_OBSERVATION' | 'CAP_02_CONFIRMATION';
export type VoiceState = 'idle' | 'listening' | 'transcribing' | 'completed';

export interface SaveStatus {
  isSaved: boolean;
  savedTimestamp: string | null;
  isUpdatingRisk: boolean;
  updateCompleted: boolean;
}

export type UserRole = 'SPECIALIST' | 'TEACHER' | 'FAMILY';

export type AppScreen =
  | 'FAM_01_TODAY'
  | 'FAM_02_CHECKIN'
  | 'FAM_03_RECOMMENDATIONS'
  | 'FAM_04_FEEDBACK'
  | 'FAM_05_ALERT_DETAIL'
  | 'FAM_06_INSUFFICIENT_INFO'
  | 'FAM_07_PROFILE'
  | 'EDU_00_HOME'
  | 'EDU_01_CLASSROOM'
  | 'EDU_02_STUDENT_DETAIL'
  | 'EDU_03_EXPRESS_REPORT'
  | 'EDU_04_PROFILE'
  | 'ESP_00_HOME'
  | 'ESP_01_PATIENTS'
  | 'ESP_02_PATIENT_SUMMARY'
  | 'ESP_03_EVOLUTION'
  | 'ESP_04_FACTORS'
  | 'ESP_05_STRATEGIES'
  | 'ESP_06_PROFILE';

export type StrategyResultObserved = 'Ayudó' | 'Ayudó parcialmente' | 'Sin efecto';

export interface StrategyApplicationLog {
  id: string;
  dateLabel: string;
  context: 'Escuela' | 'Hogar';
  result: StrategyResultObserved;
  contextDetail?: string;
}

export interface SpecialistStrategy {
  id: string;
  title: string;
  origin: 'Profesional' | 'Historial individual';
  context: 'Hogar y escuela' | 'Escuela' | 'Hogar';
  timesApplied: number;
  observedResultsSummary: {
    label: string;
    count: number;
    type: 'helped' | 'partial' | 'none';
  }[];
  shortDescription: string;
  historyContextRelation?: string;
  applications: StrategyApplicationLog[];
}

export type TimeWindow = '24h' | '72h' | '7d';

export type EvidenceNature =
  | 'PERSON_RECORDED'
  | 'AI_STRUCTURED_CONFIRMED'
  | 'SYSTEM_INFERENCE';

export interface TimelineSourceItem {
  id: string;
  timeLabel: string;
  actor: 'Familia' | 'Escuela' | 'Profesional' | 'Sistema';
  actionLabel: string;
  evidenceNature: EvidenceNature;
  evidenceLabel: string;
}

export interface FactorRankingItem {
  id: string;
  rank: number;
  title: string;
  tag: 'ACUMULACIÓN' | 'DESVIACIÓN' | 'CONTEXTO';
  tagColor: string;
  evidenceSummary: string;
  baselineComparison: string;
  details: {
    baselineValue: string;
    recentValue: string;
    note: string;
  };
}

export interface AccumulationCardItem {
  id: string;
  title: string;
  durationLabel: string;
  description: string;
  severity: 'high' | 'medium' | 'context';
}

export type SpecialistRiskLabel = 'Elevado' | 'Moderado' | 'Bajo' | 'Insuficiente';
export type SpecialistConfidenceLabel = 'Alta' | 'Media' | 'Baja';

export interface DataQualityItem {
  source: 'Familia' | 'Escuela' | 'Profesional';
  status: string;
  isMissing: boolean;
  lastUpdateLabel: string;
}

export interface SpecialistPatient {
  id: string;
  name: string;
  initials: string;
  age?: string;
  riskScore: number | null;
  riskLabel: SpecialistRiskLabel;
  confidenceScore: number;
  confidenceLabel: SpecialistConfidenceLabel;
  mainDeviation: string;
  updatedTime: string;
  predictionAt?: string;
  primaryFactors: string[];
  dataQuality: DataQualityItem[];
  baselineStatus: {
    state: 'AVAILABLE' | 'BUILDING';
    label: string;
    validDays: number;
  };
}

export type EduRiskLevel = 'ELEVATED' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';

// School Observation Specific Types (Bluba Anticipa)
export type SchoolRegulationState =
  | 'Regulado / estable'
  | 'Estable con apoyo'
  | 'Con dificultades para regularse'
  | 'No puedo determinarlo';

export type SchoolAlertLevel =
  | 'Bajo'
  | 'Habitual'
  | 'Alto'
  | 'No observado';

export type SchoolRoutineChangeAnswer = 'No' | 'Sí' | 'No estoy seguro';

export type SchoolCaptureMethod = 'FORM' | 'TEXT' | 'VOICE';

export interface SchoolObservationData {
  studentId: string;
  studentName: string;
  courseName: string;
  timestamp: string;
  captureMethod: SchoolCaptureMethod;
  isAiInterpreted: boolean;
  
  // Structured Variables
  regulationState: SchoolRegulationState | null;
  alertLevel: SchoolAlertLevel | null;
  observedBehaviors: string[];
  hadUnusualChange: SchoolRoutineChangeAnswer;
  unusualChangeCategories: string[];
  additionalComment: string;
  
  // Raw inputs for audit/history
  rawVoiceTranscript?: string;
  rawTextNote?: string;
  
  // Sync
  connectionState: NetworkConnectionState;
  isSynced: boolean;
}

export type ExpressCrisisType = 'Escalada' | 'Desregulación';
export type ExpressCrisisOutcome =
  | 'Ayudó'
  | 'Ayudó parcialmente'
  | 'No ayudó'
  | 'Aún no se puede determinar';

export interface ExpressCrisisEventRecord {
  id: string;
  studentId: string;
  studentName: string;
  eventType: ExpressCrisisType;
  timestamp: string;
  associatedFactors?: string[];
  strategyApplied?: string;
  outcomeResult?: ExpressCrisisOutcome;
  connectionState: NetworkConnectionState;
  isSynced: boolean;
}

export type ExpressEventType =
  | 'Desregulación'
  | 'Escalada'
  | 'Cambio de rutina'
  | 'Desencadenante'
  | 'Estrategia aplicada';

export type ExpressOutcomeResult = 'Mejoró' | 'Parcial' | 'Sin efecto';
export type NetworkConnectionState = 'online' | 'offline';

export interface ExpressEventRecord {
  studentId: string;
  studentName: string;
  eventType: ExpressEventType | null;
  outcomeResult?: ExpressOutcomeResult | null;
  quickNote?: string;
  timestamp: string;
  connectionState: NetworkConnectionState;
  isSynced: boolean;
}

export interface ClassroomStudent {
  id: string;
  name: string;
  initials: string;
  courseId: string;
  courseName: string;
  riskLevel: EduRiskLevel;
  riskScore: number;
  riskBadgeLabel: string;
  confidenceScore: number;
  confidenceLabel: string;
  summaryReason: string;
  updatedTime: string;
  attentionHeadline: string;
  considerations: string[];
  classroomActions: {
    id: string;
    number: number;
    title: string;
    description?: string;
  }[];
  missingDataNote?: string;
}

export interface HomeRecommendation {
  id: string;
  title: string;
  description: string;
  origin: string;
  context: 'Hogar';
  historyEvidence?: string;
  iconType: 'transitions' | 'sensory' | 'demands';
}

export type DysregulationAnswer = 'Sí' | 'No';
export type StrategyApplicationAnswer = 'Sí' | 'No' | 'Otra estrategia registrada';
export type OutcomeResultAnswer = 'Ayudó' | 'Ayudó parcialmente' | 'No tuvo efecto';

export interface FeedbackRecord {
  hadDysregulation: DysregulationAnswer | null;
  appliedStrategy: StrategyApplicationAnswer | null;
  selectedStrategyTitle: string;
  alternativeStrategyName?: string;
  outcomeResult: OutcomeResultAnswer | null;
  isSubmitted: boolean;
  submittedTimestamp: string | null;
}
