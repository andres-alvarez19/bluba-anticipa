import React, { useState } from 'react';
import {
  FileQuestion,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { ChildState, ActiveScreen } from '../types';

interface InsufficientInfoScreenProps {
  data: ChildState;
  onNavigate: (screen: ActiveScreen) => void;
  onCompleteInfo: () => void;
}

export const InsufficientInfoScreen: React.FC<InsufficientInfoScreenProps> = ({
  data,
  onNavigate,
  onCompleteInfo
}) => {
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [sleepHours, setSleepHours] = useState('5.9');
  const [wakeMood, setWakeMood] = useState('Irritable / Difícil');

  const handleSaveData = () => {
    setShowQuickForm(false);
    onCompleteInfo();
  };

  return (
    <div className="px-5 py-4 space-y-5 pb-12">
      {/* 1. CALM HERO STATE (Not an error, dignified and serene) */}
      <section
        id="block-insufficient-info-hero"
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center space-y-3.5"
      >
        <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center mx-auto border border-sky-100/80">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-1.5 max-w-xs mx-auto">
          <h2 className="text-base font-bold text-[#0F294D] leading-snug">
            Necesitamos un poco más de información
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Todavía no contamos con suficientes datos para generar una estimación confiable.
          </p>
        </div>

        {/* Rule 2 & Principle Badge: No risk score shown, calm explanation */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 text-left space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Principio de Estimación Segura</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Para comparar a Mateo consigo mismo y evitar falsas alertas o falsas tranquilidades, requerimos al menos 2 registros diarios clave.
          </p>
        </div>
      </section>

      {/* 2. SECTION: DATOS PRIORITARIOS FALTANTES */}
      <section id="section-missing-priority-data" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Datos prioritarios faltantes
          </h3>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            2 registros pendientes
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Card 1: Calidad del sueño */}
          <div
            id="missing-item-sleep"
            className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Moon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Calidad y horas de sueño
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Necesario para evaluar el umbral de descanso respecto a su baseline (7,8 h).
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider">
              Pendiente
            </span>
          </div>

          {/* Card 2: Estado al despertar */}
          <div
            id="missing-item-wake"
            className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Sun className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Estado al despertar
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Evalúa la reactividad inicial y tono de regulación matutino.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider">
              Pendiente
            </span>
          </div>
        </div>
      </section>

      {/* 3. CTA: COMPLETAR INFORMACIÓN */}
      <section id="section-complete-cta" className="pt-1">
        <button
          id="btn-complete-info"
          onClick={() => setShowQuickForm(true)}
          className="w-full h-12 bg-[#0F294D] hover:bg-[#163866] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4 text-sky-300" />
          <span>Completar información</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-2">
          Toma menos de 30 segundos registrar estos 2 datos
        </p>
      </section>

      {/* Quick Completion Sheet / Modal */}
      {showQuickForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            id="modal-quick-complete"
            className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0F294D]">
                Registro Rápido de Mateo
              </h3>
              <button
                onClick={() => setShowQuickForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Field 1: Sleep */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Horas de sueño anoche:</span>
                  <span className="text-[11px] text-slate-400">(Baseline: 7,8 h)</span>
                </label>
                <select
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="5.9">5,9 h (Déficit acumulado)</option>
                  <option value="6.5">6,5 h</option>
                  <option value="7.8">7,8 h (Habitual)</option>
                  <option value="8.5">8,5 h (Reparador)</option>
                </select>
              </div>

              {/* Field 2: Wake mood */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Estado al despertar:</span>
                  <span className="text-[11px] text-slate-400">(Baseline: Tranquilo)</span>
                </label>
                <select
                  value={wakeMood}
                  onChange={(e) => setWakeMood(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Irritable / Difícil">Descendente / Menor regulación</option>
                  <option value="Tranquilo">Tranquilo (Habitual)</option>
                  <option value="Con energía">Con energía positiva</option>
                </select>
              </div>

              <div className="bg-sky-50 p-2.5 rounded-lg text-[11px] text-sky-900">
                Al guardar, el modelo recalculará el estado contrastando con el historial de Mateo R.
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                id="btn-confirm-save-data"
                onClick={handleSaveData}
                className="flex-1 h-10 bg-[#0F294D] hover:bg-sky-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Guardar y estimar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
