import React from 'react';
import {
  Home,
  Users,
  BookmarkCheck,
  User,
  School,
  Zap,
  Lightbulb,
  Moon,
  Mic,
  Plus,
  CalendarDays
} from 'lucide-react';
import { AppScreen, UserRole } from '../types';

interface MobileBottomNavProps {
  currentRole: UserRole;
  activeScreen: AppScreen;
  onSelectScreen: (screen: AppScreen) => void;
  onOpenQuickReport?: () => void;
  childName?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRole,
  activeScreen,
  onSelectScreen,
  onOpenQuickReport,
  childName = 'Perfil',
}) => {
  // 1. ESPECIALISTA (Max 4 items)
  if (currentRole === 'SPECIALIST') {
    const isHome = activeScreen === 'ESP_00_HOME';
    const isPatients =
      activeScreen === 'ESP_01_PATIENTS' ||
      activeScreen === 'ESP_02_PATIENT_SUMMARY' ||
      activeScreen === 'ESP_03_EVOLUTION' ||
      activeScreen === 'ESP_04_FACTORS';
    const isStrategies = activeScreen === 'ESP_05_STRATEGIES';
    const isProfile = activeScreen === 'ESP_06_PROFILE';

    return (
      <nav
        id="specialist-bottom-nav"
        aria-label="Navegación Especialista"
        className="h-16 bg-white border-t border-slate-200/90 px-3 flex items-center justify-around shrink-0 z-30 shadow-lg"
      >
        {/* Inicio */}
        <button
          id="tab-esp-home"
          onClick={() => onSelectScreen('ESP_00_HOME')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isHome ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isHome ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Inicio</span>
        </button>

        {/* Casos Clínicos */}
        <button
          id="tab-esp-patients"
          onClick={() => onSelectScreen('ESP_01_PATIENTS')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isPatients ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isPatients ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Casos</span>
        </button>

        {/* Estrategias */}
        <button
          id="tab-esp-strategies"
          onClick={() => onSelectScreen('ESP_05_STRATEGIES')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isStrategies ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isStrategies ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <BookmarkCheck className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Estrategias</span>
        </button>

        {/* Perfil */}
        <button
          id="tab-esp-profile"
          onClick={() => onSelectScreen('ESP_06_PROFILE')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isProfile ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isProfile ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <User className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Perfil</span>
        </button>
      </nav>
    );
  }

  // 2. PROFESOR / EDUCADOR (Inicio, Mi Aula, Perfil)
  if (currentRole === 'TEACHER') {
    const isHome = activeScreen === 'EDU_00_HOME';
    const isClassroom =
      activeScreen === 'EDU_01_CLASSROOM' || activeScreen === 'EDU_02_STUDENT_DETAIL';
    const isProfile = activeScreen === 'EDU_04_PROFILE';

    return (
      <nav
        id="teacher-bottom-nav"
        aria-label="Navegación Docente"
        className="h-16 bg-white border-t border-slate-200/90 px-4 flex items-center justify-around shrink-0 z-30 shadow-lg"
      >
        {/* Inicio */}
        <button
          id="tab-edu-home"
          onClick={() => onSelectScreen('EDU_00_HOME')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isHome ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isHome ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Inicio</span>
        </button>

        {/* Mi Aula */}
        <button
          id="tab-edu-classroom"
          onClick={() => onSelectScreen('EDU_01_CLASSROOM')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isClassroom ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isClassroom ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <School className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Mi Aula</span>
        </button>

        {/* Perfil */}
        <button
          id="tab-edu-profile"
          onClick={() => onSelectScreen('EDU_04_PROFILE')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isProfile ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isProfile ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
            <User className="w-4 h-4" />
          </div>
          <span className="text-[10.5px] tracking-tight mt-0.5">Perfil</span>
        </button>
      </nav>
    );
  }

  // 3. FAMILIA (4 Destinos + Botón de Reporte Rápido Central)
  const isToday =
    activeScreen === 'FAM_01_TODAY' ||
    activeScreen === 'FAM_05_ALERT_DETAIL' ||
    activeScreen === 'FAM_06_INSUFFICIENT_INFO';
  const isRecommendations = activeScreen === 'FAM_03_RECOMMENDATIONS';
  const isFeedback = activeScreen === 'FAM_04_FEEDBACK';
  const isProfile = activeScreen === 'FAM_07_PROFILE';

  return (
    <nav
      id="family-bottom-nav"
      aria-label="Navegación Familia"
      className="h-16 bg-white border-t border-slate-200/90 px-2 flex items-center justify-around shrink-0 z-30 shadow-lg relative"
    >
      {/* 1. Hoy */}
      <button
        id="tab-fam-today"
        onClick={() => onSelectScreen('FAM_01_TODAY')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isToday ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isToday ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
          <Home className="w-4 h-4" />
        </div>
        <span className="text-[10.5px] tracking-tight mt-0.5">Hoy</span>
      </button>

      {/* 2. Consejos / Apoyos */}
      <button
        id="tab-fam-recommendations"
        onClick={() => onSelectScreen('FAM_03_RECOMMENDATIONS')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isRecommendations ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isRecommendations ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
          <Lightbulb className="w-4 h-4" />
        </div>
        <span className="text-[10.5px] tracking-tight mt-0.5">Consejos</span>
      </button>

      {/* BOTÓN CENTRAL DESTACADO: Reportar (Voz o Texto) */}
      <div className="flex flex-col items-center justify-center px-1 -mt-4">
        <button
          id="btn-quick-nav-report"
          onClick={() => {
            if (onOpenQuickReport) {
              onOpenQuickReport();
            } else {
              onSelectScreen('FAM_02_CHECKIN');
            }
          }}
          className="w-12 h-12 rounded-full bg-[#004D6B] hover:bg-[#00384E] text-white flex items-center justify-center shadow-md shadow-[#004D6B]/25 transition-all hover:scale-105 active:scale-95 border-2 border-white ring-2 ring-[#99CAE8]/40"
          aria-label="Registrar observación rápida"
        >
          <Mic className="w-5 h-5 text-[#99CAE8]" />
        </button>
        <span className="text-[10px] font-bold text-[#004D6B] tracking-tight mt-0.5">
          Reportar
        </span>
      </div>

      {/* 3. Estadísticas / Calendario */}
      <button
        id="tab-fam-feedback"
        onClick={() => onSelectScreen('FAM_04_FEEDBACK')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isFeedback ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isFeedback ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
          <CalendarDays className="w-4 h-4" />
        </div>
        <span className="text-[10.5px] tracking-tight mt-0.5">Estadísticas</span>
      </button>

      {/* 4. Perfil Niño */}
      <button
        id="tab-fam-profile"
        onClick={() => onSelectScreen('FAM_07_PROFILE')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          isProfile ? 'text-[#004D6B] font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isProfile ? 'bg-[#EAF6FC] text-[#004D6B]' : ''}`}>
          <User className="w-4 h-4" />
        </div>
        <span className="text-[10.5px] tracking-tight mt-0.5 truncate max-w-[50px]">{childName}</span>
      </button>
    </nav>
  );
};
