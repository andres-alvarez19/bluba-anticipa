import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Plus,
  Wifi,
  WifiOff,
  Clock,
  Check,
  User,
  ShieldAlert
} from 'lucide-react';
import { ClassroomStudent } from '../types';
import { DualGaugeRing } from './DualGaugeRing';

interface TeacherHomeScreenProps {
  students: ClassroomStudent[];
  onSelectStudent: (student: ClassroomStudent) => void;
  onNavigateToClassroom: () => void;
  onNavigateToExpressReport: (student?: ClassroomStudent) => void;
  onNavigateToProfile: () => void;
  recentSavedToast?: {
    studentName: string;
    isOffline: boolean;
  } | null;
  onClearToast?: () => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  students,
  onSelectStudent,
  onNavigateToClassroom,
  onNavigateToExpressReport,
  onNavigateToProfile,
  recentSavedToast,
  onClearToast,
}) => {
  // Automatic online / offline detection without click selector
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    subtext?: string;
    isOffline?: boolean;
  } | null>(
    recentSavedToast
      ? {
          text: `✓ Observación registrada para ${recentSavedToast.studentName}`,
          subtext: recentSavedToast.isOffline
            ? 'Guardado en el dispositivo · Pendiente de sincronización'
            : 'Guardado y sincronizado con el seguimiento escolar',
          isOffline: recentSavedToast.isOffline,
        }
      : null
  );

  const desregulatedStudents = students
    .filter((student) => student.riskLevel === 'ELEVATED' || student.riskLevel === 'MODERATE')
    .slice(0, 2);

  return (
    <div className="relative min-h-full bg-[#F8FAFC] pb-28 text-slate-800 font-sans select-none">
      {/* Automatic Discrete Offline Banner if offline */}
      {!isOnline && (
        <div
          id="banner-offline-mode"
          className="bg-amber-500 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs sticky top-0 z-40"
        >
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-100" />
            <div>
              <p className="font-bold text-[11px] leading-tight">Sin conexión</p>
              <p className="text-[10px] text-amber-100">
                Los registros se guardarán automáticamente en este dispositivo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Post-Save Toast Feedback */}
      {toastMessage && (
        <div
          id="toast-post-save-notification"
          className="mx-4 mt-3 p-3 bg-[#004D6B] text-white rounded-2xl shadow-md border border-[#99CAE8]/40 flex items-start justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold leading-tight">{toastMessage.text}</p>
              {toastMessage.subtext && (
                <p className="text-[11px] text-[#99CAE8] leading-tight">
                  {toastMessage.subtext}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setToastMessage(null);
              if (onClearToast) onClearToast();
            }}
            className="text-[#99CAE8] hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header: Limpio y directo con saludo y estado automático de red */}
      <header className="px-4.5 pt-3.5 pb-3 bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-[#004D6B] tracking-tight">
            Buenos días, Camila
          </h1>

          {/* Automatic Network indicator (non-clickable) */}
          <div
            id="indicator-network-status"
            className={`p-2 rounded-xl border flex items-center justify-center ${
              isOnline
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={isOnline ? 'Conexión activa' : 'Sin conexión'}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-600" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-4.5 py-3.5 space-y-3.5">
        {/* Sección: Alumnos desregulados o con cambios hoy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-[#004D6B] tracking-tight">
              Alumnos con señales de desregulación hoy
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EAF6FC] text-[#004D6B] px-2.5 py-1 rounded-full border border-[#99CAE8] shrink-0 whitespace-nowrap">
              <User className="w-3 h-3 text-[#004D6B] shrink-0" />
              <span>Alumnos</span>
            </span>
          </div>

          {/* Student Cards: 1st Recent Change, 2nd Desregulation Alert */}
          <div className="space-y-3">
            {desregulatedStudents.map((student, index) => {
              const isRecentChange = index === 0; // Primero es cambio reciente
              const isDesregulationAlert = index === 1; // Segundo es alerta de desregulación

              const badgeStyles = isRecentChange
                ? {
                    container: 'border-sky-200 bg-white hover:border-sky-300',
                    tag: 'bg-sky-50 text-sky-800 border-sky-200',
                    icon: AlertCircle,
                    iconColor: 'text-sky-600',
                    tagText: 'Cambio reciente',
                  }
                : {
                    container: 'border-rose-300 bg-white hover:border-rose-400',
                    tag: 'bg-rose-50 text-rose-800 border-rose-200',
                    icon: AlertTriangle,
                    iconColor: 'text-rose-600',
                    tagText: 'Alerta de desregulación',
                  };

              const IconTag = badgeStyles.icon;

              return (
                <div
                  key={student.id}
                  id={`card-student-desregulated-${student.id}`}
                  className={`rounded-2xl p-3.5 border shadow-2xs space-y-3 transition-all ${badgeStyles.container}`}
                >
                  {/* Card Header: Avatar + Info + Anillos concéntricos de Riesgo y Certeza */}
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
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${badgeStyles.tag}`}
                        >
                          <IconTag className={`w-3 h-3 ${badgeStyles.iconColor} shrink-0`} />
                          <span>{badgeStyles.tagText}</span>
                        </span>
                        <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{student.updatedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Concentric Gauge Ring (Risk & Confidence) */}
                    <div className="flex flex-col items-center shrink-0 bg-slate-50/80 p-1.5 rounded-xl border border-slate-100">
                      <DualGaugeRing
                        riskScore={student.riskScore}
                        confidenceScore={student.confidenceScore}
                        size="sm"
                        showCenterText={true}
                      />
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold">
                        <span className="flex items-center gap-0.5 text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                          {student.riskScore}/100
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-0.5 text-sky-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                          {student.confidenceScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explicación concisa del cambio observado */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Señales observadas:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-800 font-medium">
                      {student.considerations?.map((cons, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{cons}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ajuste Pedagógico Recomendado para hoy */}
                  {student.classroomActions && student.classroomActions.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#EAF6FC]/70 border border-[#99CAE8]/70 text-xs space-y-1">
                      <span className="font-bold text-[#004D6B] block text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#004D6B]" />
                        <span>Ajuste recomendado para el aula:</span>
                      </span>
                      <p className="text-[11px] text-[#004D6B] font-semibold leading-snug">
                        {student.classroomActions[0].title}
                      </p>
                    </div>
                  )}

                  {/* Acciones directas: Ver detalle y Registrar */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      id={`btn-student-detail-${student.id}`}
                      onClick={() => onSelectStudent(student)}
                      className="h-9 bg-white hover:bg-slate-50 text-[#004D6B] font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <span>Ver detalle</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      id={`btn-student-register-${student.id}`}
                      onClick={() => onNavigateToExpressReport(student)}
                      className="h-9 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#99CAE8]" />
                      <span>Registrar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
