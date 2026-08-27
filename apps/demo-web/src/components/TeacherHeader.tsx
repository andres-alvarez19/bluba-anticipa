import React from 'react';
import { GraduationCap } from 'lucide-react';
import { AppScreen } from '../types';

interface TeacherHeaderProps {
  activeScreen: AppScreen;
  classroomName: string;
  teacherRole: string;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  activeScreen,
  classroomName,
  teacherRole,
}) => {
  const getScreenPillLabel = () => {
    switch (activeScreen) {
      case 'EDU_00_HOME':
        return 'Inicio Aula';
      case 'EDU_01_CLASSROOM':
        return classroomName;
      case 'EDU_02_STUDENT_DETAIL':
        return 'Detalle Estudiante';
      case 'EDU_03_EXPRESS_REPORT':
        return 'Observación';
      case 'EDU_04_PROFILE':
        return 'Perfil Docente';
      default:
        return classroomName || '2º Básico A';
    }
  };

  return (
    <header className="px-4.5 pt-3 pb-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Branding & Educator Mode Badge */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-[#004D6B] flex items-center justify-center text-white font-bold text-[11px] shadow-xs">
            b
          </div>
          <span className="text-xs font-semibold tracking-wide text-[#004D6B] uppercase">
            Bluba Anticipa
          </span>
          <span className="text-[10px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2 py-0.5 rounded-full border border-[#99CAE8]">
            Vista Docente
          </span>
        </div>

        {/* Classroom & Teacher Pill */}
        <div className="flex items-center gap-1.5 bg-[#F7FAFC] pl-2 pr-2.5 py-1 rounded-full border border-slate-200/80">
          <GraduationCap className="w-3.5 h-3.5 text-[#004D6B]" />
          <span className="text-xs font-bold text-slate-800">{getScreenPillLabel()}</span>
        </div>
      </div>
    </header>
  );
};
