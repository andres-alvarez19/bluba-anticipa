import React from 'react';
import { AppScreen } from '../types';

interface FamilyHeaderProps {
  childName: string;
  avatarText: string;
  activeScreen: AppScreen;
}

export const FamilyHeader: React.FC<FamilyHeaderProps> = ({
  childName,
  avatarText,
  activeScreen,
}) => {
  const getScreenPillLabel = () => {
    switch (activeScreen) {
      case 'FAM_01_TODAY':
        return 'Estado Hoy';
      case 'FAM_02_CHECKIN':
        return 'Check-in';
      case 'FAM_03_RECOMMENDATIONS':
        return 'Hogar';
      case 'FAM_04_FEEDBACK':
        return 'Estadísticas';
      case 'FAM_05_ALERT_DETAIL':
        return 'Alerta';
      case 'FAM_06_INSUFFICIENT_INFO':
        return 'Información';
      case 'FAM_07_PROFILE':
        return 'Ficha Mateo';
      default:
        return 'Familia';
    }
  };

  return (
    <header className="px-4.5 pt-3 pb-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-[#004D6B] flex items-center justify-center text-white font-bold text-[11px] shadow-xs">
            b
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#004D6B] uppercase">
            Bluba Anticipa
          </span>
          <span className="text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
            {getScreenPillLabel()}
          </span>
        </div>

        {/* Child Profile Mini Pill */}
        <div className="flex items-center gap-1.5 bg-[#F7FAFC] pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200/80">
          <div className="w-4 h-4 rounded-full bg-[#004D6B] text-white flex items-center justify-center text-[9px] font-bold">
            {avatarText}
          </div>
          <span className="text-xs font-bold text-slate-800">{childName}</span>
        </div>
      </div>
    </header>
  );
};
