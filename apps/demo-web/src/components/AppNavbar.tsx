import React, { useState } from 'react';
import {
  Stethoscope,
  GraduationCap,
  Home,
  FileText,
  TrendingDown,
  Layers,
  BookmarkCheck,
  Users,
  ClipboardList,
  Activity,
  HeartHandshake,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  User,
  Grid,
  X,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Info,
} from 'lucide-react';
import { AppScreen, UserRole } from '../types';

interface AppNavbarProps {
  currentRole: UserRole;
  activeScreen: AppScreen;
  onSelectRole: (role: UserRole) => void;
  onSelectScreen: (screen: AppScreen) => void;
  videoMode?: boolean;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentRole,
  activeScreen,
  onSelectRole,
  onSelectScreen,
  videoMode = false,
}) => {
  const [showScreenCatalog, setShowScreenCatalog] = useState(false);

  const handleCatalogSelect = (screen: AppScreen) => {
    onSelectScreen(screen);
    setShowScreenCatalog(false);
  };

  return (
    <>
      <header
        id="main-app-navbar"
        className="w-full max-w-[480px] sm:max-w-[540px] mb-2 px-3 py-2.5 bg-[#004D6B] border border-[#99CAE8]/40 rounded-2xl shadow-xl space-y-2"
      >
        {/* Top Bar: Brand, Role Badge, and All Screens Catalog Button */}
        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white text-[#004D6B] flex items-center justify-center shadow-xs font-black text-xs border border-[#99CAE8]">
              BA
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-xs tracking-tight">
                  Bluba Anticipa
                </span>
                <span className="text-[9px] font-bold bg-[#99CAE8]/25 text-[#99CAE8] px-1.5 py-0.2 rounded-full border border-[#99CAE8]/40">
                  Navegación 360°
                </span>
              </div>
              <p className="text-[10px] text-[#99CAE8] font-medium">
                3 Tipos de Usuario • Red Coordinada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Screen Catalog Modal Trigger */}
            {!videoMode && <button
              id="btn-open-screen-catalog"
              onClick={() => setShowScreenCatalog(true)}
              className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-[#99CAE8] text-[#004D6B] hover:bg-white flex items-center gap-1 shadow-xs transition-all active:scale-95"
              title="Abrir mapa con todas las pantallas del sistema"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Todas las Pantallas</span>
              <span className="sm:hidden">Menú Vistas</span>
            </button>}
          </div>
        </div>

        {/* 3 Main User Role Tabs */}
        <nav
          aria-label="Selector de tipos de usuarios"
          className="grid grid-cols-3 gap-1 bg-[#00384E] p-1 rounded-xl border border-white/10"
        >
          {/* 1. ESPECIALISTA */}
          <button
            id="nav-role-specialist"
            onClick={() => onSelectRole('SPECIALIST')}
            className={`px-2 py-1.5 rounded-lg text-center sm:text-left transition-all flex flex-col sm:flex-row items-center gap-1.5 ${
              currentRole === 'SPECIALIST'
                ? 'bg-[#004D6B] text-white shadow-md font-bold ring-1 ring-[#99CAE8]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Stethoscope
              className={`w-3.5 h-3.5 shrink-0 ${
                currentRole === 'SPECIALIST' ? 'text-[#99CAE8]' : 'text-slate-300'
              }`}
            />
            <div>
              <span className="text-[11.5px] font-extrabold tracking-tight block">
                Especialista
              </span>
              <span
                className={`text-[9px] font-medium hidden sm:block ${
                  currentRole === 'SPECIALIST' ? 'text-[#99CAE8]' : 'text-slate-400'
                }`}
              >
                Clínica / Terapia
              </span>
            </div>
          </button>

          {/* 2. PROFESOR */}
          <button
            id="nav-role-teacher"
            onClick={() => onSelectRole('TEACHER')}
            className={`px-2 py-1.5 rounded-lg text-center sm:text-left transition-all flex flex-col sm:flex-row items-center gap-1.5 ${
              currentRole === 'TEACHER'
                ? 'bg-[#004D6B] text-white shadow-md font-bold ring-1 ring-[#99CAE8]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap
              className={`w-3.5 h-3.5 shrink-0 ${
                currentRole === 'TEACHER' ? 'text-[#99CAE8]' : 'text-slate-300'
              }`}
            />
            <div>
              <span className="text-[11.5px] font-extrabold tracking-tight block">
                Profesor
              </span>
              <span
                className={`text-[9px] font-medium hidden sm:block ${
                  currentRole === 'TEACHER' ? 'text-[#99CAE8]' : 'text-slate-400'
                }`}
              >
                Escuela / Aula
              </span>
            </div>
          </button>

          {/* 3. FAMILIA */}
          <button
            id="nav-role-family"
            onClick={() => onSelectRole('FAMILY')}
            className={`px-2 py-1.5 rounded-lg text-center sm:text-left transition-all flex flex-col sm:flex-row items-center gap-1.5 ${
              currentRole === 'FAMILY'
                ? 'bg-[#004D6B] text-white shadow-md font-bold ring-1 ring-[#99CAE8]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home
              className={`w-3.5 h-3.5 shrink-0 ${
                currentRole === 'FAMILY' ? 'text-[#99CAE8]' : 'text-slate-300'
              }`}
            />
            <div>
              <span className="text-[11.5px] font-extrabold tracking-tight block">
                Familia
              </span>
              <span
                className={`text-[9px] font-medium hidden sm:block ${
                  currentRole === 'FAMILY' ? 'text-[#99CAE8]' : 'text-slate-400'
                }`}
              >
                Hogar / Cuidado
              </span>
            </div>
          </button>
        </nav>

        {/* Quick Horizontal Carousel of Current Role Screens */}
        <div className={`${videoMode ? 'hidden' : 'flex'} items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar`}>
          {currentRole === 'SPECIALIST' && (
            <>
              <button
                id="quick-esp00"
                onClick={() => onSelectScreen('ESP_00_HOME')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_00_HOME'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-3 h-3" />
                <span>Inicio</span>
              </button>
              <button
                id="quick-esp01"
                onClick={() => onSelectScreen('ESP_01_PATIENTS')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_01_PATIENTS'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>ESP-01 Casos</span>
              </button>
              <button
                id="quick-esp02"
                onClick={() => onSelectScreen('ESP_02_PATIENT_SUMMARY')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_02_PATIENT_SUMMARY'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>ESP-02 Ficha</span>
              </button>
              <button
                id="quick-esp03"
                onClick={() => onSelectScreen('ESP_03_EVOLUTION')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_03_EVOLUTION'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                <span>ESP-03 Evolución</span>
              </button>
              <button
                id="quick-esp04"
                onClick={() => onSelectScreen('ESP_04_FACTORS')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_04_FACTORS'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>ESP-04 Factores</span>
              </button>
              <button
                id="quick-esp05"
                onClick={() => onSelectScreen('ESP_05_STRATEGIES')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_05_STRATEGIES'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookmarkCheck className="w-3 h-3" />
                <span>ESP-05 Estrategias</span>
              </button>
              <button
                id="quick-esp06"
                onClick={() => onSelectScreen('ESP_06_PROFILE')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'ESP_06_PROFILE'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3 h-3" />
                <span>ESP-06 Perfil</span>
              </button>
            </>
          )}

          {currentRole === 'TEACHER' && (
            <>
              <button
                id="quick-edu00"
                onClick={() => onSelectScreen('EDU_00_HOME')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'EDU_00_HOME'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-3 h-3" />
                <span>Inicio</span>
              </button>
              <button
                id="quick-edu01"
                onClick={() => onSelectScreen('EDU_01_CLASSROOM')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'EDU_01_CLASSROOM'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>EDU-01 Aula</span>
              </button>
              <button
                id="quick-edu02"
                onClick={() => onSelectScreen('EDU_02_STUDENT_DETAIL')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'EDU_02_STUDENT_DETAIL'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>EDU-02 Detalle</span>
              </button>
              <button
                id="quick-edu03"
                onClick={() => onSelectScreen('EDU_03_EXPRESS_REPORT')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'EDU_03_EXPRESS_REPORT'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>EDU-03 Reporte</span>
              </button>
              <button
                id="quick-edu04"
                onClick={() => onSelectScreen('EDU_04_PROFILE')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'EDU_04_PROFILE'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3 h-3" />
                <span>EDU-04 Perfil</span>
              </button>
            </>
          )}

          {currentRole === 'FAMILY' && (
            <>
              <button
                id="quick-fam01"
                onClick={() => onSelectScreen('FAM_01_TODAY')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_01_TODAY'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>FAM-01 Hoy</span>
              </button>
              <button
                id="quick-fam02"
                onClick={() => onSelectScreen('FAM_02_CHECKIN')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_02_CHECKIN'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>FAM-02 Check-in</span>
              </button>
              <button
                id="quick-fam03"
                onClick={() => onSelectScreen('FAM_03_RECOMMENDATIONS')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_03_RECOMMENDATIONS'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>FAM-03 Consejos</span>
              </button>
              <button
                id="quick-fam04"
                onClick={() => onSelectScreen('FAM_04_FEEDBACK')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_04_FEEDBACK'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>FAM-04 Noche</span>
              </button>
              <button
                id="quick-fam05"
                onClick={() => onSelectScreen('FAM_05_ALERT_DETAIL')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_05_ALERT_DETAIL'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>FAM-05 Alerta</span>
              </button>
              <button
                id="quick-fam06"
                onClick={() => onSelectScreen('FAM_06_INSUFFICIENT_INFO')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_06_INSUFFICIENT_INFO'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Info className="w-3 h-3" />
                <span>FAM-06 Datos</span>
              </button>
              <button
                id="quick-fam07"
                onClick={() => onSelectScreen('FAM_07_PROFILE')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeScreen === 'FAM_07_PROFILE'
                    ? 'bg-[#99CAE8] text-[#004D6B]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3 h-3" />
                <span>FAM-07 Mateo</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Full Screen Catalog Modal */}
      {showScreenCatalog && (
        <div
          id="modal-screen-catalog"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowScreenCatalog(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#004D6B] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-[#99CAE8]" />
                  <h2 className="text-base font-bold">Mapa Completo de Navegación</h2>
                </div>
                <p className="text-xs text-[#99CAE8] mt-0.5">
                  Accede a cualquiera de las pantallas del sistema Bluba Anticipa
                </p>
              </div>
              <button
                onClick={() => setShowScreenCatalog(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Screen Categories */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Category 1: Especialista */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-[#004D6B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Especialista (Clínica / Terapia)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">6 Pantallas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleCatalogSelect('ESP_00_HOME')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_00_HOME'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-00 • Inicio Clínico</span>
                      <span className="text-[10px] text-slate-500">Dashboard y prioridades del día</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('ESP_01_PATIENTS')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_01_PATIENTS'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-01 • Casos / Pacientes</span>
                      <span className="text-[10px] text-slate-500">Riesgo predictivo y calidad</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('ESP_02_PATIENT_SUMMARY')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_02_PATIENT_SUMMARY'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-02 • Resumen Mateo</span>
                      <span className="text-[10px] text-slate-500">Ficha clínica intra-sujeto</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('ESP_03_EVOLUTION')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_03_EVOLUTION'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-03 • Evolución (72h)</span>
                      <span className="text-[10px] text-slate-500">Línea de tiempo y fuentes</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('ESP_04_FACTORS')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_04_FACTORS'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-04 • Factores Explicativos</span>
                      <span className="text-[10px] text-slate-500">Desvío de variables basales</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('ESP_05_STRATEGIES')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_05_STRATEGIES'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-05 • Estrategias</span>
                      <span className="text-[10px] text-slate-500">Historial y efectividad real</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('ESP_06_PROFILE')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'ESP_06_PROFILE'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">ESP-06 • Perfil Especialista</span>
                      <span className="text-[10px] text-slate-500">Dra. Ramos & Red Clínica</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Category 2: Profesor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-[#004D6B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Profesor (Escuela / Aula)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">4 Pantallas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleCatalogSelect('EDU_00_HOME')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'EDU_00_HOME'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">EDU-00 • Inicio Docente</span>
                      <span className="text-[10px] text-slate-500">Pulso del aula y transiciones</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('EDU_01_CLASSROOM')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'EDU_01_CLASSROOM'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">EDU-01 • Mi Curso (Aula)</span>
                      <span className="text-[10px] text-slate-500">Semáforo preventivo y alumnos</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('EDU_02_STUDENT_DETAIL')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'EDU_02_STUDENT_DETAIL'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">EDU-02 • Detalle Mateo</span>
                      <span className="text-[10px] text-slate-500">Pautas pedagógicas de sala</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('EDU_03_EXPRESS_REPORT')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'EDU_03_EXPRESS_REPORT'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">EDU-03 • Reporte Express</span>
                      <span className="text-[10px] text-slate-500">Captura en 1 toque / Offline</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('EDU_04_PROFILE')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'EDU_04_PROFILE'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">EDU-04 • Perfil Aula</span>
                      <span className="text-[10px] text-slate-500">Prof. Morales & Equipo PIE</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Category 3: Familia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold text-[#004D6B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    <span>Familia (Hogar / Cuidado)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">7 Pantallas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleCatalogSelect('FAM_01_TODAY')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_01_TODAY'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-01 • Estado de Hoy</span>
                      <span className="text-[10px] text-slate-500">Anticipación y acción preventiva</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('FAM_02_CHECKIN')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_02_CHECKIN'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-02 • Check-in Matutino</span>
                      <span className="text-[10px] text-slate-500">Sueño, despertar y regulación</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('FAM_03_RECOMMENDATIONS')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_03_RECOMMENDATIONS'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-03 • Recomendaciones</span>
                      <span className="text-[10px] text-slate-500">Apoyos prácticos para casa</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('FAM_04_FEEDBACK')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_04_FEEDBACK'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-04 • Cierre / Feedback</span>
                      <span className="text-[10px] text-slate-500">Resultados del día en casa</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('FAM_05_ALERT_DETAIL')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_05_ALERT_DETAIL'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-05 • Detalle de Alerta</span>
                      <span className="text-[10px] text-slate-500">Por qué se activó el aviso</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('FAM_06_INSUFFICIENT_INFO')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_06_INSUFFICIENT_INFO'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-06 • Datos Faltantes</span>
                      <span className="text-[10px] text-slate-500">Gestión de confianza de datos</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleCatalogSelect('FAM_07_PROFILE')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeScreen === 'FAM_07_PROFILE'
                        ? 'bg-[#EAF6FC] border-[#004D6B] text-[#004D6B] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">FAM-07 • Perfil de Mateo</span>
                      <span className="text-[10px] text-slate-500">Ficha familiar y basales</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowScreenCatalog(false)}
                className="px-4 py-2 bg-[#004D6B] hover:bg-[#00384E] text-white font-bold text-xs rounded-xl transition-all"
              >
                Cerrar Navegador
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
