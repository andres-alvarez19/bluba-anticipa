import React, { useState } from 'react';
import {
  AlertTriangle,
  Moon,
  TrendingDown,
  Building2,
  ArrowRight,
  ShieldCheck,
  Info,
  CalendarCheck,
  User,
  Sparkles,
  ChevronRight,
  Clock,
  HelpCircle,
  ChevronDown,
  Check,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  RotateCcw,
  Mic,
  FileText,
} from 'lucide-react';
import { ChildState, ActiveScreen } from '../types';
import { RiskExplanationModal } from './RiskExplanationModal';
import { ConfidenceExplanationModal } from './ConfidenceExplanationModal';

interface TodayStatusScreenProps {
  data: ChildState;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenPreventiveModal: () => void;
  onOpenQuickReport?: (mode: 'text' | 'voice') => void;
  availableChildren?: ChildState[];
  onSelectChild?: (child: ChildState) => void;
}

export const TodayStatusScreen: React.FC<TodayStatusScreenProps> = ({
  data,
  onNavigate,
  onOpenPreventiveModal,
  onOpenQuickReport,
  availableChildren = [],
  onSelectChild,
}) => {
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [actionFeedbackMap, setActionFeedbackMap] = useState<Record<string, 'yes' | 'partial' | 'no'>>({});

  // Current feedback for this child's action
  const currentActionId = `${data.id}-${data.preventiveAction.id}`;
  const currentFeedback = actionFeedbackMap[currentActionId];

  const handleSetFeedback = (feedback: 'yes' | 'partial' | 'no') => {
    setActionFeedbackMap(prev => ({
      ...prev,
      [currentActionId]: feedback
    }));
  };

  const handleResetFeedback = () => {
    setActionFeedbackMap(prev => {
      const next = { ...prev };
      delete next[currentActionId];
      return next;
    });
  };

  // Presentation follows API levels; score values never classify risk or confidence here.
  const riskScore = data.riskScoreInternal;
  const riskColor = data.riskLevel === 'ELEVATED'
    ? '#E11D48'
    : data.riskLevel === 'MODERATE'
      ? '#D97706'
      : data.riskLevel === 'LOW'
        ? '#059669'
        : '#64748B';
  const confidenceScore = data.confidenceScoreInternal;
  const confidenceColor = data.confidenceLevel === 'HIGH'
    ? '#059669'
    : data.confidenceLevel === 'MEDIUM'
      ? '#0284C7'
      : '#64748B';

  // Concentric SVG Gauge calculations
  // Outer Ring: Riesgo (radius 64, strokeWidth 9)
  const radiusOuter = 64;
  const circumferenceOuter = 2 * Math.PI * radiusOuter; // ~402.12
  const riskOffset = circumferenceOuter - ((riskScore ?? 0) / 100) * circumferenceOuter;

  // Inner Ring: Confianza (radius 48, strokeWidth 8)
  const radiusInner = 48;
  const circumferenceInner = 2 * Math.PI * radiusInner; // ~301.59
  const confidenceOffset = circumferenceInner - (confidenceScore / 100) * circumferenceInner;

  return (
    <div className="px-4.5 py-4 space-y-4 pb-12">
      {/* 1. NIÑO SELECCIONADO Y SELECTOR RÁPIDO */}
      <section
        id="block-child-context"
        className="relative bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#004D6B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {data.avatarText || 'MR'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-[#004D6B] leading-tight truncate">
                {data.name}
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Última actualización: {data.lastUpdated}
              </span>
            </div>
          </div>

          {availableChildren.length > 1 && (
            <button
              id="btn-switch-child"
              type="button"
              onClick={() => setShowChildSelector(!showChildSelector)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 active:scale-95 text-xs font-bold text-slate-700 transition-all shrink-0 cursor-pointer"
            >
              <span>Cambiar</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showChildSelector ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Dropdown flotante para cambiar de niño */}
        {showChildSelector && availableChildren.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">
              Seleccionar perfil:
            </p>
            <div className="space-y-1">
              {availableChildren.map((child) => {
                const isSelected = child.id === data.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      if (onSelectChild) onSelectChild(child);
                      setShowChildSelector(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#EAF6FC] border border-[#99CAE8]/70 text-[#004D6B]'
                        : 'hover:bg-slate-50 border border-transparent text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-[#004D6B] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {child.avatarText}
                      </div>
                      <span className="text-xs font-bold">
                        {child.name}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#004D6B]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {onOpenQuickReport && (
        <section id="block-quick-observation-actions" className="grid grid-cols-[1fr_auto] gap-2">
          <button
            id="btn-today-report-voice"
            type="button"
            onClick={() => onOpenQuickReport('voice')}
            className="min-h-12 rounded-2xl bg-[#004D6B] px-4 text-white shadow-sm flex items-center justify-center gap-2 text-xs font-bold hover:bg-[#00384E] active:scale-[0.98] transition-all"
          >
            <Mic className="h-4 w-4" />
            Contarlo por voz
          </button>
          <button
            id="btn-today-report-text"
            type="button"
            onClick={() => onOpenQuickReport('text')}
            className="min-h-12 rounded-2xl border border-[#99CAE8] bg-white px-3 text-[#004D6B] flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-[#EAF6FC] active:scale-[0.98] transition-all"
          >
            <FileText className="h-4 w-4" />
            Escribir
          </button>
        </section>
      )}

      {/* 2. COMPONENTE CENTRAL: ESTADO PREVENTIVO CON GRÁFICOS INTERACTIVOS */}
      <section
        id="block-today-preventive-status"
        className="bg-white rounded-3xl p-4.5 border border-slate-200/90 shadow-xs space-y-4"
      >
        {/* Header con Título oficial */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h1 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Estado preventivo de hoy
            </h1>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{data.lastUpdated}</span>
          </div>
        </div>

        {/* 3. GRÁFICO CONCÉNTRICO UNIFICADO: RIESGO (EXTERIOR) Y CONFIANZA (INTERIOR) */}
        <div
          id="concentric-gauges-container"
          className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center justify-center gap-2"
        >
          {/* Concentric SVG Gauge with interactive hover & tooltips */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0 my-1">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* 1. Outer Track (Riesgo) */}
              <circle
                cx="80"
                cy="80"
                r={radiusOuter}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-200/80 cursor-pointer hover:stroke-slate-300 transition-colors"
                onClick={() => setShowRiskModal(true)}
              />
              {/* 1. Outer Progress Arc (Riesgo) */}
              <circle
                cx="80"
                cy="80"
                r={radiusOuter}
                stroke={riskColor}
                strokeWidth="10"
                strokeDasharray={circumferenceOuter}
                strokeDashoffset={riskOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 ease-out cursor-pointer hover:stroke-[12] hover:filter hover:drop-shadow-md"
                onClick={() => setShowRiskModal(true)}
              >
                <title>Toca para ver el detalle del índice preventivo ({riskScore ?? 'sin datos'}/100)</title>
              </circle>

              {/* 2. Inner Track (Confianza) */}
              <circle
                cx="80"
                cy="80"
                r={radiusInner}
                stroke="currentColor"
                strokeWidth="8.5"
                fill="transparent"
                className="text-slate-200/60 cursor-pointer hover:stroke-slate-300 transition-colors"
                onClick={() => setShowConfidenceModal(true)}
              />
              {/* 2. Inner Progress Arc (Confianza) */}
              <circle
                cx="80"
                cy="80"
                r={radiusInner}
                stroke={confidenceColor}
                strokeWidth="8.5"
                strokeDasharray={circumferenceInner}
                strokeDashoffset={confidenceOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 ease-out cursor-pointer hover:stroke-[10.5] hover:filter hover:drop-shadow-md"
                onClick={() => setShowConfidenceModal(true)}
              >
                <title>Toca para ver el detalle de confianza ({confidenceScore}/100)</title>
              </circle>
            </svg>

            {/* Center Content without overlap */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {riskScore == null ? '—' : riskScore}
              </span>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                Índice /100
              </span>

              <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-200/90">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: confidenceColor }}
                />
                <span className="text-[11px] font-bold text-[#004D6B] leading-none">
                  {confidenceScore}/100 conf.
                </span>
              </div>
            </div>
          </div>

          {/* Sutil micro-leyenda informativa */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
            <button
              type="button"
              onClick={() => setShowRiskModal(true)}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors group font-medium"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs group-hover:scale-110 transition-transform shrink-0"
                style={{ backgroundColor: riskColor }}
              />
              <span className="group-hover:underline">Anillo exterior: Riesgo</span>
            </button>

            <span className="text-slate-300">•</span>

            <button
              type="button"
              onClick={() => setShowConfidenceModal(true)}
              className="flex items-center gap-1.5 hover:text-[#004D6B] transition-colors group font-medium"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs group-hover:scale-110 transition-transform shrink-0"
                style={{ backgroundColor: confidenceColor }}
              />
              <span className="group-hover:underline">Anillo interior: Confianza</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. RECOMENDACIÓN PREVENTIVA SUGERIDA CON FEEDBACK ¿FUNCIONÓ? */}
      <section
        id="section-prioritized-recommendation"
        className="bg-white border border-[#99CAE8]/80 rounded-2xl p-4 shadow-2xs space-y-3"
      >
        {/* Header simple y limpio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-[#004D6B] tracking-tight">
              Recomendación sugerida
            </span>
          </div>

          <button
            id="btn-view-preventive-actions"
            type="button"
            onClick={onOpenPreventiveModal}
            className="text-xs font-bold text-[#004D6B] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver protocolo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Título y resumen conciso */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {data.preventiveAction.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.preventiveAction.summary}
          </p>
        </div>

        {/* Feedback interactivo simplificado: ¿Funcionó? */}
        <div
          id="block-recommendation-feedback"
          className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
        >
          <span className="text-xs font-bold text-slate-700">
            ¿Funcionó?
          </span>

          {!currentFeedback ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetFeedback('yes')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sí</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetFeedback('partial')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>Parcial</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetFeedback('no')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                <span>No</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {currentFeedback === 'yes' ? 'Registrado: Sí' : currentFeedback === 'partial' ? 'Registrado: Parcial' : 'Registrado: No'}
              </span>
              <button
                type="button"
                onClick={handleResetFeedback}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-700 underline cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. RESUMEN DE FACTORES DETECTADOS (MÁXIMO 3) */}
      <section id="section-key-factors" className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Factores detectados hoy ({data.factors.length})
          </h3>
          <button
            onClick={() => onNavigate('COMMON_02_ALERT_DETAIL')}
            className="text-xs font-bold text-[#004D6B] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver detalle</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {data.factors.slice(0, 3).map((factor) => {
            const isSleep = factor.iconType === 'sleep';
            const isReg = factor.iconType === 'regulation';
            const isRoutine = factor.iconType === 'routine';

            return (
              <div
                key={factor.id}
                id={`factor-card-${factor.id}`}
                onClick={() => onNavigate('COMMON_02_ALERT_DETAIL')}
                className="bg-white rounded-2xl p-3 border border-slate-200/90 hover:border-[#004D6B] transition-all shadow-2xs cursor-pointer active:scale-[0.99] group space-y-2"
              >
                {/* Cabecera del factor: Icono contextual + Título + Categoría */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSleep
                          ? 'bg-indigo-50 text-indigo-600'
                          : isReg
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-sky-50 text-[#004D6B]'
                      }`}
                    >
                      {isSleep && <Moon className="w-3.5 h-3.5" />}
                      {isReg && <TrendingDown className="w-3.5 h-3.5" />}
                      {isRoutine && <Building2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate group-hover:text-[#004D6B] transition-colors">
                        {factor.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded-md shrink-0">
                    {factor.categoryLabel}
                  </span>
                </div>

                {/* Comparación directa y limpia sin cajas anidadas pesadas */}
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Habitual: <span className="text-slate-600 font-semibold">{factor.baselineComparison.baselineValue}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {factor.baselineComparison.currentValue}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004D6B] transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mandatory Non-Diagnostic Footnote */}
      <footer id="disclaimer-today" className="pt-1 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Bluba Anticipa estima señales preventivas; no emite diagnósticos clínicos.
        </p>
      </footer>

      {/* Explanation Modals */}
      <RiskExplanationModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        riskLevel={data.riskLevel}
        riskScore={riskScore}
        riskHeadline={data.riskTextHeadline}
      />

      <ConfidenceExplanationModal
        isOpen={showConfidenceModal}
        onClose={() => setShowConfidenceModal(false)}
        confidenceLevel={data.confidenceLevel}
        confidenceScore={confidenceScore}
        confidenceHeadline={data.confidenceHeadline}
      />
    </div>
  );
};
