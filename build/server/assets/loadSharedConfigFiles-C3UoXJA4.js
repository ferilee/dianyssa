import { n as readFile, r as getHomeDir } from "./readFile-DxxtKEBW.js";
import { join } from "node:path";
//#region node_modules/.pnpm/@smithy+types@4.16.1/node_modules/@smithy/types/dist-es/profile.js
var IniSectionType;
(function(IniSectionType) {
	IniSectionType["PROFILE"] = "profile";
	IniSectionType["SSO_SESSION"] = "sso-session";
	IniSectionType["SERVICES"] = "services";
})(IniSectionType || (IniSectionType = {}));
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js
var ENV_PROFILE = "AWS_PROFILE";
var getProfileName = (init) => init.profile || process.env["AWS_PROFILE"] || "default";
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js
var getConfigData = (data) => Object.entries(data).filter(([key]) => {
	const indexOfSeparator = key.indexOf(".");
	if (indexOfSeparator === -1) return false;
	return Object.values(IniSectionType).includes(key.substring(0, indexOfSeparator));
}).reduce((acc, [key, value]) => {
	const indexOfSeparator = key.indexOf(".");
	const updatedKey = key.substring(0, indexOfSeparator) === IniSectionType.PROFILE ? key.substring(indexOfSeparator + 1) : key;
	acc[updatedKey] = value;
	return acc;
}, { ...data.default && { default: data.default } });
var getConfigFilepath = () => process.env["AWS_CONFIG_FILE"] || join(getHomeDir(), ".aws", "config");
var getCredentialsFilepath = () => process.env["AWS_SHARED_CREDENTIALS_FILE"] || join(getHomeDir(), ".aws", "credentials");
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js
var prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@+.%:/]+)\2$/;
var profileNameBlockList = ["__proto__", "profile __proto__"];
var parseIni = (iniData) => {
	const map = {};
	let currentSection;
	let currentSubSection;
	for (const iniLine of iniData.split(/\r?\n/)) {
		const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim();
		if (trimmedLine[0] === "[" && trimmedLine[trimmedLine.length - 1] === "]") {
			currentSection = void 0;
			currentSubSection = void 0;
			const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
			const matches = prefixKeyRegex.exec(sectionName);
			if (matches) {
				const [, prefix, , name] = matches;
				if (Object.values(IniSectionType).includes(prefix)) currentSection = [prefix, name].join(".");
			} else currentSection = sectionName;
			if (profileNameBlockList.includes(sectionName)) throw new Error(`Found invalid profile name "${sectionName}"`);
		} else if (currentSection) {
			const indexOfEqualsSign = trimmedLine.indexOf("=");
			if (![0, -1].includes(indexOfEqualsSign)) {
				const [name, value] = [trimmedLine.substring(0, indexOfEqualsSign).trim(), trimmedLine.substring(indexOfEqualsSign + 1).trim()];
				if (value === "") currentSubSection = name;
				else {
					if (currentSubSection && iniLine.trimStart() === iniLine) currentSubSection = void 0;
					map[currentSection] = map[currentSection] || {};
					const key = currentSubSection ? [currentSubSection, name].join(".") : name;
					map[currentSection][key] = value;
				}
			}
		}
	}
	return map;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js
var swallowError = () => ({});
var loadSharedConfigFiles = async (init = {}) => {
	const { filepath = getCredentialsFilepath(), configFilepath = getConfigFilepath() } = init;
	const homeDir = getHomeDir();
	const relativeHomeDirPrefix = "~/";
	let resolvedFilepath = filepath;
	if (filepath.startsWith(relativeHomeDirPrefix)) resolvedFilepath = join(homeDir, filepath.slice(2));
	let resolvedConfigFilepath = configFilepath;
	if (configFilepath.startsWith(relativeHomeDirPrefix)) resolvedConfigFilepath = join(homeDir, configFilepath.slice(2));
	const parsedFiles = await Promise.all([readFile(resolvedConfigFilepath, { ignoreCache: init.ignoreCache }).then(parseIni).then(getConfigData).catch(swallowError), readFile(resolvedFilepath, { ignoreCache: init.ignoreCache }).then(parseIni).catch(swallowError)]);
	return {
		configFile: parsedFiles[0],
		credentialsFile: parsedFiles[1]
	};
};
//#endregion
export { getProfileName as a, ENV_PROFILE as i, parseIni as n, IniSectionType as o, getConfigFilepath as r, loadSharedConfigFiles as t };
