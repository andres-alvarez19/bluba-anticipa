import React from 'react';
import { X, ShieldCheck, CheckCircle2, Info, HelpCircle, Layers, FileCheck } from 'lucide-react';
import { ConfidenceLevel } from '../types';

interface ConfidenceExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  confidenceHeadline: string;
}

export const ConfidenceExplanationModal: React.FC<ConfidenceExplanationModalProps> = ({
  isOpen,
  onClose,
  confidenceLevel,
  confidenceScore,
  confidenceHeadline,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confidence-explanation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="confidence-explanation-modal-content"
        className="bg-white w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004D6B] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-400/20 text-sky-200 flex items-center justify-center border border-sky-300/30">
              <ShieldCheck className="w-5 h-5 text-[#99CAE8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                ¿Qué es el Nivel de Confianza?
              </h2>
              <span className="text-[10.5px] text-[#99CAE8] font-medium block">
                Completitud y solidez de los datos registrados
              </span>
            </div>
          </div>
          <button
            id="btn-close-confidence-explanation"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          {/* Current Status Pill */}
          <div className="bg-sky-50 border border-sky-200/90 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
                Nivel actual de datos
              </span>
              <span className="text-sm font-extrabold text-[#004D6B]">
                {confidenceHeadline} ({confidenceScore}%)
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004D6B]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#004D6B]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            </div>
          </div>

          {/* 1. ¿Qué representa? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Info className="w-4 h-4 text-[#004D6B]" />
              <h3>1. ¿Qué representa la confianza?</h3>
            </div>
            <p className="text-slate-600 pl-5">
              Indica <strong>cuánta certeza y respaldo informativo</strong> tiene la estimación. No mide la gravedad de Mateo, sino la cantidad y frescura de los reportes ingresados por la familia y la escuela.
            </p>
          </div>

          {/* 2. Variables consideradas */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Layers className="w-4 h-4 text-[#004D6B]" />
              <h3>2. Fuentes de información evaluadas</h3>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Registro de sueño familiar
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Confirmado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Estado matutino / despertar
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Confirmado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  Observación escolar del día
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Pendiente
                </span>
              </div>
            </div>
          </div>

          {/* 3. Escala de confianza */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900">3. Escala de confianza</h3>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0"></div>
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Baja (0 - 45%)</span>
                  <span className="text-slate-600 text-[10.5px]">Faltan datos esenciales. La estimación puede ser incompleta.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1 shrink-0"></div>
                <div>
                  <span className="font-bold text-[#004D6B] block text-[11px]">Media (46 - 75%)</span>
                  <span className="text-sky-800 text-[10.5px]">Datos suficientes para orientar acciones preventivas preliminares.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                <div>
                  <span className="font-bold text-emerald-950 block text-[11px]">Alta (76 - 100%)</span>
                  <span className="text-emerald-800 text-[10.5px]">Registros completos del hogar y la escuela en las últimas 24h.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Tip para mejorar confianza */}
          <div className="bg-slate-100 rounded-xl p-3 flex items-start gap-2 text-slate-700">
            <FileCheck className="w-4 h-4 text-[#004D6B] mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>¿Cómo aumentarla?</strong> Realizando el breve check-in matutino o enviando una nota de voz con el botón central <strong>Reportar</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={onClose}
            className="w-full h-10 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
