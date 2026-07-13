/**
 * HTTP client untuk memanggil API website IdeTech dengan autentikasi session token
 * Setiap panggilan menggunakan Authorization header berupa Bearer token user yang sudah login
 */

import { IDETECH_BASE_URL } from "./idetech-config";

export class IdeTechClient {
  constructor(private sessionToken: string) {
    if (!sessionToken) throw new Error("Session token required");
  }

  private async request(path: string, init?: RequestInit): Promise<unknown> {
    const url = `${IDETECH_BASE_URL}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.sessionToken}`,
      ...(init?.headers as Record<string, string>),
    };

    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      throw new Error(
        (body.message as string) || `IdeTech API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
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