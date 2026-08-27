import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Cloud,
  Check,
  ChevronRight,
  Moon,
  Zap,
  Building2,
  TrendingUp,
  Plus,
  Volume2
} from 'lucide-react';
import { ExtractedVariables, VoiceState, SaveStatus, ChildState } from '../types';
import { EditVariableSheet, EditableFieldKey } from './EditVariableSheet';

interface PredictiveVariableHint {
  id: string;
  name: string;
  shortDesc: string;
  quickSample: string;
  iconType: 'sleep' | 'wake' | 'routine' | 'sensory' | 'social';
}

interface QuickReportModalProps {
  isOpen: boolean;
  initialMode?: 'text' | 'voice';
  childName?: string;
  childData?: ChildState;
  customDateLabel?: string;
  onClose: () => void;
  onSaveReport?: (variables: ExtractedVariables, isVoice: boolean) => void;
}

const PREDICTIVE_VARIABLES_BY_CHILD: Record<string, PredictiveVariableHint[]> = {
  'mateo-r': [
    {
      id: 'var-sleep',
      name: 'Sueño nocturno',
      shortDesc: 'Horas y despertares',
      quickSample: 'Durmió 5.5h con 2 despertares',
      iconType: 'sleep'
    },
    {
      id: 'var-wake-state',
      name: 'Estado al despertar',
      shortDesc: 'Ánimo o irritabilidad',
      quickSample: 'Amaneció sensible a la luz y quejoso',
      iconType: 'wake'
    },
    {
      id: 'var-school-noise',
      name: 'Colegio / Rutina',
      shortDesc: 'Ruido, eventos o cambios',
      quickSample: 'Hoy tienen acto cívico con parlantes',
      iconType: 'routine'
    }
  ],
  'sofia-m': [
    {
      id: 'var-sofia-snack',
      name: 'Pausa y merienda',
      shortDesc: 'Snack sensorial crujiente',
      quickSample: 'Tomó snack crujiente y descanso de 10 min',
      iconType: 'sensory'
    },
    {
      id: 'var-sofia-trans',
      name: 'Salida a talleres',
      shortDesc: 'Anticipación visual',
      quickSample: 'Revisamos fotos del taller antes de salir',
      iconType: 'routine'
    }
  ],
  'lucas-a': [
    {
      id: 'var-lucas-turns',
      name: 'Espera de turnos',
      shortDesc: 'Apoyo verbal en juegos',
      quickSample: 'Logró esperar turno con apoyo verbal',
      iconType: 'social'
    },
    {
      id: 'var-lucas-active',
      name: 'Actividad física',
      shortDesc: 'Juegos en el parque',
      quickSample: 'Juego estructurado en el parque por 25 min',
      iconType: 'routine'
    }
  ]
};

const DEMO_TRANSCRIPT_VOICE =
  'Mateo despertó con sueño interrumpido y un poco irritable. Nos comentaron que hoy en la escuela tendrán un acto especial con mucho ruido.';

const DEMO_TEXT_PRESET =
  'Anoche durmió 5.5 horas con 2 despertares. Amaneció más irritable y nos avisaron que hoy habrá un acto ruidoso en la escuela.';

export const QuickReportModal: React.FC<QuickReportModalProps> = ({
  isOpen,
  initialMode = 'voice',
  childName = 'Mateo R.',
  childData,
  customDateLabel,
  onClose,
  onSaveReport,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>(initialMode);
  const [step, setStep] = useState<'record' | 'review' | 'success'>('record');

  // Voice Recording State
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceTimerInterval, setVoiceTimerInterval] = useState<any>(null);

  // Text State
  const [observationText, setObservationText] = useState('');
  const [selectedHints, setSelectedHints] = useState<string[]>([]);

  // AI Extraction State
  const [variables, setVariables] = useState<ExtractedVariables>({
    sleep: 'Interrumpido (5.5h)',
    wakeState: 'Irritable / Sensible',
    routineChange: 'Acto escolar con ruido',
    context: 'Hogar y Escuela',
  });

  const [activeEditField, setActiveEditField] = useState<EditableFieldKey | null>(null);
  const [simulateError, setSimulateError] = useState(false);
  const [isErrorState, setIsErrorState] = useState(false);

  // Sync state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    isSaved: false,
    updateCompleted: false,
    savedTimestamp: null,
  });

  // Determinar variables clave según el niño activo
  const childKey = childData?.id || (childName.toLowerCase().includes('sof') ? 'sofia-m' : childName.toLowerCase().includes('luc') ? 'lucas-a' : 'mateo-r');
  const predictiveHints = PREDICTIVE_VARIABLES_BY_CHILD[childKey] || PREDICTIVE_VARIABLES_BY_CHILD['mateo-r'];

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setStep('record');
      setVoiceState('idle');
      setVoiceDuration(0);
      setIsErrorState(false);
      setSelectedHints([]);
      setSaveStatus({ isSaved: false, updateCompleted: false, savedTimestamp: null });
      if (initialMode === 'text' && !observationText) {
        setObservationText(DEMO_TEXT_PRESET);
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Start Voice Recording Simulation
  const handleStartVoice = () => {
    if (voiceState === 'listening' || voiceState === 'transcribing') return;

    setVoiceState('listening');
    setVoiceDuration(0);

    const interval = setInterval(() => {
      setVoiceDuration((prev) => prev + 1);
    }, 1000);
    setVoiceTimerInterval(interval);
  };

  // Stop & Transcribe
  const handleStopVoice = () => {
    if (voiceTimerInterval) clearInterval(voiceTimerInterval);
    setVoiceState('transcribing');

    setTimeout(() => {
      setVoiceState('completed');
      setObservationText(DEMO_TRANSCRIPT_VOICE);
      setTimeout(() => {
        if (simulateError) {
          setIsErrorState(true);
        } else {
          setStep('review');
        }
      }, 700);
    }, 1400);
  };

  const handleCancelVoice = () => {
    if (voiceTimerInterval) clearInterval(voiceTimerInterval);
    setVoiceState('idle');
    setVoiceDuration(0);
  };

  // Click on a predictive variable hint
  const handleToggleHint = (hint: PredictiveVariableHint) => {
    const isSelected = selectedHints.includes(hint.id);
    if (isSelected) {
      setSelectedHints(prev => prev.filter(id => id !== hint.id));
    } else {
      setSelectedHints(prev => [...prev, hint.id]);
      if (activeTab === 'text') {
        setObservationText(prev => {
          const trimmed = prev.trim();
          if (!trimmed) return hint.quickSample;
          if (trimmed.includes(hint.quickSample)) return trimmed;
          return `${trimmed}. ${hint.quickSample}`;
        });
      }
    }
  };

  // Text Submit to AI extraction
  const handleProcessText = () => {
    if (simulateError) {
      setIsErrorState(true);
      return;
    }
    setStep('review');
  };

  // Confirm and Save
  const handleConfirmAndSave = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    setSaveStatus({
      isSaved: true,
      updateCompleted: false,
      savedTimestamp: timeStr,
    });
    setStep('success');

    if (onSaveReport) {
      onSaveReport(variables, activeTab === 'voice');
    }

    setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, updateCompleted: true }));
    }, 2000);
  };

  const handleUpdateVariable = (key: EditableFieldKey, value: any) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleCloseAndReset = () => {
    if (voiceTimerInterval) clearInterval(voiceTimerInterval);
    onClose();
  };

  return (
    <div
      id="quick-report-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={handleCloseAndReset}
    >
      <div
        id="quick-report-modal-content"
        className="bg-white w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. CABECERA LIMPIA Y DESPEJADA */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Nuevo reporte
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {customDateLabel ? customDateLabel : `Observación rápida • ${childName}`}
            </p>
          </div>

          <button
            id="btn-close-quick-report-modal"
            onClick={handleCloseAndReset}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: RECORD (VOICE OR TEXT) */}
        {step === 'record' && !isErrorState && (
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 flex flex-col justify-between">
            {/* 2. BOTONES PRINCIPALES ARRIBA: GRABAR AUDIO O ESCRIBIR TEXTO */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <button
                id="tab-mode-voice"
                type="button"
                onClick={() => {
                  setActiveTab('voice');
                  setVoiceState('idle');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  activeTab === 'voice'
                    ? 'bg-[#004D6B] text-white border-[#004D6B] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                }`}
              >
                <Mic className={`w-4 h-4 ${activeTab === 'voice' ? 'text-white' : 'text-slate-500'}`} />
                <span>Grabar audio</span>
              </button>

              <button
                id="tab-mode-text"
                type="button"
                onClick={() => {
                  setActiveTab('text');
                  if (!observationText) setObservationText(DEMO_TEXT_PRESET);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  activeTab === 'text'
                    ? 'bg-[#004D6B] text-white border-[#004D6B] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'text' ? 'text-white' : 'text-slate-500'}`} />
                <span>Escribir texto</span>
              </button>
            </div>

            {/* 3. CARD SENCILLA DE VARIABLES SUGERIDAS */}
            <div
              id="block-predictive-variables-guide"
              className="bg-[#EAF6FC] border border-[#99CAE8]/70 rounded-2xl p-3 space-y-2 shrink-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#004D6B] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#004D6B]" />
                  <span>¿Qué conviene reportar hoy?</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Toca para {activeTab === 'text' ? 'añadir' : 'guiar'}
                </span>
              </div>

              {/* Pills directas y sencillas */}
              <div className="grid grid-cols-1 gap-1.5">
                {predictiveHints.map((hint) => {
                  const isChecked = selectedHints.includes(hint.id);
                  const isSleep = hint.iconType === 'sleep';
                  const isRoutine = hint.iconType === 'routine';
                  const isWake = hint.iconType === 'wake';

                  return (
                    <button
                      key={hint.id}
                      type="button"
                      onClick={() => handleToggleHint(hint)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-white border-[#004D6B] shadow-2xs text-[#004D6B]'
                          : 'bg-white/90 hover:bg-white border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isSleep
                              ? 'bg-indigo-50 text-indigo-600'
                              : isRoutine
                              ? 'bg-sky-50 text-[#004D6B]'
                              : isWake
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isSleep && <Moon className="w-3 h-3" />}
                          {isRoutine && <Building2 className="w-3 h-3" />}
                          {isWake && <Zap className="w-3 h-3" />}
                          {!isSleep && !isRoutine && !isWake && <Sparkles className="w-3 h-3" />}
                        </div>
                        <span className="text-xs font-bold truncate">
                          {hint.name}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-normal truncate hidden sm:inline">
                          • {hint.shortDesc}
                        </span>
                      </div>

                      <span className="text-[10.5px] font-semibold text-slate-400 shrink-0">
                        {isChecked ? (
                          <Check className="w-3.5 h-3.5 text-[#004D6B]" />
                        ) : (
                          <span className="text-[#004D6B] text-[11px] font-bold">+</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. CONTENIDO INTERACTIVO SEGÚN PESTAÑA */}
            {activeTab === 'voice' && (
              <div className="space-y-3.5 my-auto py-3 text-center">
                {voiceState === 'idle' && (
                  <div className="space-y-3">
                    <button
                      id="btn-voice-record-start"
                      type="button"
                      onClick={handleStartVoice}
                      className="w-20 h-20 rounded-full bg-[#004D6B] hover:bg-[#00384E] text-white flex items-center justify-center mx-auto shadow-md shadow-[#004D6B]/20 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                    >
                      <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">
                        Toca el micrófono para hablar (10s)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menciona cómo pasó la noche o su despertar
                      </p>
                    </div>
                  </div>
                )}

                {voiceState === 'listening' && (
                  <div className="space-y-3 py-1">
                    <div className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto animate-pulse shadow-md shadow-rose-500/20">
                      <Mic className="w-8 h-8 text-white" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-700 block">
                        Grabando… 0:0{voiceDuration}s
                      </span>
                      <div className="flex items-center justify-center gap-1 h-5">
                        <span className="w-1 h-3 bg-[#004D6B] rounded-full animate-bounce [animation-delay:0.1s]"></span>
                        <span className="w-1 h-5 bg-[#99CAE8] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-1 h-4 bg-[#004D6B] rounded-full animate-bounce [animation-delay:0.25s]"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        id="btn-voice-cancel"
                        type="button"
                        onClick={handleCancelVoice}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        id="btn-voice-finish"
                        type="button"
                        onClick={handleStopVoice}
                        className="px-4 py-2 bg-[#004D6B] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#00384E] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Terminar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {voiceState === 'transcribing' && (
                  <div className="space-y-2 py-4">
                    <div className="w-10 h-10 rounded-full bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center mx-auto animate-spin">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#004D6B]">
                      Procesando nota de voz…
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Observación:
                    </label>
                    <button
                      type="button"
                      onClick={() => setObservationText(DEMO_TEXT_PRESET)}
                      className="text-[10.5px] font-bold text-[#004D6B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#004D6B]" />
                      <span>Cargar ejemplo</span>
                    </button>
                  </div>

                  <textarea
                    id="textarea-quick-report-observation"
                    rows={3}
                    value={observationText}
                    onChange={(e) => setObservationText(e.target.value)}
                    placeholder="Escribe lo observado (sueño, despertar, eventos escolares)…"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004D6B] focus:border-transparent transition-all shadow-2xs leading-relaxed resize-none"
                  />
                </div>

                <button
                  id="btn-process-text-to-review"
                  type="button"
                  onClick={handleProcessText}
                  disabled={!observationText.trim()}
                  className="w-full h-10 bg-[#004D6B] hover:bg-[#00384E] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: REVIEW AI VARIABLES */}
        {step === 'review' && !isErrorState && (
          <div className="p-4 space-y-3 overflow-y-auto flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Variables identificadas</span>
              </span>
              <h3 className="text-xs font-bold text-slate-800">
                Confirma los datos para calibrar la predicción:
              </h3>
            </div>

            {/* 4 Extracted Variables */}
            <div className="space-y-1.5">
              <button
                id="btn-edit-modal-var-sleep"
                type="button"
                onClick={() => setActiveEditField('sleep')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Sueño nocturno
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {variables.sleep}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004D6B]" />
              </button>

              <button
                id="btn-edit-modal-var-wake"
                type="button"
                onClick={() => setActiveEditField('wakeState')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Estado al despertar
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {variables.wakeState}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004D6B]" />
              </button>

              <button
                id="btn-edit-modal-var-routine"
                type="button"
                onClick={() => setActiveEditField('routineChange')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Colegio / Rutina
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {variables.routineChange}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004D6B]" />
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                id="btn-confirm-save-modal"
                type="button"
                onClick={handleConfirmAndSave}
                className="w-full h-10 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#99CAE8]" />
                <span>Confirmar y actualizar predicción</span>
              </button>

              <button
                id="btn-back-to-record-modal"
                type="button"
                onClick={() => setStep('record')}
                className="w-full text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer py-1"
              >
                Volver a grabar / escribir
              </button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {isErrorState && (
          <div className="p-5 space-y-3 text-center my-auto flex-1 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-950">
                No pudimos procesar la nota
              </h3>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                Intenta nuevamente o ingresa el texto directamente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsErrorState(false);
                setStep('record');
              }}
              className="w-full h-9 bg-[#004D6B] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="p-6 space-y-4 text-center my-auto flex-1 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reporte registrado
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                La predicción de hoy se ha actualizado.
              </p>
            </div>

            <button
              id="btn-finish-quick-report-modal"
              type="button"
              onClick={handleCloseAndReset}
              className="w-full h-10 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Listo
            </button>
          </div>
        )}

        {/* Variable Bottom Sheet editor */}
        {activeEditField && (
          <EditVariableSheet
            fieldKey={activeEditField}
            currentValue={variables[activeEditField]}
            onSaveValue={handleUpdateVariable}
            onClose={() => setActiveEditField(null)}
          />
        )}
      </div>
    </div>
  );
};
