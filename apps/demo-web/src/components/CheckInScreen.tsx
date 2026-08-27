import React from 'react';
import {
  Moon,
  Sun,
  Activity,
  Mic,
  MessageSquarePlus,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { CheckInAnswers, SleepOption, WakeOption, RegulationOption } from '../types';

interface CheckInScreenProps {
  answers: CheckInAnswers;
  onUpdateAnswer: <K extends keyof CheckInAnswers>(key: K, value: CheckInAnswers[K]) => void;
  onContinue: () => void;
  onGoToObservation: (withVoice?: boolean) => void;
}

const SLEEP_OPTIONS: { label: SleepOption; desc: string }[] = [
  { label: 'Bien', desc: 'Descanso continuo' },
  { label: 'Interrumpido', desc: 'Despertares nocturnos' },
  { label: 'Poco', desc: 'Menos de 6 horas' },
  { label: 'No lo sé', desc: 'Sin datos aún' },
];

const WAKE_OPTIONS: { label: WakeOption; desc: string }[] = [
  { label: 'Tranquilo', desc: 'Despertar suave' },
  { label: 'Irritable', desc: 'Baja tolerancia' },
  { label: 'Cansado', desc: 'Somnoliento' },
  { label: 'Más sensible', desc: 'Reactivo a estímulos' },
  { label: 'No lo sé', desc: 'Sin observar' },
];

const REGULATION_OPTIONS: { label: RegulationOption; desc: string }[] = [
  { label: 'Como siempre', desc: 'Dentro de su patrón' },
  { label: 'Algo diferente', desc: 'Pequeños cambios' },
  { label: 'Muy diferente', desc: 'Mayor desajuste' },
  { label: 'No lo sé', desc: 'Por evaluar' },
];

export const CheckInScreen: React.FC<CheckInScreenProps> = ({
  answers,
  onUpdateAnswer,
  onContinue,
  onGoToObservation,
}) => {
  const isAnySelected = Boolean(answers.sleep || answers.wake || answers.regulation);

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-4">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/70 uppercase tracking-wider">
            Paso 1 de 3 • FAM-02
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Check-in rápido
          </span>
        </div>
        <h1 className="text-xl font-bold text-[#0F294D] tracking-tight pt-1">
          ¿Cómo está Mateo hoy?
        </h1>
        <p className="text-xs text-slate-500">
          Solo necesitamos unas señales clave para comparar con su línea base.
        </p>
      </div>

      {/* Main Questions Container (No ambiguous sliders, large touch targets) */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-0.5">
        {/* Pregunta 1: Sueño */}
        <section id="question-sleep" className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">
              1. ¿Cómo durmió anoche?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SLEEP_OPTIONS.map((opt) => {
              const isSelected = answers.sleep === opt.label;
              return (
                <button
                  key={opt.label}
                  id={`btn-sleep-${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateAnswer('sleep', opt.label)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left transition-all border text-xs flex flex-col justify-center ${
                    isSelected
                      ? 'bg-[#0F294D] text-white border-[#0F294D] shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-300" />}
                  </div>
                  <span className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pregunta 2: Despertar */}
        <section id="question-wake" className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">
              2. ¿Cómo despertó hoy?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {WAKE_OPTIONS.map((opt, idx) => {
              const isSelected = answers.wake === opt.label;
              const isFullWidth = idx === WAKE_OPTIONS.length - 1; // "No lo sé" gets full row
              return (
                <button
                  key={opt.label}
                  id={`btn-wake-${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateAnswer('wake', opt.label)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left transition-all border text-xs flex flex-col justify-center ${
                    isFullWidth ? 'col-span-2' : ''
                  } ${
                    isSelected
                      ? 'bg-[#0F294D] text-white border-[#0F294D] shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-300" />}
                  </div>
                  <span className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pregunta 3: Regulación */}
        <section id="question-regulation" className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">
              3. ¿Cómo está su regulación?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {REGULATION_OPTIONS.map((opt) => {
              const isSelected = answers.regulation === opt.label;
              return (
                <button
                  key={opt.label}
                  id={`btn-reg-${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateAnswer('regulation', opt.label)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left transition-all border text-xs flex flex-col justify-center ${
                    isSelected
                      ? 'bg-[#0F294D] text-white border-[#0F294D] shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-300" />}
                  </div>
                  <span className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Auxiliary shortcuts & Primary Action */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-add-observation"
            onClick={() => onGoToObservation(false)}
            className="h-10 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Agregar observación</span>
          </button>

          <button
            id="btn-voice-capture-shortcut"
            onClick={() => onGoToObservation(true)}
            className="h-10 px-2.5 rounded-xl border border-sky-200/80 bg-sky-50/70 hover:bg-sky-100/70 text-sky-900 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span>Contarlo por voz</span>
          </button>
        </div>

        <button
          id="btn-continue-checkin"
          onClick={onContinue}
          className="w-full h-11 bg-[#0F294D] hover:bg-[#163866] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4 text-sky-300" />
        </button>
      </div>
    </div>
  );
};
