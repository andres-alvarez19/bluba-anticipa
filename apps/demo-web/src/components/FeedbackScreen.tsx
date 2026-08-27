import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  History,
  Check,
  Layers,
  ArrowLeft
} from 'lucide-react';
import {
  FeedbackRecord,
  DysregulationAnswer,
  StrategyApplicationAnswer,
  OutcomeResultAnswer,
} from '../types';
import { CycleIndicator } from './CycleIndicator';

interface FeedbackScreenProps {
  feedbackData: FeedbackRecord;
  onUpdateFeedback: (partial: Partial<FeedbackRecord>) => void;
  onBackToRecommendations: () => void;
  onResetFeedback: () => void;
}

const OUTCOME_OPTIONS: { value: OutcomeResultAnswer; desc: string }[] = [
  { value: 'Ayudó', desc: 'Disminuyó la sobrecarga o previno el escalamiento' },
  { value: 'Ayudó parcialmente', desc: 'Tuvo un impacto leve pero requirió ajustes' },
  { value: 'No tuvo efecto', desc: 'No se observó cambio en su regulación' },
];

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  feedbackData,
  onUpdateFeedback,
  onBackToRecommendations,
  onResetFeedback,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete =
    feedbackData.hadDysregulation !== null &&
    feedbackData.appliedStrategy !== null &&
    (feedbackData.appliedStrategy === 'No' || feedbackData.outcomeResult !== null);

  const handleSubmit = () => {
    setIsSubmitting(true);
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeout(() => {
      onUpdateFeedback({
        isSubmitted: true,
        submittedTimestamp: `Hoy, ${formatted} h`,
      });
      setIsSubmitting(false);
    }, 600);
  };

  // State: Post-Submission Confirmation Screen
  if (feedbackData.isSubmitted) {
    return (
      <div className="flex flex-col h-full justify-between px-5 py-5 space-y-4 animate-in fade-in duration-200">
        {/* Header indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              FAM-04 • Confirmación
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Cierre del ciclo
            </span>
          </div>

          <CycleIndicator activeStep="HISTORIAL" />
        </div>

        {/* Success & Impact Card */}
        <div className="my-auto space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[#0F294D] tracking-tight">
              Resultado registrado
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Esta información formará parte del historial individual de Mateo y ayudará a revisar qué estrategias han sido útiles en situaciones similares.
            </p>
          </div>

          {/* Structured Traceability Card: ALERTA -> ACCIÓN -> RESULTADO -> HISTORIAL */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-left shadow-2xs space-y-3 max-w-xs mx-auto">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Resumen del ciclo cerrado
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">1. Alerta previa</span>
                <span className="font-semibold text-slate-700">Ayer (Sueño + Escuela)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">2. Estrategia</span>
                <span className="font-semibold text-[#0F294D] truncate max-w-[140px]">
                  {feedbackData.appliedStrategy === 'Otra estrategia registrada'
                    ? feedbackData.alternativeStrategyName || 'Otra registrada'
                    : feedbackData.appliedStrategy === 'Sí'
                    ? feedbackData.selectedStrategyTitle
                    : 'No aplicada'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">3. ¿Desregulación?</span>
                <span className="font-semibold text-slate-800">
                  {feedbackData.hadDysregulation}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">4. Resultado</span>
                <span className="font-bold text-emerald-700">
                  {feedbackData.outcomeResult || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <button
            id="btn-back-to-recs"
            onClick={onBackToRecommendations}
            className="w-full h-11 bg-[#0F294D] hover:bg-[#163866] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-sky-300" />
            <span>Volver a recomendaciones de hoy</span>
          </button>

          <button
            id="btn-edit-feedback"
            onClick={() => onUpdateFeedback({ isSubmitted: false })}
            className="w-full h-9 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
          >
            Modificar respuesta
          </button>
        </div>
      </div>
    );
  }

  // Active Feedback Form Screen
  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-recs-top"
            onClick={onBackToRecommendations}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0F294D] transition-colors py-1 px-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Recomendaciones</span>
          </button>
          <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80 uppercase tracking-wider">
            FAM-04 • Feedback
          </span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#0F294D] tracking-tight">
            Sobre la alerta de ayer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            La alerta anterior ya terminó. Cuéntanos qué ocurrió para actualizar el historial.
          </p>
        </div>

        {/* Visual Cycle Progress */}
        <CycleIndicator activeStep="RESULTADO" />
      </div>

      {/* Main Questions Container */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
        {/* Pregunta 1: ¿Ocurrió una desregulación? */}
        <section id="section-dysregulation" className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>¿Ocurrió una desregulación?</span>
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {(['Sí', 'No'] as DysregulationAnswer[]).map((val) => {
              const isSelected = feedbackData.hadDysregulation === val;
              return (
                <button
                  key={val}
                  id={`btn-dysregulation-${val.toLowerCase()}`}
                  onClick={() => onUpdateFeedback({ hadDysregulation: val })}
                  className={`h-12 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#0F294D] text-white border-[#0F294D] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <span>{val}</span>
                  {isSelected && <Check className="w-4 h-4 text-sky-300" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Pregunta 2: ¿Aplicaron alguna estrategia? */}
        <section id="section-strategy" className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>¿Aplicaron alguna estrategia?</span>
            </h2>

            {/* Display previously selected strategy */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 flex items-center gap-1.5">
              <span className="text-slate-400">Estrategia sugerida:</span>
              <strong className="text-[#0F294D] font-bold truncate">
                {feedbackData.selectedStrategyTitle}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { key: 'Sí' as StrategyApplicationAnswer, label: `Sí, aplicamos "${feedbackData.selectedStrategyTitle}"` },
              { key: 'No' as StrategyApplicationAnswer, label: 'No se aplicó ninguna estrategia' },
              { key: 'Otra estrategia registrada' as StrategyApplicationAnswer, label: 'Otra estrategia registrada' },
            ].map((opt) => {
              const isSelected = feedbackData.appliedStrategy === opt.key;
              return (
                <button
                  key={opt.key}
                  id={`btn-applied-${opt.key.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onUpdateFeedback({ appliedStrategy: opt.key })}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0F294D] text-white border-[#0F294D] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-300 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Sub-input if "Otra estrategia registrada" is chosen */}
          {feedbackData.appliedStrategy === 'Otra estrategia registrada' && (
            <div className="pt-1">
              <input
                id="input-alternative-strategy"
                type="text"
                value={feedbackData.alternativeStrategyName || ''}
                onChange={(e) => onUpdateFeedback({ alternativeStrategyName: e.target.value })}
                placeholder="Nombre de la estrategia aplicada…"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0F294D]"
              />
            </div>
          )}
        </section>

        {/* Pregunta 3: ¿Cómo resultó? (Only if strategy applied or partial) */}
        {feedbackData.appliedStrategy !== 'No' && (
          <section id="section-outcome" className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5 animate-in fade-in duration-150">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>¿Cómo resultó?</span>
            </h2>

            <div className="space-y-1.5">
              {OUTCOME_OPTIONS.map((opt) => {
                const isSelected = feedbackData.outcomeResult === opt.value;
                return (
                  <button
                    key={opt.value}
                    id={`btn-outcome-${opt.value.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onUpdateFeedback({ outcomeResult: opt.value })}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700 font-medium'
                    }`}
                  >
                    <div>
                      <span>{opt.value}</span>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-700' : 'text-slate-400'}`}>
                        {opt.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-700 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Primary CTA */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <button
          id="btn-save-result"
          disabled={!isFormComplete || isSubmitting}
          onClick={handleSubmit}
          className={`w-full h-11 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs ${
            isFormComplete && !isSubmitting
              ? 'bg-[#0F294D] hover:bg-[#163866] text-white active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span>Guardando en historial…</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guardar resultado</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
