import React from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Layers,
  TrendingDown,
  Compass,
  Clock,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ChildState, ActiveScreen, FactorItem } from '../types';

interface AlertDetailScreenProps {
  data: ChildState;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenPreventiveModal: () => void;
}

export const AlertDetailScreen: React.FC<AlertDetailScreenProps> = ({
  data,
  onNavigate,
  onOpenPreventiveModal,
}) => {
  return (
    <div className="min-h-full bg-slate-50">
      {/* Screen Navigation Header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200/90 sticky top-0 z-20 flex items-center justify-between">
        <button
          id="btn-back-to-today"
          onClick={() => onNavigate('FAM_01_TODAY')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0F294D] transition-colors py-1 px-1 -ml-1 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Volver a Inicio</span>
        </button>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Detalle de Alerta
        </span>
      </div>

      <div className="px-5 py-4 space-y-4 pb-12">
        {/* Title Header */}
        <div>
          <h1 className="text-lg font-bold text-[#0F294D] leading-tight">
            ¿Por qué se genera esta alerta?
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explicación basada en la comparación con el patrón habitual de Mateo.
          </p>
        </div>

        {/* 1. SUMMARY STRIP (Riesgo, Horizonte, Confianza, Actualización) */}
        <section
          id="block-alert-summary-strip"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {/* Riesgo */}
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Nivel de Riesgo</span>
              </div>
              <div className="text-sm font-bold text-amber-950">
                {data.riskTextHeadline}
              </div>
              <span className="text-[10px] text-amber-900/80 mt-0.5 block">
                Atención preventiva sugerida
              </span>
            </div>

            {/* Confianza (Strictly Independent) */}
            <div className="bg-sky-50/80 border border-sky-200/70 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-800 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                <span>Nivel de Confianza</span>
              </div>
              <div className="text-sm font-bold text-sky-950">
                {data.confidenceHeadline}
              </div>
              <span className="text-[10px] text-sky-900/80 mt-0.5 block">
                2 de 3 variables registradas
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Horizonte: <strong className="text-slate-700 font-semibold">{data.horizonText}</strong></span>
            </div>
            <span className="text-[11px] text-slate-400">
              Actualizado: {data.lastUpdated}
            </span>
          </div>
        </section>

        {/* 2. BLOCK: ¿QUÉ ESTÁ INFLUYENDO? (3 Factor Cards: Acumulación, Desviación, Contexto) */}
        <section id="block-influencing-factors" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ¿Qué está influyendo?
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              3 factores detectados
            </span>
          </div>

          <div className="space-y-3">
            {data.factors.map((factor) => {
              const isAcumulacion = factor.category === 'ACUMULACION';
              const isDesviacion = factor.category === 'DESVIACION';
              const isContexto = factor.category === 'CONTEXTO';

              return (
                <div
                  key={factor.id}
                  id={`detail-factor-${factor.id}`}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                >
                  {/* Header of Factor Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAcumulacion
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : isDesviacion
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {factor.categoryLabel}
                        </span>
                        {factor.trendDetail && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {factor.trendDetail}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {factor.title}
                      </h3>
                    </div>
                  </div>

                  {/* Visual Baseline Comparison Box */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="border-r border-slate-200 pr-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                          {factor.baselineComparison.baselineLabel}
                        </span>
                        <p className="font-bold text-slate-800 text-xs">
                          {factor.baselineComparison.baselineValue}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                          {factor.baselineComparison.currentLabel}
                        </span>
                        <p className="font-bold text-amber-900 text-xs">
                          {factor.baselineComparison.currentValue}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Impact Explanation */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {factor.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. MISSING DATA IMPACT NOTE */}
        <section id="block-missing-impact" className="bg-white rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Impacto del dato pendiente</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Falta la regulación del colegio de hoy. Este dato completará la confianza a <strong>Alta</strong> una vez que el equipo escolar registre la tarde, pero no disminuye la pertinencia de las medidas preventivas actuales.
          </p>
        </section>

        {/* 4. ACTIONS LINK */}
        <div className="pt-1">
          <button
            id="btn-alert-detail-action"
            onClick={onOpenPreventiveModal}
            className="w-full h-11 bg-[#0F294D] hover:bg-[#163866] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>Ver protocolo de acción preventiva</span>
          </button>
        </div>

        {/* 5. MANDATORY NON-DIAGNOSTIC DISCLAIMER (Rule 4: El producto NO diagnostica) */}
        <footer
          id="disclaimer-non-diagnostic"
          className="pt-2 text-center"
        >
          <div className="bg-slate-100/90 rounded-xl p-3 border border-slate-200/80">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Esta es una estimación preventiva basada en los registros disponibles. No corresponde a un diagnóstico ni a una certeza clínica.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
