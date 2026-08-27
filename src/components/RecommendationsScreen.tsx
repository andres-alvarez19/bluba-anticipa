import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  CalendarDays,
  X,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { ChildState, PreventiveAction } from '../types';

interface ExtendedRecommendation {
  id: string;
  title: string;
  description: string;
  origin: string;
  category: 'Sensorial' | 'Transiciones' | 'Rutina' | 'Emocional';
  steps: string[];
  tipsForCaregiver?: string;
}

interface RecommendationsScreenProps {
  childData: ChildState;
  selectedStrategyId?: string;
  onSelectStrategy?: (id: string, title: string) => void;
  onNavigateToFeedback: () => void;
  onNavigateToToday?: () => void;
  onOpenPreventiveModal?: () => void;
  availableChildren?: ChildState[];
  onSelectChild?: (child: ChildState) => void;
}

const CHILD_RECOMMENDATIONS_MAP: Record<string, ExtendedRecommendation[]> = {
  'mateo-r': [
    {
      id: 'rec-mateo-1',
      title: 'Espacio de menor estimulación sensorial',
      description: 'Facilita acceso al rincón de calma con luces tenues cuando aparezcan signos de fatiga.',
      origin: 'Ayudó antes',
      category: 'Sensorial',
      steps: [
        'Atenuar luces principales y reducir ruidos de fondo en la habitación.',
        'Ofrecer manta con peso o cojín sensorial durante 10 a 15 minutos.',
        'Acompañar en silencio sin exigir interacción verbal inmediata.'
      ],
      tipsForCaregiver: 'En observaciones previas, el rincón de calma redujo la sobrecarga sensorial en un 80%.'
    },
    {
      id: 'rec-mateo-2',
      title: 'Anticipación visual de transiciones',
      description: 'Avisar 5 minutos antes del cambio de actividad usando pictogramas de su rutina.',
      origin: 'Terapeuta',
      category: 'Transiciones',
      steps: [
        'Avisar con temporizador visual antes de terminar el juego actual.',
        'Mostrar imagen clara de la siguiente actividad (ej. cena, baño).',
        'Permitir que Mateo mueva el pictograma al panel de "completado".'
      ],
      tipsForCaregiver: 'Estrategia clave del plan de Terapia Ocupacional para anticipar cambios de ambiente.'
    },
    {
      id: 'rec-mateo-3',
      title: 'Simplificar demandas en la tarde',
      description: 'Dividir tareas en bloques breves de 10 minutos con pausas activas intermedias.',
      origin: 'Pauta habitual',
      category: 'Rutina',
      steps: [
        'Priorizar una sola consigna directa a la vez.',
        'Dar pausa breve para beber agua fresca o estirarse entre actividades.',
        'Reconocer el esfuerzo tras completar cada bloque.'
      ],
      tipsForCaregiver: 'Ayuda a regular la energía vespertina sin sobrecargar su atención sostenida.'
    },
    {
      id: 'rec-mateo-4',
      title: 'Pausa con hidratación y respiración',
      description: 'Ofrecer agua fresca en vaso con pajita y 3 respiraciones profundas antes de comer.',
      origin: 'Ayudó antes',
      category: 'Emocional',
      steps: [
        'Ofrecer vaso con pajita (el esfuerzo de succión ayuda a la autorregulación).',
        'Modelar juntos 3 respiraciones lentas inflando el abdomen.',
        'Sentarse a la mesa cuando su respiración sea estable.'
      ],
      tipsForCaregiver: 'Efectivo para calmar el ritmo cardíaco y facilitar la ingesta de alimentos.'
    }
  ],
  'sofia-m': [
    {
      id: 'rec-sofia-1',
      title: 'Merienda con texturas y pausa sensorial',
      description: 'Snack crujiente y ambiente sin ruidos fuertes antes de salir a talleres.',
      origin: 'Ayudó antes',
      category: 'Sensorial',
      steps: [
        'Ofrecer snack saludable crujiente que aporte input propioceptivo oral.',
        'Facilitar 10 minutos de calma en su habitación con volumen bajo.',
        'Verificar que su mochila esté lista con antelación.'
      ],
      tipsForCaregiver: 'El input propioceptivo oral favorece la concentración previa a entornos ruidosos.'
    },
    {
      id: 'rec-sofia-2',
      title: 'Acompañamiento en transición de salida',
      description: 'Revisar fotos de la actividad para reducir la incertidumbre del cambio.',
      origin: 'Terapeuta',
      category: 'Transiciones',
      steps: [
        'Repasar brevemente quién estará en el taller y qué actividades harán.',
        'Permitir que lleve un llavero sensorial o pequeño objeto de apego.',
        'Despedida predecible y afectuosa.'
      ],
      tipsForCaregiver: 'Reduce la ansiedad anticipatoria ante cambios de cuidadores o docentes.'
    },
    {
      id: 'rec-sofia-3',
      title: 'Juego libre sin pantallas',
      description: '20 minutos de movimiento en el suelo para descomprimir energía acumulada.',
      origin: 'Pauta habitual',
      category: 'Rutina',
      steps: [
        'Disponer tapete o cojines para juegos motores libres.',
        'Evitar dispositivos electrónicos durante esta ventana de tiempo.',
        'Permitir que ella guíe el ritmo del juego.'
      ],
      tipsForCaregiver: 'Consolida la relajación muscular después de jornadas escolares intensas.'
    }
  ],
  'lucas-a': [
    {
      id: 'rec-lucas-1',
      title: 'Refuerzo verbal positivo',
      description: 'Reconocer verbalmente su capacidad de esperar turnos y pedir pausas.',
      origin: 'Terapeuta',
      category: 'Emocional',
      steps: [
        'Identificar el momento exacto en que expresa calma o espera su turno.',
        'Elogiar de forma específica y cercana (ej. "¡Qué bien pediste tu turno!").',
        'Evitar correcciones prolongadas durante momentos de frustración.'
      ],
      tipsForCaregiver: 'Fortalece la autoestima y la autorregulación guiada.'
    },
    {
      id: 'rec-lucas-2',
      title: 'Juego estructurado al aire libre',
      description: 'Movimiento en parque o patio para canalizar energía de forma regulada.',
      origin: 'Ayudó antes',
      category: 'Rutina',
      steps: [
        'Establecer 20-30 minutos de actividad motriz al aire libre.',
        'Definir reglas claras y sencillas antes de iniciar el juego.',
        'Avisar 3 minutos antes del cierre de la actividad.'
      ],
      tipsForCaregiver: 'El gasto de energía en espacios abiertos promueve una noche de descanso reparador.'
    },
    {
      id: 'rec-lucas-3',
      title: 'Lectura compartida antes de dormir',
      description: '15 minutos de cuento con luz cálida para consolidar el sueño reparador.',
      origin: 'Pauta habitual',
      category: 'Sensorial',
      steps: [
        'Atenuar luces y preparar la cama con temperatura agradable.',
        'Leer un cuento breve con tono de voz pausado y bajo.',
        'Rutina predecible de despedida para conciliar el sueño.'
      ],
      tipsForCaregiver: 'Facilita la transición hacia el reposo nocturno.'
    }
  ]
};

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({
  childData,
  onNavigateToFeedback,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionFeedbackMap, setActionFeedbackMap] = useState<Record<string, 'yes' | 'partial' | 'no'>>({});
  const [activeModalProtocol, setActiveModalProtocol] = useState<{
    title: string;
    category: string;
    origin?: string;
    badgeText?: string;
    steps: string[];
    tips?: string;
  } | null>(null);

  const childKey = childData.id in CHILD_RECOMMENDATIONS_MAP ? childData.id : 'mateo-r';
  const childRecommendations = CHILD_RECOMMENDATIONS_MAP[childKey] || CHILD_RECOMMENDATIONS_MAP['mateo-r'];

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'Sensorial', label: 'Sensorial' },
    { id: 'Transiciones', label: 'Transiciones' },
    { id: 'Rutina', label: 'Rutina' },
    { id: 'Emocional', label: 'Emocional' }
  ];

  const filteredRecs = selectedCategory === 'all'
    ? childRecommendations
    : childRecommendations.filter(r => r.category === selectedCategory);

  const primaryActionId = `primary-${childData.id}-${childData.preventiveAction.id}`;
  const primaryFeedback = actionFeedbackMap[primaryActionId];

  // Cálculo de color para la etiqueta de nivel de riesgo
  const riskScore = childData.riskScoreInternal || 74;
  const isHighRisk = riskScore >= 70 || childData.riskLevel === 'HIGH' || /elevado|alto/i.test(childData.riskTextHeadline || '');
  const isModerateRisk = (riskScore >= 35 && riskScore < 70) || childData.riskLevel === 'MODERATE' || /moderado/i.test(childData.riskTextHeadline || '');

  const riskBadgeStyle = isHighRisk
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isModerateRisk
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const handleFeedback = (actionId: string, value: 'yes' | 'partial' | 'no') => {
    setActionFeedbackMap(prev => ({
      ...prev,
      [actionId]: value
    }));
  };

  const handleResetFeedback = (actionId: string) => {
    setActionFeedbackMap(prev => {
      const next = { ...prev };
      delete next[actionId];
      return next;
    });
  };

  // Abrir protocolo al pulsar la recomendación principal
  const handleOpenPrimaryProtocol = () => {
    setActiveModalProtocol({
      title: childData.preventiveAction.title,
      category: 'Prioritaria',
      origin: 'Pauta sugerida hoy',
      badgeText: childData.preventiveAction.badgeText,
      steps: childData.preventiveAction.steps || [
        'Atenuar estímulos ambientales y luces fuertes.',
        'Ofrecer apoyo sensorial estructurado durante 10 minutos.',
        'Acompañar con voz suave y respetar su tiempo de regulación.'
      ],
      tips: childData.preventiveAction.tipsForCaregiver
    });
  };

  // Abrir protocolo al pulsar una recomendación complementaria
  const handleOpenRecProtocol = (rec: ExtendedRecommendation) => {
    setActiveModalProtocol({
      title: rec.title,
      category: rec.category,
      origin: rec.origin,
      badgeText: rec.origin,
      steps: rec.steps,
      tips: rec.tipsForCaregiver
    });
  };

  return (
    <div className="px-4.5 py-4 space-y-3.5 pb-14">
      {/* 1. CABECERA LIMPIA DEL PERFIL ACTIVO (SIN SELECTOR, RIESGO CON COLOR DINÁMICO) */}
      <section
        id="block-recommendations-child-header"
        className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#004D6B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {childData.avatarText || 'MR'}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-[#004D6B] leading-tight truncate">
              {childData.name}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Consejos y pautas
            </p>
          </div>
        </div>

        <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${riskBadgeStyle}`}>
          {childData.riskTextHeadline}
        </span>
      </section>

      {/* 2. RECOMENDACIÓN SUGERIDA PARA HOY (PULSAR PARA VER PROTOCOLO) */}
      <section
        id="section-primary-home-recommendation"
        onClick={handleOpenPrimaryProtocol}
        className="bg-white border border-[#99CAE8]/90 hover:border-[#004D6B] rounded-2xl p-4 shadow-2xs space-y-3 cursor-pointer transition-all active:scale-[0.99] group"
      >
        {/* Header limpio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-[#004D6B]">
              Recomendación sugerida hoy
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#004D6B] opacity-80 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-[#004D6B]" />
          </div>
        </div>

        {/* Título y descripción concisa */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#004D6B] transition-colors">
            {childData.preventiveAction.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {childData.preventiveAction.summary}
          </p>
        </div>

        {/* Feedback: ¿Funcionó? (stopPropagation para no abrir el modal al votar) */}
        <div
          id="primary-action-feedback"
          onClick={(e) => e.stopPropagation()}
          className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
        >
          <span className="text-xs font-bold text-slate-700">
            ¿Funcionó?
          </span>

          {!primaryFeedback ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleFeedback(primaryActionId, 'yes')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sí</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback(primaryActionId, 'partial')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <span>Parcial</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback(primaryActionId, 'no')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                <span>No</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {primaryFeedback === 'yes' ? 'Registrado: Sí' : primaryFeedback === 'partial' ? 'Registrado: Parcial' : 'Registrado: No'}
              </span>
              <button
                type="button"
                onClick={() => handleResetFeedback(primaryActionId)}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-700 underline cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. FILTROS RÁPIDOS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#004D6B] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 4. OTRAS ESTRATEGIAS (PULSAR PARA VER PROTOCOLO, SIN BOTÓN DE APLICAR) */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-0.5">
          Otras opciones ({filteredRecs.length})
        </h3>

        <div className="space-y-2.5">
          {filteredRecs.map((rec) => {
            const feedbackKey = `rec-${childData.id}-${rec.id}`;
            const feedback = actionFeedbackMap[feedbackKey];

            return (
              <div
                key={rec.id}
                id={`card-${rec.id}`}
                onClick={() => handleOpenRecProtocol(rec)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 hover:border-[#004D6B] transition-all space-y-2.5 shadow-2xs cursor-pointer active:scale-[0.99] group"
              >
                {/* Cabecera limpia: Categoría + Origen sutil + Indicador de flecha */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#004D6B] bg-[#EAF6FC] px-2 py-0.5 rounded-md">
                      {rec.category}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {rec.origin}
                    </span>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004D6B] transition-colors" />
                </div>

                {/* Título y descripción concisa */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#004D6B] transition-colors">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {rec.description}
                  </p>
                </div>

                {/* Acciones limpias en fila única: Solo ¿Funcionó? */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-slate-700">
                    ¿Funcionó?
                  </span>

                  {!feedback ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFeedback(feedbackKey, 'yes')}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-all active:scale-95 cursor-pointer"
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(feedbackKey, 'no')}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-bold text-slate-600 hover:text-rose-700 transition-all active:scale-95 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{feedback === 'yes' ? 'Sirvió' : 'No sirvió'}</span>
                      <button
                        type="button"
                        onClick={() => handleResetFeedback(feedbackKey)}
                        className="text-[10.5px] text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer font-normal"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ACCESO AL HISTORIAL */}
      <div className="pt-1">
        <button
          id="btn-go-to-calendar-stats"
          type="button"
          onClick={onNavigateToFeedback}
          className="w-full h-10 bg-white hover:bg-slate-50 text-[#004D6B] font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
        >
          <CalendarDays className="w-3.5 h-3.5 text-[#004D6B]" />
          <span>Ver calendario e historial</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 6. MODAL INTERACTIVO DE PROTOCOLO (SE ABRE AL PULSAR CUALQUIER CARD) */}
      {activeModalProtocol && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            id="modal-recommendation-protocol"
            className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200"
          >
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF6FC] text-[#004D6B] border border-[#99CAE8]/70">
                  <ShieldCheck className="w-3 h-3 text-[#004D6B]" />
                  {activeModalProtocol.category}
                </span>
                <h2 className="text-base font-bold text-[#004D6B] leading-snug">
                  {activeModalProtocol.title}
                </h2>
              </div>
              <button
                id="btn-close-protocol-modal"
                type="button"
                onClick={() => setActiveModalProtocol(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pasos del protocolo */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pasos de aplicación sugeridos
              </h3>

              <div className="space-y-2">
                {activeModalProtocol.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-150 flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#004D6B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips y evidencia para el cuidador */}
            {activeModalProtocol.tips && (
              <div className="bg-sky-50/70 rounded-xl p-3.5 border border-sky-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#004D6B]">
                  <BookOpen className="w-3.5 h-3.5 text-[#004D6B]" />
                  <span>Recomendación para {childData.name.split(' ')[0]}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                  {activeModalProtocol.tips}
                </p>
              </div>
            )}

            {/* Footer con botón de cierre */}
            <div className="pt-2">
              <button
                id="btn-dismiss-protocol-modal"
                type="button"
                onClick={() => setActiveModalProtocol(null)}
                className="w-full h-11 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <span>Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
