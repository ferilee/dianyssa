import { IDETECH_BASE_URL } from "./idetech-config";

export class IdeTechClient {
  constructor(private sessionToken: string) {}

  private async request(path: string, init?: RequestInit) {
    const url = `${IDETECH_BASE_URL}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.sessionToken}`,
      ...(init?.headers as Record<string, string>),
    };

    const response = await fetch(url, { ...init, headers });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        body?.message || `IdeTech API error: ${response.status} ${response.statusText}`
      );
    }

    return body;
  }

  get(path: string) {
    return this.request(path, { method: "GET" });
  }

  post(path: string, body: unknown) {
    return this.request(path, { method: "POST", body: JSON.stringify(body) });
  }

  put(path: string, body: unknown) {
    return this.request(path, { method: "PUT", body: JSON.stringify(body) });
  }

  patch(path: string, body: unknown) {
    return this.request(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  delete(path: string) {
    return this.request(path, { method: "DELETE" });
  }
}

export function createIdeTechClient(sessionToken: string) {
  return new IdeTechClient(sessionToken);
}