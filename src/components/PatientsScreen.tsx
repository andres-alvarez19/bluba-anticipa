import React from 'react';
import {
  Users,
  ChevronRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';
import { SpecialistPatient, SpecialistRiskLabel, SpecialistConfidenceLabel } from '../types';

interface PatientsScreenProps {
  patients: SpecialistPatient[];
  onSelectPatient: (patient: SpecialistPatient) => void;
}

const getRiskStyle = (riskLabel: SpecialistRiskLabel) => {
  switch (riskLabel) {
    case 'Elevado':
      return {
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        cardBorder: 'border-rose-200/90 hover:border-rose-300 bg-rose-50/15',
        dotBg: 'bg-rose-500',
        icon: AlertTriangle,
        iconColor: 'text-rose-600',
      };
    case 'Moderado':
      return {
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
        cardBorder: 'border-amber-200/90 hover:border-amber-300 bg-amber-50/15',
        dotBg: 'bg-amber-500',
        icon: AlertCircle,
        iconColor: 'text-amber-600',
      };
    case 'Bajo':
      return {
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        cardBorder: 'border-slate-200/90 hover:border-slate-300 bg-white',
        dotBg: 'bg-emerald-500',
        icon: CheckCircle2,
        iconColor: 'text-slate-500',
      };
    case 'Insuficiente':
    default:
      return {
        badgeBg: 'bg-slate-100 text-slate-500 border-slate-200',
        cardBorder: 'border-slate-200/80 hover:border-slate-300 bg-white',
        dotBg: 'bg-slate-400',
        icon: HelpCircle,
        iconColor: 'text-slate-400',
      };
  }
};

const getConfidenceStyle = (confidenceLabel: SpecialistConfidenceLabel) => {
  switch (confidenceLabel) {
    case 'Alta':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    case 'Media':
      return 'bg-sky-50 text-sky-800 border-sky-200/80';
    case 'Baja':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const PatientsScreen: React.FC<PatientsScreenProps> = ({
  patients,
  onSelectPatient,
}) => {
  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8] uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-[#004D6B]" />
            <span>ESP-01 • Casos</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Supervisión clínica
          </span>
        </div>

        <div className="pt-1">
          <h1 className="text-xl font-bold text-[#004D6B] tracking-tight">
            Pacientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Priorizados por desviaciones respecto al baseline y necesidad de revisión
          </p>
        </div>
      </div>

      {/* Patient List (Cards, not a table) */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
        {patients.map((patient) => {
          const riskStyle = getRiskStyle(patient.riskLabel);
          const confidenceStyle = getConfidenceStyle(patient.confidenceLabel);
          const IconComponent = riskStyle.icon;

          return (
            <button
              key={patient.id}
              id={`patient-card-${patient.id}`}
              onClick={() => onSelectPatient(patient)}
              className={`w-full text-left rounded-2xl p-3.5 border transition-all shadow-2xs group flex flex-col justify-between space-y-2.5 ${riskStyle.cardBorder}`}
            >
              {/* Card Top: Name, Initials, Risk Badge, and Confidence Badge */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-[#99CAE8]/40">
                    {patient.initials}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#004D6B] group-hover:text-[#00384E] transition-colors">
                      {patient.name}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {patient.age}
                    </span>
                  </div>
                </div>

                {/* Risk + Confidence Pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${riskStyle.badgeBg}`}
                  >
                    <IconComponent className={`w-3 h-3 ${riskStyle.iconColor}`} />
                    <span>Riesgo {patient.riskLabel.toLowerCase()}</span>
                  </span>

                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${confidenceStyle}`}
                  >
                    Conf. {patient.confidenceLabel.toLowerCase()}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors ml-0.5" />
                </div>
              </div>

              {/* Card Bottom: Principal Deviation + Last Update */}
              <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-100/90 text-xs">
                <p className="text-slate-700 font-medium text-[11px] truncate max-w-[220px]">
                  {patient.mainDeviation}
                </p>
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 ml-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Actualizado {patient.updatedTime}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-1 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center">
          Toca a Mateo R. para revisar desglose de confianza, factores y calidad de datos.
        </p>
      </div>
    </div>
  );
};
