import type { components, operations } from "./generated/openapi";

export type SessionResponse = components["schemas"]["SessionResponse"];
export type ChildSummary = components["schemas"]["ChildSummary"];
export type UserContext = components["schemas"]["UserContext"];
export type DailyRecordCreateRequest = components["schemas"]["DailyRecordCreateRequest"];
export type DailyRecordResponse = components["schemas"]["DailyRecordResponse"];
export type RiskPrediction = components["schemas"]["RiskPrediction"];
export type PreventiveStatus = components["schemas"]["PreventiveStatus"];
export type ObservationDraft = components["schemas"]["ObservationDraft"];
export type ProposedVariable = components["schemas"]["ProposedVariable"];
export type TextObservationDraftRequest = components["schemas"]["TextObservationDraftRequest"];
export type ObservationDraftPatchRequest = components["schemas"]["ObservationDraftPatchRequest"];
export type ConfirmObservationDraftRequest = components["schemas"]["ConfirmObservationDraftRequest"];

type OpenApiAudioObservationDraftRequest =
  operations["createAudioObservationDraft"]["requestBody"]["content"]["multipart/form-data"];

export type AudioObservationDraftRequest = Omit<OpenApiAudioObservationDraftRequest, "audio"> & {
  audio: Blob;
};

export interface IdempotentRequestOptions {
  idempotencyKey?: string;
}

export interface ApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

export function createApiClient({ baseUrl, fetcher = fetch }: ApiClientOptions) {
  const root = baseUrl.replace(/\/$/, "");

  return {
    async health(): Promise<{ status: "ok" }> {
      return request(fetcher, `${root}/health`);
    },
    async createDemoSession(role: components["schemas"]["Role"]): Promise<SessionResponse> {
      return request(fetcher, `${root}/v1/auth/session`, {
        method: "POST",
        body: JSON.stringify({ role })
      });
    },
    async getMyContext(): Promise<UserContext> {
      return request(fetcher, `${root}/v1/me/context`);
    },
    async listAuthorizedChildren(): Promise<ChildSummary[]> {
      return request(fetcher, `${root}/v1/children`);
    },
    async createDailyRecord(childId: string, record: DailyRecordCreateRequest): Promise<DailyRecordResponse> {
      return request(fetcher, `${root}/v1/children/${encodeURIComponent(childId)}/daily-records`, {
        method: "POST",
        body: JSON.stringify(record)
      });
    },
    async createTextObservationDraft(
      draft: TextObservationDraftRequest,
      options: IdempotentRequestOptions = {}
    ): Promise<ObservationDraft> {
      return request(fetcher, `${root}/v1/observation-drafts/text`, {
        method: "POST",
        headers: idempotencyHeaders(options.idempotencyKey),
        body: JSON.stringify(draft)
      });
    },
    async createAudioObservationDraft(
      draft: AudioObservationDraftRequest,
      options: IdempotentRequestOptions = {}
    ): Promise<ObservationDraft> {
      const formData = new FormData();
      formData.append("child_id", draft.child_id);
      formData.append("context", draft.context);
      formData.append("audio", draft.audio);
      if (draft.mime_type != null) {
        formData.append("mime_type", draft.mime_type);
      }

      return request(fetcher, `${root}/v1/observation-drafts/audio`, {
        method: "POST",
        headers: idempotencyHeaders(options.idempotencyKey),
        body: formData
      });
    },
    async patchObservationDraft(
      draftId: string,
      patch: ObservationDraftPatchRequest
    ): Promise<ObservationDraft> {
      return request(fetcher, `${root}/v1/observation-drafts/${encodeURIComponent(draftId)}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
    },
    async confirmObservationDraft(
      draftId: string,
      confirmation: ConfirmObservationDraftRequest = {},
      options: IdempotentRequestOptions = {}
    ): Promise<DailyRecordResponse> {
      return request(fetcher, `${root}/v1/observation-drafts/${encodeURIComponent(draftId)}/confirm`, {
        method: "POST",
        headers: idempotencyHeaders(options.idempotencyKey),
        body: JSON.stringify(confirmation)
      });
    },
    async getCurrentRiskPrediction(childId: string): Promise<RiskPrediction> {
      return request(fetcher, `${root}/v1/children/${encodeURIComponent(childId)}/risk-predictions/current`);
    },
    async getPreventiveStatus(childId: string): Promise<PreventiveStatus> {
      return request(fetcher, `${root}/v1/children/${encodeURIComponent(childId)}/preventive-status`);
    }
  };
}

async function request<T>(fetcher: typeof fetch, url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isFormData && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetcher(url, {
    ...init,
    headers
  });
  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function idempotencyHeaders(idempotencyKey?: string): HeadersInit | undefined {
  return idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined;
}
