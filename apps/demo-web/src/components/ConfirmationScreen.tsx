import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Cloud
} from 'lucide-react';
import { ExtractedVariables, SaveStatus } from '../types';
import { EditVariableSheet, EditableFieldKey } from './EditVariableSheet';

interface ConfirmationScreenProps {
  variables: ExtractedVariables;
  onUpdateVariable: (key: EditableFieldKey, value: any) => void;
  onBackToObservation: () => void;
  onConfirmAndSave: () => void;
  isErrorState?: boolean;
  onRetryExtraction: () => void;
  saveStatus: SaveStatus;
  onResetToNewCheckIn: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  variables,
  onUpdateVariable,
  onBackToObservation,
  onConfirmAndSave,
  isErrorState = false,
  onRetryExtraction,
  saveStatus,
  onResetToNewCheckIn,
}) => {
  const [activeEditField, setActiveEditField] = useState<EditableFieldKey | null>(null);

  // If currently displaying post-confirmation saved state
  if (saveStatus.isSaved) {
    return (
      <div className="flex flex-col h-full justify-between px-5 py-6 space-y-5 animate-in fade-in duration-200">
        <div className="space-y-4 my-auto text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[#004D6B]">
              Registro guardado
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Las variables confirmadas para Mateo R. quedaron almacenadas en su historial.
            </p>
          </div>

          <div className="bg-[#EAF6FC] border border-[#99CAE8]/70 rounded-2xl p-4 text-left space-y-2 max-w-xs mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#99CAE8]/50 text-[#004D6B] flex items-center justify-center shrink-0">
                {saveStatus.updateCompleted ? (
                  <Check className="w-3.5 h-3.5 text-[#004D6B]" />
                ) : (
                  <RefreshCw className="w-3 h-3 text-[#004D6B] animate-spin" />
                )}
              </div>
              <span className="text-xs font-bold text-[#004D6B]">
                {saveStatus.updateCompleted
                  ? 'Estado preventivo actualizado'
                  : 'Actualizando el estado preventivo…'}
              </span>
            </div>

            <p className="text-[11px] text-[#004D6B]/85 leading-relaxed">
              {saveStatus.updateCompleted
                ? 'El modelo ha recalculado las desviaciones y acumulación respecto a su baseline.'
                : 'El motor analítico recalcula en segundo plano sin retrasar el almacenamiento del registro.'}
            </p>

            <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between border-t border-[#99CAE8]/40">
              <span>Guardado: {saveStatus.savedTimestamp || '08:45 AM'}</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>Sincronizado</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            id="btn-new-checkin"
            onClick={onResetToNewCheckIn}
            className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-[#99CAE8]" />
            <span>Hacer otro registro</span>
          </button>
        </div>
      </div>
    );
  }

  // If Error Variant: "No pudimos interpretar esta observación"
  if (isErrorState) {
    return (
      <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-4 animate-in fade-in duration-200">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
            Atención • Estado alternativo
          </span>
          <h1 className="text-xl font-bold text-[#004D6B] tracking-tight pt-1">
            No pudimos interpretar esta observación
          </h1>
          <p className="text-xs text-slate-500">
            La IA no detectó suficientes variables estructuradas, pero puedes corregirlo fácilmente.
          </p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 text-center space-y-3 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-950">
              La falla de IA nunca bloquea tu registro
            </h2>
            <p className="text-xs text-amber-900/80 leading-relaxed max-w-xs mx-auto">
              Puedes reintentar el procesamiento con otro texto o asignar las variables manualmente con un par de toques.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100">
          <button
            id="btn-retry-extraction"
            onClick={onRetryExtraction}
            className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-[#99CAE8]" />
            <span>Intentar nuevamente</span>
          </button>

          <button
            id="btn-manual-edit-variables"
            onClick={() => onRetryExtraction()}
            className="w-full h-10 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Registrar manualmente</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal CAP-02 Confirmation & Review Screen
  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-4">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Paso 3 de 3 • CAP-02</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Control de usuario
          </span>
        </div>

        <h1 className="text-xl font-bold text-[#004D6B] tracking-tight pt-1">
          Esto es lo que entendimos
        </h1>
        <p className="text-xs text-slate-500">
          Revísalo antes de guardarlo. Toca cualquier variable si deseas corregirla.
        </p>
      </div>

      {/* Main Extracted Variables List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        <div className="bg-[#EAF6FC] border border-[#99CAE8]/70 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#99CAE8]/60 text-[#004D6B] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#004D6B]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#004D6B]">
                Interpretados automáticamente
              </p>
              <p className="text-[10px] text-[#004D6B]/80">
                La IA no guarda nada sin tu confirmación
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#004D6B] bg-white px-2 py-0.5 rounded-md border border-[#99CAE8]/60">
            Editable
          </span>
        </div>

        {/* 4 Editable Variable Cards */}
        <div className="space-y-2">
          {/* Card 1: Sueño */}
          <button
            id="card-var-sleep"
            onClick={() => setActiveEditField('sleep')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left flex items-center justify-between transition-all shadow-2xs group"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Sueño
              </span>
              <span className="text-sm font-bold text-[#004D6B] flex items-center gap-1.5">
                {variables.sleep}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#004D6B]">
              <span className="text-[10px] font-medium text-slate-400">Editar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 2: Estado al despertar */}
          <button
            id="card-var-wake"
            onClick={() => setActiveEditField('wakeState')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left flex items-center justify-between transition-all shadow-2xs group"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Estado al despertar
              </span>
              <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                {variables.wakeState}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#004D6B]">
              <span className="text-[10px] font-medium text-slate-400">Editar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 3: Cambio de rutina */}
          <button
            id="card-var-routine"
            onClick={() => setActiveEditField('routineChange')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left flex items-center justify-between transition-all shadow-2xs group"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cambio de rutina
              </span>
              <span className="text-sm font-bold text-[#004D6B] flex items-center gap-1.5">
                {variables.routineChange}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#004D6B]">
              <span className="text-[10px] font-medium text-slate-400">Editar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 4: Contexto */}
          <button
            id="card-var-context"
            onClick={() => setActiveEditField('context')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left flex items-center justify-between transition-all shadow-2xs group"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Contexto
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                {variables.context}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#004D6B]">
              <span className="text-[10px] font-medium text-slate-400">Editar</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <button
          id="btn-confirm-and-save"
          onClick={onConfirmAndSave}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#99CAE8]" />
          <span>Confirmar y guardar</span>
        </button>

        <button
          id="btn-edit-observation-secondary"
          onClick={onBackToObservation}
          className="w-full h-9 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
        >
          Editar observación
        </button>
      </div>

      {activeEditField && (
        <EditVariableSheet
          fieldKey={activeEditField}
          currentValue={variables[activeEditField]}
          onSaveValue={onUpdateVariable}
          onClose={() => setActiveEditField(null)}
        />
      )}
    </div>
  );
};
