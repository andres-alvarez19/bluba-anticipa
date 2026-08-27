import React, { useState } from 'react';
import {
  ArrowLeft,
  BookmarkCheck,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
  UserCheck,
  History,
  Info,
  Calendar,
  Layers,
  FileText,
  X
} from 'lucide-react';
import { SpecialistStrategy, StrategyResultObserved } from '../types';
import { MATEO_STRATEGIES } from '../data/specialistStrategiesData';

interface StrategiesScreenProps {
  onBackToSummary: () => void;
  onNavigateToEvolution?: () => void;
}

const getResultBadge = (result: StrategyResultObserved) => {
  switch (result) {
    case 'Ayudó':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
      };
    case 'Ayudó parcialmente':
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        dot: 'bg-amber-500',
        icon: AlertCircle,
      };
    case 'Sin efecto':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        icon: HelpCircle,
      };
  }
};

export const StrategiesScreen: React.FC<StrategiesScreenProps> = ({
  onBackToSummary,
  onNavigateToEvolution,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<SpecialistStrategy | null>(null);

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Top Header & Back Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-summary-from-strategies"
            onClick={onBackToSummary}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Resumen</span>
          </button>

          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8] uppercase tracking-wider">
            ESP-05 • Intervenciones
          </span>
        </div>

        {/* Title Header */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
              <BookmarkCheck className="w-4 h-4 text-[#004D6B]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#004D6B] tracking-tight">
                Estrategias de Mateo
              </h1>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                Historial de apoyos utilizados y resultados registrados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conceptual Memory Banner */}
      <div className="bg-[#EAF6FC] border border-[#99CAE8]/70 rounded-2xl p-3 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-[#004D6B] font-bold text-[11px] uppercase tracking-wide">
          <History className="w-3.5 h-3.5 text-[#004D6B]" />
          <span>Memoria individual de intervenciones</span>
        </div>
        <p className="text-[11px] text-[#004D6B]/90 font-medium leading-relaxed">
          Recupera qué apoyos se han utilizado previamente para Mateo y su respuesta observada en cada entorno, complementando las guías generales.
        </p>
      </div>

      {/* Main List of Strategies */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Estrategias registradas ({MATEO_STRATEGIES.length})
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Toca para ver detalle e historial
          </span>
        </div>

        <div className="space-y-2.5">
          {MATEO_STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              id={`strategy-card-${strategy.id}`}
              onClick={() => setSelectedStrategy(strategy)}
              className="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-[#99CAE8] hover:shadow-xs transition-all space-y-2.5 group"
            >
              {/* Top row: Title + Arrow */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <h2 className="text-xs font-bold text-slate-900 group-hover:text-[#004D6B] transition-colors leading-snug">
                    {strategy.title}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {strategy.shortDescription}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 mt-0.5" />
              </div>

              {/* Metadata Badges (Origen, Contexto, Aplicada) */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {/* Origen */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {strategy.origin === 'Profesional' ? (
                    <UserCheck className="w-2.5 h-2.5 text-[#004D6B]" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  )}
                  <span>Origen: {strategy.origin}</span>
                </span>

                {/* Contexto */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  <Building2 className="w-2.5 h-2.5 text-slate-500" />
                  <span>Contexto: {strategy.context}</span>
                </span>

                {/* Aplicada */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF6FC] text-[#004D6B] border border-[#99CAE8] font-bold">
                  <span>Aplicada {strategy.timesApplied} veces</span>
                </span>
              </div>

              {/* Simple Observed Results Representation (NO complex statistical charts) */}
              <div className="pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Resultados:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {strategy.observedResultsSummary.map((res, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                        res.type === 'helped'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : res.type === 'partial'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          res.type === 'helped'
                            ? 'bg-emerald-500'
                            : res.type === 'partial'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{res.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL / SHEET: DETALLE DE ESTRATEGIA */}
      {selectedStrategy && (
        <div
          id="modal-strategy-detail"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2 bg-[#F7FAFC]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded-md border border-[#99CAE8] uppercase tracking-wider">
                  Detalle de estrategia
                </span>
                <h2 className="text-sm font-bold text-[#004D6B] pt-1">
                  {selectedStrategy.title}
                </h2>
              </div>
              <button
                id="btn-close-strategy-detail"
                onClick={() => setSelectedStrategy(null)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Descripción breve */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Descripción
                </span>
                <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedStrategy.shortDescription}
                </p>
              </div>

              {/* Origen y Contexto */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Origen
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {selectedStrategy.origin}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Contexto permitido
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {selectedStrategy.context}
                  </span>
                </div>
              </div>

              {/* Relación con situaciones anteriores */}
              {selectedStrategy.historyContextRelation && (
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-950 font-bold text-[10px] uppercase">
                    <Info className="w-3 h-3 text-sky-700" />
                    <span>Relación con situaciones previas</span>
                  </div>
                  <p className="text-[11px] text-sky-900 font-medium leading-relaxed">
                    «{selectedStrategy.historyContextRelation}»
                  </p>
                  <p className="text-[10px] text-slate-400 italic pt-0.5">
                    Registro de observación directa. No presupone causalidad universal.
                  </p>
                </div>
              )}

              {/* Historial cronológico de aplicaciones */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Historial cronológico ({selectedStrategy.applications.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Más reciente primero
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedStrategy.applications.map((app) => {
                    const badge = getResultBadge(app.result);
                    const ResultIcon = badge.icon;

                    return (
                      <div
                        key={app.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {app.dateLabel}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="font-semibold text-slate-600 text-[11px]">
                              Aplicada en {app.context.toLowerCase()}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.bg}`}
                          >
                            <ResultIcon className="w-2.5 h-2.5" />
                            <span>Resultado: {app.result}</span>
                          </span>
                        </div>

                        {app.contextDetail && (
                          <p className="text-[11px] text-slate-500 font-medium pl-0.5">
                            {app.contextDetail}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="w-full h-10 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation CTA */}
      <div className="pt-2 border-t border-slate-100">
        <button
          id="btn-return-to-summary"
          onClick={onBackToSummary}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <span>Volver al resumen preventivo de Mateo (ESP-02)</span>
        </button>
      </div>
    </div>
  );
};
