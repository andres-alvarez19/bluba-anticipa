import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Moon,
  Clock,
  Sparkles,
  CalendarCheck,
  Layers,
  Edit3,
  Check
} from 'lucide-react';
import { ChildState } from '../types';

interface DayRecord {
  dayNumber: number;
  dateStr: string;
  fullDateLabel: string;
  isToday: boolean;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED';
  riskLabel: string;
  confidenceScore: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceLabel: string;
  sleepDetail: string;
  wakeDetail: string;
  schoolDetail?: string;
  strategyApplied?: string;
  strategyResult?: 'Ayudó' | 'Ayudó parcialmente' | 'No aplicada';
  hasReport: boolean;
}

interface FamilyStatsCalendarScreenProps {
  childData: ChildState;
  onOpenReportForDate: (dateLabel: string) => void;
  onNavigateToRecommendations: () => void;
}

// Mocked historical data for August 2026
const DAYS_DATA_AUGUST_2026: Record<number, DayRecord> = {
  1: {
    dayNumber: 1,
    dateStr: '2026-08-01',
    fullDateLabel: 'Sábado 1 de agosto',
    isToday: false,
    riskScore: 22,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 90,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '8,2 h continuas sin despertares',
    wakeDetail: 'Tranquilo y con buen apetito',
    strategyApplied: 'Rutina matutina habitual',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  2: {
    dayNumber: 2,
    dateStr: '2026-08-02',
    fullDateLabel: 'Domingo 2 de agosto',
    isToday: false,
    riskScore: 25,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 85,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,9 h de sueño reparador',
    wakeDetail: 'Tranquilo',
    strategyApplied: 'Juego libre en casa',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  3: {
    dayNumber: 3,
    dateStr: '2026-08-03',
    fullDateLabel: 'Lunes 3 de agosto',
    isToday: false,
    riskScore: 35,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,5 h de sueño',
    wakeDetail: 'Tranquilo',
    schoolDetail: 'Jornada escolar sin incidentes',
    hasReport: true,
  },
  4: {
    dayNumber: 4,
    dateStr: '2026-08-04',
    fullDateLabel: 'Martes 4 de agosto',
    isToday: false,
    riskScore: 48,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 75,
    confidenceLevel: 'MEDIUM',
    confidenceLabel: 'Media',
    sleepDetail: '6,8 h (despertar a las 4 AM)',
    wakeDetail: 'Algo cansado',
    schoolDetail: 'Mayor sensibilidad al ruido de recreo',
    strategyApplied: 'Anticipar transición al llegar a casa',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  5: {
    dayNumber: 5,
    dateStr: '2026-08-05',
    fullDateLabel: 'Miércoles 5 de agosto',
    isToday: false,
    riskScore: 30,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 85,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,8 h de sueño recuperado',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  6: {
    dayNumber: 6,
    dateStr: '2026-08-06',
    fullDateLabel: 'Jueves 6 de agosto',
    isToday: false,
    riskScore: 28,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,6 h',
    wakeDetail: 'Estable',
    hasReport: true,
  },
  7: {
    dayNumber: 7,
    dateStr: '2026-08-07',
    fullDateLabel: 'Viernes 7 de agosto',
    isToday: false,
    riskScore: 55,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 70,
    confidenceLevel: 'MEDIUM',
    confidenceLabel: 'Media',
    sleepDetail: '6,5 h',
    wakeDetail: 'Irritable ante cambio de ropa',
    schoolDetail: 'Actividad deportiva grupal demandante',
    strategyApplied: 'Espacio de descompresión en penumbra',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  8: {
    dayNumber: 8,
    dateStr: '2026-08-08',
    fullDateLabel: 'Sábado 8 de agosto',
    isToday: false,
    riskScore: 20,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 90,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '8,4 h continuas',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  9: {
    dayNumber: 9,
    dateStr: '2026-08-09',
    fullDateLabel: 'Domingo 9 de agosto',
    isToday: false,
    riskScore: 22,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 85,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '8,0 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  10: {
    dayNumber: 10,
    dateStr: '2026-08-10',
    fullDateLabel: 'Lunes 10 de agosto',
    isToday: false,
    riskScore: 32,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,7 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  11: {
    dayNumber: 11,
    dateStr: '2026-08-11',
    fullDateLabel: 'Martes 11 de agosto',
    isToday: false,
    riskScore: 62,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 78,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '6,1 h (pesadillas)',
    wakeDetail: 'Más sensible al tacto y ruido',
    schoolDetail: 'Dificultad en cambio de bloque curricular',
    strategyApplied: 'Anticipación con panel visual',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  12: {
    dayNumber: 12,
    dateStr: '2026-08-12',
    fullDateLabel: 'Miércoles 12 de agosto',
    isToday: false,
    riskScore: 72,
    riskLevel: 'ELEVATED',
    riskLabel: 'Elevado',
    confidenceScore: 82,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '5,8 h (2 despertares prolongados)',
    wakeDetail: 'Irritable y desregulado',
    schoolDetail: 'Simulacro escolar no avisado',
    strategyApplied: 'Protocolo de menor demanda y descompresión',
    strategyResult: 'Ayudó parcialmente',
    hasReport: true,
  },
  13: {
    dayNumber: 13,
    dateStr: '2026-08-13',
    fullDateLabel: 'Jueves 13 de agosto',
    isToday: false,
    riskScore: 45,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 85,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,2 h (recuperando sueño)',
    wakeDetail: 'Menor reactividad',
    strategyApplied: 'Anticipar transiciones',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  14: {
    dayNumber: 14,
    dateStr: '2026-08-14',
    fullDateLabel: 'Viernes 14 de agosto',
    isToday: false,
    riskScore: 30,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,8 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  15: {
    dayNumber: 15,
    dateStr: '2026-08-15',
    fullDateLabel: 'Sábado 15 de agosto',
    isToday: false,
    riskScore: 18,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 90,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '8,5 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  16: {
    dayNumber: 16,
    dateStr: '2026-08-16',
    fullDateLabel: 'Domingo 16 de agosto',
    isToday: false,
    riskScore: 20,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 85,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '8,0 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  17: {
    dayNumber: 17,
    dateStr: '2026-08-17',
    fullDateLabel: 'Lunes 17 de agosto',
    isToday: false,
    riskScore: 34,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,6 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  18: {
    dayNumber: 18,
    dateStr: '2026-08-18',
    fullDateLabel: 'Martes 18 de agosto',
    isToday: false,
    riskScore: 28,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,7 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  19: {
    dayNumber: 19,
    dateStr: '2026-08-19',
    fullDateLabel: 'Miércoles 19 de agosto',
    isToday: false,
    riskScore: 30,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 75,
    confidenceLevel: 'MEDIUM',
    confidenceLabel: 'Media',
    sleepDetail: '7,5 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  20: {
    dayNumber: 20,
    dateStr: '2026-08-20',
    fullDateLabel: 'Jueves 20 de agosto',
    isToday: false,
    riskScore: 42,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 75,
    confidenceLevel: 'MEDIUM',
    confidenceLabel: 'Media',
    sleepDetail: '6,9 h',
    wakeDetail: 'Algo irritable',
    strategyApplied: 'Anticipación visual',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  21: {
    dayNumber: 21,
    dateStr: '2026-08-21',
    fullDateLabel: 'Viernes 21 de agosto',
    isToday: false,
    riskScore: 35,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '7,6 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  22: {
    dayNumber: 22,
    dateStr: '2026-08-22',
    fullDateLabel: 'Sábado 22 de agosto',
    isToday: false,
    riskScore: 24,
    riskLevel: 'LOW',
    riskLabel: 'Bajo',
    confidenceScore: 90,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '8,1 h',
    wakeDetail: 'Tranquilo',
    hasReport: true,
  },
  23: {
    dayNumber: 23,
    dateStr: '2026-08-23',
    fullDateLabel: 'Domingo 23 de agosto',
    isToday: false,
    riskScore: 52,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 85,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '6,3 h (dificultad para conciliar)',
    wakeDetail: 'Inquieto',
    strategyApplied: 'Rutina sensorial relajante previa al sueño',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  24: {
    dayNumber: 24,
    dateStr: '2026-08-24',
    fullDateLabel: 'Lunes 24 de agosto',
    isToday: false,
    riskScore: 60,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 80,
    confidenceLevel: 'HIGH',
    confidenceLabel: 'Alta',
    sleepDetail: '6,0 h (acumulando 2 días con <6,5 h)',
    wakeDetail: 'Baja tolerancia a la frustración',
    schoolDetail: 'Aviso de cambio de sala informado',
    strategyApplied: 'Anticipación de transiciones',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  25: {
    dayNumber: 25,
    dateStr: '2026-08-25',
    fullDateLabel: 'Martes 25 de agosto (Ayer)',
    isToday: false,
    riskScore: 68,
    riskLevel: 'MODERATE',
    riskLabel: 'Moderado',
    confidenceScore: 75,
    confidenceLevel: 'MEDIUM',
    confidenceLabel: 'Media',
    sleepDetail: '5,9 h (3 noches consecutivas de déficit)',
    wakeDetail: 'Irritable matutino',
    schoolDetail: 'Acto especial en colegio con ruido',
    strategyApplied: 'Espacio de descompresión sensorial',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  26: {
    dayNumber: 26,
    dateStr: '2026-08-26',
    fullDateLabel: 'Miércoles 26 de agosto (Hoy)',
    isToday: true,
    riskScore: 74,
    riskLevel: 'ELEVATED',
    riskLabel: 'Elevado',
    confidenceScore: 67,
    confidenceLevel: 'MEDIUM',
    confidenceLabel: 'Media',
    sleepDetail: '5,9 h (interrumpido con 2 despertares)',
    wakeDetail: 'Irritable ante pequeños estímulos',
    schoolDetail: 'Cambio de sala escolar en curso',
    strategyApplied: 'Anticipar las transiciones de hoy',
    strategyResult: 'Ayudó',
    hasReport: true,
  },
  27: {
    dayNumber: 27,
    dateStr: '2026-08-27',
    fullDateLabel: 'Jueves 27 de agosto',
    isToday: false,
    riskScore: 0,
    riskLevel: 'LOW',
    riskLabel: 'Pendiente',
    confidenceScore: 0,
    confidenceLevel: 'LOW',
    confidenceLabel: 'Sin datos',
    sleepDetail: 'Registro aún no realizado',
    wakeDetail: 'Registro aún no realizado',
    hasReport: false,
  },
  28: {
    dayNumber: 28,
    dateStr: '2026-08-28',
    fullDateLabel: 'Viernes 28 de agosto',
    isToday: false,
    riskScore: 0,
    riskLevel: 'LOW',
    riskLabel: 'Pendiente',
    confidenceScore: 0,
    confidenceLevel: 'LOW',
    confidenceLabel: 'Sin datos',
    sleepDetail: 'Registro aún no realizado',
    wakeDetail: 'Registro aún no realizado',
    hasReport: false,
  },
  29: {
    dayNumber: 29,
    dateStr: '2026-08-29',
    fullDateLabel: 'Sábado 29 de agosto',
    isToday: false,
    riskScore: 0,
    riskLevel: 'LOW',
    riskLabel: 'Pendiente',
    confidenceScore: 0,
    confidenceLevel: 'LOW',
    confidenceLabel: 'Sin datos',
    sleepDetail: 'Registro aún no realizado',
    wakeDetail: 'Registro aún no realizado',
    hasReport: false,
  },
  30: {
    dayNumber: 30,
    dateStr: '2026-08-30',
    fullDateLabel: 'Domingo 30 de agosto',
    isToday: false,
    riskScore: 0,
    riskLevel: 'LOW',
    riskLabel: 'Pendiente',
    confidenceScore: 0,
    confidenceLevel: 'LOW',
    confidenceLabel: 'Sin datos',
    sleepDetail: 'Registro aún no realizado',
    wakeDetail: 'Registro aún no realizado',
    hasReport: false,
  },
  31: {
    dayNumber: 31,
    dateStr: '2026-08-31',
    fullDateLabel: 'Lunes 31 de agosto',
    isToday: false,
    riskScore: 0,
    riskLevel: 'LOW',
    riskLabel: 'Pendiente',
    confidenceScore: 0,
    confidenceLevel: 'LOW',
    confidenceLabel: 'Sin datos',
    sleepDetail: 'Registro aún no realizado',
    wakeDetail: 'Registro aún no realizado',
    hasReport: false,
  },
};

export const FamilyStatsCalendarScreen: React.FC<FamilyStatsCalendarScreenProps> = ({
  childData,
  onOpenReportForDate,
  onNavigateToRecommendations,
}) => {
  // Selected day state (default to today: 26)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(26);

  const selectedDay =
    DAYS_DATA_AUGUST_2026[selectedDayNumber] || DAYS_DATA_AUGUST_2026[26];

  // Calendar starts on Saturday (Aug 1, 2026 is Saturday -> offset 5 in Monday-based week)
  const firstDayOffset = 5; // Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const totalDaysInMonth = 31;
  const blankDays = Array.from({ length: firstDayOffset }, (_, i) => i);
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  return (
    <div className="px-4 py-3.5 space-y-3.5 pb-16">
      {/* 1. RESUMEN MENSUAL CABECERA LIMPIA */}
      <section className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            Calendario de autorregulación
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {childData.name} • Agosto 2026
          </p>
        </div>

        <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-1 rounded-lg">
          26 días registrados
        </span>
      </section>

      {/* 2. CALENDARIO MENSUAL LIMPIO Y ELEGANTE */}
      <section
        id="section-calendar-card"
        className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3"
      >
        {/* Month Selector Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#004D6B]" />
            <h2 className="text-xs font-bold text-slate-900">Agosto 2026</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <button
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-700 px-1">Agosto</span>
            <button
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>

        {/* Calendar Grid Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {/* Blank days from previous month */}
          {blankDays.map((i) => (
            <div key={`blank-${i}`} className="h-9 rounded-lg bg-transparent" />
          ))}

          {/* Month Days */}
          {monthDays.map((dayNum) => {
            const record = DAYS_DATA_AUGUST_2026[dayNum];
            const isSelected = dayNum === selectedDayNumber;
            const isToday = record?.isToday;
            const hasData = record?.hasReport;

            const isHighRisk = record && record.riskScore >= 70;
            const isModRisk = record && record.riskScore >= 36 && record.riskScore < 70;

            return (
              <button
                key={`day-${dayNum}`}
                id={`calendar-day-${dayNum}`}
                onClick={() => setSelectedDayNumber(dayNum)}
                className={`h-10 rounded-xl flex flex-col items-center justify-between p-1 transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-[#004D6B] text-white shadow-xs z-10'
                    : isToday
                    ? 'bg-[#EAF6FC] border border-[#004D6B] text-slate-900 font-bold'
                    : hasData
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                    : 'bg-slate-50/40 text-slate-300 border border-dashed border-slate-200/80 hover:bg-slate-100/50'
                }`}
              >
                {/* Day number */}
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isSelected ? 'text-white' : isToday ? 'text-[#004D6B]' : ''
                  }`}
                >
                  {dayNum}
                </span>

                {/* Status Dot */}
                {hasData ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                      isSelected
                        ? 'bg-white'
                        : isHighRisk
                        ? 'bg-rose-500'
                        : isModRisk
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-slate-200 mb-0.5"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Simplified Legend */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[10.5px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Estable (Bajo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <span>Moderado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>Elevado</span>
          </div>
        </div>
      </section>

      {/* 3. DETALLE LIMPIO DEL DÍA SELECCIONADO */}
      <section
        id="section-selected-day-detail"
        className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3"
      >
        {/* Header of selected day */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-900">
              {selectedDay.fullDateLabel}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              {selectedDay.hasReport ? 'Registro confirmado' : 'Sin observaciones'}
            </span>
          </div>

          {selectedDay.hasReport && (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                  selectedDay.riskScore >= 70
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : selectedDay.riskScore >= 36
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                Riesgo {selectedDay.riskLabel} ({selectedDay.riskScore}%)
              </span>
              <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Confianza {selectedDay.confidenceLabel}
              </span>
            </div>
          )}
        </div>

        {/* Observations Details */}
        {selectedDay.hasReport ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 py-1">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Moon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Sueño nocturno
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {selectedDay.sleepDetail}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 py-1 border-t border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Despertar y Regulación
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {selectedDay.wakeDetail}
                </p>
              </div>
            </div>

            {selectedDay.schoolDetail && (
              <div className="flex items-start gap-2.5 py-1 border-t border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-[#004D6B] flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    Contexto Escolar
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedDay.schoolDetail}
                  </p>
                </div>
              </div>
            )}

            {selectedDay.strategyApplied && (
              <div className="flex items-start justify-between gap-2.5 py-1.5 border-t border-slate-100">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 block text-[11px]">
                      Estrategia aplicada
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {selectedDay.strategyApplied}
                    </p>
                  </div>
                </div>
                {selectedDay.strategyResult && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {selectedDay.strategyResult}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center space-y-1">
            <Clock className="w-5 h-5 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              No hay observaciones registradas
            </p>
            <p className="text-[11px] text-slate-400">
              Puedes registrar nota de voz o texto para esta fecha.
            </p>
          </div>
        )}

        {/* CTA: Report / Edit */}
        <div className="pt-1">
          <button
            id={`btn-report-for-date-${selectedDay.dayNumber}`}
            onClick={() => onOpenReportForDate(selectedDay.fullDateLabel)}
            className="w-full h-10 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#99CAE8]" />
            <span>
              {selectedDay.hasReport
                ? `Editar reporte del ${selectedDay.dayNumber} de agosto`
                : `Registrar reporte del ${selectedDay.dayNumber} de agosto`}
            </span>
          </button>
        </div>
      </section>

      {/* 4. PATRONES Y MÉTRICAS CLAVE DEL MES */}
      <section
        id="section-monthly-metrics"
        className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5"
      >
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Resumen mensual de autorregulación
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 block">
              Días estables
            </span>
            <span className="text-lg font-black text-emerald-950">19 días</span>
            <span className="text-[10px] text-emerald-700 font-medium block">
              73% del mes en rango óptimo
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
            <span className="text-[11px] font-bold text-amber-800 block">
              Apoyos preventivos
            </span>
            <span className="text-lg font-black text-amber-950">6 días</span>
            <span className="text-[10px] text-amber-700 font-medium block">
              Anticipación aplicada con éxito
            </span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-150 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 text-[11px]">
              Estrategia con mayor efectividad:
            </span>
            <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              85% éxito
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Anticipación visual de transiciones</strong> redujo significativamente la sobrecarga en días con sueño &lt; 6,5 h.
          </p>
        </div>
      </section>
    </div>
  );
};
