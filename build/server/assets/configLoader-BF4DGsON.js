import { a as getProfileName, t as loadSharedConfigFiles } from "./loadSharedConfigFiles-C3UoXJA4.js";
import { t as CredentialsProviderError } from "./CredentialsProviderError-uKEwU1di.js";
import { t as chain } from "./chain-opDPuwo1.js";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js
function parseQueryString(querystring) {
	const query = {};
	querystring = querystring.replace(/^\?/, "");
	if (querystring) for (const pair of querystring.split("&")) {
		let [key, value = null] = pair.split("=");
		key = decodeURIComponent(key);
		if (value) value = decodeURIComponent(value);
		if (!(key in query)) query[key] = value;
		else if (Array.isArray(query[key])) query[key].push(value);
		else query[key] = [query[key], value];
	}
	return query;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js
var parseUrl = (url) => {
	if (typeof url === "string") return parseUrl(new URL(url));
	const { hostname, pathname, port, protocol, search } = url;
	let query;
	if (search) query = parseQueryString(search);
	return {
		hostname,
		port: port ? parseInt(port) : void 0,
		protocol,
		path: pathname,
		query
	};
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js
var fromValue = (staticValue) => () => Promise.resolve(staticValue);
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js
var memoize = (provider, isExpired, requiresRefresh) => {
	let resolved;
	let pending;
	let hasResult;
	let isConstant = false;
	const coalesceProvider = async () => {
		if (!pending) pending = provider();
		try {
			resolved = await pending;
			hasResult = true;
			isConstant = false;
		} finally {
			pending = void 0;
		}
		return resolved;
	};
	if (isExpired === void 0) return async (options) => {
		if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider();
		return resolved;
	};
	return async (options) => {
		if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider();
		if (isConstant) return resolved;
		if (requiresRefresh && !requiresRefresh(resolved)) {
			isConstant = true;
			return resolved;
		}
		if (isExpired(resolved)) {
			await coalesceProvider();
			return resolved;
		}
		return resolved;
	};
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js
function getSelectorName(functionString) {
	try {
		const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
		constants.delete("CONFIG");
		constants.delete("CONFIG_PREFIX_SEPARATOR");
		constants.delete("ENV");
		return [...constants].join(", ");
	} catch (ignored) {
		return functionString;
	}
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js
var fromEnv = (envVarSelector, options) => async () => {
	try {
		const config = envVarSelector(process.env, options);
		if (config === void 0) throw new Error();
		return config;
	} catch (e) {
		throw new CredentialsProviderError(e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`, { logger: options?.logger });
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js
var fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {}) => async () => {
	const profile = getProfileName(init);
	const { configFile, credentialsFile } = await loadSharedConfigFiles(init);
	const profileFromCredentials = credentialsFile[profile] || {};
	const profileFromConfig = configFile[profile] || {};
	const mergedProfile = preferredFile === "config" ? {
		...profileFromCredentials,
		...profileFromConfig
	} : {
		...profileFromConfig,
		...profileFromCredentials
	};
	try {
		const configValue = configSelector(mergedProfile, preferredFile === "config" ? configFile : credentialsFile);
		if (configValue === void 0) throw new Error();
		return configValue;
	} catch (e) {
		throw new CredentialsProviderError(e.message || `Not found in config files w/ profile [${profile}]: ${getSelectorName(configSelector.toString())}`, { logger: init.logger });
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js
var isFunction = (func) => typeof func === "function";
var fromStatic = (defaultValue) => isFunction(defaultValue) ? async () => await defaultValue() : fromValue(defaultValue);
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js
var loadConfig = ({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => {
	const { signingName, logger } = configuration;
	return memoize(chain(fromEnv(environmentVariableSelector, {
		signingName,
		logger
	}), fromSharedConfigFiles(configFileSelector, configuration), fromStatic(defaultValue)));
};
//#endregion
export { memoize as n, parseUrl as r, loadConfig as t };
