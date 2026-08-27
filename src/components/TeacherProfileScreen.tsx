import React from 'react';
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  Wifi,
  Sparkles,
  HeartHandshake,
  CheckCircle,
  Mail,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface TeacherProfileScreenProps {
  onBackToHome: () => void;
  onNavigateToClassroom: () => void;
}

export const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({
  onBackToHome,
  onNavigateToClassroom,
}) => {
  return (
    <div className="px-4 py-3 space-y-4 pb-20">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#004D6B] text-white flex items-center justify-center font-bold text-lg shadow-sm ring-4 ring-[#EAF6FC]">
            CM
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#004D6B]">
                Prof. Carlos Morales
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Profesor Jefe • 1° Básico B
            </p>
            <span className="inline-block text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
              Colegio San Esteban
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#004D6B]" />
            <span>c.morales@sanesteban.edu.cl</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-200">
            Sesión Activa
          </span>
        </div>
      </div>

      {/* Classroom Setup & PIE Network */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
          <Users className="w-4 h-4 text-[#004D6B]" />
          <span>Equipo de Apoyo y PIE del Aula</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-[11px] block">
                Psicopedagoga Ana Torres
              </span>
              <span className="text-[10px] text-slate-500">
                Equipo de Inclusión Escolar (PIE)
              </span>
            </div>
            <span className="text-[9.5px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded border border-[#99CAE8]">
              Co-docencia
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 text-[11px] block">
                Dra. Valentina Ramos
              </span>
              <span className="text-[10px] text-slate-500">
                Terapeuta Externa Bluba (Psicología)
              </span>
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Vinculada
            </span>
          </div>
        </div>
      </div>

      {/* Classroom Adaptations Enabled */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B] uppercase tracking-wide">
          <Layers className="w-4 h-4 text-[#004D6B]" />
          <span>Recursos Pedagógicos en Sala</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-medium text-slate-800 text-[11px]">
              Panel visual de transiciones en pared
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-medium text-slate-800 text-[11px]">
              Rincón de calma y baja estimulación
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-medium text-slate-800 text-[11px]">
              Registro Express con funcionamiento Offline
            </span>
            <span className="text-[10px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded">
              Activo
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Privacy & Scope */}
      <div className="bg-[#EAF6FC] border border-[#99CAE8] rounded-2xl p-3 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-[#004D6B] font-bold text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#004D6B]" />
          <span>Enfoque Pedagógico Seguro</span>
        </div>
        <p className="text-[10.5px] text-[#004D6B] font-medium leading-relaxed">
          Las observaciones de aula son estrictamente pedagógicas y formativas, sin diagnósticos clínicos y orientadas al bienestar del estudiante.
        </p>
      </div>

      {/* Button to go to classroom */}
      <button
        id="btn-profile-to-classroom"
        onClick={onNavigateToClassroom}
        className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
      >
        <span>Volver a Mi Curso</span>
        <ChevronRight className="w-4 h-4 text-[#99CAE8]" />
      </button>
    </div>
  );
};
