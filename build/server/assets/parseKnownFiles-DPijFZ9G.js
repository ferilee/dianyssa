import { t as loadSharedConfigFiles } from "./loadSharedConfigFiles-C3UoXJA4.js";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/mergeConfigFiles.js
var mergeConfigFiles = (...files) => {
	const merged = {};
	for (const file of files) for (const [key, values] of Object.entries(file)) if (merged[key] !== void 0) Object.assign(merged[key], values);
	else merged[key] = values;
	return merged;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseKnownFiles.js
var parseKnownFiles = async (init) => {
	const parsedFiles = await loadSharedConfigFiles(init);
	return mergeConfigFiles(parsedFiles.configFile, parsedFiles.credentialsFile);
};
//#endregion
export { parseKnownFiles as t };
