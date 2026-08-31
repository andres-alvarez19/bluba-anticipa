import { describe, expect, it, vi } from "vitest";

import {
  createApiClient,
  type AudioObservationDraftRequest,
  type ObservationDraft
} from "./index";

const observationDraft: ObservationDraft = {
  draft_id: "draft/one",
  child_id: "CH-002",
  context: "HOME",
  input_type: "TEXT",
  proposed_variables: [],
  status: "PENDING_CONFIRMATION"
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("createApiClient observation drafts", () => {
  it("keeps JSON as the default content type and forwards the idempotency key", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(observationDraft, 201));
    const client = createApiClient({ baseUrl: "http://api.test/", fetcher });

    await client.createTextObservationDraft(
      { child_id: "CH-002", context: "HOME", text: "Durmio poco" },
      { idempotencyKey: "text-attempt-1" }
    );

    const [url, init] = fetcher.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(url).toBe("http://api.test/v1/observation-drafts/text");
    expect(init?.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("idempotency-key")).toBe("text-attempt-1");
    expect(JSON.parse(String(init?.body))).toEqual({
      child_id: "CH-002",
      context: "HOME",
      text: "Durmio poco"
    });
  });

  it("sends audio as FormData without setting Content-Type manually", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(observationDraft, 201));
    const client = createApiClient({ baseUrl: "http://api.test", fetcher });
    const draft: AudioObservationDraftRequest = {
      child_id: "CH-002",
      context: "HOME",
      audio: new Blob(["audio-bytes"], { type: "audio/webm" }),
      mime_type: "audio/webm"
    };

    await client.createAudioObservationDraft(draft, { idempotencyKey: "audio-attempt-1" });

    const [, init] = fetcher.mock.calls[0];
    const headers = new Headers(init?.headers);
    const body = init?.body as FormData;
    expect(headers.has("content-type")).toBe(false);
    expect(headers.get("idempotency-key")).toBe("audio-attempt-1");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("child_id")).toBe("CH-002");
    expect(body.get("context")).toBe("HOME");
    expect(body.get("audio")).toBeInstanceOf(Blob);
    expect(body.get("mime_type")).toBe("audio/webm");
  });

  it("encodes draft ids for patch and confirmation", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(observationDraft))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            record_id: "record-1",
            child_id: "CH-002",
            recorded_at: "2026-08-30T10:00:00Z",
            source: "FAMILY",
            persistence_status: "PERSISTED",
            risk_recalculation_requested: true
          },
          201
        )
      );
    const client = createApiClient({ baseUrl: "http://api.test", fetcher });

    await client.patchObservationDraft("draft/one", { proposed_variables: [] });
    await client.confirmObservationDraft(
      "draft/one",
      { notes: "Confirmado" },
      { idempotencyKey: "confirm-attempt-1" }
    );

    expect(fetcher.mock.calls[0][0]).toBe("http://api.test/v1/observation-drafts/draft%2Fone");
    expect(fetcher.mock.calls[0][1]?.method).toBe("PATCH");
    expect(fetcher.mock.calls[1][0]).toBe("http://api.test/v1/observation-drafts/draft%2Fone/confirm");
    expect(new Headers(fetcher.mock.calls[1][1]?.headers).get("idempotency-key")).toBe("confirm-attempt-1");
  });
});
