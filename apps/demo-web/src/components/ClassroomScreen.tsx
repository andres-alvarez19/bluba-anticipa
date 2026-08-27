import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  Sparkles,
  School,
  BookOpen,
  HeartHandshake,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { ClassroomStudent, EduRiskLevel } from '../types';
import { CLASSROOM_COURSES } from '../data/classroomData';
import { DualGaugeRing } from './DualGaugeRing';

interface ClassroomScreenProps {
  students: ClassroomStudent[];
  onSelectStudent: (student: ClassroomStudent) => void;
  onNavigateToExpressReport?: (student: ClassroomStudent) => void;
}

export const ClassroomScreen: React.FC<ClassroomScreenProps> = ({
  students,
  onSelectStudent,
  onNavigateToExpressReport,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('curso-1b');
  const [expandedTool, setExpandedTool] = useState<'pie' | 'pautas' | null>(null);

  // Normalize course IDs if needed
  const activeCourseStudents = students.filter(
    (s) => s.courseId === selectedCourseId || (selectedCourseId === 'curso-1b' && (s.courseId === '1-basico-b' || !s.courseId))
  );

  const activeCourse =
    CLASSROOM_COURSES.find((c) => c.id === selectedCourseId) || CLASSROOM_COURSES[0];

  return (
    <div className="min-h-full bg-[#F8FAFC] pb-28 text-slate-800 font-sans select-none">
      {/* 1. Header Limpio y Elegante */}
      <header className="px-4.5 pt-3.5 pb-3 bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-[#004D6B] tracking-tight">
              Mi Aula
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Gestión pedagógica y seguimiento preventivo de alumnos
            </p>
          </div>
          <span className="text-[11px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2.5 py-1 rounded-full border border-[#99CAE8] shrink-0">
            {activeCourseStudents.length} alumnos
          </span>
        </div>
      </header>

      <div className="px-4.5 py-3.5 space-y-4">
        {/* 2. Selector de Cursos Estilizado */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Seleccionar curso
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CLASSROOM_COURSES.map((course) => {
              const isSelected = course.id === selectedCourseId;
              return (
                <button
                  key={course.id}
                  id={`btn-course-${course.id}`}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#004D6B] text-white border-[#004D6B] shadow-xs ring-2 ring-[#99CAE8]/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold block">{course.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-[#99CAE8]' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {course.totalStudents}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium">
                    <span className={isSelected ? 'text-rose-200' : 'text-rose-700 font-semibold'}>
                      {course.elevatedCount} alerta{course.elevatedCount === 1 ? '' : 's'}
                    </span>
                    <span className={isSelected ? 'text-white/40' : 'text-slate-300'}>•</span>
                    <span className={isSelected ? 'text-amber-200' : 'text-amber-700 font-semibold'}>
                      {course.moderateCount} ajuste{course.moderateCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Lista de Alumnos con Anillos de Riesgo y Certeza */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#004D6B] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#004D6B]" />
              <span>Nómina de alumnos ({activeCourseStudents.length})</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Anillos: Ext. Riesgo / Int. Certeza
            </span>
          </div>

          <div className="space-y-2.5">
            {activeCourseStudents.map((student) => {
              const isElevated = student.riskLevel === 'ELEVATED';
              const isModerate = student.riskLevel === 'MODERATE';

              const badgeColor = isElevated
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : isModerate
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200';

              const IconTag = isElevated
                ? AlertTriangle
                : isModerate
                ? AlertCircle
                : CheckCircle2;

              return (
                <div
                  key={student.id}
                  id={`student-card-${student.id}`}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                >
                  {/* Top row: Avatar, Name, Status Badge, and Dual Ring */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shrink-0">
                        {student.initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#004D6B] leading-tight">
                          {student.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${badgeColor}`}
                        >
                          <IconTag className="w-3 h-3 shrink-0" />
                          <span>{student.attentionHeadline || student.riskBadgeLabel}</span>
                        </span>
                      </div>
                    </div>

                    {/* Dual Concentric Ring */}
                    <div className="flex flex-col items-center shrink-0 bg-slate-50/90 p-1.5 rounded-xl border border-slate-100">
                      <DualGaugeRing
                        riskScore={student.riskScore}
                        confidenceScore={student.confidenceScore}
                        size="sm"
                        showCenterText={true}
                      />
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold">
                        <span className="text-rose-700">{student.riskScore}/100</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-sky-700">{student.confidenceScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Reason */}
                  <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start justify-between gap-2">
                    <p className="text-[11px] font-medium leading-relaxed">
                      {student.summaryReason}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {student.updatedTime}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      id={`btn-classroom-detail-${student.id}`}
                      onClick={() => onSelectStudent(student)}
                      className="h-8.5 bg-white hover:bg-slate-50 text-[#004D6B] font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span>Ver pauta</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {onNavigateToExpressReport && (
                      <button
                        id={`btn-classroom-register-${student.id}`}
                        onClick={() => onNavigateToExpressReport(student)}
                        className="h-8.5 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#99CAE8]" />
                        <span>Registrar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Herramientas y Recursos de Apoyo Docente */}
        <div className="pt-2 space-y-2 border-t border-slate-200/80">
          <span className="text-[11px] font-bold text-[#004D6B] uppercase tracking-wider block">
            Recursos y Apoyo para el Aula
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Tool 1: Equipo PIE */}
            <div
              onClick={() => setExpandedTool(expandedTool === 'pie' ? null : 'pie')}
              className={`p-3 bg-white rounded-2xl border transition-all cursor-pointer ${
                expandedTool === 'pie'
                  ? 'border-[#004D6B] ring-2 ring-[#99CAE8]/40 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
                <HeartHandshake className="w-4 h-4 text-[#004D6B]" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 mt-2">
                Equipo PIE
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Terapeuta y acuerdos
              </p>
            </div>

            {/* Tool 2: Pautas de Aula */}
            <div
              onClick={() => setExpandedTool(expandedTool === 'pautas' ? null : 'pautas')}
              className={`p-3 bg-white rounded-2xl border transition-all cursor-pointer ${
                expandedTool === 'pautas'
                  ? 'border-[#004D6B] ring-2 ring-[#99CAE8]/40 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-[#EAF6FC] text-[#004D6B] flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4 text-[#004D6B]" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 mt-2">
                Pautas de Aula
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Estrategias sensoriales
              </p>
            </div>
          </div>

          {/* Expanded Tool Content */}
          {expandedTool === 'pie' && (
            <div className="bg-[#EAF6FC] border border-[#99CAE8]/70 rounded-2xl p-3.5 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#004D6B] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#004D6B]" />
                  Contacto Equipo PIE
                </span>
                <button
                  onClick={() => setExpandedTool(null)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>
              <div className="text-[11px] text-slate-700 space-y-1">
                <p><strong>Terapeuta Ocupacional:</strong> Dra. Valentina Ramos</p>
                <p><strong>Horario de coordinación:</strong> Jueves 14:00 - 15:30</p>
                <p className="text-slate-500 text-[10px] mt-1">
                  En caso de escalamiento conductual agudo, contactar a inspectoría o sala de calma PIE.
                </p>
              </div>
            </div>
          )}

          {expandedTool === 'pautas' && (
            <div className="bg-[#EAF6FC] border border-[#99CAE8]/70 rounded-2xl p-3.5 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#004D6B] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#004D6B]" />
                  Pautas y Apoyos Estándar
                </span>
                <button
                  onClick={() => setExpandedTool(null)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 list-disc list-inside">
                <li><strong>Anticipación:</strong> Avisar cambios de sala o profesor con 10 min de antelación.</li>
                <li><strong>Canalización motora:</strong> Asignar tareas prácticas (repartir guías, ordenar libros).</li>
                <li><strong>Sobrecarga auditiva:</strong> Permitir uso de protectores auditivos en actividades grupales.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
