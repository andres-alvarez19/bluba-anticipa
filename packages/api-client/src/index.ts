import type { DailyRecord, Prediction } from "@bluba/shared-types";

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
    async createDailyRecord(record: DailyRecord): Promise<DailyRecord> {
      return request(fetcher, `${root}/daily-records`, {
        method: "POST",
        body: JSON.stringify(record)
      });
    },
    async createPrediction(subjectId: string, horizonHours = 24): Promise<Prediction> {
      return request(fetcher, `${root}/subjects/${encodeURIComponent(subjectId)}/predictions`, {
        method: "POST",
        body: JSON.stringify({ horizon_hours: horizonHours })
      });
    },
    async getLatestPrediction(subjectId: string): Promise<Prediction> {
      return request(fetcher, `${root}/subjects/${encodeURIComponent(subjectId)}/predictions/latest`);
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
