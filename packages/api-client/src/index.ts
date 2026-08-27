import type { components } from "./generated/openapi";

export type SessionResponse = components["schemas"]["SessionResponse"];
export type ChildSummary = components["schemas"]["ChildSummary"];
export type UserContext = components["schemas"]["UserContext"];
export type DailyRecordCreateRequest = components["schemas"]["DailyRecordCreateRequest"];
export type DailyRecordResponse = components["schemas"]["DailyRecordResponse"];
export type RiskPrediction = components["schemas"]["RiskPrediction"];
export type PreventiveStatus = components["schemas"]["PreventiveStatus"];

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
    async getCurrentRiskPrediction(childId: string): Promise<RiskPrediction> {
      return request(fetcher, `${root}/v1/children/${encodeURIComponent(childId)}/risk-predictions/current`);
    },
    async getPreventiveStatus(childId: string): Promise<PreventiveStatus> {
      return request(fetcher, `${root}/v1/children/${encodeURIComponent(childId)}/preventive-status`);
    }
  };
}

async function request<T>(fetcher: typeof fetch, url: string, init?: RequestInit): Promise<T> {
  const response = await fetcher(url, {
    headers: { "content-type": "application/json", ...init?.headers },
    ...init
  });
  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}
