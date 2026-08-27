import React from 'react';
import {
  Heart,
  Moon,
  Sun,
  Shield,
  School,
  Building2,
  Bell,
  Clock,
  ChevronRight,
  UserCheck,
  CheckCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ChildState } from '../types';

interface FamilyProfileScreenProps {
  childData: ChildState;
  onBackToToday: () => void;
  onNavigateToCheckIn: () => void;
  onNavigateToRecommendations: () => void;
}

export const FamilyProfileScreen: React.FC<FamilyProfileScreenProps> = ({
  childData,
  onBackToToday,
  onNavigateToCheckIn,
  onNavigateToRecommendations,
}) => {
  return (
    <div className="px-4 py-3 space-y-4 pb-20">
      {/* Child Card Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#004D6B] text-white flex items-center justify-center font-bold text-xl shadow-sm ring-4 ring-[#EAF6FC]">
            {childData.avatarText || 'M'}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#004D6B]">
                {childData.name}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                ({childData.age || '6 años'})
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Familia Ramírez • Cuidado principal en casa
            </p>
            <span className="inline-block text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
              Baseline validado (14+ días)
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>Contacto de emergencia: Mamá (+56 9 7654 3210)</span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-200">
            Vinculado
          </span>
        </div>
      </div>

      {/* Baseline Reference of the Child */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
          <Sliders className="w-4 h-4 text-[#004D6B]" />
          <span>Patrón Basal Habitual de Mateo</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <div className="flex items-center gap-1 text-slate-500 text-[10.5px]">
              <Moon className="w-3 h-3 text-[#004D6B]" />
              <span>Sueño habitual</span>
            </div>
            <span className="font-bold text-slate-800 text-xs">
              {childData.baseline.sleepHoursHabitual} horas continuas
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <div className="flex items-center gap-1 text-slate-500 text-[10.5px]">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Despertar habitual</span>
            </div>
            <span className="font-bold text-slate-800 text-xs">
              {childData.baseline.wakeStateHabitual}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
          <span className="text-[10.5px] text-slate-500 font-semibold block">
            Estrategias con mayor efectividad en casa:
          </span>
          <p className="text-[11px] text-slate-700 font-medium">
            Anticipación visual 5 minutos antes y rincón de menor estimulación con cojín sensorial.
          </p>
        </div>
      </div>

      {/* Connected Network (School & Clinic) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
            <Heart className="w-4 h-4 text-[#004D6B]" />
            <span>Red de Apoyo Conectada</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            2 Conectados
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-[#004D6B]" />
              <div>
                <span className="font-bold text-slate-800 text-[11px] block">
                  Colegio San Esteban
                </span>
                <span className="text-[10px] text-slate-500">
                  Prof. Carlos Morales (1° Básico B)
                </span>
              </div>
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Activo
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#004D6B]" />
              <div>
                <span className="font-bold text-slate-800 text-[11px] block">
                  Centro de Neurodesarrollo
                </span>
                <span className="text-[10px] text-slate-500">
                  Dra. Valentina Ramos (Terapeuta)
                </span>
              </div>
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Activo
            </span>
          </div>
        </div>
      </div>

      {/* Routine Check Reminders */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
          <Bell className="w-4 h-4 text-[#004D6B]" />
          <span>Horarios de Rutina Bluba</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-slate-800 text-[11px] block">Check-in matutino</span>
                <span className="text-[10px] text-slate-500">Notificación sugerida</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#004D6B]">07:30 AM</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#004D6B]" />
              <div>
                <span className="font-bold text-slate-800 text-[11px] block">Cierre y feedback nocturno</span>
                <span className="text-[10px] text-slate-500">Registro de efectividad</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#004D6B]">20:30 PM</span>
          </div>
        </div>
      </div>

      {/* Button back to today */}
      <button
        id="btn-profile-to-today"
        onClick={onBackToToday}
        className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
      >
        <span>Volver a Estado de Hoy</span>
        <ChevronRight className="w-4 h-4 text-[#99CAE8]" />
      </button>
    </div>
  );
};
