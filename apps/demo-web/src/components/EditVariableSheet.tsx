import React from 'react';
import { X, Check, Edit2 } from 'lucide-react';

export type EditableFieldKey = 'sleep' | 'wakeState' | 'routineChange' | 'context';

interface EditVariableSheetProps {
  fieldKey: EditableFieldKey;
  currentValue: string;
  onSaveValue: (fieldKey: EditableFieldKey, newValue: any) => void;
  onClose: () => void;
}

const FIELD_CONFIGS: Record<
  EditableFieldKey,
  { title: string; subtitle: string; options: { label: string; desc?: string }[] }
> = {
  sleep: {
    title: 'Editar: Sueño',
    subtitle: 'Selecciona cómo descansó anoche',
    options: [
      { label: 'Reparador', desc: 'Sueño continuo y reparador' },
      { label: 'Interrumpido', desc: 'Varios despertares en la noche' },
      { label: 'Dificultad para conciliar', desc: 'Le costó iniciar el sueño' },
      { label: 'No lo sé', desc: 'Sin registro disponible' },
    ],
  },
  wakeState: {
    title: 'Editar: Estado al despertar',
    subtitle: 'Nivel de disposición y ánimo al iniciar el día',
    options: [
      { label: 'Tranquilo', desc: 'Despertar calmo y fluido' },
      { label: 'Irritable', desc: 'Baja tolerancia a la frustración' },
      { label: 'Cansado', desc: 'Fatiga física o somnolencia' },
      { label: 'No lo sé', desc: 'Sin información' },
    ],
  },
  routineChange: {
    title: 'Editar: Cambio de rutina',
    subtitle: '¿Hubo alguna alteración en sus horarios o espacios?',
    options: [
      { label: 'Sí', desc: 'Cambio de sala, horario o cuidadores' },
      { label: 'No', desc: 'Día estructurado según su rutina habitual' },
      { label: 'No lo sé', desc: 'Por confirmar con el colegio' },
    ],
  },
  context: {
    title: 'Editar: Contexto',
    subtitle: 'Ámbito principal de las observaciones',
    options: [
      { label: 'Escolar', desc: 'Colegio, jardín o aula' },
      { label: 'Hogar', desc: 'Casa o entorno familiar' },
      { label: 'Terapia', desc: 'Sesión fonoaudiología, TO o psicología' },
      { label: 'Social', desc: 'Cumpleaños, plazas o paseos' },
      { label: 'Ninguno', desc: 'Sin contexto específico' },
    ],
  },
};

export const EditVariableSheet: React.FC<EditVariableSheetProps> = ({
  fieldKey,
  currentValue,
  onSaveValue,
  onClose,
}) => {
  const config = FIELD_CONFIGS[fieldKey];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
      <div
        id="sheet-edit-variable"
        className="bg-white w-full max-w-sm rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0F294D]">{config.title}</h3>
            <p className="text-[11px] text-slate-500">{config.subtitle}</p>
          </div>
          <button
            id="btn-close-edit-sheet"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Option List */}
        <div className="space-y-2">
          {config.options.map((opt) => {
            const isSelected = currentValue === opt.label;
            return (
              <button
                key={opt.label}
                id={`btn-select-option-${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  onSaveValue(fieldKey, opt.label);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700 font-medium'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{opt.label}</span>
                  </div>
                  {opt.desc && (
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-700' : 'text-slate-400'}`}>
                      {opt.desc}
                    </p>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-sky-700 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 text-center italic pt-1">
          La corrección humana actualiza de inmediato las variables estructuradas.
        </p>
      </div>
    </div>
  );
};
