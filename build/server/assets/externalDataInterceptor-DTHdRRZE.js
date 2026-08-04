import { t as fileIntercept } from "./readFile-DxxtKEBW.js";
import { n as tokenIntercept } from "./getSSOTokenFromFile-BTl5SS1W.js";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/externalDataInterceptor.js
var externalDataInterceptor = {
	getFileRecord() {
		return fileIntercept;
	},
	interceptFile(path, contents) {
		fileIntercept[path] = Promise.resolve(contents);
	},
	getTokenRecord() {
		return tokenIntercept;
	},
	interceptToken(id, contents) {
		tokenIntercept[id] = contents;
	}
};
//#endregion
export { externalDataInterceptor as t };
