export type ExportJobRecord = {
  id: string;
  rppDocumentId: string;
  organizationId: string;
  format: string;
  attempts: number;
};

export type ExportJobDocument = {
  id: string;
  telegramUserId: string;
  organizationId: string;
};

/**
 * Port untuk worker ekspor. Adapter produksi akan memakai Drizzle, sedangkan
 * harness E2E dapat memakai libSQL sementara tanpa memanggil database aplikasi.
 */
export interface ExportJobRepository {
  recoverExpiredLeases(now: number): Promise<number>;
  claimNext(now: number, leaseMs: number): Promise<ExportJobRecord | null>;
  findDocument(rppDocumentId: string): Promise<ExportJobDocument | null>;
  complete(jobId: string, now: number): Promise<void>;
  retry(jobId: string, attempts: number, error: string, retryAt: number, now: number): Promise<void>;
}
