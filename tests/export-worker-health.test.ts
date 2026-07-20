import { describe, expect, it } from "bun:test";
import { createExportWorkerHealthTracker } from "../server/operations/export-worker-health";

describe("export worker health tracker", () => {
  it("records operational timestamps without exposing mutable state", () => {
    const tracker = createExportWorkerHealthTracker();
    tracker.recordTick(10);
    tracker.recordJobStarted(11);
    tracker.recordJobCompleted(12);
    tracker.recordJobFailed(13);

    expect(tracker.snapshot()).toEqual({
      lastTickAt: 10,
      lastJobStartedAt: 11,
      lastJobCompletedAt: 12,
      lastJobFailedAt: 13,
    });
  });
});
