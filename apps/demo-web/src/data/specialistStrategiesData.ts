import { SpecialistStrategy } from '../types';

export const MATEO_STRATEGIES: SpecialistStrategy[] = [
  {
    id: 'strat-1',
    title: 'Anticipación visual de transiciones',
    origin: 'Profesional',
    context: 'Hogar y escuela',
    timesApplied: 4,
    observedResultsSummary: [
      { label: '3 ayudaron', count: 3, type: 'helped' },
      { label: '1 ayudó parcialmente', count: 1, type: 'partial' },
    ],
    shortDescription:
      'Secuencia visual con apoyos pictográficos 5 minutos antes de cambiar de actividad o espacio físico.',
    historyContextRelation:
      'Utilizada anteriormente en contextos con cambios de rutina y transiciones entre asignaturas.',
    applications: [
      {
        id: 'app-1',
        dateLabel: '24 ago',
        context: 'Escuela',
        result: 'Ayudó',
        contextDetail: 'Transición hacia la sala de talleres.',
      },
      {
        id: 'app-2',
        dateLabel: '18 ago',
        context: 'Hogar',
        result: 'Ayudó parcialmente',
        contextDetail: 'Salida matutina hacia el colegio.',
      },
      {
        id: 'app-3',
        dateLabel: '12 ago',
        context: 'Escuela',
        result: 'Ayudó',
        contextDetail: 'Reincorporación a sala tras recreo mayor.',
      },
      {
        id: 'app-4',
        dateLabel: '05 ago',
        context: 'Hogar',
        result: 'Ayudó',
        contextDetail: 'Inicio de rutina de cena y descanso.',
      },
    ],
  },
  {
    id: 'strat-2',
    title: 'Espacio de menor estimulación',
    origin: 'Historial individual',
    context: 'Escuela',
    timesApplied: 3,
    observedResultsSummary: [
      { label: '2 ayudaron', count: 2, type: 'helped' },
      { label: '1 sin efecto', count: 1, type: 'none' },
    ],
    shortDescription:
      'Pausa preventiva de 5 a 7 minutos en rincón con luz atenuada y baja carga sonora.',
    historyContextRelation:
      'Utilizada anteriormente en jornadas con sobrecarga sensorial o fatiga acumulada.',
    applications: [
      {
        id: 'app-21',
        dateLabel: '22 ago',
        context: 'Escuela',
        result: 'Ayudó',
        contextDetail: 'Pausa en rincón tranquilo antes de evaluación.',
      },
      {
        id: 'app-22',
        dateLabel: '14 ago',
        context: 'Escuela',
        result: 'Sin efecto',
        contextDetail: 'Aplicada tardíamente durante escalada motora.',
      },
      {
        id: 'app-23',
        dateLabel: '08 ago',
        context: 'Escuela',
        result: 'Ayudó',
        contextDetail: 'Pausa previa al bloque de almuerzo.',
      },
    ],
  },
];
