import { r as getHomeDir } from "./readFile-DxxtKEBW.js";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getSSOTokenFilepath.js
var getSSOTokenFilepath = (id) => {
	const cacheName = createHash("sha1").update(id).digest("hex");
	return join(getHomeDir(), ".aws", "sso", "cache", `${cacheName}.json`);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getSSOTokenFromFile.js
var tokenIntercept = {};
var getSSOTokenFromFile = async (id) => {
	if (tokenIntercept[id]) return tokenIntercept[id];
	const ssoTokenText = await readFile(getSSOTokenFilepath(id), "utf8");
	return JSON.parse(ssoTokenText);
};
//#endregion
export { tokenIntercept as n, getSSOTokenFilepath as r, getSSOTokenFromFile as t };
