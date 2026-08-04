import { sep } from "node:path";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js
var homeDirCache = {};
var getHomeDirCacheKey = () => {
	if (process && process.geteuid) return `${process.geteuid()}`;
	return "DEFAULT";
};
var getHomeDir = () => {
	const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${sep}` } = process.env;
	if (HOME) return HOME;
	if (USERPROFILE) return USERPROFILE;
	if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;
	const homeDirCacheKey = getHomeDirCacheKey();
	if (!homeDirCache[homeDirCacheKey]) homeDirCache[homeDirCacheKey] = homedir();
	return homeDirCache[homeDirCacheKey];
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js
var filePromises = {};
var fileIntercept = {};
var readFile$1 = (path, options) => {
	if (fileIntercept[path] !== void 0) return fileIntercept[path];
	if (!filePromises[path] || options?.ignoreCache) filePromises[path] = readFile(path, "utf8");
	return filePromises[path];
};
//#endregion
export { readFile$1 as n, getHomeDir as r, fileIntercept as t };
