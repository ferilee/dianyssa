import { n as ProviderError } from "./CredentialsProviderError-uKEwU1di.js";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js
var chain = (...providers) => async () => {
	if (providers.length === 0) throw new ProviderError("No providers in chain");
	let lastProviderError;
	for (const provider of providers) try {
		return await provider();
	} catch (err) {
		lastProviderError = err;
		if (err?.tryNextLink) continue;
		throw err;
	}
	throw lastProviderError;
};
//#endregion
export { chain as t };
