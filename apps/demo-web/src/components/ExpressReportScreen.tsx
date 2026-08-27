import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  CloudOff,
  Clock,
  Flame,
  Activity,
  Check,
  Sparkles,
  School,
  RefreshCw,
  Zap,
  Mic,
  RotateCcw,
  FileText,
  SlidersHorizontal,
  Square,
  Wand2,
  AlertCircle,
  Edit3,
  Plus,
  X,
  Play,
  Volume2,
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import {
  ClassroomStudent,
  SchoolRegulationState,
  SchoolAlertLevel,
  SchoolRoutineChangeAnswer,
  SchoolCaptureMethod,
  SchoolObservationData,
  ExpressCrisisType,
  ExpressCrisisOutcome,
  ExpressCrisisEventRecord,
  NetworkConnectionState,
} from '../types';

interface ExpressReportScreenProps {
  student: ClassroomStudent;
  onBackToDetail: () => void;
  onBackToClassroom: () => void;
  onSaveObservation: (
    observation: SchoolObservationData,
    onPersisted: () => void,
  ) => Promise<void>;
}

// 4 Regulation States with clean descriptions & visual tags
const REGULATION_OPTIONS: {
  value: SchoolRegulationState;
  label: string;
  description: string;
  badgeClass: string;
  borderClass: string;
}[] = [
  {
    value: 'Regulado / estable',
    label: 'Regulado / estable',
    description: 'Participa y responde con normalidad al entorno',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-200',
  },
  {
    value: 'Estable con apoyo',
    label: 'Estable con apoyo',
    description: 'Requiere guía visual, pausas o acompañamiento puntual',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    borderClass: 'border-sky-500 bg-sky-50/60 text-sky-950 ring-2 ring-sky-200',
  },
  {
    value: 'Con dificultades para regularse',
    label: 'Con dificultades para regularse',
    description: 'Signos de sobrecarga, agitación o frustración',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    borderClass: 'border-amber-500 bg-amber-50/60 text-amber-950 ring-2 ring-amber-200',
  },
  {
    value: 'No puedo determinarlo',
    label: 'No puedo determinarlo',
    description: 'Tiempo de observación insuficiente o conducta ambigua',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    borderClass: 'border-slate-400 bg-slate-100/80 text-slate-900 ring-2 ring-slate-200',
  },
];

// 4 Alert Levels (distinct pedagogical arousal states)
const ALERT_LEVEL_OPTIONS: {
  value: SchoolAlertLevel;
  label: string;
  sublabel: string;
  badgeClass: string;
}[] = [
  {
    value: 'Bajo',
    label: 'Bajo',
    sublabel: 'Hipoalerta / somnoliento',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    value: 'Habitual',
    label: 'Habitual',
    sublabel: 'Nivel esperado en aula',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'Alto',
    label: 'Alto',
    sublabel: 'Hiperalerta / inquieto',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    value: 'No observado',
    label: 'No observado',
    sublabel: 'Sin evaluar',
    badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
  },
];

// Behavior Chips
const BEHAVIOR_CATALOG = [
  'Irritabilidad',
  'Agitación motora',
  'Aislamiento',
  'Llanto',
  'Dificultad para participar',
  'Rechazo de actividad',
  'Mayor necesidad de apoyo',
  'Sensibilidad a ruidos',
];

// Routine Change Categories
const ROUTINE_CHANGE_CATEGORIES = [
  'Ruido o aglomeración',
  'Cambio de sala',
  'Cambio de horario',
  'Profesor reemplazante',
  'Actividad inesperada',
  'Transición compleja',
  'Regreso de recreo',
];

// Voice Simulation Presets
const VOICE_PRESETS = [
  {
    title: 'Ruido imprevisto y cambio de sala',
    transcript: 'Durante el recreo estuvo bastante más irritable de lo habitual. Había mucho ruido por la campana y después le costó volver a la sala, requiriendo apoyo visual y pausas.',
    detectedRegulation: 'Con dificultades para regularse' as SchoolRegulationState,
    detectedAlert: 'Alto' as SchoolAlertLevel,
    detectedBehaviors: ['Irritabilidad', 'Sensibilidad a ruidos', 'Mayor necesidad de apoyo'],
    detectedChange: 'Sí' as SchoolRoutineChangeAnswer,
    detectedCategories: ['Ruido o aglomeración', 'Transición compleja'],
    suggestedAction: 'Anticipación con panel visual y ubicación lejos de parlantes',
  },
  {
    title: 'Profesor reemplazante en taller',
    transcript: 'Hubo cambio de docente en la clase de música. Se mostró retraído y rechazó participar de la actividad grupal inicial.',
    detectedRegulation: 'Estable con apoyo' as SchoolRegulationState,
    detectedAlert: 'Bajo' as SchoolAlertLevel,
    detectedBehaviors: ['Aislamiento', 'Rechazo de actividad'],
    detectedChange: 'Sí' as SchoolRoutineChangeAnswer,
    detectedCategories: ['Profesor reemplazante', 'Actividad inesperada'],
    suggestedAction: 'Acompañamiento 1 a 1 y rol estructurado con material concreto',
  },
  {
    title: 'Transición fluida con anticipación',
    transcript: 'Participó muy bien en la clase de lenguaje. Anticipamos la pausa con tarjeta visual y se mantuvo tranquilo toda la mañana.',
    detectedRegulation: 'Regulado / estable' as SchoolRegulationState,
    detectedAlert: 'Habitual' as SchoolAlertLevel,
    detectedBehaviors: [],
    detectedChange: 'No' as SchoolRoutineChangeAnswer,
    detectedCategories: [],
    suggestedAction: 'Mantener refuerzo positivo y rutinas visuales establecidas',
  },
];

// Text Simulation Presets
const TEXT_PRESETS = [
  {
    title: 'Sobrecarga de ruido en pasillo',
    text: 'Durante la lectura hubo mucho ruido y gritos en el pasillo. Se puso muy agitado e irritable, le ofrecimos audífonos de cancelación.',
    detectedRegulation: 'Con dificultades para regularse' as SchoolRegulationState,
    detectedAlert: 'Alto' as SchoolAlertLevel,
    detectedBehaviors: ['Irritabilidad', 'Agitación motora', 'Sensibilidad a ruidos'],
    detectedChange: 'Sí' as SchoolRoutineChangeAnswer,
    detectedCategories: ['Ruido o aglomeración'],
    suggestedAction: 'Uso preventivo de audífonos protectores en pasillos',
  },
  {
    title: 'Cambio de horario por lluvia',
    text: 'Llovió y suspendieron educación física. Le costó el cambio imprevisto pero con apoyo de la asistente se mantuvo en la tarea.',
    detectedRegulation: 'Estable con apoyo' as SchoolRegulationState,
    detectedAlert: 'Habitual' as SchoolAlertLevel,
    detectedBehaviors: ['Mayor necesidad de apoyo'],
    detectedChange: 'Sí' as SchoolRoutineChangeAnswer,
    detectedCategories: ['Cambio de horario', 'Actividad inesperada'],
    suggestedAction: 'Anticipación escrita de modificaciones de horario',
  },
];

// Crisis factors and strategies for rapid crisis flow
const CRISIS_ASSOCIATED_FACTORS = [
  'Ruido elevado',
  'Cambio de rutina',
  'Transición compleja',
  'Interacción social',
  'Demanda pedagógica elevada',
  'Tiempo de espera prolongado',
];

const CRISIS_STRATEGIES_CATALOG = [
  'Anticipación visual',
  'Pausa activa / Rincón de calma',
  'Reducción de estímulos sonoros',
  'Acompañamiento 1 a 1',
  'Fraccionamiento de la tarea',
];

const CRISIS_OUTCOME_OPTIONS: ExpressCrisisOutcome[] = [
  'Ayudó',
  'Ayudó parcialmente',
  'No ayudó',
  'Aún no se puede determinar',
];

export const ExpressReportScreen: React.FC<ExpressReportScreenProps> = ({
  student,
  onBackToDetail,
  onBackToClassroom,
  onSaveObservation,
}) => {
  // Navigation & Step Modes: CAPTURE -> REVIEW -> CONFIRMATION
  const [captureMethod, setCaptureMethod] = useState<SchoolCaptureMethod>('FORM');
  const [currentStep, setCurrentStep] = useState<'CAPTURE' | 'REVIEW' | 'CONFIRMATION'>('CAPTURE');

  // Network State
  const [connectionState, setConnectionState] = useState<NetworkConnectionState>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online'
  );

  // Form & Extracted State
  const [regulationState, setRegulationState] = useState<SchoolRegulationState | null>('Con dificultades para regularse');
  const [alertLevel, setAlertLevel] = useState<SchoolAlertLevel | null>('Alto');
  const [observedBehaviors, setObservedBehaviors] = useState<string[]>(['Sensibilidad a ruidos', 'Sobrecarga sensorial']);
  const [hadUnusualChange, setHadUnusualChange] = useState<SchoolRoutineChangeAnswer>('Sí');
  const [unusualChangeCategories, setUnusualChangeCategories] = useState<string[]>(['Ruido o aglomeración', 'Transición compleja']);
  const [additionalComment, setAdditionalComment] = useState<string>('Sobrecarga por ruido durante una transición escolar.');
  const [suggestedClassroomAction, setSuggestedClassroomAction] = useState<string>(
    'Apoyo con apoyos visuales y pausas intermedias'
  );
  const [isAiInterpreted, setIsAiInterpreted] = useState<boolean>(false);

  // Custom Chip State
  const [customBehaviorText, setCustomBehaviorText] = useState<string>('');
  const [showCustomBehaviorInput, setShowCustomBehaviorInput] = useState<boolean>(false);

  // Text Mode State
  const [rawText, setRawText] = useState<string>(
    'Durante el recreo estuvo más irritable por el ruido de la campana y le costó volver a la sala.'
  );
  const [isInterpretingText, setIsInterpretingText] = useState<boolean>(false);
  const [hasExtractedVariables, setHasExtractedVariables] = useState<boolean>(true);

  // Voice Mode State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isTranscribingVoice, setIsTranscribingVoice] = useState<boolean>(false);
  const [selectedVoicePresetIdx, setSelectedVoicePresetIdx] = useState<number>(0);

  // Inline Editing in Review Screen
  const [inlineEditField, setInlineEditField] = useState<string | null>(null);

  // Saved Observation Record
  const [savedObservation, setSavedObservation] = useState<SchoolObservationData | null>(null);
  const [savePhase, setSavePhase] = useState<'idle' | 'saving' | 'refreshing'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Crisis Modal State
  const [showCrisisModal, setShowCrisisModal] = useState<boolean>(false);
  const [crisisStep, setCrisisStep] = useState<'SELECT_TYPE' | 'SUCCESS_QUICK' | 'ADD_DETAILS' | 'DETAILS_SAVED'>('SELECT_TYPE');
  const [crisisType, setCrisisType] = useState<ExpressCrisisType | null>(null);
  const [crisisTime, setCrisisTime] = useState<string>('Ahora · 11:42');
  const [crisisFactors, setCrisisFactors] = useState<string[]>([]);
  const [crisisStrategy, setCrisisStrategy] = useState<string>('');
  const [crisisOutcome, setCrisisOutcome] = useState<ExpressCrisisOutcome | null>(null);

  // Dynamic Current Time
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('11:45');

  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setCurrentTimeStr(timeStr);
    setCrisisTime(`Ahora · ${timeStr}`);
  }, []);

  // Voice recording timer
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Initial interpretation of default text
  useEffect(() => {
    if (captureMethod === 'TEXT' && rawText && !isAiInterpreted) {
      extractVariablesFromText(rawText);
    }
  }, [captureMethod]);

  const handleToggleBehavior = (behavior: string) => {
    setObservedBehaviors((prev) =>
      prev.includes(behavior) ? prev.filter((b) => b !== behavior) : [...prev, behavior]
    );
  };

  const handleAddCustomBehavior = () => {
    if (customBehaviorText.trim()) {
      if (!observedBehaviors.includes(customBehaviorText.trim())) {
        setObservedBehaviors((prev) => [...prev, customBehaviorText.trim()]);
      }
      setCustomBehaviorText('');
      setShowCustomBehaviorInput(false);
    }
  };

  const handleToggleChangeCategory = (cat: string) => {
    setUnusualChangeCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Helper: Core extraction logic from free text
  const extractVariablesFromText = (text: string) => {
    const lower = text.toLowerCase();
    let detReg: SchoolRegulationState = 'Estable con apoyo';
    let detAlert: SchoolAlertLevel = 'Habitual';
    const detBehaviors: string[] = [];
    let detChange: SchoolRoutineChangeAnswer = 'No';
    const detCategories: string[] = [];
    let detAction = 'Anticipación y apoyo visual en sala';

    if (
      lower.includes('desregul') ||
      lower.includes('crisis') ||
      lower.includes('llanto') ||
      lower.includes('gritos') ||
      lower.includes('sobrecarga')
    ) {
      detReg = 'Con dificultades para regularse';
      detAlert = 'Alto';
      detAction = 'Pausa sensorial en rincón de calma y reducción de estímulos';
    } else if (
      lower.includes('tranquilo') ||
      lower.includes('bien') ||
      lower.includes('regulado') ||
      lower.includes('participó')
    ) {
      detReg = 'Regulado / estable';
      detAlert = 'Habitual';
      detAction = 'Mantener dinámica actual y refuerzo de logros';
    } else if (lower.includes('apoyo') || lower.includes('asistente') || lower.includes('guía')) {
      detReg = 'Estable con apoyo';
      detAlert = 'Habitual';
      detAction = 'Apoyo visual 1 a 1 y pausas intermedias breves';
    }

    if (lower.includes('irritable') || lower.includes('irritab')) detBehaviors.push('Irritabilidad');
    if (lower.includes('agitad') || lower.includes('inquiet') || lower.includes('motor')) detBehaviors.push('Agitación motora');
    if (lower.includes('aislad') || lower.includes('retraíd') || lower.includes('solo')) detBehaviors.push('Aislamiento');
    if (lower.includes('llor') || lower.includes('llanto')) detBehaviors.push('Llanto');
    if (lower.includes('rechaz') || lower.includes('no quiso')) detBehaviors.push('Rechazo de actividad');
    if (lower.includes('apoyo')) detBehaviors.push('Mayor necesidad de apoyo');
    if (lower.includes('ruido') || lower.includes('campana') || lower.includes('sonor')) detBehaviors.push('Sensibilidad a ruidos');
    if (lower.includes('costó') || lower.includes('dificultad')) detBehaviors.push('Dificultad para participar');

    if (
      lower.includes('cambio') ||
      lower.includes('recreo') ||
      lower.includes('ruido') ||
      lower.includes('lluvia') ||
      lower.includes('reemplazo') ||
      lower.includes('sala') ||
      lower.includes('horario')
    ) {
      detChange = 'Sí';
      if (lower.includes('ruido') || lower.includes('gritos') || lower.includes('campana')) {
        detCategories.push('Ruido o aglomeración');
      }
      if (lower.includes('sala')) detCategories.push('Cambio de sala');
      if (lower.includes('horario') || lower.includes('lluvia')) detCategories.push('Cambio de horario');
      if (lower.includes('profesor') || lower.includes('reemplaz')) detCategories.push('Profesor reemplazante');
      if (lower.includes('recreo')) detCategories.push('Regreso de recreo');
      if (lower.includes('transición') || lower.includes('volver')) detCategories.push('Transición compleja');
    }

    setRegulationState(detReg);
    setAlertLevel(detAlert);
    setObservedBehaviors(detBehaviors.length > 0 ? detBehaviors : ['Mayor necesidad de apoyo']);
    setHadUnusualChange(detChange);
    setUnusualChangeCategories(detCategories.length > 0 ? detCategories : (detChange === 'Sí' ? ['Transición compleja'] : []));
    setSuggestedClassroomAction(detAction);
    setAdditionalComment(text.trim());
    setHasExtractedVariables(true);
    setIsAiInterpreted(true);
  };

  const handleInterpretText = (customTextToAnalyze?: string) => {
    const text = customTextToAnalyze || rawText;
    if (!text.trim()) return;

    setIsInterpretingText(true);

    setTimeout(() => {
      setIsInterpretingText(false);
      extractVariablesFromText(text);
    }, 550);
  };

  const handleStartAudio = (presetIdx = selectedVoicePresetIdx) => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setVoiceTranscript('');

    setTimeout(() => {
      setIsRecording(false);
      setIsTranscribingVoice(true);

      setTimeout(() => {
        setIsTranscribingVoice(false);
        const preset = VOICE_PRESETS[presetIdx];
        setVoiceTranscript(preset.transcript);
        setRegulationState(preset.detectedRegulation);
        setAlertLevel(preset.detectedAlert);
        setObservedBehaviors(preset.detectedBehaviors);
        setHadUnusualChange(preset.detectedChange);
        setUnusualChangeCategories(preset.detectedCategories);
        setSuggestedClassroomAction(preset.suggestedAction);
        setAdditionalComment(preset.transcript);
        setHasExtractedVariables(true);
        setIsAiInterpreted(true);
      }, 700);
    }, 2400);
  };

  const handleConfirmAndSave = async () => {
    const payload: SchoolObservationData = {
      studentId: student.id,
      studentName: student.name,
      courseName: student.courseName,
      timestamp: `Hoy · ${currentTimeStr}`,
      captureMethod: captureMethod,
      isAiInterpreted: isAiInterpreted,
      regulationState: regulationState,
      alertLevel: alertLevel,
      observedBehaviors: observedBehaviors,
      hadUnusualChange: hadUnusualChange,
      unusualChangeCategories: hadUnusualChange === 'Sí' ? unusualChangeCategories : [],
      additionalComment: additionalComment.trim(),
      rawVoiceTranscript: captureMethod === 'VOICE' ? voiceTranscript : undefined,
      rawTextNote: captureMethod === 'TEXT' ? rawText : undefined,
      connectionState: connectionState,
      isSynced: connectionState === 'online',
    };

    setSaveError(null);
    setSavePhase('saving');
    try {
      await onSaveObservation(payload, () => setSavePhase('refreshing'));
      setSavedObservation(payload);
      setCurrentStep('CONFIRMATION');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No fue posible guardar la observación.');
    } finally {
      setSavePhase('idle');
    }
  };

  const handleResetForAnother = () => {
    setCurrentStep('CAPTURE');
    setCaptureMethod('FORM');
    setRawText('');
    setVoiceTranscript('');
    setRegulationState('Regulado / estable');
    setAlertLevel('Habitual');
    setObservedBehaviors([]);
    setHadUnusualChange('No');
    setUnusualChangeCategories([]);
    setAdditionalComment('');
    setHasExtractedVariables(false);
    setIsAiInterpreted(false);
    setSavedObservation(null);
  };

  if (savePhase !== 'idle') {
    return (
      <div className="h-full flex items-center justify-center px-6 text-center">
        <div className="bg-white border border-[#99CAE8] rounded-3xl p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-full border-4 border-[#99CAE8] border-t-[#004D6B] animate-spin mx-auto" />
          <h1 className="text-lg font-extrabold text-[#004D6B]">
            {savePhase === 'refreshing' ? 'Registro confirmado' : 'Guardando observación…'}
          </h1>
          <p className="text-sm text-slate-600">
            {savePhase === 'refreshing'
              ? 'Actualizando estado preventivo…'
              : 'Enviando DailyRecord confirmado al sistema.'}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: CONFIRMATION SCREEN (STEP 3)
  // ==========================================
  if (currentStep === 'CONFIRMATION' && savedObservation) {
    const isOnline = savedObservation.connectionState === 'online';

    return (
      <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-4 animate-in fade-in duration-200">
        <div className="space-y-4 my-auto text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs ring-4 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-[#004D6B] tracking-tight">
              Observación registrada
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Las variables observadas para <strong>{student.name}</strong> fueron incorporadas al seguimiento preventivo.
            </p>
          </div>

          {/* Structured Summary Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs text-left space-y-3 max-w-sm mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Variables confirmadas
              </span>
              <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded-full border border-[#99CAE8]">
                {savedObservation.timestamp}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Estado de regulación:</span>
                <span className="font-bold text-[#004D6B]">{savedObservation.regulationState}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Nivel de alerta:</span>
                <span className="font-bold text-slate-800">{savedObservation.alertLevel}</span>
              </div>

              {savedObservation.observedBehaviors.length > 0 && (
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Conductas detectadas:</span>
                  <div className="flex flex-wrap gap-1">
                    {savedObservation.observedBehaviors.map((b) => (
                      <span key={b} className="text-[10px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {savedObservation.unusualChangeCategories.length > 0 && (
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium block mb-1">Factor contextual / cambio:</span>
                  <div className="flex flex-wrap gap-1">
                    {savedObservation.unusualChangeCategories.map((c) => (
                      <span key={c} className="text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sync Status */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Estado de red:</span>
              {isOnline ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  Sincronizado con el sistema escolar
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                  Guardado local · Pendiente de sincronización
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          {saveError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800">
              {saveError} Puedes corregir el formulario y reintentar.
            </div>
          )}
          <button
            id="btn-return-to-student-confirmed"
            onClick={onBackToDetail}
            className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <School className="w-4 h-4 text-[#99CAE8]" />
            <span>Volver a la ficha de {student.name}</span>
          </button>

          <button
            id="btn-register-another-observation"
            onClick={handleResetForAnother}
            className="w-full h-10 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Registrar otra observación</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: REVIEW SCREEN (STEP 2: PRE-SAVE REVIEW)
  // ==========================================
  if (currentStep === 'REVIEW') {
    return (
      <div className="flex flex-col h-full justify-between px-4.5 py-3.5 pb-6 space-y-3 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              id="btn-back-to-capture-mode"
              onClick={() => setCurrentStep('CAPTURE')}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Editar relato</span>
            </button>

            <span className="text-[10.5px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8]/70 uppercase tracking-wider">
              Revisar variables clave
            </span>
          </div>

          {/* Student Banner */}
          <div className="bg-white rounded-2xl p-2.5 px-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-xs">
                {student.initials}
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#004D6B] leading-tight">
                  {student.name}
                </h1>
                <span className="text-[10px] text-slate-500 font-medium">
                  {student.courseName} · Hoy {currentTimeStr}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {isAiInterpreted ? 'Extraído con IA' : 'Entrada directa'}
            </span>
          </div>
        </div>

        {/* Structured Variables List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold text-[#004D6B] uppercase tracking-wider">
              Variables relevantes identificadas
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Toca 'Editar' para ajustar cualquier campo
            </span>
          </div>

          {/* Variable 1: Estado de Regulación */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                1. Estado de regulación
              </span>
              <button
                type="button"
                onClick={() => setInlineEditField(inlineEditField === 'reg' ? null : 'reg')}
                className="text-[10.5px] font-bold text-[#004D6B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{inlineEditField === 'reg' ? 'Cerrar' : 'Editar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <p className="text-xs font-bold text-[#004D6B]">
                {regulationState || 'No especificado'}
              </p>
            </div>

            {inlineEditField === 'reg' && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 animate-in fade-in">
                {REGULATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRegulationState(opt.value);
                      setInlineEditField(null);
                    }}
                    className={`p-2 text-left text-[10.5px] rounded-xl border transition-all cursor-pointer ${
                      regulationState === opt.value
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Variable 2: Nivel de Alerta */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                2. Nivel de alerta / Arousal
              </span>
              <button
                type="button"
                onClick={() => setInlineEditField(inlineEditField === 'alert' ? null : 'alert')}
                className="text-[10.5px] font-bold text-[#004D6B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{inlineEditField === 'alert' ? 'Cerrar' : 'Editar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <p className="text-xs font-bold text-slate-800">
                {alertLevel || 'Habitual'}
              </p>
            </div>

            {inlineEditField === 'alert' && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 animate-in fade-in">
                {ALERT_LEVEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setAlertLevel(opt.value);
                      setInlineEditField(null);
                    }}
                    className={`p-2 text-center text-[10.5px] rounded-xl border transition-all cursor-pointer ${
                      alertLevel === opt.value
                        ? 'bg-[#004D6B] text-white border-[#004D6B] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.label} ({opt.sublabel})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Variable 3: Comportamientos observados */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                3. Conductas específicas
              </span>
              <button
                type="button"
                onClick={() => setInlineEditField(inlineEditField === 'behaviors' ? null : 'behaviors')}
                className="text-[10.5px] font-bold text-[#004D6B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{inlineEditField === 'behaviors' ? 'Cerrar' : 'Editar'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {observedBehaviors.length > 0 ? (
                observedBehaviors.map((b) => (
                  <span
                    key={b}
                    className="text-[11px] font-semibold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-lg border border-[#99CAE8]"
                  >
                    {b}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Ninguna conducta disruptiva identificada
                </span>
              )}
            </div>

            {inlineEditField === 'behaviors' && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5 animate-in fade-in">
                <div className="flex flex-wrap gap-1">
                  {BEHAVIOR_CATALOG.map((b) => {
                    const isSelected = observedBehaviors.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleToggleBehavior(b)}
                        className={`text-[10.5px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#004D6B] text-white border-[#004D6B]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Variable 4: Desencadenante / Factor de cambio */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                4. Desencadenante contextual
              </span>
              <button
                type="button"
                onClick={() => setInlineEditField(inlineEditField === 'change' ? null : 'change')}
                className="text-[10.5px] font-bold text-[#004D6B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{inlineEditField === 'change' ? 'Cerrar' : 'Editar'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                {hadUnusualChange === 'Sí'
                  ? 'Cambio o estímulo ambiental detectado'
                  : 'Sin alteraciones ambientales atípicas'}
              </p>

              {hadUnusualChange === 'Sí' && unusualChangeCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {unusualChangeCategories.map((c) => (
                    <span
                      key={c}
                      className="text-[10.5px] font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {inlineEditField === 'change' && (
              <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in">
                <div className="grid grid-cols-2 gap-1.5">
                  {(['No', 'Sí'] as SchoolRoutineChangeAnswer[]).map((ans) => (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => setHadUnusualChange(ans)}
                      className={`h-8 rounded-xl border text-xs font-semibold cursor-pointer ${
                        hadUnusualChange === ans
                          ? 'bg-[#004D6B] text-white border-[#004D6B]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ans === 'Sí' ? 'Sí, hubo cambio/estímulo' : 'No hubo cambio'}
                    </button>
                  ))}
                </div>

                {hadUnusualChange === 'Sí' && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ROUTINE_CHANGE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleChangeCategory(cat)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border cursor-pointer ${
                          unusualChangeCategories.includes(cat)
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Variable 5: Ajuste pedagógico sugerido */}
          {suggestedClassroomAction && (
            <div className="bg-[#EAF6FC]/70 rounded-2xl p-3 border border-[#99CAE8]/70 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#004D6B]">
                <Lightbulb className="w-3.5 h-3.5 text-[#004D6B] shrink-0" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider">
                  Ajuste pedagógico sugerido
                </span>
              </div>
              <p className="text-xs font-semibold text-[#004D6B] leading-snug">
                {suggestedClassroomAction}
              </p>
            </div>
          )}

          {/* Relato transcrito */}
          {additionalComment && (
            <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Relato registrado:
              </span>
              <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                "{additionalComment}"
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <button
            id="btn-confirm-and-save-variables"
            onClick={handleConfirmAndSave}
            className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#99CAE8]" />
            <span>Confirmar y guardar observación</span>
          </button>

          <button
            id="btn-back-to-editing-full"
            onClick={() => setCurrentStep('CAPTURE')}
            className="w-full h-9 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
          >
            <span>Volver a redactar o grabar</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN CAPTURE SCREEN (STEP 1: TEXT, VOICE, OR FORM)
  // ==========================================
  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-3.5 pb-6 space-y-3">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-student-main"
            onClick={onBackToDetail}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          {/* Connection state */}
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              connectionState === 'online'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {connectionState === 'online' ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>En línea</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3 h-3 text-amber-600" />
                <span>Sin conexión</span>
              </>
            )}
          </div>
        </div>

        {/* Selected Student Banner */}
        <div className="bg-white rounded-2xl p-2.5 px-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-xs">
              {student.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-[#004D6B] leading-tight">
                  {student.name}
                </h1>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                  {student.courseName}
                </span>
              </div>
              <span className="text-[10.5px] text-slate-500 font-medium block">
                Escuela · Hoy · {currentTimeStr}
              </span>
            </div>
          </div>

          <span className="text-[10.5px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded-md border border-[#99CAE8]/70">
            Registrar
          </span>
        </div>
      </div>

      {/* Segmented Control: Escribir | Voz | Formulario */}
      <div className="space-y-1">
        <div
          role="tablist"
          aria-label="Método de registro"
          className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80"
        >
          {/* Method 1: ESCRIBIR */}
          <button
            id="tab-method-text"
            type="button"
            role="tab"
            aria-selected={captureMethod === 'TEXT'}
            onClick={() => setCaptureMethod('TEXT')}
            className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              captureMethod === 'TEXT'
                ? 'bg-white text-[#004D6B] shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${captureMethod === 'TEXT' ? 'text-[#004D6B]' : 'text-slate-400'}`} />
            <span className="text-[11px] leading-none">Escribir</span>
          </button>

          {/* Method 2: VOZ */}
          <button
            id="tab-method-voice"
            type="button"
            role="tab"
            aria-selected={captureMethod === 'VOICE'}
            onClick={() => setCaptureMethod('VOICE')}
            className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              captureMethod === 'VOICE'
                ? 'bg-white text-[#004D6B] shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${captureMethod === 'VOICE' ? 'text-rose-500' : 'text-slate-400'}`} />
            <span className="text-[11px] leading-none">Por voz</span>
          </button>

          {/* Method 3: FORMULARIO */}
          <button
            id="tab-method-form"
            type="button"
            role="tab"
            aria-selected={captureMethod === 'FORM'}
            onClick={() => setCaptureMethod('FORM')}
            className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              captureMethod === 'FORM'
                ? 'bg-white text-[#004D6B] shadow-2xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 ${captureMethod === 'FORM' ? 'text-[#004D6B]' : 'text-slate-400'}`} />
            <span className="text-[11px] leading-none">Opciones</span>
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">

        {/* ========================================================= */}
        {/* MODO 1: ESCRIBIR (TEXTO LIBRE CON EXTRACCIÓN DE VARIABLES) */}
        {/* ========================================================= */}
        {captureMethod === 'TEXT' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="space-y-0.5">
                <h2 className="text-xs font-bold text-[#004D6B]">
                  Describe lo observado en aula
                </h2>
                <p className="text-[11px] text-slate-500">
                  Escribe con naturalidad. La IA extraerá los indicadores más relevantes.
                </p>
              </div>

              <textarea
                id="textarea-free-text"
                rows={3}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (e.target.value.length > 10) {
                    extractVariablesFromText(e.target.value);
                  }
                }}
                placeholder="Ej. Durante el recreo estuvo más irritable por el ruido de la campana y le costó volver a la sala."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004D6B] leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {rawText.length} caracteres
                </span>

                <button
                  type="button"
                  id="btn-interpret-free-text"
                  onClick={() => handleInterpretText()}
                  disabled={!rawText.trim() || isInterpretingText}
                  className="h-8 px-3 bg-[#004D6B] hover:bg-[#00384E] disabled:opacity-50 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Wand2 className="w-3 h-3 text-[#99CAE8]" />
                  <span>{isInterpretingText ? 'Interpretando…' : 'Reinterpretar variables'}</span>
                </button>
              </div>
            </div>

            {/* LIVE EXTRACTED VARIABLES PREVIEW (Visual clarity of relevant variables) */}
            {hasExtractedVariables && (
              <div
                id="card-extracted-variables-preview"
                className="bg-white rounded-2xl p-3.5 border border-[#99CAE8]/70 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[10.5px] font-extrabold text-[#004D6B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#004D6B]" />
                    <span>Variables clave detectadas:</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Listo para confirmar
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Regulación */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Regulación
                    </span>
                    <span className="font-bold text-[#004D6B] text-[11px] block truncate">
                      {regulationState}
                    </span>
                  </div>

                  {/* Nivel de Alerta */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Nivel de Alerta
                    </span>
                    <span className="font-bold text-slate-800 text-[11px] block">
                      {alertLevel} ({alertLevel === 'Alto' ? 'Hiperalerta' : alertLevel === 'Bajo' ? 'Hipoalerta' : 'Esperado'})
                    </span>
                  </div>
                </div>

                {/* Conductas observadas */}
                {observedBehaviors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Conductas identificadas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {observedBehaviors.map((b) => (
                        <span
                          key={b}
                          className="text-[10.5px] font-semibold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-lg border border-[#99CAE8]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Factor / Cambio */}
                {hadUnusualChange === 'Sí' && unusualChangeCategories.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Factor desencadenante:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {unusualChangeCategories.map((c) => (
                        <span
                          key={c}
                          className="text-[10.5px] font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick text examples */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                O selecciona un ejemplo común:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TEXT_PRESETS.map((tp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRawText(tp.text);
                      extractVariablesFromText(tp.text);
                    }}
                    className="text-left p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs transition-all flex flex-col justify-between cursor-pointer shadow-2xs"
                  >
                    <span className="font-bold text-[#004D6B] text-[11px] block">{tp.title}</span>
                    <span className="text-slate-500 text-[10px] line-clamp-2 mt-0.5">"{tp.text}"</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 2: NOTA DE VOZ (GRABACIÓN LIMPIA CON EXTRACCIÓN)    */}
        {/* ========================================================= */}
        {captureMethod === 'VOICE' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs text-center space-y-3">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-[#004D6B]">
                  Dictado por voz para el aula
                </h2>
                <p className="text-xs text-slate-500">
                  Graba un audio breve. La IA transcribirá y extraerá las variables.
                </p>
              </div>

              {/* Microphone Controller */}
              <div className="py-2 space-y-2">
                <button
                  type="button"
                  id="btn-voice-recorder-main"
                  onClick={() => handleStartAudio(selectedVoicePresetIdx)}
                  disabled={isRecording || isTranscribingVoice}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200'
                      : isTranscribingVoice
                      ? 'bg-[#004D6B] text-white animate-spin'
                      : 'bg-rose-500 hover:bg-rose-600 text-white active:scale-95 ring-4 ring-rose-100'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-7 h-7 fill-white" />
                  ) : isTranscribingVoice ? (
                    <RefreshCw className="w-7 h-7" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>

                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isRecording
                      ? `Grabando audio · 00:${recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}`
                      : isTranscribingVoice
                      ? 'Interpretando audio escolar…'
                      : voiceTranscript
                      ? 'Grabación lista'
                      : 'Toca el micrófono para hablar'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isRecording ? 'Toca para detener' : 'Máximo 30 segundos'}
                  </span>
                </div>
              </div>

              {/* Transcript & Extracted Variables Box */}
              {voiceTranscript && (
                <div className="bg-[#EAF6FC] rounded-2xl p-3.5 text-left border border-[#99CAE8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-[#004D6B] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#004D6B]" />
                      <span>Transcripción del audio:</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-[#99CAE8]/70 italic leading-relaxed">
                    "{voiceTranscript}"
                  </p>

                  {/* Highlight of extracted variables */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-[#99CAE8]/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium text-[11px]">Regulación:</span>
                      <span className="font-bold text-[#004D6B] text-[11px]">{regulationState}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium text-[11px]">Alerta:</span>
                      <span className="font-bold text-slate-800 text-[11px]">{alertLevel}</span>
                    </div>
                    {observedBehaviors.length > 0 && (
                      <div className="pt-1 border-t border-slate-100 flex flex-wrap gap-1">
                        {observedBehaviors.map((b) => (
                          <span key={b} className="text-[10px] font-semibold bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Audio Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                O prueba dictados de audio de ejemplo:
              </span>
              <div className="space-y-1">
                {VOICE_PRESETS.map((p, idx) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => {
                      setSelectedVoicePresetIdx(idx);
                      handleStartAudio(idx);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#EAF6FC] border border-slate-200 hover:border-[#99CAE8] text-[11px] text-slate-700 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-[#004D6B] block text-[11px]">{p.title}</span>
                      <span className="text-slate-500 text-[10px] truncate block">"{p.transcript}"</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#004D6B] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 3: FORMULARIO POR OPCIONES                          */}
        {/* ========================================================= */}
        {captureMethod === 'FORM' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Campo 1 — Regulación */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                1. Estado de regulación
              </label>

              <div className="space-y-1.5">
                {REGULATION_OPTIONS.map((opt) => {
                  const isSelected = regulationState === opt.value;
                  return (
                    <button
                      key={opt.value}
                      id={`opt-reg-${opt.value.toLowerCase().replace(/[\s\/]/g, '-')}`}
                      type="button"
                      onClick={() => setRegulationState(opt.value)}
                      className={`w-full p-2.5 px-3 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                        isSelected
                          ? opt.borderClass
                          : 'border-slate-200/90 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="text-xs font-bold block leading-tight">
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block leading-snug">
                          {opt.description}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#004D6B] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo 2 — Alerta */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                2. Nivel de alerta
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALERT_LEVEL_OPTIONS.map((opt) => {
                  const isSelected = alertLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAlertLevel(opt.value)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#004D6B] text-white border-[#004D6B] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold block text-xs">{opt.label}</span>
                      <span className={`text-[10px] block ${isSelected ? 'text-[#99CAE8]' : 'text-slate-400'}`}>
                        {opt.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo 3 — Conductas */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                3. Conductas específicas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BEHAVIOR_CATALOG.map((b) => {
                  const isSelected = observedBehaviors.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleToggleBehavior(b)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#004D6B] text-white border-[#004D6B] shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SEPARATE ACTION: CRISIS EXPRESS */}
        <div className="pt-2">
          <div
            id="card-critical-action-box"
            className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-3.5 space-y-2 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-950 block leading-tight">
                  ¿Ocurrió una desregulación aguda?
                </span>
                <span className="text-[10px] text-rose-800/80 font-medium block">
                  Reporte express de escalada en 1 toque
                </span>
              </div>
            </div>

            <button
              id="btn-report-critical-escalation"
              type="button"
              onClick={() => {
                setCrisisStep('SELECT_TYPE');
                setCrisisType(null);
                setShowCrisisModal(true);
              }}
              className="w-full h-9.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-rose-200" />
              <span>Reportar situación crítica</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary CTA: "Revisar variables y guardar" */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <button
          id="btn-submit-review-form"
          onClick={() => {
            if (captureMethod === 'TEXT' && rawText.trim() && !hasExtractedVariables) {
              extractVariablesFromText(rawText);
            }
            setCurrentStep('REVIEW');
          }}
          disabled={!regulationState}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-[#99CAE8]" />
          <span>Revisar variables y guardar</span>
        </button>
      </div>

      {/* CRISIS MODAL */}
      {showCrisisModal && (
        <div
          id="modal-crisis-express"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-4.5 space-y-3.5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            {crisisStep === 'SELECT_TYPE' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-950 leading-tight">
                        Reporte rápido de situación crítica
                      </h3>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {student.name} · {student.courseName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCrisisModal(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    ¿Qué está ocurriendo?
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-crisis-escalada"
                      type="button"
                      onClick={() => setCrisisType('Escalada')}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        crisisType === 'Escalada'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                          : 'bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 border-amber-200'
                      }`}
                    >
                      <Flame className="w-6 h-6" />
                      <span className="text-xs font-bold">Escalada</span>
                      <span className={`text-[9.5px] leading-tight ${crisisType === 'Escalada' ? 'text-amber-100' : 'text-amber-800/80'}`}>
                        Tensión o agitación en aumento
                      </span>
                    </button>

                    <button
                      id="btn-crisis-desregulacion"
                      type="button"
                      onClick={() => setCrisisType('Desregulación')}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        crisisType === 'Desregulación'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                          : 'bg-rose-50/70 hover:bg-rose-100/80 text-rose-950 border-rose-200'
                      }`}
                    >
                      <Activity className="w-6 h-6" />
                      <span className="text-xs font-bold">Desregulación</span>
                      <span className={`text-[9.5px] leading-tight ${crisisType === 'Desregulación' ? 'text-rose-100' : 'text-rose-800/80'}`}>
                        Pérdida de autorregulación activa
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  id="btn-confirm-quick-crisis"
                  onClick={() => {
                    if (crisisType) setCrisisStep('SUCCESS_QUICK');
                  }}
                  disabled={!crisisType}
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Registrar evento</span>
                </button>
              </div>
            )}

            {crisisStep === 'SUCCESS_QUICK' && (
              <div className="text-center space-y-3 py-1 animate-in fade-in">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">
                    ✓ Evento registrado
                  </h3>
                  <p className="text-xs text-slate-600">
                    Se registró <strong>{crisisType}</strong> para {student.name} ({crisisTime}).
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    id="btn-crisis-dismiss-now"
                    onClick={() => {
                      setShowCrisisModal(false);
                      onBackToDetail();
                    }}
                    className="w-full h-10 bg-[#004D6B] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Volver a la ficha del alumno</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
