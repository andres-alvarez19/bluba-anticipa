import React from 'react';
import { X, AlertTriangle, Shield, CheckCircle2, Info, Lightbulb, HeartHandshake } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskLevel: RiskLevel;
  riskScore: number;
  riskHeadline: string;
}

export const RiskExplanationModal: React.FC<RiskExplanationModalProps> = ({
  isOpen,
  onClose,
  riskLevel,
  riskScore,
  riskHeadline,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="risk-explanation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="risk-explanation-modal-content"
        className="bg-white w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004D6B] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                ¿Qué es el Riesgo Preventivo?
              </h2>
              <span className="text-[10.5px] text-[#99CAE8] font-medium block">
                Guía de interpretación para la familia
              </span>
            </div>
          </div>
          <button
            id="btn-close-risk-explanation"
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
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Nivel actual estimado
              </span>
              <span className="text-sm font-extrabold text-amber-950">
                {riskHeadline} ({riskScore}%)
              </span>
            </div>
            <span className="px-2.5 py-1 bg-amber-200/80 text-amber-950 font-bold text-[11px] rounded-lg">
              Próximas 24h
            </span>
          </div>

          {/* 1. ¿Qué significa? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h3>1. ¿Qué significa este valor?</h3>
            </div>
            <p className="text-slate-600 pl-5">
              Es un <strong>indicador anticipatorio</strong> que estima la probabilidad de que Mateo experimente sobrecarga sensorial o emocional durante la jornada, comparando sus patrones recientes con su línea base habitual.
            </p>
          </div>

          {/* 2. ¿Cómo se calcula? */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Shield className="w-4 h-4 text-[#004D6B]" />
              <h3>2. ¿Cómo se calcula?</h3>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-200/80 pl-3">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004D6B] mt-1.5 shrink-0"></span>
                <span><strong>Acumulación de fatiga:</strong> Calidad y horas de sueño de los últimos 3 días.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004D6B] mt-1.5 shrink-0"></span>
                <span><strong>Desviación al despertar:</strong> Nivel de reactividad o irritabilidad matutina.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004D6B] mt-1.5 shrink-0"></span>
                <span><strong>Contexto ambiental:</strong> Cambios de rutina escolar, eventos ruidosos o transiciones.</span>
              </div>
            </div>
          </div>

          {/* 3. Niveles de Riesgo */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900">3. Escala de niveles</h3>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                <div>
                  <span className="font-bold text-emerald-950 block text-[11px]">Bajo (0 - 35%)</span>
                  <span className="text-emerald-800 text-[10.5px]">Patrones estables. Rutina habitual sin adaptaciones especiales.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                <div>
                  <span className="font-bold text-amber-950 block text-[11px]">Moderado (36 - 69%)</span>
                  <span className="text-amber-800 text-[10.5px]">Fatiga o estímulos acumulados. Conviene anticipar transiciones.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></div>
                <div>
                  <span className="font-bold text-rose-950 block text-[11px]">Elevado (70 - 100%)</span>
                  <span className="text-rose-800 text-[10.5px]">Alta probabilidad de desregulación. Aplicar protocolo preventivo temprano.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Aclaración clave */}
          <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 flex items-start gap-2 text-sky-950">
            <HeartHandshake className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Importante:</strong> Un riesgo elevado no es un diagnóstico ni una certeza de crisis; es una oportunidad para brindarle a Mateo el apoyo necesario antes de que se sobrecargue.
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
