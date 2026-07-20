export type ExportWorkerHealth = {
  lastTickAt: number | null;
  lastJobStartedAt: number | null;
  lastJobCompletedAt: number | null;
  lastJobFailedAt: number | null;
};

export function createExportWorkerHealthTracker() {
  const state: ExportWorkerHealth = {
    lastTickAt: null,
    lastJobStartedAt: null,
    lastJobCompletedAt: null,
    lastJobFailedAt: null,
  };

  return {
    recordTick(at = Date.now()) { state.lastTickAt = at; },
    recordJobStarted(at = Date.now()) { state.lastJobStartedAt = at; },
    recordJobCompleted(at = Date.now()) { state.lastJobCompletedAt = at; },
    recordJobFailed(at = Date.now()) { state.lastJobFailedAt = at; },
    snapshot(): ExportWorkerHealth { return { ...state }; },
  };
}

export const exportWorkerHealth = createExportWorkerHealthTracker();
