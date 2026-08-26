export type ActorContext = "family" | "school" | "professional";

export type ObservationStatus = "observed" | "unknown";

export interface DailyObservation {
  feature_key: string;
  status: ObservationStatus;
  value?: string | number | boolean | null;
  note?: string | null;
}

export interface DailyRecord {
  subject_id: string;
  recorded_at: string;
  context: ActorContext;
  source_actor_id?: string | null;
  observations: DailyObservation[];
  source?: "form" | "text_confirmed" | "voice_confirmed" | "import";
}

export interface Recommendation {
  id: string;
  title: string;
  rationale?: string | null;
  source: "professional_plan" | "historical_success" | "validated_catalog";
  strategy_id?: string | null;
}

export interface ScoreLevel {
  score: number;
  level: "low" | "medium" | "high";
}

export interface Prediction {
  subject_id: string;
  prediction_timestamp: string;
  horizon_hours: number;
  status: "available" | "insufficient_data";
  risk: ScoreLevel | null;
  confidence: ScoreLevel;
  data_quality: {
    score: number;
    missing_features: string[];
    stale_features: string[];
    source_coverage: Record<ActorContext, boolean>;
  };
  top_factors: Array<{
    feature_key: string;
    label: string;
    direction: "risk_increase" | "risk_decrease" | "context_only";
    importance: number;
    observation?: string | null;
    baseline_reference?: string | null;
  }>;
  recommendations: Recommendation[];
  insufficiency_reasons: string[];
}
