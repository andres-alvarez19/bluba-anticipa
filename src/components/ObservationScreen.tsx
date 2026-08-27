import React, { useState, useEffect } from 'react';
import {
  Mic,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { VoiceState } from '../types';

interface ObservationScreenProps {
  observationText: string;
  onChangeText: (text: string) => void;
  onBack: () => void;
  onContinueToConfirmation: (isErrorCase?: boolean) => void;
  initialStartVoice?: boolean;
}

const DEMO_EXAMPLE =
  'Anoche despertó varias veces. Hoy amaneció irritable y nos avisaron que cambiarán su sala.';

export const ObservationScreen: React.FC<ObservationScreenProps> = ({
  observationText,
  onChangeText,
  onBack,
  onContinueToConfirmation,
  initialStartVoice = false,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [simulateError, setSimulateError] = useState(false);

  // Trigger voice recording simulation if navigated via "Contarlo por voz"
  useEffect(() => {
    if (initialStartVoice && voiceState === 'idle') {
      handleStartVoiceSimulation();
    }
  }, [initialStartVoice]);

  // Voice recording simulation loop
  const handleStartVoiceSimulation = () => {
    if (voiceState === 'listening' || voiceState === 'transcribing') return;

    setVoiceState('listening');
    setVoiceDuration(0);

    const interval = setInterval(() => {
      setVoiceDuration((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setVoiceState('transcribing');

      setTimeout(() => {
        setVoiceState('completed');
        onChangeText(DEMO_EXAMPLE);
      }, 1600);
    }, 3200);
  };

  const handleApplyDemoExample = () => {
    onChangeText(DEMO_EXAMPLE);
  };

  const handleClear = () => {
    onChangeText('');
    setVoiceState('idle');
  };

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-4">
      {/* Header & Back Button */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-checkin"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a preguntas</span>
          </button>
          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded-full border border-[#99CAE8]/70 uppercase tracking-wider">
            Paso 2 de 3 • CAP-01
          </span>
        </div>

        <h1 className="text-xl font-bold text-[#004D6B] tracking-tight pt-1">
          ¿Quieres agregar algo más?
        </h1>
        <p className="text-xs text-slate-500">
          Puedes escribir con tus propias palabras o grabarlo por voz. La IA extraerá los factores clave para tu confirmación.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
        {/* Voice Capture Unit */}
        <section
          id="block-voice-recorder"
          className={`rounded-2xl p-4 border transition-all text-center space-y-3 ${
            voiceState === 'listening'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
              : voiceState === 'transcribing'
              ? 'bg-[#EAF6FC] border-[#99CAE8]'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          {voiceState === 'idle' && (
            <div className="space-y-2.5">
              <button
                id="btn-record-voice-prominent"
                onClick={handleStartVoiceSimulation}
                className="w-14 h-14 rounded-full bg-[#004D6B] hover:bg-[#00384E] text-white flex items-center justify-center mx-auto shadow-md transition-transform active:scale-95 group"
                aria-label="Grabar audio"
              >
                <Mic className="w-6 h-6 text-[#99CAE8] group-hover:scale-110 transition-transform" />
              </button>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Toca para hablar
                </p>
                <p className="text-[11px] text-slate-400">
                  Grabación rápida de notas de voz
                </p>
              </div>
            </div>
          )}

          {voiceState === 'listening' && (
            <div className="space-y-2.5 py-1">
              <div className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto animate-pulse shadow-md">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-700 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Grabando… (0:0{voiceDuration}s)
                </p>
                {/* Visual soundwave animation */}
                <div className="flex items-center justify-center gap-1 h-5 pt-1">
                  <span className="w-1 h-3 bg-[#004D6B] rounded-full animate-bounce"></span>
                  <span className="w-1 h-5 bg-[#99CAE8] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1 h-6 bg-[#004D6B] rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1 h-4 bg-[#99CAE8] rounded-full animate-bounce [animation-delay:0.25s]"></span>
                  <span className="w-1 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.35s]"></span>
                </div>
              </div>
            </div>
          )}

          {voiceState === 'transcribing' && (
            <div className="space-y-2 py-2">
              <div className="w-10 h-10 rounded-full bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#004D6B]">
                Transcribiendo audio…
              </p>
              <p className="text-[11px] text-slate-500">
                Extrayendo texto en lenguaje natural
              </p>
            </div>
          )}

          {voiceState === 'completed' && (
            <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">Audio transcrito con éxito</span>
              </div>
              <button
                onClick={handleStartVoiceSimulation}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold underline ml-2"
              >
                Volver a grabar
              </button>
            </div>
          )}
        </section>

        {/* Textarea Observation Area */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observación en texto</span>
            </label>
            {observationText && (
              <button
                onClick={handleClear}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Borrar
              </button>
            )}
          </div>

          <textarea
            id="input-observation-text"
            rows={4}
            value={observationText}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Cuéntanos brevemente qué ocurrió hoy…"
            className="w-full p-3.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004D6B] focus:border-transparent transition-all shadow-2xs leading-relaxed"
          />

          {/* Preset Demo Button */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              id="btn-load-demo-example"
              type="button"
              onClick={handleApplyDemoExample}
              className="text-[11px] font-medium text-[#004D6B] hover:text-[#00384E] bg-[#EAF6FC] hover:bg-[#d8eef9] px-2.5 py-1 rounded-lg border border-[#99CAE8]/70 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#004D6B]" />
              <span>Cargar ejemplo para demo</span>
            </button>

            {/* Error simulation toggle */}
            <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3 h-3"
              />
              <span>Probar error IA</span>
            </label>
          </div>
        </section>
      </div>

      {/* Primary Actions */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <button
          id="btn-submit-observation"
          onClick={() => onContinueToConfirmation(simulateError)}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
        >
          <span>Interpretar y revisar</span>
          <ArrowRight className="w-4 h-4 text-[#99CAE8]" />
        </button>

        <button
          id="btn-skip-observation"
          onClick={() => onContinueToConfirmation(false)}
          className="w-full h-9 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
        >
          Omitir y continuar a confirmación
        </button>
      </div>
    </div>
  );
};
