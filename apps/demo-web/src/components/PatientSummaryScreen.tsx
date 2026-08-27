import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Database,
  Layers,
  Calendar,
  Sparkles,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';
import { SpecialistPatient } from '../types';

interface PatientSummaryScreenProps {
  patient: SpecialistPatient;
  onBackToPatients: () => void;
  onNavigateToEvolution: () => void;
  onNavigateToFactors: () => void;
  onNavigateToStrategies?: () => void;
}

export const PatientSummaryScreen: React.FC<PatientSummaryScreenProps> = ({
  patient,
  onBackToPatients,
  onNavigateToEvolution,
  onNavigateToFactors,
  onNavigateToStrategies,
}) => {

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Top Header & Back Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-patients"
            onClick={onBackToPatients}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Pacientes</span>
          </button>

          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8] uppercase tracking-wider">
            ESP-02 • Resumen
          </span>
        </div>

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-xs ring-1 ring-[#99CAE8]/40">
              {patient.initials}
            </div>
            <div>
              <h1 className="text-base font-bold text-[#004D6B] leading-tight">
                {patient.name}
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">
                {patient.age} • Monitoreo preventivo
              </span>
            </div>
          </div>

          <div className="text-right text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Última actualización: {patient.updatedTime}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {/* TWO INDEPENDENT MODULES: RISK INDEX & CONFIDENCE */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* MÓDULO 1: Índice de riesgo */}
          <div
            id="module-risk-index"
            className="bg-white rounded-2xl p-3.5 border border-rose-200/90 shadow-2xs flex flex-col justify-between space-y-2 bg-gradient-to-b from-rose-50/30 to-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                Índice de riesgo
              </span>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {patient.riskLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-1 py-0.5">
              <span className="text-2xl font-black text-rose-700 tracking-tight">
                {patient.riskScore ?? '—'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>

            {/* Mandatory Disclaimer */}
            <p className="text-[10px] text-slate-500 font-medium leading-tight pt-1 border-t border-rose-100">
              Índice de riesgo. No equivale a probabilidad clínica.
            </p>
          </div>

          {/* MÓDULO 2: Confianza */}
          <div
            id="module-confidence-level"
            className="bg-white rounded-2xl p-3.5 border border-sky-200/90 shadow-2xs flex flex-col justify-between space-y-2 bg-gradient-to-b from-sky-50/30 to-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                Confianza
              </span>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                {patient.confidenceLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-1 py-0.5">
              <span className="text-2xl font-black text-sky-800 tracking-tight">
                {patient.confidenceScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>

            <p className="text-[10px] text-slate-500 font-medium leading-tight pt-1 border-t border-sky-100">
              Basada en regularidad de fuentes y densidad de datos.
            </p>
          </div>
        </div>

        {/* SECCIÓN: Principales factores */}
        <section
          id="section-primary-factors"
          className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5"
        >
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <div className="w-4 h-4 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Principales factores
            </h2>
          </div>

          <ul className="space-y-1.5">
            {patient.primaryFactors.map((factor, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs font-medium text-slate-700 leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECCIÓN: Calidad de datos */}
        <section
          id="section-data-quality"
          className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5"
        >
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <div className="w-4 h-4 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Database className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Calidad de datos
            </h2>
          </div>

          <div className="space-y-2">
            {patient.dataQuality.map((item, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                  item.isMissing
                    ? 'bg-amber-50/60 border-amber-200/80 text-amber-900'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{item.source}</span>
                  {item.isMissing && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded">
                      Faltante
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-right">
                  <span className={`text-[11px] font-semibold ${item.isMissing ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN: Baseline */}
        <section
          id="section-baseline-status"
          className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Layers className="w-3 h-3" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                Baseline
              </h2>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                patient.baselineStatus.state === 'AVAILABLE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {patient.baselineStatus.label}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Ventana calibrada con registros continuos de sueño, regulación matutina y estabilidad ambiental.
          </p>
        </section>
      </div>

      {/* CTAs */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        {/* CTA 1: Ver evolución */}
        <button
          id="btn-view-evolution"
          onClick={onNavigateToEvolution}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <TrendingUp className="w-4 h-4 text-[#99CAE8]" />
          <span>Ver evolución</span>
        </button>

        {/* CTA 2 (secundario): Ver factores y fuentes */}
        <button
          id="btn-view-factors-sources"
          onClick={onNavigateToFactors}
          className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-200"
        >
          <span>Ver factores y fuentes</span>
        </button>

        {/* CTA 3: Ver estrategias de Mateo (ESP-05) */}
        {onNavigateToStrategies && (
          <button
            id="btn-view-strategies-from-summary"
            onClick={onNavigateToStrategies}
            className="w-full h-9 bg-[#EAF6FC] hover:bg-[#d5edf8] active:scale-[0.99] text-[#004D6B] font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#99CAE8]"
          >
            <span>Ver historial de estrategias (ESP-05)</span>
          </button>
        )}
      </div>
    </div>
  );
};
