import React from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  Activity,
  Clock,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SpecialistPatient } from '../types';

interface SpecialistHomeScreenProps {
  patients: SpecialistPatient[];
  onSelectPatient: (patient: SpecialistPatient) => void;
  onNavigateToPatients: () => void;
  onNavigateToStrategies: () => void;
  onNavigateToEvolution: () => void;
  onNavigateToProfile: () => void;
}

export const SpecialistHomeScreen: React.FC<SpecialistHomeScreenProps> = ({
  patients,
  onSelectPatient,
  onNavigateToPatients,
  onNavigateToStrategies,
  onNavigateToEvolution,
  onNavigateToProfile,
}) => {
  const elevatedPatients = patients.filter((p) => p.riskLabel === 'Elevado');
  const moderatePatients = patients.filter((p) => p.riskLabel === 'Moderado');
  const lowPatients = patients.filter((p) => p.riskLabel === 'Bajo');

  const priorityPatient = elevatedPatients[0] || patients[0];

  return (
    <div className="px-4 py-3 space-y-4 pb-20">
      {/* Clinician Welcome Banner */}
      <div className="bg-gradient-to-br from-[#004D6B] to-[#003348] text-white rounded-2xl p-4 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10.5px] font-bold text-[#99CAE8] uppercase tracking-wider">
              Panel Clínico • Hoy
            </span>
          </div>
          <span className="text-[10px] font-semibold bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/15">
            4 Casos Activos
          </span>
        </div>

        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Hola, Dra. Valentina Ramos
          </h1>
          <p className="text-xs text-slate-200 leading-relaxed mt-0.5">
            Monitoreo preventivo individualizado basado en el historial basal de cada paciente.
          </p>
        </div>

        {/* Clinical KPI Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
          <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10">
            <span className="text-[10px] text-rose-200 font-semibold block">Prioritarios</span>
            <span className="text-base font-extrabold text-white">{elevatedPatients.length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10">
            <span className="text-[10px] text-amber-200 font-semibold block">En observación</span>
            <span className="text-base font-extrabold text-white">{moderatePatients.length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10">
            <span className="text-[10px] text-[#99CAE8] font-semibold block">Estables</span>
            <span className="text-base font-extrabold text-white">{lowPatients.length}</span>
          </div>
        </div>
      </div>

      {/* Priority Case Alert (Mateo R.) */}
      {priorityPatient && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Atención prioritaria hoy</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              Índice de riesgo {priorityPatient.riskScore}/100
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-sm ring-2 ring-rose-400/50 shrink-0">
              {priorityPatient.initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-[#004D6B] truncate">
                {priorityPatient.name}
              </h2>
              <p className="text-[11px] text-rose-700 font-medium line-clamp-1">
                {priorityPatient.mainDeviation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-home-view-priority-summary"
              onClick={() => onSelectPatient(priorityPatient)}
              className="h-9 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Ver Ficha Resumen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-home-view-priority-evolution"
              onClick={onNavigateToEvolution}
              className="h-9 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#004D6B]" />
              <span>Evolución (72h)</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#004D6B] uppercase tracking-wider">
          Accesos Clínicos Principales
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {/* Pacientes */}
          <button
            id="btn-home-to-patients"
            onClick={onNavigateToPatients}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#99CAE8] shadow-2xs text-left space-y-1.5 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
              <Users className="w-4 h-4 text-[#004D6B]" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#004D6B] transition-colors">
              Lista de Casos
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium">
              4 pacientes en seguimiento
            </p>
          </button>

          {/* Estrategias */}
          <button
            id="btn-home-to-strategies"
            onClick={onNavigateToStrategies}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#99CAE8] shadow-2xs text-left space-y-1.5 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
              <BookmarkCheck className="w-4 h-4 text-[#004D6B]" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#004D6B] transition-colors">
              Estrategias
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium">
              Historial y efectividad
            </p>
          </button>

          {/* Evolución y Factores */}
          <button
            id="btn-home-to-evolution"
            onClick={onNavigateToEvolution}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#99CAE8] shadow-2xs text-left space-y-1.5 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
              <Activity className="w-4 h-4 text-[#004D6B]" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#004D6B] transition-colors">
              Evolución 7d
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium">
              Línea temporal y fuentes
            </p>
          </button>

          {/* Perfil Clínico */}
          <button
            id="btn-home-to-profile"
            onClick={onNavigateToProfile}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#99CAE8] shadow-2xs text-left space-y-1.5 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-[#004D6B]" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#004D6B] transition-colors">
              Mi Perfil & Red
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium">
              Escuelas y protocolos
            </p>
          </button>
        </div>
      </div>

      {/* Multidisciplinary Team Stream */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B]">
            <Clock className="w-3.5 h-3.5" />
            <span>Últimos registros del equipo</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Hoy</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-[#004D6B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              F
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px]">Familia Mateo</span>
                <span className="text-[9.5px] text-slate-400">07:45 AM</span>
              </div>
              <p className="text-[10.5px] text-slate-600 font-medium">
                Check-in completado: Noche interrumpida (5h), despertar irritable.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-[#004D6B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              E
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px]">Prof. Carlos M. (Escuela)</span>
                <span className="text-[9.5px] text-slate-400">11:15 AM</span>
              </div>
              <p className="text-[10.5px] text-slate-600 font-medium">
                Reporte Express registrado: Desregulación leve en transición a patio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
