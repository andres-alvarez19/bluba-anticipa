import React from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  Users,
  Sliders,
  Lock,
  Mail,
  Phone,
  FileSpreadsheet,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  School,
  HeartHandshake,
} from 'lucide-react';

interface SpecialistProfileScreenProps {
  onBackToHome: () => void;
  onNavigateToPatients: () => void;
}

export const SpecialistProfileScreen: React.FC<SpecialistProfileScreenProps> = ({
  onBackToHome,
  onNavigateToPatients,
}) => {
  return (
    <div className="px-4 py-3 space-y-4 pb-20">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#004D6B] text-white flex items-center justify-center font-bold text-lg shadow-sm ring-4 ring-[#EAF6FC]">
            VR
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#004D6B]">
                Dra. Valentina Ramos
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Psicóloga Clínica Infanto-Juvenil
            </p>
            <span className="inline-block text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
              Reg. Colegiado: 48.291-C
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#004D6B]" />
            <span className="truncate">v.ramos@neurobluba.cl</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#004D6B]" />
            <span>+56 9 8721 4400</span>
          </div>
        </div>
      </div>

      {/* Clinical Center & Affiliation */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
          <Building2 className="w-4 h-4 text-[#004D6B]" />
          <span>Centro Clínico Asociado</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <h2 className="text-xs font-bold text-slate-800">
            Centro de Neurodesarrollo y Apoyo Integral
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Sede Oriente • Programa de Acompañamiento Preventivo
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
              Convenio Escolar Activo
            </span>
            <span className="text-[10px] text-slate-400">4 Casos activos</span>
          </div>
        </div>
      </div>

      {/* Collaborative Network */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
            <Users className="w-4 h-4 text-[#004D6B]" />
            <span>Red Colaborativa Vinculada</span>
          </div>
          <span className="text-[10px] text-[#004D6B] font-bold">2 Colegios</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-[#F7FAFC] rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-[#004D6B]" />
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">
                  Colegio San Esteban
                </span>
                <span className="text-[10px] text-slate-500">
                  Prof. Carlos Morales (1° Básico B)
                </span>
              </div>
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Sincronizado
            </span>
          </div>

          <div className="p-2.5 bg-[#F7FAFC] rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-[#004D6B]" />
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">
                  Colegio Los Alerces
                </span>
                <span className="text-[10px] text-slate-500">
                  Equipo PIE / Orientación
                </span>
              </div>
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Sincronizado
            </span>
          </div>
        </div>
      </div>

      {/* Baseline Algorithm & Model Settings */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
          <Sliders className="w-4 h-4 text-[#004D6B]" />
          <span>Configuración del Modelo Preventivo</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">
                Comparación exclusiva intra-sujeto
              </span>
              <span className="text-[10px] text-slate-500">
                Cada paciente evaluado sólo contra su propio baseline
              </span>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">
                Ventana de acumulación
              </span>
              <span className="text-[10px] text-slate-500">
                72 horas con mayor peso en desvelos acumulados
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded">
              72 Horas
            </span>
          </div>
        </div>
      </div>

      {/* Security & Data Integrity */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Confidencialidad y Seguridad Clínica</span>
        </div>
        <p className="text-[10.5px] text-emerald-900 font-medium leading-relaxed">
          Consentimientos informados de familias y convenios de corresponsabilidad vigentes bajo normativa médica y escolar 2026.
        </p>
      </div>

      {/* Navigation button */}
      <button
        id="btn-profile-go-to-patients"
        onClick={onNavigateToPatients}
        className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
      >
        <span>Ver lista de pacientes activos</span>
        <ChevronRight className="w-4 h-4 text-[#99CAE8]" />
      </button>
    </div>
  );
};
