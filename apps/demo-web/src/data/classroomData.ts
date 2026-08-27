import { ClassroomStudent } from '../types';

export interface ClassroomCourse {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  elevatedCount: number;
  moderateCount: number;
  lowCount: number;
  insufficientCount: number;
}

export const CLASSROOM_COURSES: ClassroomCourse[] = [
  {
    id: '2-basico-a',
    name: '2º Básico A',
    grade: '2º Básico',
    totalStudents: 24,
    elevatedCount: 1,
    moderateCount: 1,
    lowCount: 21,
    insufficientCount: 1,
  },
  {
    id: '1-basico-b',
    name: '1º Básico B',
    grade: '1º Básico',
    totalStudents: 22,
    elevatedCount: 1,
    moderateCount: 2,
    lowCount: 18,
    insufficientCount: 1,
  },
];

export const CLASSROOM_STUDENTS: ClassroomStudent[] = [
  // 1. MATEO (sujeto canónico de demo)
  {
    id: 'child-demo-1',
    name: 'Mateo R.',
    initials: 'MR',
    courseId: '1-basico-b',
    courseName: '1º Básico B',
    riskLevel: 'INSUFFICIENT',
    riskScore: 0,
    riskBadgeLabel: 'Pendiente de API',
    confidenceScore: 0,
    confidenceLabel: 'Pendiente de API',
    summaryReason: 'El estado preventivo de Mateo se obtiene desde Backend.',
    updatedTime: 'Pendiente de API',
    attentionHeadline: 'Atención prioritaria hoy',
    considerations: [
      'Mayor irritabilidad registrada durante el inicio.',
      'Alerta más alta de lo habitual.',
      'Cambio de sala informado para hoy.',
    ],
    classroomActions: [
      {
        id: 'act-m1',
        number: 1,
        title: 'Anticipar visualmente las próximas transiciones.',
        description: 'Anticipar la transición y ofrecer un espacio de menor estimulación si lo necesita.',
      },
      {
        id: 'act-m2',
        number: 2,
        title: 'Ofrecer zona de baja estimulación sensorial.',
        description: 'Permitir uso de audífonos canceladores de ruido o rincón de calma ante ruidos imprevistos.',
      },
    ],
    missingDataNote: undefined,
  },

  // 2. EMILIA (Requiere seguimiento)
  {
    id: 'emilia-v',
    name: 'Emilia V.',
    initials: 'EV',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'MODERATE',
    riskScore: 48,
    riskBadgeLabel: 'Requiere seguimiento',
    confidenceScore: 80,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Necesitó mayor apoyo durante la primera actividad de la mañana.',
    updatedTime: 'Hace 40 min',
    attentionHeadline: 'Requiere seguimiento',
    considerations: [
      'Necesitó mayor apoyo durante la primera actividad.',
      'Mayor sensibilidad ante consignas verbales extensas.',
    ],
    classroomActions: [
      {
        id: 'act-e1',
        number: 1,
        title: 'Fraccionar instrucciones complejas en pasos individuales.',
        description: 'Verificar comprensión con tarjetas visuales antes del trabajo autónomo.',
      },
    ],
    missingDataNote: undefined,
  },

  // 3. LUCAS (Información incompleta)
  {
    id: 'lucas-m',
    name: 'Lucas M.',
    initials: 'LM',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'INSUFFICIENT',
    riskScore: 30,
    riskBadgeLabel: 'Información incompleta',
    confidenceScore: 25,
    confidenceLabel: 'Confianza baja',
    summaryReason: 'No existen observaciones escolares recientes suficientes para confirmar su estado actual.',
    updatedTime: 'Sin registros hoy',
    attentionHeadline: 'Información incompleta',
    considerations: [
      'No existen observaciones escolares recientes.',
      'Se requiere observación inicial durante el primer bloque.',
    ],
    classroomActions: [
      {
        id: 'act-lucas1',
        number: 1,
        title: 'Registrar observación en la primera transición o actividad.',
        description: 'Verificar estado de alerta y disposición al ingreso de la jornada.',
      },
    ],
    missingDataNote: 'No existen registros recientes suficientes para confirmar el estado actual.',
  },

  // 4. SOFÍA (Sin señales relevantes)
  {
    id: 'sofia-g',
    name: 'Sofía G.',
    initials: 'SG',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 14,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 92,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Patrón habitual y buena disposición en el aula.',
    updatedTime: '08:30',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [
      'Llegada tranquila con participación regular.',
      'Sin variaciones detectadas respecto a su línea base.',
    ],
    classroomActions: [
      {
        id: 'act-sg1',
        number: 1,
        title: 'Mantener la rutina y apoyos habituales.',
        description: 'Continuar con el acompañamiento pedagógico planificado.',
      },
    ],
  },

  // 5. DIEGO (Resto del curso con seguimiento reciente)
  {
    id: 'diego-r',
    name: 'Diego R.',
    initials: 'DR',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 22,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 88,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Estable con apoyos regulares.',
    updatedTime: '09:10',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [
      'Participación adecuada en actividades grupales.',
    ],
    classroomActions: [],
  },

  // 6. ANTONIA (Resto del curso)
  {
    id: 'antonia-l',
    name: 'Antonia L.',
    initials: 'AL',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 12,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 95,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Sin eventos ni alertas reportadas.',
    updatedTime: '09:10',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [
      'Ingreso habitual sin requerimientos extraordinarios.',
    ],
    classroomActions: [],
  },

  // 7. MATÍAS (Resto del curso)
  {
    id: 'matias-p',
    name: 'Matías P.',
    initials: 'MP',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 15,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 90,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Regulación dentro de lo esperado.',
    updatedTime: '08:50',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [],
    classroomActions: [],
  },

  // 8. VALENTINA (Resto del curso)
  {
    id: 'valentina-c',
    name: 'Valentina C.',
    initials: 'VC',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 10,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 96,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Trabajo autónomo sin dificultades.',
    updatedTime: '08:45',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [],
    classroomActions: [],
  },

  // 9. FELIPE (Resto del curso)
  {
    id: 'felipe-h',
    name: 'Felipe H.',
    initials: 'FH',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 18,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 89,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Interacción social positiva en el recreo.',
    updatedTime: '08:35',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [],
    classroomActions: [],
  },

  // 10. CAMILA (Resto del curso)
  {
    id: 'camila-b',
    name: 'Camila B.',
    initials: 'CB',
    courseId: '2-basico-a',
    courseName: '2º Básico A',
    riskLevel: 'LOW',
    riskScore: 11,
    riskBadgeLabel: 'Sin señales relevantes',
    confidenceScore: 94,
    confidenceLabel: 'Confianza alta',
    summaryReason: 'Bienestar habitual en aula.',
    updatedTime: '08:20',
    attentionHeadline: 'Sin señales relevantes',
    considerations: [],
    classroomActions: [],
  },
];
