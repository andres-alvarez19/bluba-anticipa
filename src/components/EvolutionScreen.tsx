import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Moon,
  Activity,
  SunMedium,
  TrendingDown,
  Layers,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Info,
  ShieldAlert
} from 'lucide-react';
import { TimeWindow } from '../types';
import {
  MATEO_LONGITUDINAL_DATA,
  MATEO_ACCUMULATIONS
} from '../data/specialistAnalyticsData';

interface EvolutionScreenProps {
  onBackToSummary: () => void;
  onNavigateToFactors: () => void;
  onNavigateToStrategies?: () => void;
}

export const EvolutionScreen: React.FC<EvolutionScreenProps> = ({
  onBackToSummary,
  onNavigateToFactors,
  onNavigateToStrategies,
}) => {
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow>('72h');
  const metrics = MATEO_LONGITUDINAL_DATA[selectedWindow];

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Top Header & Back Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-summary"
            onClick={onBackToSummary}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Resumen</span>
          </button>

          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8] uppercase tracking-wider">
            ESP-03 • Evolución
          </span>
        </div>

        {/* Title Header */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-[#004D6B] tracking-tight">
              Evolución de Mateo
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Comparación de ventana reciente vs. baseline individual (14 días)
            </p>
          </div>

          {/* Time window selector */}
          <div
            id="time-window-selector"
            className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shrink-0"
          >
            {(['24h', '72h', '7d'] as TimeWindow[]).map((win) => (
              <button
                key={win}
                id={`btn-window-${win}`}
                onClick={() => setSelectedWindow(win)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  selectedWindow === win
                    ? 'bg-[#004D6B] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {win === '24h' ? '24 h' : win === '72h' ? '72 h' : '7 días'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Longitudinal Comparison */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {/* Visual Notice: Pattern over snapshot */}
        <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200/80 flex items-start gap-2 text-xs">
          <Info className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            El riesgo actual responde a la <strong className="text-slate-800 font-bold">acumulación temporal de 3 días</strong>, no únicamente a un evento puntual aislado de hoy.
          </p>
        </div>

        {/* COMPARISON CARDS (VARIABLES PRINCIPALES) */}
        <div className="space-y-2.5">
          {/* VARIABLE 1: SUEÑO */}
          <div
            id="var-card-sleep"
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3"
          >
            {/* Header: Title + Baseline Ref */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Sueño nocturno</span>
              </div>

              {/* Explicit Baseline Reference Pill */}
              <div className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                <span>Baseline:</span>
                <span className="text-[#0F294D] font-extrabold">{metrics.sleepBaseline} h</span>
              </div>
            </div>

            {/* Mobile-adapted baseline comparison bars */}
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500 font-medium flex justify-between">
                <span>Registro por noche</span>
                <span className="text-rose-700 font-bold">
                  Déficit promedio: {(metrics.sleepBaseline - metrics.sleepRecentAvg).toFixed(1)} h/noche
                </span>
              </div>

              {/* Bar items with baseline dashed reference */}
              <div className="space-y-2 relative pt-1">
                {metrics.sleepRecentDays.map((day, idx) => {
                  const maxHours = 9;
                  const barWidthPercent = Math.min(100, (day.value / maxHours) * 100);
                  const baselinePercent = (metrics.sleepBaseline / maxHours) * 100;
                  const isBelow = day.value < metrics.sleepBaseline;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{day.dayLabel}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900">{day.value} h</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isBelow ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {day.diffHours > 0 ? `+${day.diffHours} h` : `${day.diffHours} h`}
                          </span>
                        </div>
                      </div>

                      {/* Bar Track with Baseline Line */}
                      <div className="h-2.5 w-full bg-slate-100 rounded-full relative overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isBelow ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${barWidthPercent}%` }}
                        />
                        {/* Baseline reference marker line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-700/80 z-10"
                          style={{ left: `${baselinePercent}%` }}
                          title={`Baseline: ${metrics.sleepBaseline}h`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Baseline legend */}
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 pt-0.5">
                <span className="w-2 h-0.5 bg-slate-700 rounded-full inline-block" />
                <span>Línea de referencia baseline individual ({metrics.sleepBaseline} h)</span>
              </div>
            </div>
          </div>

          {/* VARIABLE 2: REGULACIÓN */}
          <div
            id="var-card-regulation"
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Regulación</span>
              </div>

              <div className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                <span>Baseline:</span>
                <span className="text-[#0F294D] font-extrabold">{metrics.regulationBaseline} pts (Estable)</span>
              </div>
            </div>

            {/* Values progression */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {metrics.regulationRecentDays.map((reg, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-2 border border-slate-200/70 text-center space-y-0.5"
                >
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    {reg.dayLabel}
                  </span>
                  <span className="text-sm font-black text-rose-700">
                    {reg.value}
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </span>
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded block truncate">
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-600 font-medium">
              Regulación actual <strong className="text-rose-700 font-bold">28 % inferior a su baseline</strong>, con 2 días consecutivos de descenso.
            </p>
          </div>

          {/* VARIABLE 3: ESTADO AL DESPERTAR */}
          <div
            id="var-card-wakeup"
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center">
                  <SunMedium className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Estado al despertar</span>
              </div>

              <span className="text-[10px] font-semibold text-slate-500">
                Habitual: Tranquilo
              </span>
            </div>

            <div className="space-y-1.5">
              {metrics.wakeupRecentDays.map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-medium text-slate-600">{w.dayLabel}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      w.state === 'alert'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : w.state === 'warning'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {w.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN: ACUMULACIONES DETECTADAS */}
        <section id="section-accumulations" className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-rose-50 text-rose-700 flex items-center justify-center">
                <Layers className="w-3 h-3" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Acumulaciones detectadas
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Persistencia temporal
            </span>
          </div>

          <div className="space-y-2">
            {MATEO_ACCUMULATIONS.map((acc) => (
              <div
                key={acc.id}
                id={`acc-card-${acc.id}`}
                className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between"
              >
                <div className="space-y-0.5 max-w-[220px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {acc.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">
                    {acc.description}
                  </p>
                </div>

                {/* Duration Badge */}
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black border ${
                      acc.severity === 'high'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    {acc.durationLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA Buttons */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        <button
          id="btn-nav-to-factors"
          onClick={onNavigateToFactors}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>Ver factores y calidad de datos (ESP-04)</span>
          <ChevronRight className="w-4 h-4 text-[#99CAE8]" />
        </button>

        {onNavigateToStrategies && (
          <button
            id="btn-nav-to-strategies-from-evolution"
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
