import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { PreventiveAction } from '../types';

interface PreventiveActionsModalProps {
  action: PreventiveAction;
  onClose: () => void;
}

export const PreventiveActionsModal: React.FC<PreventiveActionsModalProps> = ({
  action,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        id="modal-preventive-protocol"
        className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {action.badgeText}
            </span>
            <h2 className="text-base font-bold text-[#0F294D] leading-snug">
              {action.title}
            </h2>
          </div>
          <button
            id="btn-close-preventive-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pasos preventivos sugeridos
          </h3>

          <div className="space-y-2.5">
            {action.steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-3 border border-slate-150 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-[#0F294D] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Context / Evidence box */}
        <div className="bg-sky-50/70 rounded-xl p-3.5 border border-sky-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
            <BookOpen className="w-3.5 h-3.5 text-sky-700" />
            <span>Evidencia del historial de Mateo</span>
          </div>
          <p className="text-[11px] text-sky-900 leading-relaxed">
            {action.tipsForCaregiver}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            id="btn-dismiss-modal"
            onClick={onClose}
            className="w-full h-11 bg-[#0F294D] hover:bg-sky-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Entendido, aplicar hoy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
