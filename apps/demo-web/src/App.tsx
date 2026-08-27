import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { RiskPrediction } from '@bluba/api-client';
import { AnimatePresence, motion } from 'motion/react';
import { AppNavbar } from './components/AppNavbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SpecialistHeader } from './components/SpecialistHeader';
import { TeacherHeader } from './components/TeacherHeader';
import { FamilyHeader } from './components/FamilyHeader';

// Specialist Flow Screens
import { SpecialistHomeScreen } from './components/SpecialistHomeScreen';
import { PatientsScreen } from './components/PatientsScreen';
import { PatientSummaryScreen } from './components/PatientSummaryScreen';
import { EvolutionScreen } from './components/EvolutionScreen';
import { FactorsQualityScreen } from './components/FactorsQualityScreen';
import { StrategiesScreen } from './components/StrategiesScreen';
import { SpecialistProfileScreen } from './components/SpecialistProfileScreen';

// Educator Flow Screens
import { TeacherHomeScreen } from './components/TeacherHomeScreen';
import { ClassroomScreen } from './components/ClassroomScreen';
import { StudentDetailScreen } from './components/StudentDetailScreen';
import { ExpressReportScreen } from './components/ExpressReportScreen';
import { TeacherProfileScreen } from './components/TeacherProfileScreen';

// Family Flow Screens
import { TodayStatusScreen } from './components/TodayStatusScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { RecommendationsScreen } from './components/RecommendationsScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { FamilyStatsCalendarScreen } from './components/FamilyStatsCalendarScreen';
import { AlertDetailScreen } from './components/AlertDetailScreen';
import { InsufficientInfoScreen } from './components/InsufficientInfoScreen';
import { FamilyProfileScreen } from './components/FamilyProfileScreen';
import { PreventiveActionsModal } from './components/PreventiveActionsModal';
import { QuickReportModal } from './components/QuickReportModal';

// Mock Data
import { SPECIALIST_PATIENTS } from './data/specialistData';
import { CLASSROOM_STUDENTS } from './data/classroomData';
import { MATEO_ACTIVE_CASE, FAMILY_CHILDREN_LIST } from './data/mockData';
import {
  AppScreen,
  UserRole,
  SpecialistPatient,
  ClassroomStudent,
  ChildState,
  CheckInAnswers,
  FeedbackRecord,
  ActiveScreen,
  SchoolObservationData,
} from './types';
import { demoApi } from './demo/api';
import { DEMO_CHILD_ID } from './demo/constants';
import { schoolObservationToDailyRecord } from './demo/adapters/dailyRecordAdapter';
import {
  toFamilyState,
  toSpecialistPatient,
  toTeacherStudent,
} from './demo/adapters/predictionPresentationAdapter';

export default function App() {
  const videoMode = new URLSearchParams(window.location.search).get('demo') === 'video';
  // Active User Persona / Role
  const [currentRole, setCurrentRole] = useState<UserRole>(videoMode ? 'FAMILY' : 'SPECIALIST');
  const [activeScreen, setActiveScreen] = useState<AppScreen>(videoMode ? 'FAM_01_TODAY' : 'ESP_00_HOME');
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Specialist state
  const [selectedPatient, setSelectedPatient] = useState<SpecialistPatient>(
    SPECIALIST_PATIENTS[0] // Mateo R. by default
  );

  // Educator state
  const [selectedStudent, setSelectedStudent] = useState<ClassroomStudent>(
    CLASSROOM_STUDENTS[0]
  );

  // Family state
  const [familyFixture, setFamilyFixture] = useState<ChildState>(MATEO_ACTIVE_CASE);
  const [checkInAnswers, setCheckInAnswers] = useState<CheckInAnswers>({
    sleep: 'Interrumpido',
    wake: 'Irritable',
    regulation: 'Algo diferente',
  });
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('rec-1');
  const [selectedStrategyTitle, setSelectedStrategyTitle] = useState<string>(
    'Anticipar las transiciones'
  );
  const [feedbackData, setFeedbackData] = useState<FeedbackRecord>({
    hadDysregulation: 'Sí',
    appliedStrategy: 'Sí',
    selectedStrategyTitle: 'Anticipación visual de transiciones',
    outcomeResult: 'Ayudó',
    isSubmitted: false,
    submittedTimestamp: null,
  });
  const [showPreventiveModal, setShowPreventiveModal] = useState<boolean>(false);
  const [showQuickReportModal, setShowQuickReportModal] = useState<boolean>(false);
  const [quickReportMode, setQuickReportMode] = useState<'text' | 'voice'>('voice');
  const [selectedReportDateLabel, setSelectedReportDateLabel] = useState<string | undefined>(undefined);

  const refreshPrediction = useCallback(async () => {
    setPredictionLoading(true);
    setPredictionError(null);
    try {
      const nextPrediction = await demoApi.getCurrentRiskPrediction(DEMO_CHILD_ID);
      setPrediction(nextPrediction);
      return nextPrediction;
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : 'No fue posible consultar el estado preventivo.');
      throw error;
    } finally {
      setPredictionLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPrediction().catch(() => undefined);
  }, [refreshPrediction]);

  const familyData = useMemo(
    () => (prediction ? toFamilyState(prediction, familyFixture) : familyFixture),
    [prediction, familyFixture],
  );
  const specialistPatients = useMemo(
    () => prediction
      ? [toSpecialistPatient(prediction, SPECIALIST_PATIENTS[0]), ...SPECIALIST_PATIENTS.slice(1)]
      : SPECIALIST_PATIENTS,
    [prediction],
  );
  const selectedPatientView = selectedPatient.id === DEMO_CHILD_ID && prediction
    ? toSpecialistPatient(prediction, SPECIALIST_PATIENTS[0])
    : selectedPatient;
  const classroomStudents = useMemo(() => {
    if (!prediction) return CLASSROOM_STUDENTS;
    const mateoIndex = CLASSROOM_STUDENTS.findIndex((student) => student.id === DEMO_CHILD_ID);
    if (mateoIndex < 0) return CLASSROOM_STUDENTS;
    return CLASSROOM_STUDENTS.map((student, index) =>
      index === mateoIndex ? toTeacherStudent(prediction, student) : student,
    );
  }, [prediction]);
  const selectedStudentView = selectedStudent.id === DEMO_CHILD_ID && prediction
    ? toTeacherStudent(prediction, selectedStudent)
    : selectedStudent;

  const handleSaveSchoolObservation = async (
    observation: SchoolObservationData,
    onPersisted: () => void,
  ) => {
    const record = schoolObservationToDailyRecord(observation);
    await demoApi.createDailyRecord(DEMO_CHILD_ID, record);
    onPersisted();
    await Promise.all([
      refreshPrediction(),
      new Promise<void>((resolve) => window.setTimeout(resolve, 800)),
    ]);
  };

  // Role Switch Handler
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'SPECIALIST') {
      setActiveScreen(videoMode ? 'ESP_02_PATIENT_SUMMARY' : 'ESP_00_HOME');
    } else if (role === 'TEACHER') {
      setActiveScreen(videoMode ? 'EDU_02_STUDENT_DETAIL' : 'EDU_00_HOME');
    } else if (role === 'FAMILY') {
      setActiveScreen('FAM_01_TODAY');
    }
    void refreshPrediction().catch(() => undefined);
  };

  // Screen Switch Handler
  const handleSelectScreen = (screen: AppScreen) => {
    setActiveScreen(screen);
    // Auto-align role with screen type
    if (screen.startsWith('ESP_')) {
      setCurrentRole('SPECIALIST');
    } else if (screen.startsWith('EDU_')) {
      setCurrentRole('TEACHER');
    } else if (screen.startsWith('FAM_')) {
      setCurrentRole('FAMILY');
    }
  };

  // Specialist Navigation Handlers
  const handleSelectPatient = (patient: SpecialistPatient) => {
    setSelectedPatient(patient);
    setActiveScreen('ESP_02_PATIENT_SUMMARY');
  };

  const handleBackToPatients = () => {
    setActiveScreen('ESP_01_PATIENTS');
  };

  // Family ActiveScreen converter
  const handleFamilyActiveScreenNavigate = (screen: ActiveScreen) => {
    if (screen === 'FAM_01_TODAY') {
      setActiveScreen('FAM_01_TODAY');
    } else if (screen === 'COMMON_02_ALERT_DETAIL') {
      setActiveScreen('FAM_05_ALERT_DETAIL');
    } else if (screen === 'COMMON_03_INSUFFICIENT_INFO') {
      setActiveScreen('FAM_06_INSUFFICIENT_INFO');
    }
  };

  const isSpecialistFlow = currentRole === 'SPECIALIST';
  const isEducatorFlow = currentRole === 'TEACHER';
  const isFamilyFlow = currentRole === 'FAMILY';

  return (
    <main className="min-h-screen bg-[#F7FAFC] text-slate-800 flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 lg:p-6 select-none sm:select-auto font-sans">
      {/* Top Universal Navbar: 3 User Roles (Especialista, Profesor, Familia) & Full Screen Catalog */}
      <AppNavbar
        currentRole={currentRole}
        activeScreen={activeScreen}
        onSelectRole={handleSelectRole}
        onSelectScreen={handleSelectScreen}
        videoMode={videoMode}
      />

      {/* Mobile Screen Container (Standard 390 x 844 px mobile view) */}
      <div
        id="mobile-app-container"
        className="w-full max-w-[390px] h-[100dvh] sm:h-[844px] bg-[#F7FAFC] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col border-0 sm:border-[8px] sm:border-[#004D6B] relative ring-1 ring-black/5"
      >
        {/* iOS-inspired status bar */}
        <div className="hidden sm:flex h-5 w-full bg-white items-center justify-between px-6 pt-1 shrink-0 z-40 select-none border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-800 tracking-tight">08:45</span>
          <div className="w-20 h-3 bg-[#004D6B] rounded-full"></div>
          <div className="flex items-center gap-1.5 text-slate-700 text-[10px] font-bold">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Global Role-Specific Header */}
        {isSpecialistFlow && (
          <SpecialistHeader
            activeScreen={activeScreen}
            specialistTitle="Dra. Valentina Ramos (Terapeuta)"
          />
        )}
        {isEducatorFlow && (
          <TeacherHeader
            activeScreen={activeScreen}
            classroomName="1° Básico B"
            teacherRole="Prof. Guía"
          />
        )}
        {isFamilyFlow && (
          <FamilyHeader
            childName={familyData.name}
            avatarText={familyData.avatarText}
            activeScreen={activeScreen}
          />
        )}

        {/* Main Body with Motion Transitions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#F7FAFC]">
          {predictionLoading && !prediction ? (
            <PredictionLoadingState />
          ) : predictionError ? (
            <PredictionErrorState message={predictionError} onRetry={refreshPrediction} />
          ) : (
          <AnimatePresence mode="wait">
            {/* ================================================================
                ESPECIALISTA FLOW (ESP-00 to ESP-06)
            ================================================================ */}
            {activeScreen === 'ESP_00_HOME' && (
              <motion.div
                key="esp-00"
                className="h-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <SpecialistHomeScreen
                  patients={specialistPatients}
                  onSelectPatient={handleSelectPatient}
                  onNavigateToPatients={() => setActiveScreen('ESP_01_PATIENTS')}
                  onNavigateToStrategies={() => setActiveScreen('ESP_05_STRATEGIES')}
                  onNavigateToEvolution={() => setActiveScreen('ESP_03_EVOLUTION')}
                  onNavigateToProfile={() => setActiveScreen('ESP_06_PROFILE')}
                />
              </motion.div>
            )}

            {activeScreen === 'ESP_01_PATIENTS' && (
              <motion.div
                key="esp-01"
                className="h-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.16 }}
              >
                <PatientsScreen
                  patients={specialistPatients}
                  onSelectPatient={handleSelectPatient}
                />
              </motion.div>
            )}

            {activeScreen === 'ESP_02_PATIENT_SUMMARY' && (
              <motion.div
                key={`esp-02-${selectedPatient.id}`}
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <PatientSummaryScreen
                  patient={selectedPatientView}
                  onBackToPatients={handleBackToPatients}
                  onNavigateToEvolution={() => setActiveScreen('ESP_03_EVOLUTION')}
                  onNavigateToFactors={() => setActiveScreen('ESP_04_FACTORS')}
                  onNavigateToStrategies={() => setActiveScreen('ESP_05_STRATEGIES')}
                />
              </motion.div>
            )}

            {activeScreen === 'ESP_03_EVOLUTION' && (
              <motion.div
                key="esp-03"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <EvolutionScreen
                  onBackToSummary={() => setActiveScreen('ESP_02_PATIENT_SUMMARY')}
                  onNavigateToFactors={() => setActiveScreen('ESP_04_FACTORS')}
                  onNavigateToStrategies={() => setActiveScreen('ESP_05_STRATEGIES')}
                />
              </motion.div>
            )}

            {activeScreen === 'ESP_04_FACTORS' && (
              <motion.div
                key="esp-04"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <FactorsQualityScreen
                  onBackToSummary={() => setActiveScreen('ESP_02_PATIENT_SUMMARY')}
                  onNavigateToEvolution={() => setActiveScreen('ESP_03_EVOLUTION')}
                  onNavigateToStrategies={() => setActiveScreen('ESP_05_STRATEGIES')}
                />
              </motion.div>
            )}

            {activeScreen === 'ESP_05_STRATEGIES' && (
              <motion.div
                key="esp-05"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <StrategiesScreen
                  onBackToSummary={() => setActiveScreen('ESP_02_PATIENT_SUMMARY')}
                  onNavigateToEvolution={() => setActiveScreen('ESP_03_EVOLUTION')}
                />
              </motion.div>
            )}

            {activeScreen === 'ESP_06_PROFILE' && (
              <motion.div
                key="esp-06"
                className="h-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <SpecialistProfileScreen
                  onBackToHome={() => setActiveScreen('ESP_00_HOME')}
                  onNavigateToPatients={() => setActiveScreen('ESP_01_PATIENTS')}
                />
              </motion.div>
            )}

            {/* ================================================================
                PROFESOR FLOW (EDU-00 to EDU-04)
            ================================================================ */}
            {activeScreen === 'EDU_00_HOME' && (
              <motion.div
                key="edu-00"
                className="h-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <TeacherHomeScreen
                  students={classroomStudents}
                  onSelectStudent={(s) => {
                    setSelectedStudent(s);
                    setActiveScreen('EDU_02_STUDENT_DETAIL');
                  }}
                  onNavigateToClassroom={() => setActiveScreen('EDU_01_CLASSROOM')}
                  onNavigateToExpressReport={(s) => {
                    if (s) setSelectedStudent(s);
                    setActiveScreen('EDU_03_EXPRESS_REPORT');
                  }}
                  onNavigateToProfile={() => setActiveScreen('EDU_04_PROFILE')}
                />
              </motion.div>
            )}

            {activeScreen === 'EDU_01_CLASSROOM' && (
              <motion.div
                key="edu-01"
                className="h-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.16 }}
              >
                <ClassroomScreen
                  students={classroomStudents}
                  onSelectStudent={(s) => {
                    setSelectedStudent(s);
                    setActiveScreen('EDU_02_STUDENT_DETAIL');
                  }}
                  onNavigateToExpressReport={(s) => {
                    setSelectedStudent(s);
                    setActiveScreen('EDU_03_EXPRESS_REPORT');
                  }}
                />
              </motion.div>
            )}

            {activeScreen === 'EDU_02_STUDENT_DETAIL' && (
              <motion.div
                key="edu-02"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <StudentDetailScreen
                  student={selectedStudentView}
                  onBackToClassroom={() => setActiveScreen('EDU_01_CLASSROOM')}
                  onNavigateToExpressReport={() => setActiveScreen('EDU_03_EXPRESS_REPORT')}
                />
              </motion.div>
            )}

            {activeScreen === 'EDU_03_EXPRESS_REPORT' && (
              <motion.div
                key="edu-03"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <ExpressReportScreen
                  student={selectedStudentView}
                  onBackToDetail={() => setActiveScreen('EDU_02_STUDENT_DETAIL')}
                  onBackToClassroom={() => setActiveScreen('EDU_01_CLASSROOM')}
                  onSaveObservation={handleSaveSchoolObservation}
                />
              </motion.div>
            )}

            {activeScreen === 'EDU_04_PROFILE' && (
              <motion.div
                key="edu-04"
                className="h-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <TeacherProfileScreen
                  onBackToHome={() => setActiveScreen('EDU_00_HOME')}
                  onNavigateToClassroom={() => setActiveScreen('EDU_01_CLASSROOM')}
                />
              </motion.div>
            )}

            {/* ================================================================
                FAMILIA FLOW (FAM-01 to FAM-07)
            ================================================================ */}
            {activeScreen === 'FAM_01_TODAY' && (
              <motion.div
                key="fam-01"
                className="h-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >
                {predictionLoading && !prediction ? (
                  <PredictionLoadingState />
                ) : predictionError ? (
                  <PredictionErrorState message={predictionError} onRetry={refreshPrediction} />
                ) : prediction ? <TodayStatusScreen
                  data={familyData}
                  availableChildren={videoMode ? [familyData] : FAMILY_CHILDREN_LIST}
                  onSelectChild={(child) => setFamilyFixture(child)}
                  onNavigate={handleFamilyActiveScreenNavigate}
                  onOpenPreventiveModal={() => setShowPreventiveModal(true)}
                  onOpenQuickReport={(mode) => {
                    setQuickReportMode(mode);
                    setShowQuickReportModal(true);
                  }}
                /> : null}
              </motion.div>
            )}

            {activeScreen === 'FAM_02_CHECKIN' && (
              <motion.div
                key="fam-02"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <CheckInScreen
                  answers={checkInAnswers}
                  onUpdateAnswer={(key, val) =>
                    setCheckInAnswers((prev) => ({ ...prev, [key]: val }))
                  }
                  onContinue={() => setActiveScreen('FAM_03_RECOMMENDATIONS')}
                  onGoToObservation={(withVoice) => {
                    setQuickReportMode(withVoice ? 'voice' : 'text');
                    setShowQuickReportModal(true);
                  }}
                />
              </motion.div>
            )}

            {activeScreen === 'FAM_03_RECOMMENDATIONS' && (
              <motion.div
                key="fam-03"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <RecommendationsScreen
                  childData={familyData}
                  availableChildren={FAMILY_CHILDREN_LIST}
                  onSelectChild={(child) => setFamilyFixture(child)}
                  selectedStrategyId={selectedStrategyId}
                  onSelectStrategy={(id, title) => {
                    setSelectedStrategyId(id);
                    setSelectedStrategyTitle(title);
                  }}
                  onNavigateToFeedback={() => setActiveScreen('FAM_04_FEEDBACK')}
                  onNavigateToToday={() => setActiveScreen('FAM_01_TODAY')}
                  onOpenPreventiveModal={() => setShowPreventiveModal(true)}
                />
              </motion.div>
            )}

            {activeScreen === 'FAM_04_FEEDBACK' && (
              <motion.div
                key="fam-04"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <FamilyStatsCalendarScreen
                  childData={familyData}
                  onOpenReportForDate={(dateLabel) => {
                    setSelectedReportDateLabel(dateLabel);
                    setQuickReportMode('voice');
                    setShowQuickReportModal(true);
                  }}
                  onNavigateToRecommendations={() => setActiveScreen('FAM_03_RECOMMENDATIONS')}
                />
              </motion.div>
            )}

            {activeScreen === 'FAM_05_ALERT_DETAIL' && (
              <motion.div
                key="fam-05"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <AlertDetailScreen
                  data={familyData}
                  onNavigate={handleFamilyActiveScreenNavigate}
                  onOpenPreventiveModal={() => setShowPreventiveModal(true)}
                />
              </motion.div>
            )}

            {activeScreen === 'FAM_06_INSUFFICIENT_INFO' && (
              <motion.div
                key="fam-06"
                className="h-full"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
              >
                <InsufficientInfoScreen
                  data={familyData}
                  onNavigate={handleFamilyActiveScreenNavigate}
                  onCompleteInfo={() => {
                    setFamilyFixture((prev) => ({
                      ...prev,
                      confidenceLevel: 'HIGH',
                      confidenceHeadline: 'CONFIANZA ALTA',
                      missingData: prev.missingData.map((m) => ({ ...m, status: 'completed' })),
                    }));
                    setActiveScreen('FAM_01_TODAY');
                  }}
                />
              </motion.div>
            )}

            {activeScreen === 'FAM_07_PROFILE' && (
              <motion.div
                key="fam-07"
                className="h-full"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <FamilyProfileScreen
                  childData={familyData}
                  onBackToToday={() => setActiveScreen('FAM_01_TODAY')}
                  onNavigateToCheckIn={() => setActiveScreen('FAM_02_CHECKIN')}
                  onNavigateToRecommendations={() => setActiveScreen('FAM_03_RECOMMENDATIONS')}
                />
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>

        {/* Dynamic Mobile Bottom Navigation for the Active Role */}
        {!videoMode && <MobileBottomNav
          currentRole={currentRole}
          activeScreen={activeScreen}
          onSelectScreen={handleSelectScreen}
          childName={familyData.name.split(' ')[0]}
          onOpenQuickReport={() => {
            setSelectedReportDateLabel(undefined);
            setQuickReportMode('voice');
            setShowQuickReportModal(true);
          }}
        />}

        {/* Global Preventive Protocol Modal for Family Flow */}
        {showPreventiveModal && (
          <PreventiveActionsModal
            action={familyData.preventiveAction}
            onClose={() => setShowPreventiveModal(false)}
          />
        )}

        {/* Global Observation Quick Report Modal (Text & Voice) */}
        <QuickReportModal
          isOpen={showQuickReportModal}
          initialMode={quickReportMode}
          childName={familyData.name}
          childData={familyData}
          customDateLabel={selectedReportDateLabel}
          onClose={() => {
            setShowQuickReportModal(false);
            setSelectedReportDateLabel(undefined);
          }}
          onSaveReport={(variables, isVoice) => {
            // Update family data with new observation
            setFamilyFixture((prev) => ({
              ...prev,
              lastUpdated: 'Recién registrado',
            }));
            setSelectedReportDateLabel(undefined);
          }}
        />
      </div>
    </main>
  );
}

function PredictionLoadingState() {
  return (
    <div className="h-full flex items-center justify-center p-8 text-center">
      <div className="space-y-2">
        <div className="w-8 h-8 rounded-full border-4 border-[#99CAE8] border-t-[#004D6B] animate-spin mx-auto" />
        <p className="text-sm font-bold text-[#004D6B]">Consultando estado preventivo real…</p>
      </div>
    </div>
  );
}

function PredictionErrorState({ message, onRetry }: { message: string; onRetry: () => Promise<unknown> }) {
  return (
    <div className="h-full flex items-center justify-center p-8 text-center">
      <div className="space-y-3 bg-white border border-rose-200 rounded-2xl p-5">
        <p className="text-sm font-bold text-rose-800">No se pudo cargar la predicción</p>
        <p className="text-xs text-slate-600">{message}</p>
        <button
          type="button"
          onClick={() => void onRetry().catch(() => undefined)}
          className="px-4 py-2 rounded-xl bg-[#004D6B] text-white text-xs font-bold"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
