import { describe, expect, it } from "bun:test";
import type { ExportJobRepository } from "../services/export-job-repository";

describe("export job repository contract", () => {
  it("defines the operations required by an injectable worker repository", () => {
    const repository: Pick<ExportJobRepository, "recoverExpiredLeases" | "claimNext" | "findDocument" | "complete" | "retry"> = {} as ExportJobRepository;
    expect(Object.keys(repository)).toEqual([]);
  });
});
