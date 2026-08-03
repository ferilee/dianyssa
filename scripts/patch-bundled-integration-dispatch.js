const dispatchErrorMarker = "Failed to dispatch processor request";
const publicBaseUrlChain =
  "process.env.APP_URL||process.env.URL||process.env.DEPLOY_URL||process.env.BETTER_AUTH_URL";
const internalBaseUrlChain = `process.env.WEBHOOK_BASE_URL||${publicBaseUrlChain}`;

/**
 * Patches Agent Native's production bundle. The framework regenerates its
 * integration source while building, so the source-level patch alone is not
 * sufficient for the runtime code that sends the processor request.
 */
export function patchBundledIntegrationDispatch(source) {
  const markerIndex = source.indexOf(dispatchErrorMarker);
  if (markerIndex === -1) return source;

  const internalIndex = source.indexOf(internalBaseUrlChain, markerIndex);
  if (internalIndex !== -1) return source;

  const publicIndex = source.indexOf(publicBaseUrlChain, markerIndex);
  if (publicIndex === -1) {
    throw new Error(
      "[patch-output] Could not find the integration self-dispatch URL chain after its error marker.",
    );
  }

  return `${source.slice(0, publicIndex)}${internalBaseUrlChain}${source.slice(
    publicIndex + publicBaseUrlChain.length,
  )}`;
}
