import React from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  AlertCircle,
  Info,
  Zap,
} from 'lucide-react';
import { ClassroomStudent } from '../types';
import { DualGaugeRing } from './DualGaugeRing';

interface StudentDetailScreenProps {
  student: ClassroomStudent;
  onBackToClassroom: () => void;
  onNavigateToExpressReport?: () => void;
}

export const StudentDetailScreen: React.FC<StudentDetailScreenProps> = ({
  student,
  onBackToClassroom,
  onNavigateToExpressReport,
}) => {
  const isHighRisk = student.riskScore >= 70;
  const isModerateRisk = student.riskScore >= 40 && student.riskScore < 70;

  return (
    <div className="flex flex-col h-full justify-between px-4.5 py-4 pb-6 space-y-3.5">
      {/* Header Info & Back Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            id="btn-back-to-classroom"
            onClick={onBackToClassroom}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#004D6B] transition-colors py-1 px-1 -ml-1 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          <span className="text-[11px] font-bold text-[#004D6B] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full border border-[#99CAE8] uppercase tracking-wider">
            Detalle pedagógico
          </span>
        </div>

        {/* Student Profile Header */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-[#004D6B] text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 shrink-0">
                {student.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-bold text-[#004D6B] tracking-tight">
                    {student.name}
                  </h1>
                  <span className="text-xs text-slate-400 font-medium">• {student.courseName}</span>
                </div>
                {/* Pedagogical Attention Headline */}
                <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{student.attentionHeadline}</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-medium text-slate-400">
              {student.updatedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main Functional Content Area */}
      <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
        {/* SECCIÓN 0: Anillos de Riesgo y Certeza */}
        <section
          id="section-risk-confidence-gauge"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Evaluación predictiva de desregulación
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              Jornada actual
            </span>
          </div>

          <div className="flex items-center gap-4 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            {/* Dual Rings */}
            <div className="shrink-0">
              <DualGaugeRing
                riskScore={student.riskScore}
                confidenceScore={student.confidenceScore}
                size="md"
                showCenterText={true}
              />
            </div>

            {/* Explanation of the two concentric rings */}
            <div className="space-y-2 flex-1 min-w-0">
              {/* Outer Ring: Riesgo */}
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-800">Anillo exterior: Riesgo</span>
                    <span className="font-extrabold text-rose-700">{student.riskScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isHighRisk
                      ? 'Nivel elevado de probabilidad de desregulación conductual/emocional.'
                      : isModerateRisk
                      ? 'Nivel moderado de probabilidad de alteración en aula.'
                      : 'Nivel bajo de probabilidad de desregulación.'}
                  </p>
                </div>
              </div>

              {/* Inner Ring: Certeza / Confianza */}
              <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1 shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-800">Anillo interior: Certeza</span>
                    <span className="font-extrabold text-sky-700">{student.confidenceScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Confianza {student.confidenceLabel.toLowerCase()} sustentada en datos del hogar y reportes de aula previos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 1: Qué considerar durante la jornada */}
        <section
          id="section-considerations"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <Info className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Qué considerar durante la jornada
            </h2>
          </div>

          <ul className="space-y-2">
            {student.considerations.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs font-medium text-slate-700 leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECCIÓN 2: Acciones para el aula (Máximo 3) */}
        <section
          id="section-classroom-actions"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                Acciones para el aula
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/70">
              Apoyos recomendados
            </span>
          </div>

          <div className="space-y-2.5">
            {student.classroomActions.map((action) => (
              <div
                key={action.id}
                id={`action-item-${action.id}`}
                className="bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl p-3 space-y-1 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-[#004D6B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    {action.number}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug">
                      {action.title}
                    </h3>
                    {action.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {action.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary Info & Missing Data Notice if applicable */}
        {student.missingDataNote && (
          <div
            id="banner-missing-data"
            className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[11px]">Dato pendiente</span>
              <p className="text-[11px] text-amber-800/90">
                {student.missingDataNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prominent CTA for Teacher: Registrar evento */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <button
          id="btn-report-escalation-cta"
          onClick={onNavigateToExpressReport}
          className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Zap className="w-4 h-4 text-[#99CAE8]" />
          <span>Registrar observación de aula</span>
        </button>
      </div>
    </div>
  );
};
