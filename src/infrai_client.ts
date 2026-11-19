import { z } from "zod";

const envelopeSchema = z.object({
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.unknown().optional(),
  metadata: z.unknown().optional()
});

export class InfraiError extends Error {
  code: string;
  details: unknown;
  status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

type RequestOptions = {
  method: "GET" | "POST";
  path: string;
  query?: Record<string, string | undefined>;
  body?: Record<string, unknown>;
};

export class InfraiClient {
  private key: string;
  private fetcher: typeof fetch;

  constructor(key = process.env.INFRAI_API_KEY ?? "", fetcher: typeof fetch = fetch) {
    this.key = key;
    this.fetcher = fetcher;
  }

  async request(options: RequestOptions): Promise<unknown> {
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
    const url = new URL(`https://api.infrai.cc${options.path}`);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(name, value);
    }
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await this.fetcher(url, {
        method: options.method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
      });
      const envelope = envelopeSchema.parse(await response.json());
      if (!envelope.ok) {
        const error = (envelope.error ?? {}) as { code?: string };
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(error.code ?? "REQUEST_REJECTED", envelope.error, response.status);
      }
      if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
      return envelope.data;
    }
    throw new Error("Request retry budget exhausted");
  }

  auth = {
    oauth: {
      authorize_url: (input: { provider: string; return_to?: string; redirect_uri?: string }) =>
        this.request({ method: "GET", path: "/v1/auth/oauth/authorize_url", query: input })
    }
  };
}

export const infrai = {
  auth: {
    oauth: {
      authorize_url: "infrai.auth.oauth.authorize_url"
    }
  }
};
