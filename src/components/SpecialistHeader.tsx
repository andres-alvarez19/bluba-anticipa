import React from 'react';
import { Stethoscope } from 'lucide-react';
import { AppScreen } from '../types';

interface SpecialistHeaderProps {
  activeScreen: AppScreen;
  specialistTitle?: string;
}

export const SpecialistHeader: React.FC<SpecialistHeaderProps> = ({
  activeScreen,
  specialistTitle = 'Dra. Valentina Ramos (Terapeuta)',
}) => {
  const getScreenPillLabel = () => {
    switch (activeScreen) {
      case 'ESP_00_HOME':
        return 'Inicio';
      case 'ESP_01_PATIENTS':
        return 'Casos';
      case 'ESP_02_PATIENT_SUMMARY':
        return 'Ficha Mateo';
      case 'ESP_03_EVOLUTION':
        return 'Evolución';
      case 'ESP_04_FACTORS':
        return 'Factores';
      case 'ESP_05_STRATEGIES':
        return 'Estrategias';
      case 'ESP_06_PROFILE':
        return 'Mi Perfil';
      default:
        return 'Clínica';
    }
  };

  return (
    <header className="px-4.5 pt-3 pb-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Branding & Specialist Mode Badge */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-[#004D6B] flex items-center justify-center text-white font-bold text-[11px] shadow-xs">
            b
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#004D6B] uppercase">
            Bluba Anticipa
          </span>
          <span className="text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
            Especialista
          </span>
        </div>

        {/* Clinician Pill */}
        <div className="flex items-center gap-1.5 bg-[#F7FAFC] pl-2 pr-2.5 py-1 rounded-full border border-slate-200/80">
          <Stethoscope className="w-3.5 h-3.5 text-[#004D6B]" />
          <span className="text-xs font-bold text-slate-800">
            {getScreenPillLabel()}
          </span>
        </div>
      </div>
    </header>
  );
};
