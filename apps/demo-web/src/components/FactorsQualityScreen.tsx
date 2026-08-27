import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileQuestion,
  Clock,
  Sparkles,
  User,
  Cpu,
  CheckCircle2,
  Database,
  Layers,
  Info,
  TrendingDown
} from 'lucide-react';
import { EvidenceNature } from '../types';
import {
  MATEO_FACTORS_RANKING,
  MATEO_TIMELINE_SOURCES
} from '../data/specialistAnalyticsData';

interface FactorsQualityScreenProps {
  onBackToSummary: () => void;
  onNavigateToEvolution: () => void;
  onNavigateToStrategies?: () => void;
}

export const FactorsQualityScreen: React.FC<FactorsQualityScreenProps> = ({
  onBackToSummary,
  onNavigateToEvolution,
  onNavigateToStrategies,
}) => {
  // State for expanded factor cards (allow expanding/collapsing to inspect minimal evidence)
  const [expandedFactorIds, setExpandedFactorIds] = useState<Record<string, boolean>>({
    'fact-1': true, // First one open by default
  });

  const toggleFactorExpand = (id: string) => {
    setExpandedFactorIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getEvidenceBadge = (nature: EvidenceNature, label: string) => {
    switch (nature) {
      case 'PERSON_RECORDED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <User className="w-2.5 h-2.5 text-emerald-700" />
            <span>{label}</span>
          </span>
        );
      case 'AI_STRUCTURED_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-2.5 h-2.5 text-indigo-700" />
            <span>{label}</span>
          </span>
        );
      case 'SYSTEM_INFERENCE':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
            <Cpu className="w-2.5 h-2.5 text-sky-700" />
            <span>{label}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Top Header & Back Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-summary-from-factors"
            onClick={onBackToSummary}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Resumen</span>
          </button>

          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8] uppercase tracking-wider">
            ESP-04 • Factores
          </span>
        </div>

        {/* Title Header */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
          <h1 className="text-base font-bold text-[#004D6B] tracking-tight">
            Qué explica esta estimación
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Jerarquía de factores explicativos, evidencia contrastada y trazabilidad de fuentes
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {/* SECCIÓN 1: RANKING DE FACTORES */}
        <section id="section-ranking-factors" className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center">
                #
              </span>
              <span>Factores ordenados por peso</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">
              Toca para ver evidencia
            </span>
          </div>

          <div className="space-y-2">
            {MATEO_FACTORS_RANKING.map((factor) => {
              const isExpanded = !!expandedFactorIds[factor.id];

              return (
                <div
                  key={factor.id}
                  id={`factor-card-${factor.id}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Clickable Header / Card Summary */}
                  <button
                    onClick={() => toggleFactorExpand(factor.id)}
                    className="w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0F294D] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                          {factor.rank}
                        </span>

                        <h3 className="text-xs font-bold text-slate-900 leading-snug">
                          {factor.title}
                        </h3>
                      </div>

                      {/* Tag & Baseline preview */}
                      <div className="flex items-center gap-2 pl-7">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${factor.tagColor}`}
                        >
                          {factor.tag}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {factor.baselineComparison}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-400 p-1 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Minimal Evidence Area */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/60 space-y-2 pl-10 pr-3 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Baseline habitual
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-800">
                            {factor.details.baselineValue}
                          </span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Periodo reciente
                          </span>
                          <span className="text-[11px] font-extrabold text-rose-700">
                            {factor.details.recentValue}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-white p-2 rounded-xl border border-slate-200/60">
                        {factor.details.note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN 2: INFORMACIÓN FALTANTE */}
        <section id="section-missing-info" className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileQuestion className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Información faltante
            </h2>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">
                Regulación escolar de hoy
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
                Pendiente de registro
              </span>
            </div>

            <p className="text-xs font-bold text-amber-900 leading-snug">
              Este dato reduce la confianza de la estimación.
            </p>

            <p className="text-[11px] text-amber-800/80 font-medium leading-relaxed pt-0.5">
              Sin la observación del bloque matutino escolar, el modelo pondera con mayor peso los registros del hogar y antecedentes longitudinales.
            </p>
          </div>
        </section>

        {/* SECCIÓN 3: FUENTES RECIENTES (TIMELINE & DISTINCIÓN DE EVIDENCIA) */}
        <section id="section-recent-sources" className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Database className="w-3 h-3" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Fuentes recientes
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Trazabilidad
            </span>
          </div>

          {/* Evidence Nature Legend */}
          <div className="grid grid-cols-1 gap-1 text-[10px] bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-600">
            <span className="font-bold text-slate-700 mb-0.5">
              Tipos de evidencia auditables:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Dato registrado por persona (sin transformación)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span>Dato estructurado mediante IA y confirmado por usuario</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <span>Inferencia calculada por sistema (algoritmo predictivo)</span>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-2">
            {MATEO_TIMELINE_SOURCES.map((item) => (
              <div
                key={item.id}
                id={`source-item-${item.id}`}
                className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0F294D]">
                      {item.timeLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      · {item.actor} ·
                    </span>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[140px]">
                      {item.actionLabel}
                    </span>
                  </div>
                </div>

                {/* Explicit Evidence Badge */}
                <div className="pt-0.5">
                  {getEvidenceBadge(item.evidenceNature, item.evidenceLabel)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Nav Actions */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-nav-to-evolution-from-factors"
            onClick={onNavigateToEvolution}
            className="h-10 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-200"
          >
            <TrendingDown className="w-3.5 h-3.5 text-slate-600" />
            <span>Ver evolución (ESP-03)</span>
          </button>

          <button
            id="btn-nav-back-to-summary"
            onClick={onBackToSummary}
            className="h-10 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span>Volver al resumen (ESP-02)</span>
          </button>
        </div>

        {onNavigateToStrategies && (
          <button
            id="btn-nav-to-strategies-from-factors"
            onClick={onNavigateToStrategies}
            className="w-full h-9 bg-[#EAF6FC] hover:bg-[#d5edf8] active:scale-[0.99] text-[#004D6B] font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#99CAE8]"
          >
            <span>Ver historial de intervenciones (ESP-05)</span>
          </button>
        )}
      </div>
    </div>
  );
};
