import React from 'react';
import { ArrowRight, Bell, Sparkles, CheckSquare, History } from 'lucide-react';

interface CycleIndicatorProps {
  activeStep: 'ALERTA' | 'ACCION' | 'RESULTADO' | 'HISTORIAL';
}

const STEPS: { key: 'ALERTA' | 'ACCION' | 'RESULTADO' | 'HISTORIAL'; label: string; icon: any }[] = [
  { key: 'ALERTA', label: 'Alerta', icon: Bell },
  { key: 'ACCION', label: 'Acción', icon: Sparkles },
  { key: 'RESULTADO', label: 'Resultado', icon: CheckSquare },
  { key: 'HISTORIAL', label: 'Historial', icon: History },
];

export const CycleIndicator: React.FC<CycleIndicatorProps> = ({ activeStep }) => {
  return (
    <div className="bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isActive = step.key === activeStep;
          const isPassed =
            (activeStep === 'ACCION' && step.key === 'ALERTA') ||
            (activeStep === 'RESULTADO' && (step.key === 'ALERTA' || step.key === 'ACCION')) ||
            (activeStep === 'HISTORIAL' && step.key !== 'HISTORIAL');

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#0F294D] text-white shadow-xs'
                      : isPassed
                      ? 'bg-slate-100 text-slate-700 font-semibold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
