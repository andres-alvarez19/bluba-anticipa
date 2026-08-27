import React, { useState } from 'react';
import { ChevronDown, Sparkles, Check, Info, ShieldCheck } from 'lucide-react';
import { ActiveScreen } from '../types';

interface HeaderProps {
  childName: string;
  avatarText: string;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  isInsufficientState: boolean;
  onToggleInsufficientState: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  childName,
  avatarText,
  activeScreen,
  onNavigate,
  isInsufficientState,
  onToggleInsufficientState
}) => {
  const [showChildMenu, setShowChildMenu] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  return (
    <header className="px-5 pt-3 pb-3 border-b border-slate-100 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
      {/* Top Branding / Mode strip */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-[#004D6B] flex items-center justify-center text-white font-bold text-[11px] shadow-xs">
            b
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#004D6B] uppercase">
            Bluba Anticipa
          </span>
          <span className="text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
            MVP 2026
          </span>
        </div>

        {/* Prototype Quick State Switcher (Discreet control for evaluating the 3 required states) */}
        <div className="relative">
          <button
            id="btn-scenario-switcher"
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full transition-colors"
            title="Cambiar estado para evaluar prototipo"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            <span className="max-w-[110px] truncate">
              {isInsufficientState ? 'Caso: Info Insuficiente' : 'Caso: Mateo (Alerta)'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulación de Estados (Reglas MVP)
              </div>
              <button
                id="btn-select-elevated-case"
                onClick={() => {
                  onToggleInsufficientState(false);
                  onNavigate('FAM_01_TODAY');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  !isInsufficientState
                    ? 'bg-amber-50 text-amber-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-800">1. Caso Mateo R. (Alerta Activa)</div>
                  <div className="text-[10px] text-slate-500">Riesgo Elevado + Confianza Media</div>
                </div>
                {!isInsufficientState && <Check className="w-4 h-4 text-amber-700 shrink-0" />}
              </button>

              <button
                id="btn-select-insufficient-case"
                onClick={() => {
                  onToggleInsufficientState(true);
                  onNavigate('COMMON_03_INSUFFICIENT_INFO');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between mt-1 transition-colors ${
                  isInsufficientState
                    ? 'bg-sky-50 text-sky-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-800">2. Caso Información Insuficiente</div>
                  <div className="text-[10px] text-slate-500">Faltan 2 variables críticas (COMMON-03)</div>
                </div>
                {isInsufficientState && <Check className="w-4 h-4 text-sky-700 shrink-0" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Greeting & Child Selector */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <p className="text-[13px] font-normal text-slate-500 leading-tight">
            Buenos días,
          </p>
          <div className="relative inline-block">
            <button
              id="btn-child-selector"
              onClick={() => setShowChildMenu(!showChildMenu)}
              className="flex items-center gap-1.5 text-lg font-bold text-[#004D6B] hover:text-[#00384E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#99CAE8] rounded-md py-0.5"
            >
              <span>{childName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showChildMenu && (
              <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-40">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Perfil del niño
                </div>
                <div className="px-2 py-1.5 bg-[#EAF6FC] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-xs">
                      {avatarText}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{childName}</p>
                      <p className="text-[10px] text-slate-500">Baseline activo</p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-[#004D6B]" />
                </div>
                <div className="mt-1 pt-1 border-t border-slate-100 px-2 py-1 text-[11px] text-slate-400 italic">
                  Comparación exclusiva contra su propio historial
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Child Avatar with baseline indicator badge */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-[#99CAE8]/40">
              {avatarText}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
              title="Línea base calibrada"
            ></span>
          </div>
        </div>
      </div>
    </header>
  );
};
