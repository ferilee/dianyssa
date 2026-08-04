import { t as setCredentialFeature } from "./setCredentialFeature-B8gFd5oe.js";
import { t as HttpRequest } from "./httpRequest-MsxXbvEi.js";
import { n as escapeUri, r as HttpResponse } from "./node-http-handler-ESuki7Pk.js";
import { n as memoize, r as parseUrl, t as loadConfig } from "./configLoader-BF4DGsON.js";
import { A as isArrayBuffer, E as toUtf8, O as fromUtf8, T as parseRfc7231DateTime, _ as _parseRfc3339DateTimeWithOffset, b as LazyJsonString, d as fromHex, f as toHex, g as _parseEpochTimestamp, k as fromBase64, l as toUint8Array, m as splitHeader, p as NumericValue, r as v4, t as Uint8ArrayBlobAdapter, v as _parseRfc7231DateTime } from "./serde-DSMreXns.js";
import { env, versions } from "node:process";
import { createHash, createHmac } from "node:crypto";
import { Readable } from "node:stream";
import { platform, release } from "node:os";
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/emitWarningIfUnsupportedVersion.js
var state = { warningEmitted: false };
var emitWarningIfUnsupportedVersion$1 = (version) => {
	if (version && !state.warningEmitted) {
		if (process.env.AWS_SDK_JS_NODE_VERSION_SUPPORT_WARNING_DISABLED === "true") {
			state.warningEmitted = true;
			return;
		}
		const userMajorVersion = parseInt(version.substring(1, version.indexOf(".")));
		const vv = 22;
		if (userMajorVersion < vv) {
			state.warningEmitted = true;
			process.emitWarning(`NodeVersionSupportWarning: The AWS SDK for JavaScript (v3)
versions published after the first week of January 2027
will require node >=${vv}. You are running node ${version}.

To continue receiving updates to AWS services, bug fixes,
and security updates please upgrade to node >=${vv}.

More information can be found at: https://a.co/c895JFp`);
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/isStreamingPayload/isStreamingPayload.js
var isStreamingPayload = (request) => request?.body instanceof Readable || typeof ReadableStream !== "undefined" && request?.body instanceof ReadableStream;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/middleware-stack/MiddlewareStack.js
var getAllAliases = (name, aliases) => {
	const _aliases = [];
	if (name) _aliases.push(name);
	if (aliases) for (const alias of aliases) _aliases.push(alias);
	return _aliases;
};
var getMiddlewareNameWithAliases = (name, aliases) => {
	return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
};
var constructStack = () => {
	let absoluteEntries = [];
	let relativeEntries = [];
	let identifyOnResolve = false;
	const entriesNameSet = /* @__PURE__ */ new Set();
	const sort = (entries) => entries.sort((a, b) => stepWeights[b.step] - stepWeights[a.step] || priorityWeights[b.priority || "normal"] - priorityWeights[a.priority || "normal"]);
	const removeByName = (toRemove) => {
		let isRemoved = false;
		const filterCb = (entry) => {
			const aliases = getAllAliases(entry.name, entry.aliases);
			if (aliases.includes(toRemove)) {
				isRemoved = true;
				for (const alias of aliases) entriesNameSet.delete(alias);
				return false;
			}
			return true;
		};
		absoluteEntries = absoluteEntries.filter(filterCb);
		relativeEntries = relativeEntries.filter(filterCb);
		return isRemoved;
	};
	const removeByReference = (toRemove) => {
		let isRemoved = false;
		const filterCb = (entry) => {
			if (entry.middleware === toRemove) {
				isRemoved = true;
				for (const alias of getAllAliases(entry.name, entry.aliases)) entriesNameSet.delete(alias);
				return false;
			}
			return true;
		};
		absoluteEntries = absoluteEntries.filter(filterCb);
		relativeEntries = relativeEntries.filter(filterCb);
		return isRemoved;
	};
	const cloneTo = (toStack) => {
		absoluteEntries.forEach((entry) => {
			toStack.add(entry.middleware, { ...entry });
		});
		relativeEntries.forEach((entry) => {
			toStack.addRelativeTo(entry.middleware, { ...entry });
		});
		toStack.identifyOnResolve?.(stack.identifyOnResolve());
		return toStack;
	};
	const expandRelativeMiddlewareList = (from) => {
		const expandedMiddlewareList = [];
		from.before.forEach((entry) => {
			if (entry.before.length === 0 && entry.after.length === 0) expandedMiddlewareList.push(entry);
			else expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
		});
		expandedMiddlewareList.push(from);
		from.after.reverse().forEach((entry) => {
			if (entry.before.length === 0 && entry.after.length === 0) expandedMiddlewareList.push(entry);
			else expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
		});
		return expandedMiddlewareList;
	};
	const getMiddlewareList = (debug = false) => {
		const normalizedAbsoluteEntries = [];
		const normalizedRelativeEntries = [];
		const normalizedEntriesNameMap = {};
		absoluteEntries.forEach((entry) => {
			const normalizedEntry = {
				...entry,
				before: [],
				after: []
			};
			for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) normalizedEntriesNameMap[alias] = normalizedEntry;
			normalizedAbsoluteEntries.push(normalizedEntry);
		});
		relativeEntries.forEach((entry) => {
			const normalizedEntry = {
				...entry,
				before: [],
				after: []
			};
			for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) normalizedEntriesNameMap[alias] = normalizedEntry;
			normalizedRelativeEntries.push(normalizedEntry);
		});
		normalizedRelativeEntries.forEach((entry) => {
			if (entry.toMiddleware) {
				const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
				if (toMiddleware === void 0) {
					if (debug) return;
					throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
				}
				if (entry.relation === "after") toMiddleware.after.push(entry);
				if (entry.relation === "before") toMiddleware.before.push(entry);
			}
		});
		return sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
			wholeList.push(...expandedMiddlewareList);
			return wholeList;
		}, []);
	};
	const stack = {
		add: (middleware, options = {}) => {
			const { name, override, aliases: _aliases } = options;
			const entry = {
				step: "initialize",
				priority: "normal",
				middleware,
				...options
			};
			const aliases = getAllAliases(name, _aliases);
			if (aliases.length > 0) {
				if (aliases.some((alias) => entriesNameSet.has(alias))) {
					if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
					for (const alias of aliases) {
						const toOverrideIndex = absoluteEntries.findIndex((entry) => entry.name === alias || entry.aliases?.some((a) => a === alias));
						if (toOverrideIndex === -1) continue;
						const toOverride = absoluteEntries[toOverrideIndex];
						if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
						absoluteEntries.splice(toOverrideIndex, 1);
					}
				}
				for (const alias of aliases) entriesNameSet.add(alias);
			}
			absoluteEntries.push(entry);
		},
		addRelativeTo: (middleware, options) => {
			const { name, override, aliases: _aliases } = options;
			const entry = {
				middleware,
				...options
			};
			const aliases = getAllAliases(name, _aliases);
			if (aliases.length > 0) {
				if (aliases.some((alias) => entriesNameSet.has(alias))) {
					if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
					for (const alias of aliases) {
						const toOverrideIndex = relativeEntries.findIndex((entry) => entry.name === alias || entry.aliases?.some((a) => a === alias));
						if (toOverrideIndex === -1) continue;
						const toOverride = relativeEntries[toOverrideIndex];
						if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
						relativeEntries.splice(toOverrideIndex, 1);
					}
				}
				for (const alias of aliases) entriesNameSet.add(alias);
			}
			relativeEntries.push(entry);
		},
		clone: () => cloneTo(constructStack()),
		use: (plugin) => {
			plugin.applyToStack(stack);
		},
		remove: (toRemove) => {
			if (typeof toRemove === "string") return removeByName(toRemove);
			else return removeByReference(toRemove);
		},
		removeByTag: (toRemove) => {
			let isRemoved = false;
			const filterCb = (entry) => {
				const { tags, name, aliases: _aliases } = entry;
				if (tags && tags.includes(toRemove)) {
					const aliases = getAllAliases(name, _aliases);
					for (const alias of aliases) entriesNameSet.delete(alias);
					isRemoved = true;
					return false;
				}
				return true;
			};
			absoluteEntries = absoluteEntries.filter(filterCb);
			relativeEntries = relativeEntries.filter(filterCb);
			return isRemoved;
		},
		concat: (from) => {
			const cloned = cloneTo(constructStack());
			cloned.use(from);
			cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
			return cloned;
		},
		applyToStack: cloneTo,
		identify: () => {
			return getMiddlewareList(true).map((mw) => {
				const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
				return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
			});
		},
		identifyOnResolve(toggle) {
			if (typeof toggle === "boolean") identifyOnResolve = toggle;
			return identifyOnResolve;
		},
		resolve: (handler, context) => {
			for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) handler = middleware(handler, context);
			if (identifyOnResolve) console.log(stack.identify());
			return handler;
		}
	};
	return stack;
};
var stepWeights = {
	initialize: 5,
	serialize: 4,
	build: 3,
	finalizeRequest: 2,
	deserialize: 1
};
var priorityWeights = {
	high: 3,
	normal: 2,
	low: 1
};
//#endregion
//#region node_modules/.pnpm/@smithy+types@4.16.1/node_modules/@smithy/types/dist-es/endpoint.js
var EndpointURLScheme;
(function(EndpointURLScheme) {
	EndpointURLScheme["HTTP"] = "http";
	EndpointURLScheme["HTTPS"] = "https";
})(EndpointURLScheme || (EndpointURLScheme = {}));
//#endregion
//#region node_modules/.pnpm/@smithy+types@4.16.1/node_modules/@smithy/types/dist-es/extensions/checksum.js
var AlgorithmId;
(function(AlgorithmId) {
	AlgorithmId["MD5"] = "md5";
	AlgorithmId["CRC32"] = "crc32";
	AlgorithmId["CRC32C"] = "crc32c";
	AlgorithmId["SHA1"] = "sha1";
	AlgorithmId["SHA256"] = "sha256";
})(AlgorithmId || (AlgorithmId = {}));
//#endregion
//#region node_modules/.pnpm/@smithy+types@4.16.1/node_modules/@smithy/types/dist-es/middleware.js
var SMITHY_CONTEXT_KEY = "__smithy_context";
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js
var getSmithyContext = (context) => context["__smithy_context"] || (context["__smithy_context"] = {});
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/isValidHostLabel.js
var VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
var isValidHostLabel = (value, allowSubDomains = false) => {
	if (!allowSubDomains) return VALID_HOST_LABEL_REGEX.test(value);
	const labels = value.split(".");
	for (const label of labels) if (!isValidHostLabel(label)) return false;
	return true;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/isValidHostname.js
function isValidHostname(hostname) {
	return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(hostname);
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js
var normalizeProvider$1 = (input) => {
	if (typeof input === "function") return input;
	const promisified = Promise.resolve(input);
	return () => promisified;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/toEndpointV1.js
var toEndpointV1 = (endpoint) => {
	if (typeof endpoint === "object") {
		if ("url" in endpoint) {
			const v1Endpoint = parseUrl(endpoint.url);
			if (endpoint.headers) {
				v1Endpoint.headers = {};
				for (const name in endpoint.headers) v1Endpoint.headers[name.toLowerCase()] = endpoint.headers[name].join(", ");
			}
			return v1Endpoint;
		}
		return endpoint;
	}
	return parseUrl(endpoint);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client.js
var Client = class {
	config;
	middlewareStack = constructStack();
	initConfig;
	handlers;
	constructor(config) {
		this.config = config;
		const { protocol, protocolSettings } = config;
		if (protocolSettings) {
			if (typeof protocol === "function") config.protocol = new protocol(protocolSettings);
		}
	}
	send(command, optionsOrCb, cb) {
		const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
		const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
		const useHandlerCache = options === void 0 && this.config.cacheMiddleware === true;
		let handler;
		if (useHandlerCache) {
			if (!this.handlers) this.handlers = /* @__PURE__ */ new WeakMap();
			const handlers = this.handlers;
			if (handlers.has(command.constructor)) handler = handlers.get(command.constructor);
			else {
				handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
				handlers.set(command.constructor, handler);
			}
		} else {
			delete this.handlers;
			handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
		}
		if (callback) handler(command).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {});
		else return handler(command).then((result) => result.output);
	}
	destroy() {
		this.config?.requestHandler?.destroy?.();
		delete this.handlers;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/deref.js
var deref = (schemaRef) => {
	if (typeof schemaRef === "function") return schemaRef();
	return schemaRef;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/schemas/operation.js
var operation = (namespace, name, traits, input, output) => ({
	name,
	namespace,
	traits,
	input,
	output
});
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaDeserializationMiddleware.js
var schemaDeserializationMiddleware = (config) => (next, context) => async (args) => {
	const { response } = await next(args);
	const { operationSchema } = getSmithyContext(context);
	const [, ns, n, t, i, o] = operationSchema ?? [];
	try {
		return {
			response,
			output: await config.protocol.deserializeResponse(operation(ns, n, t, i, o), {
				...config,
				...context
			}, response)
		};
	} catch (error) {
		Object.defineProperty(error, "$response", {
			value: response,
			enumerable: false,
			writable: false,
			configurable: false
		});
		if (!("$metadata" in error)) {
			const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
			try {
				error.message += "\n  " + hint;
			} catch (ignored) {
				if (!context.logger || context.logger?.constructor?.name === "NoOpLogger") console.warn(hint);
				else context.logger?.warn?.(hint);
			}
			if (typeof error.$responseBodyText !== "undefined") {
				if (error.$response) error.$response.body = error.$responseBodyText;
			}
			try {
				if (HttpResponse.isInstance(response)) {
					const { headers = {}, statusCode } = response;
					const headerEntries = Object.entries(headers);
					error.$metadata = {
						httpStatusCode: statusCode,
						requestId: findHeader(/^x-[\w-]+-request-?id$/, headerEntries),
						extendedRequestId: findHeader(/^x-[\w-]+-id-2$/, headerEntries),
						cfId: findHeader(/^x-[\w-]+-cf-id$/, headerEntries)
					};
				}
			} catch (ignored) {}
		}
		throw error;
	}
};
var findHeader = (pattern, headers) => {
	return (headers.find(([k]) => {
		return k.match(pattern);
	}) || [void 0, void 0])[1];
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/middleware/schemaSerializationMiddleware.js
var schemaSerializationMiddleware = (config) => (next, context) => async (args) => {
	const { operationSchema } = getSmithyContext(context);
	const [, ns, n, t, i, o] = operationSchema ?? [];
	const endpoint = context.endpointV2 ? async () => toEndpointV1(context.endpointV2) : config.endpoint;
	const request = await config.protocol.serializeRequest(operation(ns, n, t, i, o), args.input, {
		...config,
		...context,
		endpoint
	});
	return next({
		...args,
		request
	});
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js
var deserializerMiddlewareOption = {
	name: "deserializerMiddleware",
	step: "deserialize",
	tags: ["DESERIALIZER"],
	override: true
};
var serializerMiddlewareOption$1 = {
	name: "serializerMiddleware",
	step: "serialize",
	tags: ["SERIALIZER"],
	override: true
};
function getSchemaSerdePlugin(config) {
	return { applyToStack: (commandStack) => {
		commandStack.add(schemaSerializationMiddleware(config), serializerMiddlewareOption$1);
		commandStack.add(schemaDeserializationMiddleware(config), deserializerMiddlewareOption);
		config.protocol.setSerdeContext(config);
	} };
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/schemas/translateTraits.js
var traitsCache = [];
function translateTraits(indicator) {
	if (typeof indicator === "object") return indicator;
	indicator = indicator | 0;
	if (traitsCache[indicator]) return traitsCache[indicator];
	const traits = {};
	let i = 0;
	for (const trait of [
		"httpLabel",
		"idempotent",
		"idempotencyToken",
		"sensitive",
		"httpPayload",
		"httpResponseCode",
		"httpQueryParams"
	]) if ((indicator >> i++ & 1) === 1) traits[trait] = 1;
	return traitsCache[indicator] = traits;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js
var anno = {
	it: Symbol.for("@smithy/nor-struct-it"),
	ns: Symbol.for("@smithy/ns")
};
var simpleSchemaCacheN = [];
var simpleSchemaCacheS = {};
var NormalizedSchema = class NormalizedSchema {
	ref;
	memberName;
	static symbol = Symbol.for("@smithy/nor");
	symbol = NormalizedSchema.symbol;
	name;
	schema;
	_isMemberSchema;
	traits;
	memberTraits;
	normalizedTraits;
	constructor(ref, memberName) {
		this.ref = ref;
		this.memberName = memberName;
		const traitStack = [];
		let _ref = ref;
		let schema = ref;
		this._isMemberSchema = false;
		while (isMemberSchema(_ref)) {
			traitStack.push(_ref[1]);
			_ref = _ref[0];
			schema = deref(_ref);
			this._isMemberSchema = true;
		}
		if (traitStack.length > 0) {
			this.memberTraits = {};
			for (let i = traitStack.length - 1; i >= 0; --i) {
				const traitSet = traitStack[i];
				Object.assign(this.memberTraits, translateTraits(traitSet));
			}
		} else this.memberTraits = 0;
		if (schema instanceof NormalizedSchema) {
			const computedMemberTraits = this.memberTraits;
			Object.assign(this, schema);
			this.memberTraits = Object.assign({}, computedMemberTraits, schema.getMemberTraits(), this.getMemberTraits());
			this.normalizedTraits = void 0;
			this.memberName = memberName ?? schema.memberName;
			return;
		}
		this.schema = deref(schema);
		if (isStaticSchema(this.schema)) {
			this.name = `${this.schema[1]}#${this.schema[2]}`;
			this.traits = this.schema[3];
		} else {
			this.name = this.memberName ?? String(schema);
			this.traits = 0;
		}
		if (this._isMemberSchema && !memberName) throw new Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(true)} missing member name.`);
	}
	static [Symbol.hasInstance](lhs) {
		const isPrototype = this.prototype.isPrototypeOf(lhs);
		if (!isPrototype && typeof lhs === "object" && lhs !== null) return lhs.symbol === this.symbol;
		return isPrototype;
	}
	static of(ref) {
		const keyAble = typeof ref === "function" || typeof ref === "object" && ref !== null;
		if (typeof ref === "number") {
			if (simpleSchemaCacheN[ref]) return simpleSchemaCacheN[ref];
		} else if (typeof ref === "string") {
			if (simpleSchemaCacheS[ref]) return simpleSchemaCacheS[ref];
		} else if (keyAble) {
			if (ref[anno.ns]) return ref[anno.ns];
		}
		const sc = deref(ref);
		if (sc instanceof NormalizedSchema) return sc;
		if (isMemberSchema(sc)) {
			const [ns, traits] = sc;
			if (ns instanceof NormalizedSchema) {
				Object.assign(ns.getMergedTraits(), translateTraits(traits));
				return ns;
			}
			throw new Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(ref, null, 2)}.`);
		}
		const ns = new NormalizedSchema(sc);
		if (keyAble) return ref[anno.ns] = ns;
		if (typeof sc === "string") return simpleSchemaCacheS[sc] = ns;
		if (typeof sc === "number") return simpleSchemaCacheN[sc] = ns;
		return ns;
	}
	getSchema() {
		const sc = this.schema;
		if (Array.isArray(sc) && sc[0] === 0) return sc[4];
		return sc;
	}
	getName(withNamespace = false) {
		const { name } = this;
		return !withNamespace && name && name.includes("#") ? name.split("#")[1] : name || void 0;
	}
	getMemberName() {
		return this.memberName;
	}
	isMemberSchema() {
		return this._isMemberSchema;
	}
	isListSchema() {
		const sc = this.getSchema();
		return typeof sc === "number" ? sc >= 64 && sc < 128 : sc[0] === 1;
	}
	isMapSchema() {
		const sc = this.getSchema();
		return typeof sc === "number" ? sc >= 128 && sc <= 255 : sc[0] === 2;
	}
	isStructSchema() {
		const sc = this.getSchema();
		if (typeof sc !== "object") return false;
		const id = sc[0];
		return id === 3 || id === -3 || id === 4;
	}
	isUnionSchema() {
		const sc = this.getSchema();
		if (typeof sc !== "object") return false;
		return sc[0] === 4;
	}
	isBlobSchema() {
		const sc = this.getSchema();
		return sc === 21 || sc === 42;
	}
	isTimestampSchema() {
		const sc = this.getSchema();
		return typeof sc === "number" && sc >= 4 && sc <= 7;
	}
	isUnitSchema() {
		return this.getSchema() === "unit";
	}
	isDocumentSchema() {
		return this.getSchema() === 15;
	}
	isStringSchema() {
		return this.getSchema() === 0;
	}
	isBooleanSchema() {
		return this.getSchema() === 2;
	}
	isNumericSchema() {
		return this.getSchema() === 1;
	}
	isBigIntegerSchema() {
		return this.getSchema() === 17;
	}
	isBigDecimalSchema() {
		return this.getSchema() === 19;
	}
	isStreaming() {
		const { streaming } = this.getMergedTraits();
		return !!streaming || this.getSchema() === 42;
	}
	isIdempotencyToken() {
		return !!this.getMergedTraits().idempotencyToken;
	}
	getMergedTraits() {
		return this.normalizedTraits ?? (this.normalizedTraits = {
			...this.getOwnTraits(),
			...this.getMemberTraits()
		});
	}
	getMemberTraits() {
		return translateTraits(this.memberTraits);
	}
	getOwnTraits() {
		return translateTraits(this.traits);
	}
	getKeySchema() {
		const [isDoc, isMap] = [this.isDocumentSchema(), this.isMapSchema()];
		if (!isDoc && !isMap) throw new Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(true)}`);
		const schema = this.getSchema();
		return member([isDoc ? 15 : schema[4] ?? 0, 0], "key");
	}
	getValueSchema() {
		const sc = this.getSchema();
		const [isDoc, isMap, isList] = [
			this.isDocumentSchema(),
			this.isMapSchema(),
			this.isListSchema()
		];
		const memberSchema = typeof sc === "number" ? 63 & sc : sc && typeof sc === "object" && (isMap || isList) ? sc[3 + sc[0]] : isDoc ? 15 : void 0;
		if (memberSchema != null) return member([memberSchema, 0], isMap ? "value" : "member");
		throw new Error(`@smithy/core/schema - ${this.getName(true)} has no value member.`);
	}
	getMemberSchema(memberName) {
		const struct = this.getSchema();
		if (this.isStructSchema() && struct[4].includes(memberName)) {
			const i = struct[4].indexOf(memberName);
			const memberSchema = struct[5][i];
			return member(isMemberSchema(memberSchema) ? memberSchema : [memberSchema, 0], memberName);
		}
		if (this.isDocumentSchema()) return member([15, 0], memberName);
		throw new Error(`@smithy/core/schema - ${this.getName(true)} has no member=${memberName}.`);
	}
	getMemberSchemas() {
		const buffer = {};
		try {
			for (const [k, v] of this.structIterator()) buffer[k] = v;
		} catch (ignored) {}
		return buffer;
	}
	getEventStreamMember() {
		if (this.isStructSchema()) {
			for (const [memberName, memberSchema] of this.structIterator()) if (memberSchema.isStreaming() && memberSchema.isStructSchema()) return memberName;
		}
		return "";
	}
	*structIterator() {
		if (this.isUnitSchema()) return;
		if (!this.isStructSchema()) throw new Error("@smithy/core/schema - cannot iterate non-struct schema.");
		const struct = this.getSchema();
		const z = struct[4].length;
		let it = struct[anno.it];
		if (it && z === it.length) {
			yield* it;
			return;
		}
		it = Array(z);
		for (let i = 0; i < z; ++i) {
			const k = struct[4][i];
			const v = member([struct[5][i], 0], k);
			yield it[i] = [k, v];
		}
		struct[anno.it] = it;
	}
};
function member(memberSchema, memberName) {
	if (memberSchema instanceof NormalizedSchema) return Object.assign(memberSchema, {
		memberName,
		_isMemberSchema: true
	});
	return new NormalizedSchema(memberSchema, memberName);
}
var isMemberSchema = (sc) => Array.isArray(sc) && sc.length === 2;
var isStaticSchema = (sc) => Array.isArray(sc) && sc.length >= 5;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js
var TypeRegistry = class TypeRegistry {
	namespace;
	schemas;
	exceptions;
	static registries = /* @__PURE__ */ new Map();
	constructor(namespace, schemas = /* @__PURE__ */ new Map(), exceptions = /* @__PURE__ */ new Map()) {
		this.namespace = namespace;
		this.schemas = schemas;
		this.exceptions = exceptions;
	}
	static for(namespace) {
		if (!TypeRegistry.registries.has(namespace)) TypeRegistry.registries.set(namespace, new TypeRegistry(namespace));
		return TypeRegistry.registries.get(namespace);
	}
	copyFrom(other) {
		const { schemas, exceptions } = this;
		for (const [k, v] of other.schemas) if (!schemas.has(k)) schemas.set(k, v);
		for (const [k, v] of other.exceptions) if (!exceptions.has(k)) exceptions.set(k, v);
	}
	register(shapeId, schema) {
		const qualifiedName = this.normalizeShapeId(shapeId);
		for (const r of [this, TypeRegistry.for(qualifiedName.split("#")[0])]) r.schemas.set(qualifiedName, schema);
	}
	getSchema(shapeId) {
		const id = this.normalizeShapeId(shapeId);
		if (!this.schemas.has(id)) {
			if (!shapeId.includes("#")) {
				const suffix = "#" + shapeId;
				const candidates = [];
				for (const [shapeId, schema] of this.schemas.entries()) if (shapeId.endsWith(suffix)) candidates.push(schema);
				if (candidates.length === 1) return candidates[0];
			}
			throw new Error(`@smithy/core/schema - schema not found for ${id}`);
		}
		return this.schemas.get(id);
	}
	registerError(es, ctor) {
		const $error = es;
		const ns = $error[1];
		for (const r of [this, TypeRegistry.for(ns)]) {
			r.schemas.set(ns + "#" + $error[2], $error);
			r.exceptions.set($error, ctor);
		}
	}
	getErrorCtor(es) {
		const $error = es;
		if (this.exceptions.has($error)) return this.exceptions.get($error);
		return TypeRegistry.for($error[1]).exceptions.get($error);
	}
	getBaseException() {
		for (const exceptionKey of this.exceptions.keys()) if (Array.isArray(exceptionKey)) {
			const [, ns, name] = exceptionKey;
			const id = ns + "#" + name;
			if (id.startsWith("smithy.ts.sdk.synthetic.") && id.endsWith("ServiceException")) return exceptionKey;
		}
	}
	find(predicate) {
		for (const schema of this.schemas.values()) if (predicate(schema)) return schema;
	}
	clear() {
		this.schemas.clear();
		this.exceptions.clear();
	}
	normalizeShapeId(shapeId) {
		if (shapeId.includes("#")) return shapeId;
		return this.namespace + "#" + shapeId;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/schemaLogFilter.js
var SENSITIVE_STRING = "***SensitiveInformation***";
function schemaLogFilter(schema, data) {
	if (data == null) return data;
	const ns = NormalizedSchema.of(schema);
	if (ns.getMergedTraits().sensitive) return SENSITIVE_STRING;
	if (ns.isListSchema()) {
		if (!!ns.getValueSchema().getMergedTraits().sensitive) return SENSITIVE_STRING;
	} else if (ns.isMapSchema()) {
		if (!!ns.getKeySchema().getMergedTraits().sensitive || !!ns.getValueSchema().getMergedTraits().sensitive) return SENSITIVE_STRING;
	} else if (ns.isStructSchema() && typeof data === "object") {
		const object = data;
		const newObject = {};
		for (const [member, memberNs] of ns.structIterator()) if (object[member] != null) newObject[member] = schemaLogFilter(memberNs, object[member]);
		return newObject;
	}
	return data;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/command.js
var Command = class {
	middlewareStack = constructStack();
	schema;
	static classBuilder() {
		return new ClassBuilder();
	}
	resolveMiddlewareWithContext(clientStack, configuration, options, { middlewareFn, clientName, commandName, inputFilterSensitiveLog, outputFilterSensitiveLog, smithyContext, additionalContext, CommandCtor }) {
		for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) this.middlewareStack.use(mw);
		const stack = clientStack.concat(this.middlewareStack);
		const { logger } = configuration;
		const handlerExecutionContext = {
			logger,
			clientName,
			commandName,
			inputFilterSensitiveLog,
			outputFilterSensitiveLog,
			[SMITHY_CONTEXT_KEY]: {
				commandInstance: this,
				...smithyContext
			},
			...additionalContext
		};
		const { requestHandler } = configuration;
		let requestOptions = options ?? {};
		if (smithyContext.eventStream) requestOptions = {
			isEventStream: true,
			...requestOptions
		};
		return stack.resolve((request) => requestHandler.handle(request.request, requestOptions), handlerExecutionContext);
	}
};
var ClassBuilder = class {
	_init = () => {};
	_ep = {};
	_middlewareFn = () => [];
	_commandName = "";
	_clientName = "";
	_additionalContext = {};
	_smithyContext = {};
	_inputFilterSensitiveLog = void 0;
	_outputFilterSensitiveLog = void 0;
	_serializer = null;
	_deserializer = null;
	_operationSchema;
	init(cb) {
		this._init = cb;
	}
	ep(endpointParameterInstructions) {
		this._ep = endpointParameterInstructions;
		return this;
	}
	m(middlewareSupplier) {
		this._middlewareFn = middlewareSupplier;
		return this;
	}
	s(service, operation, smithyContext = {}) {
		this._smithyContext = {
			service,
			operation,
			...smithyContext
		};
		return this;
	}
	c(additionalContext = {}) {
		this._additionalContext = additionalContext;
		return this;
	}
	n(clientName, commandName) {
		this._clientName = clientName;
		this._commandName = commandName;
		return this;
	}
	f(inputFilter = (_) => _, outputFilter = (_) => _) {
		this._inputFilterSensitiveLog = inputFilter;
		this._outputFilterSensitiveLog = outputFilter;
		return this;
	}
	ser(serializer) {
		this._serializer = serializer;
		return this;
	}
	de(deserializer) {
		this._deserializer = deserializer;
		return this;
	}
	sc(operation) {
		this._operationSchema = operation;
		this._smithyContext.operationSchema = operation;
		return this;
	}
	build() {
		const closure = this;
		let CommandRef;
		return CommandRef = class extends Command {
			input;
			static getEndpointParameterInstructions() {
				return closure._ep;
			}
			constructor(...[input]) {
				super();
				this.input = input ?? {};
				closure._init(this);
				this.schema = closure._operationSchema;
			}
			resolveMiddleware(stack, configuration, options) {
				const op = closure._operationSchema;
				const input = op?.[4] ?? op?.input;
				const output = op?.[5] ?? op?.output;
				return this.resolveMiddlewareWithContext(stack, configuration, options, {
					CommandCtor: CommandRef,
					middlewareFn: closure._middlewareFn,
					clientName: closure._clientName,
					commandName: closure._commandName,
					inputFilterSensitiveLog: closure._inputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, input) : (_) => _),
					outputFilterSensitiveLog: closure._outputFilterSensitiveLog ?? (op ? schemaLogFilter.bind(null, output) : (_) => _),
					smithyContext: closure._smithyContext,
					additionalContext: closure._additionalContext
				});
			}
			serialize = closure._serializer;
			deserialize = closure._deserializer;
		};
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/exceptions.js
var ServiceException = class ServiceException extends Error {
	$fault;
	$response;
	$retryable;
	$metadata;
	constructor(options) {
		super(options.message);
		Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype);
		this.name = options.name;
		this.$fault = options.$fault;
		this.$metadata = options.$metadata;
	}
	static isInstance(value) {
		if (!value) return false;
		const candidate = value;
		return ServiceException.prototype.isPrototypeOf(candidate) || Boolean(candidate.$fault) && Boolean(candidate.$metadata) && (candidate.$fault === "client" || candidate.$fault === "server");
	}
	static [Symbol.hasInstance](instance) {
		if (!instance) return false;
		const candidate = instance;
		if (this === ServiceException) return ServiceException.isInstance(instance);
		if (ServiceException.isInstance(instance)) {
			if (candidate.name && this.name) return this.prototype.isPrototypeOf(instance) || candidate.name === this.name;
			return this.prototype.isPrototypeOf(instance);
		}
		return false;
	}
};
var decorateServiceException = (exception, additions = {}) => {
	Object.entries(additions).filter(([, v]) => v !== void 0).forEach(([k, v]) => {
		if (exception[k] == void 0 || exception[k] === "") exception[k] = v;
	});
	exception.message = exception.message || exception.Message || "UnknownError";
	delete exception.Message;
	return exception;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/defaults-mode.js
var loadConfigsForDefaultMode = (mode) => {
	switch (mode) {
		case "standard": return {
			retryMode: "standard",
			connectionTimeout: 3100
		};
		case "in-region": return {
			retryMode: "standard",
			connectionTimeout: 1100
		};
		case "cross-region": return {
			retryMode: "standard",
			connectionTimeout: 3100
		};
		case "mobile": return {
			retryMode: "standard",
			connectionTimeout: 3e4
		};
		default: return {};
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/emitWarningIfUnsupportedVersion.js
var warningEmitted = false;
var emitWarningIfUnsupportedVersion = (version) => {
	if (version && !warningEmitted && parseInt(version.substring(1, version.indexOf("."))) < 16) warningEmitted = true;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/checksum.js
var knownAlgorithms = Object.values(AlgorithmId);
var getChecksumConfiguration = (runtimeConfig) => {
	const checksumAlgorithms = [];
	for (const id in AlgorithmId) {
		const algorithmId = AlgorithmId[id];
		if (runtimeConfig[algorithmId] === void 0) continue;
		checksumAlgorithms.push({
			algorithmId: () => algorithmId,
			checksumConstructor: () => runtimeConfig[algorithmId]
		});
	}
	for (const [id, ChecksumCtor] of Object.entries(runtimeConfig.checksumAlgorithms ?? {})) checksumAlgorithms.push({
		algorithmId: () => id,
		checksumConstructor: () => ChecksumCtor
	});
	return {
		addChecksumAlgorithm(algo) {
			runtimeConfig.checksumAlgorithms = runtimeConfig.checksumAlgorithms ?? {};
			const id = algo.algorithmId();
			const ctor = algo.checksumConstructor();
			if (knownAlgorithms.includes(id)) runtimeConfig.checksumAlgorithms[id.toUpperCase()] = ctor;
			else runtimeConfig.checksumAlgorithms[id] = ctor;
			checksumAlgorithms.push(algo);
		},
		checksumAlgorithms() {
			return checksumAlgorithms;
		}
	};
};
var resolveChecksumRuntimeConfig = (clientConfig) => {
	const runtimeConfig = {};
	clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
		const id = checksumAlgorithm.algorithmId();
		if (knownAlgorithms.includes(id)) runtimeConfig[id] = checksumAlgorithm.checksumConstructor();
	});
	return runtimeConfig;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/retry.js
var getRetryConfiguration = (runtimeConfig) => {
	return {
		setRetryStrategy(retryStrategy) {
			runtimeConfig.retryStrategy = retryStrategy;
		},
		retryStrategy() {
			return runtimeConfig.retryStrategy;
		}
	};
};
var resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
	const runtimeConfig = {};
	runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
	return runtimeConfig;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/defaultExtensionConfiguration.js
var getDefaultExtensionConfiguration = (runtimeConfig) => {
	return Object.assign(getChecksumConfiguration(runtimeConfig), getRetryConfiguration(runtimeConfig));
};
var resolveDefaultRuntimeConfig = (config) => {
	return Object.assign(resolveChecksumRuntimeConfig(config), resolveRetryRuntimeConfig(config));
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/NoOpLogger.js
var NoOpLogger = class {
	trace() {}
	debug() {}
	info() {}
	warn() {}
	error() {}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client-command-builder.js
function makeBuilder(common, service, name, ep) {
	return function makeCommand(added, plugins, op, $, smithyContext = {}) {
		const epMerged = Object.assign({}, common, added);
		return Command.classBuilder().ep(epMerged).m(function(CommandCtor, clientStack, config, options) {
			const list = plugins.call(this, CommandCtor, clientStack, config, options);
			list.unshift(ep(config, CommandCtor.getEndpointParameterInstructions()));
			return list;
		}).s(service, op, smithyContext).n(name, op.charAt(0).toUpperCase() + op.slice(1) + "Command").sc($).build();
	};
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/booleanSelector.js
var booleanSelector = (obj, key, type) => {
	if (!(key in obj)) return void 0;
	if (obj[key] === "true") return true;
	if (obj[key] === "false") return false;
	throw new Error(`Cannot load ${type} "${key}". Expected "true" or "false", got ${obj[key]}.`);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/util-config-provider/types.js
var SelectorType;
(function(SelectorType) {
	SelectorType["ENV"] = "env";
	SelectorType["CONFIG"] = "shared config entry";
})(SelectorType || (SelectorType = {}));
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js
var ENV_USE_DUALSTACK_ENDPOINT = "AWS_USE_DUALSTACK_ENDPOINT";
var CONFIG_USE_DUALSTACK_ENDPOINT = "use_dualstack_endpoint";
var NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_DUALSTACK_ENDPOINT, SelectorType.ENV),
	configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_DUALSTACK_ENDPOINT, SelectorType.CONFIG),
	default: false
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseFipsEndpointConfigOptions.js
var ENV_USE_FIPS_ENDPOINT = "AWS_USE_FIPS_ENDPOINT";
var CONFIG_USE_FIPS_ENDPOINT = "use_fips_endpoint";
var NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => booleanSelector(env, ENV_USE_FIPS_ENDPOINT, SelectorType.ENV),
	configFileSelector: (profile) => booleanSelector(profile, CONFIG_USE_FIPS_ENDPOINT, SelectorType.CONFIG),
	default: false
};
var DEFAULTS_MODE_OPTIONS = [
	"in-region",
	"cross-region",
	"mobile",
	"standard",
	"legacy"
];
var IMDS_TOKEN_PATH = "/latest/api/token";
var X_AWS_EC2_METADATA_TOKEN_TTL = "x-aws-ec2-metadata-token-ttl-seconds";
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/getInstanceMetadataRegion.js
var TIMEOUT_MS = 1e3;
var NEG_CACHE_TTL_MS = 6e4;
var negativeCacheUntil = 0;
var getInstanceMetadataRegion = async () => {
	if (process.env["AWS_EC2_METADATA_DISABLED"]) return;
	if (Date.now() < negativeCacheUntil) return;
	try {
		const endpoint = resolveImdsEndpoint();
		const token = (await imdsRequest({
			...endpoint,
			path: IMDS_TOKEN_PATH,
			method: "PUT",
			headers: { [X_AWS_EC2_METADATA_TOKEN_TTL]: "21600" }
		})).toString();
		return (await imdsRequest({
			...endpoint,
			path: "/latest/meta-data/placement/region",
			method: "GET",
			headers: { ["x-aws-ec2-metadata-token"]: token }
		})).toString().trim() || cacheNegativeAndReturnUndefined();
	} catch {
		return cacheNegativeAndReturnUndefined();
	}
};
var cacheNegativeAndReturnUndefined = () => {
	negativeCacheUntil = Date.now() + NEG_CACHE_TTL_MS;
};
var resolveImdsEndpoint = () => {
	const envEndpoint = process.env.AWS_EC2_METADATA_SERVICE_ENDPOINT;
	if (envEndpoint) {
		const url = new URL(envEndpoint);
		return {
			hostname: url.hostname.replace(/^\[(.+)]$/, "$1"),
			port: url.port ? Number(url.port) : void 0
		};
	}
	if (process.env.AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE === "IPv6") return { hostname: "fd00:ec2::254" };
	return { hostname: "169.254.169.254" };
};
var imdsRequest = async (options) => {
	const { request } = await import("node:http");
	return new Promise((resolve, reject) => {
		const req = request({
			hostname: options.hostname,
			port: options.port,
			path: options.path,
			method: options.method,
			headers: options.headers,
			timeout: TIMEOUT_MS,
			signal: AbortSignal.timeout(TIMEOUT_MS)
		});
		req.on("error", (err) => {
			reject(err);
			req.destroy();
		});
		req.on("timeout", () => {
			reject(/* @__PURE__ */ new Error("TimeoutError from instance metadata service"));
			req.destroy();
		});
		req.on("response", (res) => {
			const { statusCode = 400 } = res;
			if (statusCode < 200 || statusCode >= 300) {
				reject(Object.assign(/* @__PURE__ */ new Error("Error response received from instance metadata service"), { statusCode }));
				req.destroy();
				return;
			}
			const chunks = [];
			res.on("data", (chunk) => chunks.push(chunk));
			res.on("end", () => {
				resolve(Buffer.concat(chunks));
				req.destroy();
			});
		});
		req.end();
	});
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/config.js
var REGION_ENV_NAME = "AWS_REGION";
var REGION_INI_NAME = "region";
var NODE_REGION_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => env[REGION_ENV_NAME],
	configFileSelector: (profile) => profile[REGION_INI_NAME],
	default: async () => {
		const region = await getInstanceMetadataRegion();
		if (region) return region;
		throw new Error("Region is missing");
	}
};
var NODE_REGION_CONFIG_FILE_OPTIONS = { preferredFile: "credentials" };
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/checkRegion.js
var validRegions = /* @__PURE__ */ new Set();
var checkRegion = (region, check = isValidHostLabel) => {
	if (!validRegions.has(region) && !check(region)) if (region === "*") console.warn(`@smithy/config-resolver WARN - Please use the caller region instead of "*". See "sigv4a" in https://github.com/aws/aws-sdk-js-v3/blob/main/supplemental-docs/CLIENTS.md.`);
	else throw new Error(`Region not accepted: region="${region}" is not a valid hostname component.`);
	else validRegions.add(region);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/isFipsRegion.js
var isFipsRegion = (region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/getRealRegion.js
var getRealRegion = (region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/resolveRegionConfig.js
var resolveRegionConfig = (input) => {
	const { region, useFipsEndpoint } = input;
	if (!region) throw new Error("Region is missing");
	return Object.assign(input, {
		region: async () => {
			const realRegion = getRealRegion(typeof region === "function" ? await region() : region);
			checkRegion(realRegion);
			return realRegion;
		},
		useFipsEndpoint: async () => {
			if (isFipsRegion(typeof region === "string" ? region : await region())) return true;
			return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
		}
	});
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/defaultsModeConfig.js
var AWS_DEFAULTS_MODE_ENV = "AWS_DEFAULTS_MODE";
var AWS_DEFAULTS_MODE_CONFIG = "defaults_mode";
var NODE_DEFAULTS_MODE_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => {
		return env[AWS_DEFAULTS_MODE_ENV];
	},
	configFileSelector: (profile) => {
		return profile[AWS_DEFAULTS_MODE_CONFIG];
	},
	default: "legacy"
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/resolveDefaultsModeConfig.js
var resolveDefaultsModeConfig = ({ region = loadConfig(NODE_REGION_CONFIG_OPTIONS), defaultsMode = loadConfig(NODE_DEFAULTS_MODE_CONFIG_OPTIONS) } = {}) => memoize(async () => {
	const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
	switch (mode?.toLowerCase()) {
		case "auto": return resolveNodeDefaultsModeAuto(region);
		case "in-region":
		case "cross-region":
		case "mobile":
		case "standard":
		case "legacy": return Promise.resolve(mode?.toLocaleLowerCase());
		case void 0: return Promise.resolve("legacy");
		default: throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
	}
});
var resolveNodeDefaultsModeAuto = async (clientRegion) => {
	if (clientRegion) {
		const resolvedRegion = typeof clientRegion === "function" ? await clientRegion() : clientRegion;
		const inferredRegion = await inferPhysicalRegion();
		if (!inferredRegion) return "standard";
		if (resolvedRegion === inferredRegion) return "in-region";
		else return "cross-region";
	}
	return "standard";
};
var inferPhysicalRegion = async () => {
	if (process.env["AWS_EXECUTION_ENV"] && (process.env["AWS_REGION"] || process.env["AWS_DEFAULT_REGION"])) return process.env["AWS_REGION"] ?? process.env["AWS_DEFAULT_REGION"];
	return getInstanceMetadataRegion();
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointUrlConfig.js
var ENV_ENDPOINT_URL = "AWS_ENDPOINT_URL";
var CONFIG_ENDPOINT_URL = "endpoint_url";
var getEndpointUrlConfig = (serviceId) => ({
	environmentVariableSelector: (env) => {
		const serviceEndpointUrl = env[[ENV_ENDPOINT_URL, ...serviceId.split(" ").map((w) => w.toUpperCase())].join("_")];
		if (serviceEndpointUrl) return serviceEndpointUrl;
		const endpointUrl = env[ENV_ENDPOINT_URL];
		if (endpointUrl) return endpointUrl;
	},
	configFileSelector: (profile, config) => {
		if (config && profile.services) {
			const servicesSection = config[["services", profile.services].join(".")];
			if (servicesSection) {
				const endpointUrl = servicesSection[[serviceId.split(" ").map((w) => w.toLowerCase()).join("_"), CONFIG_ENDPOINT_URL].join(".")];
				if (endpointUrl) return endpointUrl;
			}
		}
		const endpointUrl = profile[CONFIG_ENDPOINT_URL];
		if (endpointUrl) return endpointUrl;
	},
	default: void 0
});
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromConfig.js
var getEndpointFromConfig = async (serviceId) => loadConfig(getEndpointUrlConfig(serviceId ?? ""))();
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/service-customizations/s3.js
var resolveParamsForS3 = async (endpointParams) => {
	const bucket = endpointParams?.Bucket || "";
	if (typeof endpointParams.Bucket === "string") endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
	if (isArnBucketName(bucket)) {
		if (endpointParams.ForcePathStyle === true) throw new Error("Path-style addressing cannot be used with ARN buckets");
	} else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) endpointParams.ForcePathStyle = true;
	if (endpointParams.DisableMultiRegionAccessPoints) {
		endpointParams.disableMultiRegionAccessPoints = true;
		endpointParams.DisableMRAP = true;
	}
	return endpointParams;
};
var DOMAIN_PATTERN = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
var IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
var DOTS_PATTERN = /\.\./;
var isDnsCompatibleBucketName = (bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
var isArnBucketName = (bucketName) => {
	const [arn, partition, service, , , bucket] = bucketName.split(":");
	const isArn = arn === "arn" && bucketName.split(":").length >= 6;
	const isValidArn = Boolean(isArn && partition && service && bucket);
	if (isArn && !isValidArn) throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
	return isValidArn;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/createConfigValueProvider.js
var createConfigValueProvider = (configKey, canonicalEndpointParamKey, config, isClientContextParam = false) => {
	const configProvider = async () => {
		let configValue;
		if (isClientContextParam) configValue = config.clientContextParams?.[configKey] ?? config[configKey] ?? config[canonicalEndpointParamKey];
		else configValue = config[configKey] ?? config[canonicalEndpointParamKey];
		if (typeof configValue === "function") return configValue();
		return configValue;
	};
	if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") return async () => {
		const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
		return credentials?.credentialScope ?? credentials?.CredentialScope;
	};
	if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") return async () => {
		const credentials = typeof config.credentials === "function" ? await config.credentials() : config.credentials;
		return credentials?.accountId ?? credentials?.AccountId;
	};
	if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") return async () => {
		if (config.isCustomEndpoint === false) return;
		const endpoint = await configProvider();
		if (endpoint && typeof endpoint === "object") {
			if ("url" in endpoint) return endpoint.url.href;
			if ("hostname" in endpoint) {
				const { protocol, hostname, port, path } = endpoint;
				return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
			}
		}
		return endpoint;
	};
	return configProvider;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/adaptors/getEndpointFromInstructions.js
function bindGetEndpointFromInstructions(getEndpointFromConfig) {
	return async (commandInput, instructionsSupplier, clientConfig, context) => {
		if (!clientConfig.isCustomEndpoint) {
			let endpointFromConfig;
			if (clientConfig.serviceConfiguredEndpoint) endpointFromConfig = await clientConfig.serviceConfiguredEndpoint();
			else endpointFromConfig = await getEndpointFromConfig(clientConfig.serviceId);
			if (endpointFromConfig) {
				clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
				clientConfig.isCustomEndpoint = true;
			}
		}
		const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
		if (typeof clientConfig.endpointProvider !== "function") throw new Error("config.endpointProvider is not set.");
		const endpoint = clientConfig.endpointProvider(endpointParams, context);
		if (clientConfig.isCustomEndpoint && clientConfig.endpoint) {
			const customEndpoint = await clientConfig.endpoint();
			if (customEndpoint?.headers) {
				endpoint.headers ??= {};
				for (const [name, value] of Object.entries(customEndpoint.headers)) endpoint.headers[name] = Array.isArray(value) ? value : [value];
			}
		}
		return endpoint;
	};
}
var resolveParams = async (commandInput, instructionsSupplier, clientConfig) => {
	const endpointParams = {};
	const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
	for (const [name, instruction] of Object.entries(instructions)) switch (instruction.type) {
		case "staticContextParams":
			endpointParams[name] = instruction.value;
			break;
		case "contextParams":
			endpointParams[name] = commandInput[instruction.name];
			break;
		case "clientContextParams":
		case "builtInParams":
			endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig, instruction.type !== "builtInParams")();
			break;
		case "operationContextParams":
			endpointParams[name] = instruction.get(commandInput);
			break;
		default: throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
	}
	if (Object.keys(instructions).length === 0) Object.assign(endpointParams, clientConfig);
	if (String(clientConfig.serviceId).toLowerCase() === "s3") await resolveParamsForS3(endpointParams);
	return endpointParams;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/endpointMiddleware.js
function setFeature$1(context, feature, value) {
	if (!context.__smithy_context) context.__smithy_context = { features: {} };
	else if (!context.__smithy_context.features) context.__smithy_context.features = {};
	context.__smithy_context.features[feature] = value;
}
function bindEndpointMiddleware(getEndpointFromConfig) {
	const getEndpointFromInstructions = bindGetEndpointFromInstructions(getEndpointFromConfig);
	return ({ config, instructions }) => {
		return (next, context) => async (args) => {
			if (config.isCustomEndpoint) setFeature$1(context, "ENDPOINT_OVERRIDE", "N");
			const endpoint = await getEndpointFromInstructions(args.input, { getEndpointParameterInstructions() {
				return instructions;
			} }, { ...config }, context);
			context.endpointV2 = endpoint;
			context.authSchemes = endpoint.properties?.authSchemes;
			const authScheme = context.authSchemes?.[0];
			if (authScheme) {
				context["signing_region"] = authScheme.signingRegion;
				context["signing_service"] = authScheme.signingName;
				const httpAuthOption = getSmithyContext(context)?.selectedHttpAuthScheme?.httpAuthOption;
				if (httpAuthOption) httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
					signing_region: authScheme.signingRegion,
					signingRegion: authScheme.signingRegion,
					signing_service: authScheme.signingName,
					signingName: authScheme.signingName,
					signingRegionSet: authScheme.signingRegionSet
				}, authScheme.properties);
			}
			return next({ ...args });
		};
	};
}
var endpointMiddlewareOptions = {
	step: "serialize",
	tags: [
		"ENDPOINT_PARAMETERS",
		"ENDPOINT_V2",
		"ENDPOINT"
	],
	name: "endpointV2Middleware",
	override: true,
	relation: "before",
	toMiddleware: {
		name: "serializerMiddleware",
		step: "serialize",
		tags: ["SERIALIZER"],
		override: true
	}.name
};
function bindGetEndpointPlugin(getEndpointFromConfig) {
	const endpointMiddleware = bindEndpointMiddleware(getEndpointFromConfig);
	return (config, instructions) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(endpointMiddleware({
			config,
			instructions
		}), endpointMiddlewareOptions);
	} });
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/middleware-endpoint/resolveEndpointConfig.js
function bindResolveEndpointConfig(getEndpointFromConfig) {
	return (input) => {
		const tls = input.tls ?? true;
		const { endpoint, useDualstackEndpoint, useFipsEndpoint } = input;
		const resolvedConfig = Object.assign(input, {
			endpoint: endpoint != null ? async () => toEndpointV1(await normalizeProvider$1(endpoint)()) : void 0,
			tls,
			isCustomEndpoint: !!endpoint,
			useDualstackEndpoint: normalizeProvider$1(useDualstackEndpoint ?? false),
			useFipsEndpoint: normalizeProvider$1(useFipsEndpoint ?? false)
		});
		let configuredEndpointPromise = void 0;
		resolvedConfig.serviceConfiguredEndpoint = async () => {
			if (input.serviceId && !configuredEndpointPromise) configuredEndpointPromise = getEndpointFromConfig(input.serviceId);
			return configuredEndpointPromise;
		};
		return resolvedConfig;
	};
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/bdd/BinaryDecisionDiagram.js
var BinaryDecisionDiagram = class BinaryDecisionDiagram {
	nodes;
	root;
	conditions;
	results;
	constructor(bdd, root, conditions, results) {
		this.nodes = bdd;
		this.root = root;
		this.conditions = conditions;
		this.results = results;
	}
	static from(bdd, root, conditions, results) {
		return new BinaryDecisionDiagram(bdd, root, conditions, results);
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/cache/EndpointCache.js
var EndpointCache = class {
	capacity;
	data = /* @__PURE__ */ new Map();
	parameters = [];
	constructor({ size, params }) {
		this.capacity = size ?? 50;
		if (params) this.parameters = params;
	}
	get(endpointParams, resolver) {
		const key = this.hash(endpointParams);
		if (key === false) return resolver();
		if (!this.data.has(key)) {
			if (this.data.size > this.capacity + 10) {
				const keys = this.data.keys();
				let i = 0;
				while (true) {
					const { value, done } = keys.next();
					this.data.delete(value);
					if (done || ++i > 10) break;
				}
			}
			this.data.set(key, resolver());
		}
		return this.data.get(key);
	}
	size() {
		return this.data.size;
	}
	hash(endpointParams) {
		let buffer = "";
		const { parameters } = this;
		if (parameters.length === 0) return false;
		for (const param of parameters) {
			const val = String(endpointParams[param] ?? "");
			if (val.includes("|;")) return false;
			buffer += val + "|;";
		}
		return buffer;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/types/EndpointError.js
var EndpointError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "EndpointError";
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/debugId.js
var debugId = "endpoints";
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/debug/toDebugString.js
function toDebugString(input) {
	if (typeof input !== "object" || input == null) return input;
	if ("ref" in input) return `$${toDebugString(input.ref)}`;
	if ("fn" in input) return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
	return JSON.stringify(input, null, 2);
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/customEndpointFunctions.js
var customEndpointFunctions = {};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/booleanEquals.js
var booleanEquals = (value1, value2) => value1 === value2;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/coalesce.js
function coalesce(...args) {
	for (const arg of args) if (arg != null) return arg;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttrPathList.js
var getAttrPathList = (path) => {
	const parts = path.split(".");
	const pathList = [];
	for (const part of parts) {
		const squareBracketIndex = part.indexOf("[");
		if (squareBracketIndex !== -1) {
			if (part.indexOf("]") !== part.length - 1) throw new EndpointError(`Path: '${path}' does not end with ']'`);
			const arrayIndex = part.slice(squareBracketIndex + 1, -1);
			if (Number.isNaN(parseInt(arrayIndex))) throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
			if (squareBracketIndex !== 0) pathList.push(part.slice(0, squareBracketIndex));
			pathList.push(arrayIndex);
		} else pathList.push(part);
	}
	return pathList;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/getAttr.js
var getAttr = (value, path) => getAttrPathList(path).reduce((acc, index) => {
	if (typeof acc !== "object") throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
	else if (Array.isArray(acc)) {
		const i = parseInt(index);
		return acc[i < 0 ? acc.length + i : i];
	}
	return acc[index];
}, value);
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isSet.js
var isSet = (value) => value != null;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/ite.js
function ite(condition, trueValue, falseValue) {
	return condition ? trueValue : falseValue;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/not.js
var not = (value) => !value;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/isIpAddress.js
var IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
var isIpAddress = (value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]");
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/parseURL.js
var DEFAULT_PORTS = {
	[EndpointURLScheme.HTTP]: 80,
	[EndpointURLScheme.HTTPS]: 443
};
var parseURL = (value) => {
	const whatwgURL = (() => {
		try {
			if (value instanceof URL) return value;
			if (typeof value === "object" && "hostname" in value) {
				const { hostname, port, protocol = "", path = "", query = {} } = value;
				const url = new URL(`${protocol}//${hostname}${port ? `:${port}` : ""}${path}`);
				url.search = Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&");
				return url;
			}
			return new URL(value);
		} catch (ignored) {
			return null;
		}
	})();
	if (!whatwgURL) {
		console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
		return null;
	}
	const urlString = whatwgURL.href;
	const { host, hostname, pathname, protocol, search } = whatwgURL;
	if (search) return null;
	const scheme = protocol.slice(0, -1);
	if (!Object.values(EndpointURLScheme).includes(scheme)) return null;
	const isIp = isIpAddress(hostname);
	return {
		scheme,
		authority: `${host}${urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`) ? `:${DEFAULT_PORTS[scheme]}` : ``}`,
		path: pathname,
		normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
		isIp
	};
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/split.js
function split(value, delimiter, limit) {
	if (limit === 1) return [value];
	if (value === "") return [""];
	const parts = value.split(delimiter);
	if (limit === 0) return parts;
	return parts.slice(0, limit - 1).concat(parts.slice(1).join(delimiter));
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/stringEquals.js
var stringEquals = (value1, value2) => value1 === value2;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/substring.js
var substring = (input, start, stop, reverse) => {
	if (input == null || start >= stop || input.length < stop || /[^\u0000-\u007f]/.test(input)) return null;
	if (!reverse) return input.substring(start, stop);
	return input.substring(input.length - stop, input.length - start);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/lib/uriEncode.js
var uriEncode = (value) => encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/endpointFunctions.js
var endpointFunctions = {
	booleanEquals,
	coalesce,
	getAttr,
	isSet,
	isValidHostLabel,
	ite,
	not,
	parseURL,
	split,
	stringEquals,
	substring,
	uriEncode
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateTemplate.js
var evaluateTemplate = (template, options) => {
	const evaluatedTemplateArr = [];
	const { referenceRecord, endpointParams } = options;
	let currentIndex = 0;
	while (currentIndex < template.length) {
		const openingBraceIndex = template.indexOf("{", currentIndex);
		if (openingBraceIndex === -1) {
			evaluatedTemplateArr.push(template.slice(currentIndex));
			break;
		}
		evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
		const closingBraceIndex = template.indexOf("}", openingBraceIndex);
		if (closingBraceIndex === -1) {
			evaluatedTemplateArr.push(template.slice(openingBraceIndex));
			break;
		}
		if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
			evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
			currentIndex = closingBraceIndex + 2;
		}
		const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
		if (parameterName.includes("#")) {
			const [refName, attrName] = parameterName.split("#");
			evaluatedTemplateArr.push(getAttr(referenceRecord[refName] ?? endpointParams[refName], attrName));
		} else evaluatedTemplateArr.push(referenceRecord[parameterName] ?? endpointParams[parameterName]);
		currentIndex = closingBraceIndex + 1;
	}
	return evaluatedTemplateArr.join("");
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getReferenceValue.js
var getReferenceValue = ({ ref }, options) => {
	return options.referenceRecord[ref] ?? options.endpointParams[ref];
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateExpression.js
var evaluateExpression = (obj, keyName, options) => {
	if (typeof obj === "string") return evaluateTemplate(obj, options);
	else if (obj["fn"]) return group$1.callFunction(obj, options);
	else if (obj["ref"]) return getReferenceValue(obj, options);
	throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
};
var callFunction = ({ fn, argv }, options) => {
	const evaluatedArgs = Array(argv.length);
	for (let i = 0; i < evaluatedArgs.length; ++i) {
		const arg = argv[i];
		if (typeof arg === "boolean" || typeof arg === "number") evaluatedArgs[i] = arg;
		else evaluatedArgs[i] = group$1.evaluateExpression(arg, "arg", options);
	}
	const namespaceSeparatorIndex = fn.indexOf(".");
	if (namespaceSeparatorIndex !== -1) {
		const customFunction = customEndpointFunctions[fn.slice(0, namespaceSeparatorIndex)]?.[fn.slice(namespaceSeparatorIndex + 1)];
		if (typeof customFunction === "function") return customFunction(...evaluatedArgs);
	}
	const callable = endpointFunctions[fn];
	if (typeof callable === "function") return callable(...evaluatedArgs);
	throw new Error(`function ${fn} not loaded in endpointFunctions.`);
};
var group$1 = {
	evaluateExpression,
	callFunction
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/evaluateCondition.js
var evaluateCondition = (condition, options) => {
	const { assign } = condition;
	if (assign && assign in options.referenceRecord) throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
	const value = callFunction(condition, options);
	options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(condition)} = ${toDebugString(value)}`);
	const result = value === "" ? true : !!value;
	if (assign != null) return {
		result,
		toAssign: {
			name: assign,
			value
		}
	};
	return { result };
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointHeaders.js
var getEndpointHeaders = (headers, options) => Object.entries(headers ?? {}).reduce((acc, [headerKey, headerVal]) => {
	acc[headerKey] = headerVal.map((headerValEntry) => {
		const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
		if (typeof processedExpr !== "string") throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
		return processedExpr;
	});
	return acc;
}, {});
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointProperties.js
var getEndpointProperties = (properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => {
	acc[propertyKey] = group.getEndpointProperty(propertyVal, options);
	return acc;
}, {});
var getEndpointProperty = (property, options) => {
	if (Array.isArray(property)) return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
	switch (typeof property) {
		case "string": return evaluateTemplate(property, options);
		case "object":
			if (property === null) throw new EndpointError(`Unexpected endpoint property: ${property}`);
			return group.getEndpointProperties(property, options);
		case "boolean": return property;
		default: throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
	}
};
var group = {
	getEndpointProperty,
	getEndpointProperties
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/getEndpointUrl.js
var getEndpointUrl = (endpointUrl, options) => {
	const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
	if (typeof expression === "string") try {
		return new URL(expression);
	} catch (error) {
		console.error(`Failed to construct URL with ${expression}`, error);
		throw error;
	}
	throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/decideEndpoint.js
var RESULT = 1e8;
var decideEndpoint = (bdd, options) => {
	const { nodes, root, results, conditions } = bdd;
	let ref = root;
	const referenceRecord = {};
	const closure = {
		referenceRecord,
		endpointParams: options.endpointParams,
		logger: options.logger
	};
	while (ref !== 1 && ref !== -1 && ref < RESULT) {
		const node_i = 3 * (Math.abs(ref) - 1);
		const [condition_i, highRef, lowRef] = [
			nodes[node_i],
			nodes[node_i + 1],
			nodes[node_i + 2]
		];
		const [fn, argv, assign] = conditions[condition_i];
		const evaluation = evaluateCondition({
			fn,
			assign,
			argv
		}, closure);
		if (evaluation.toAssign) {
			const { name, value } = evaluation.toAssign;
			referenceRecord[name] = value;
		}
		ref = ref >= 0 === evaluation.result ? highRef : lowRef;
	}
	if (ref >= RESULT) {
		const result = results[ref - RESULT];
		if (result[0] === -1) {
			const [, errorExpression] = result;
			throw new EndpointError(evaluateExpression(errorExpression, "Error", closure));
		}
		const [url, properties, headers] = result;
		return {
			url: getEndpointUrl(url, closure),
			properties: getEndpointProperties(properties, closure),
			headers: getEndpointHeaders(headers ?? {}, closure)
		};
	}
	throw new EndpointError(`No matching endpoint.`);
};
var resolveEndpointConfig = bindResolveEndpointConfig(getEndpointFromConfig);
bindEndpointMiddleware(getEndpointFromConfig);
var getEndpointPlugin = bindGetEndpointPlugin(getEndpointFromConfig);
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/collect-stream-body.js
var collectBody = async (streamBody = /* @__PURE__ */ new Uint8Array(), context) => {
	if (streamBody instanceof Uint8Array) return Uint8ArrayBlobAdapter.mutate(streamBody);
	if (!streamBody) return Uint8ArrayBlobAdapter.mutate(/* @__PURE__ */ new Uint8Array());
	const fromContext = context.streamCollector(streamBody);
	return Uint8ArrayBlobAdapter.mutate(await fromContext);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/extended-encode-uri-component.js
function extendedEncodeURIComponent(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
		return "%" + c.charCodeAt(0).toString(16).toUpperCase();
	});
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/SerdeContext.js
var SerdeContext = class {
	serdeContext;
	setSerdeContext(serdeContext) {
		this.serdeContext = serdeContext;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/HttpProtocol.js
var HttpProtocol = class extends SerdeContext {
	options;
	compositeErrorRegistry;
	constructor(options) {
		super();
		this.options = options;
		this.compositeErrorRegistry = TypeRegistry.for(options.defaultNamespace);
		for (const etr of options.errorTypeRegistries ?? []) this.compositeErrorRegistry.copyFrom(etr);
	}
	getRequestType() {
		return HttpRequest;
	}
	getResponseType() {
		return HttpResponse;
	}
	setSerdeContext(serdeContext) {
		this.serdeContext = serdeContext;
		this.serializer.setSerdeContext(serdeContext);
		this.deserializer.setSerdeContext(serdeContext);
		if (this.getPayloadCodec()) this.getPayloadCodec().setSerdeContext(serdeContext);
	}
	updateServiceEndpoint(request, endpoint) {
		if ("url" in endpoint) {
			request.protocol = endpoint.url.protocol;
			request.hostname = endpoint.url.hostname;
			request.port = endpoint.url.port ? Number(endpoint.url.port) : void 0;
			request.path = endpoint.url.pathname;
			request.fragment = endpoint.url.hash || void 0;
			request.username = endpoint.url.username || void 0;
			request.password = endpoint.url.password || void 0;
			if (!request.query) request.query = {};
			for (const [k, v] of endpoint.url.searchParams.entries()) request.query[k] = v;
			if (endpoint.headers) for (const name in endpoint.headers) request.headers[name] = endpoint.headers[name].join(", ");
			return request;
		} else {
			request.protocol = endpoint.protocol;
			request.hostname = endpoint.hostname;
			request.port = endpoint.port ? Number(endpoint.port) : void 0;
			request.path = endpoint.path;
			request.query = { ...endpoint.query };
			if (endpoint.headers) for (const name in endpoint.headers) request.headers[name] = endpoint.headers[name];
			return request;
		}
	}
	setHostPrefix(request, operationSchema, input) {
		if (this.serdeContext?.disableHostPrefix) return;
		const inputNs = NormalizedSchema.of(operationSchema.input);
		const opTraits = translateTraits(operationSchema.traits ?? {});
		if (opTraits.endpoint) {
			let hostPrefix = opTraits.endpoint?.[0];
			if (typeof hostPrefix === "string") {
				for (const [name, member] of inputNs.structIterator()) {
					if (!member.getMergedTraits().hostLabel) continue;
					const replacement = input[name];
					if (typeof replacement !== "string") throw new Error(`@smithy/core/schema - ${name} in input must be a string as hostLabel.`);
					hostPrefix = hostPrefix.replace(`{${name}}`, replacement);
				}
				request.hostname = hostPrefix + request.hostname;
				if (!isValidHostname(request.hostname)) throw new Error(`[${request.hostname}] is not a valid hostname.`);
			}
		}
	}
	deserializeMetadata(output) {
		return {
			httpStatusCode: output.statusCode,
			requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
			extendedRequestId: output.headers["x-amz-id-2"],
			cfId: output.headers["x-amz-cf-id"]
		};
	}
	async serializeEventStream({ eventStream, requestSchema, initialRequest }) {
		return (await this.loadEventStreamCapability()).serializeEventStream({
			eventStream,
			requestSchema,
			initialRequest
		});
	}
	async deserializeEventStream({ response, responseSchema, initialResponseContainer }) {
		return (await this.loadEventStreamCapability()).deserializeEventStream({
			response,
			responseSchema,
			initialResponseContainer
		});
	}
	async loadEventStreamCapability() {
		const { EventStreamSerde, eventStreamSerdeProvider } = await import("../index.js").then((n) => n.n);
		return new EventStreamSerde({
			marshaller: this.resolveEventStreamMarshaller(eventStreamSerdeProvider),
			serializer: this.serializer,
			deserializer: this.deserializer,
			serdeContext: this.serdeContext,
			defaultContentType: this.getDefaultContentType()
		});
	}
	resolveEventStreamMarshaller(importedProvider) {
		const context = this.serdeContext;
		if (context.eventStreamMarshaller) return context.eventStreamMarshaller;
		return importedProvider(this.serdeContext);
	}
	getDefaultContentType() {
		throw new Error(`@smithy/core/protocols - ${this.constructor.name} getDefaultContentType() implementation missing.`);
	}
	async deserializeHttpMessage(schema, context, response, arg4, arg5) {
		return [];
	}
	getEventStreamMarshaller() {
		const context = this.serdeContext;
		if (!context.eventStreamMarshaller) throw new Error("@smithy/core - HttpProtocol: eventStreamMarshaller missing in serdeContext.");
		return context.eventStreamMarshaller;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/serde/determineTimestampFormat.js
function determineTimestampFormat(ns, settings) {
	if (settings.timestampFormat.useTrait) {
		if (ns.isTimestampSchema() && (ns.getSchema() === 5 || ns.getSchema() === 6 || ns.getSchema() === 7)) return ns.getSchema();
	}
	const { httpLabel, httpPrefixHeaders, httpHeader, httpQuery } = ns.getMergedTraits();
	return (settings.httpBindings ? typeof httpPrefixHeaders === "string" || Boolean(httpHeader) ? 6 : Boolean(httpQuery) || Boolean(httpLabel) ? 5 : void 0 : void 0) ?? settings.timestampFormat.default;
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/serde/FromStringShapeDeserializer.js
var FromStringShapeDeserializer = class extends SerdeContext {
	settings;
	constructor(settings) {
		super();
		this.settings = settings;
	}
	read(_schema, data) {
		const ns = NormalizedSchema.of(_schema);
		if (ns.isListSchema()) return splitHeader(data).map((item) => this.read(ns.getValueSchema(), item));
		if (ns.isBlobSchema()) return (this.serdeContext?.base64Decoder ?? fromBase64)(data);
		if (ns.isTimestampSchema()) switch (determineTimestampFormat(ns, this.settings)) {
			case 5: return _parseRfc3339DateTimeWithOffset(data);
			case 6: return _parseRfc7231DateTime(data);
			case 7: return _parseEpochTimestamp(data);
			default:
				console.warn("Missing timestamp format, parsing value with Date constructor:", data);
				return new Date(data);
		}
		if (ns.isStringSchema()) {
			const mediaType = ns.getMergedTraits().mediaType;
			let intermediateValue = data;
			if (mediaType) {
				if (ns.getMergedTraits().httpHeader) intermediateValue = this.base64ToUtf8(intermediateValue);
				if (mediaType === "application/json" || mediaType.endsWith("+json")) intermediateValue = LazyJsonString.from(intermediateValue);
				return intermediateValue;
			}
		}
		if (ns.isNumericSchema()) return Number(data);
		if (ns.isBigIntegerSchema()) return BigInt(data);
		if (ns.isBigDecimalSchema()) return new NumericValue(data, "bigDecimal");
		if (ns.isBooleanSchema()) return String(data).toLowerCase() === "true";
		return data;
	}
	base64ToUtf8(base64String) {
		return (this.serdeContext?.utf8Encoder ?? toUtf8)((this.serdeContext?.base64Decoder ?? fromBase64)(base64String));
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/protocol-http/extensions/httpExtensionConfiguration.js
var getHttpHandlerExtensionConfiguration = (runtimeConfig) => {
	return {
		setHttpHandler(handler) {
			runtimeConfig.httpHandler = handler;
		},
		httpHandler() {
			return runtimeConfig.httpHandler;
		},
		updateHttpClientConfig(key, value) {
			runtimeConfig.httpHandler?.updateHttpClientConfig(key, value);
		},
		httpHandlerConfigs() {
			return runtimeConfig.httpHandler.httpHandlerConfigs();
		}
	};
};
var resolveHttpHandlerRuntimeConfig = (httpHandlerExtensionConfiguration) => {
	return { httpHandler: httpHandlerExtensionConfiguration.httpHandler() };
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/middleware-content-length/contentLengthMiddleware.js
var CONTENT_LENGTH_HEADER = "content-length";
function contentLengthMiddleware(bodyLengthChecker) {
	return (next) => async (args) => {
		const request = args.request;
		if (HttpRequest.isInstance(request)) {
			const { body, headers } = request;
			if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER) === -1) try {
				const length = bodyLengthChecker(body);
				request.headers = {
					...request.headers,
					[CONTENT_LENGTH_HEADER]: String(length)
				};
			} catch (ignored) {}
		}
		return next({
			...args,
			request
		});
	};
}
var contentLengthMiddlewareOptions = {
	step: "build",
	tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
	name: "contentLengthMiddleware",
	override: true
};
var getContentLengthPlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/service-error-classification/constants.js
var THROTTLING_ERROR_CODES = [
	"BandwidthLimitExceeded",
	"EC2ThrottledException",
	"LimitExceededException",
	"PriorRequestNotComplete",
	"ProvisionedThroughputExceededException",
	"RequestLimitExceeded",
	"RequestThrottled",
	"RequestThrottledException",
	"SlowDown",
	"ThrottledException",
	"Throttling",
	"ThrottlingException",
	"TooManyRequestsException",
	"TransactionInProgressException"
];
var TRANSIENT_ERROR_CODES = [
	"TimeoutError",
	"RequestTimeout",
	"RequestTimeoutException"
];
var TRANSIENT_ERROR_STATUS_CODES = [
	500,
	502,
	503,
	504
];
var NODEJS_TIMEOUT_ERROR_CODES = [
	"ECONNRESET",
	"ECONNREFUSED",
	"EPIPE",
	"ETIMEDOUT"
];
var NODEJS_NETWORK_ERROR_CODES = [
	"EHOSTUNREACH",
	"ENETUNREACH",
	"ENOTFOUND",
	"EAI_AGAIN"
];
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/service-error-classification/service-error-classification.js
var isRetryableByTrait = (error) => error?.$retryable !== void 0;
var isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
var isBrowserNetworkError = (error) => {
	const errorMessages = /* @__PURE__ */ new Set([
		"Failed to fetch",
		"NetworkError when attempting to fetch resource",
		"The Internet connection appears to be offline",
		"Load failed",
		"Network request failed"
	]);
	if (!(error && error instanceof TypeError)) return false;
	return errorMessages.has(error.message);
};
var isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
var isTransientError = (error, depth = 0) => isRetryableByTrait(error) || isClockSkewCorrectedError(error) || error.name === "InvalidSignatureException" && error.message?.includes("Signature expired") || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || NODEJS_NETWORK_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0) || isBrowserNetworkError(error) || isNodeJsHttp2TransientError(error) || error.cause !== void 0 && depth <= 10 && isTransientError(error.cause, depth + 1);
var isServerError = (error) => {
	if (error.$metadata?.httpStatusCode !== void 0) {
		const statusCode = error.$metadata.httpStatusCode;
		if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) return true;
		return false;
	}
	return false;
};
function isNodeJsHttp2TransientError(error) {
	return error.code === "ERR_HTTP2_STREAM_ERROR" && error.message.includes("NGHTTP2_REFUSED_STREAM");
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/constants.js
var MAXIMUM_RETRY_DELAY = 20 * 1e3;
var INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
var REQUEST_HEADER = "amz-sdk-request";
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/parseRetryAfterHeader.js
function parseRetryAfterHeader(response, logger) {
	if (!HttpResponse.isInstance(response)) return;
	for (const header of Object.keys(response.headers)) {
		const h = header.toLowerCase();
		if (h === "retry-after") {
			const retryAfter = response.headers[header];
			let retryAfterSeconds = NaN;
			if (retryAfter.endsWith("GMT")) try {
				retryAfterSeconds = (parseRfc7231DateTime(retryAfter).getTime() - Date.now()) / 1e3;
			} catch (e) {
				logger?.trace?.("Failed to parse retry-after header");
				logger?.trace?.(e);
			}
			else if (retryAfter.match(/ GMT, ((\d+)|(\d+\.\d+))$/)) retryAfterSeconds = Number(retryAfter.match(/ GMT, ([\d.]+)$/)?.[1]);
			else if (retryAfter.match(/^((\d+)|(\d+\.\d+))$/)) retryAfterSeconds = Number(retryAfter);
			else if (Date.parse(retryAfter) >= Date.now()) retryAfterSeconds = (Date.parse(retryAfter) - Date.now()) / 1e3;
			if (isNaN(retryAfterSeconds)) return;
			return new Date(Date.now() + retryAfterSeconds * 1e3);
		} else if (h === "x-amz-retry-after") {
			const v = response.headers[header];
			const backoffMilliseconds = Number(v);
			if (isNaN(backoffMilliseconds)) {
				logger?.trace?.(`Failed to parse x-amz-retry-after=${v}`);
				return;
			}
			return new Date(Date.now() + backoffMilliseconds);
		}
	}
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/util.js
var asSdkError = (error) => {
	if (error instanceof Error) return error;
	if (error instanceof Object) return Object.assign(/* @__PURE__ */ new Error(), error);
	if (typeof error === "string") return new Error(error);
	return /* @__PURE__ */ new Error(`AWS SDK error wrapper for ${error}`);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/retryMiddleware.js
function bindRetryMiddleware(isStreamingPayload) {
	return (options) => (next, context) => async (args) => {
		let retryStrategy = await options.retryStrategy();
		const maxAttempts = await options.maxAttempts();
		if (isRetryStrategyV2(retryStrategy)) {
			retryStrategy = retryStrategy;
			let retryToken = await retryStrategy.acquireInitialRetryToken((context["partition_id"] ?? "") + (context.__retryLongPoll ? ":longpoll" : ""));
			let lastError = /* @__PURE__ */ new Error();
			let attempts = 0;
			let totalRetryDelay = 0;
			const { request } = args;
			const isRequest = HttpRequest.isInstance(request);
			if (isRequest) request.headers[INVOCATION_ID_HEADER] = v4();
			while (true) try {
				if (isRequest) request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
				const { response, output } = await next(args);
				retryStrategy.recordSuccess(retryToken);
				output.$metadata.attempts = attempts + 1;
				output.$metadata.totalRetryDelay = totalRetryDelay;
				return {
					response,
					output
				};
			} catch (e) {
				const retryErrorInfo = getRetryErrorInfo(e, options.logger);
				lastError = asSdkError(e);
				if (isRequest && isStreamingPayload(request)) {
					(context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
					throw lastError;
				}
				try {
					retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
				} catch (ignoredRefreshError) {
					if (!lastError.$metadata) lastError.$metadata = {};
					lastError.$metadata.attempts = attempts + 1;
					lastError.$metadata.totalRetryDelay = totalRetryDelay;
					throw lastError;
				}
				attempts = retryToken.getRetryCount();
				const delay = retryToken.getRetryDelay();
				totalRetryDelay += (retryToken?.$retryLog?.acquisitionDelay ?? 0) + delay;
				if (delay > 0) await cooldown(delay);
			}
		} else {
			retryStrategy = retryStrategy;
			if (retryStrategy?.mode) context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
			return retryStrategy.retry(next, args);
		}
	};
}
var cooldown = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var isRetryStrategyV2 = (retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined";
var getRetryErrorInfo = (error, logger) => {
	const errorInfo = {
		error,
		errorType: getRetryErrorType(error)
	};
	const retryAfterHint = parseRetryAfterHeader(error.$response, logger);
	if (retryAfterHint) errorInfo.retryAfterHint = retryAfterHint;
	return errorInfo;
};
var getRetryErrorType = (error) => {
	if (isThrottlingError(error)) return "THROTTLING";
	if (isTransientError(error)) return "TRANSIENT";
	if (isServerError(error)) return "SERVER_ERROR";
	return "CLIENT_ERROR";
};
var retryMiddlewareOptions = {
	name: "retryMiddleware",
	tags: ["RETRY"],
	step: "finalizeRequest",
	priority: "high",
	override: true
};
function bindGetRetryPlugin(isStreamingPayload) {
	const retryMiddleware = bindRetryMiddleware(isStreamingPayload);
	return (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
	} });
}
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRateLimiter.js
var DefaultRateLimiter = class DefaultRateLimiter {
	static setTimeoutFn = (fn, delay) => setTimeout(fn, delay);
	beta;
	minCapacity;
	minFillRate;
	scaleConstant;
	smooth;
	enabled = false;
	availableTokens = 0;
	lastMaxRate = 0;
	measuredTxRate = 0;
	requestCount = 0;
	fillRate;
	lastThrottleTime;
	lastTimestamp = 0;
	lastTxRateBucket;
	maxCapacity;
	timeWindow = 0;
	constructor(options) {
		this.beta = options?.beta ?? .7;
		this.minCapacity = options?.minCapacity ?? 1;
		this.minFillRate = options?.minFillRate ?? .5;
		this.scaleConstant = options?.scaleConstant ?? .4;
		this.smooth = options?.smooth ?? .8;
		this.lastThrottleTime = this.getCurrentTimeInSeconds();
		this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
		this.fillRate = this.minFillRate;
		this.maxCapacity = this.minCapacity;
	}
	async getSendToken() {
		return this.acquireTokenBucket(1);
	}
	updateClientSendingRate(response) {
		let calculatedRate;
		this.updateMeasuredRate();
		const retryErrorInfo = response;
		if (retryErrorInfo?.errorType === "THROTTLING" || isThrottlingError(retryErrorInfo?.error ?? response)) {
			const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
			this.lastMaxRate = rateToUse;
			this.calculateTimeWindow();
			this.lastThrottleTime = this.getCurrentTimeInSeconds();
			calculatedRate = this.cubicThrottle(rateToUse);
			this.enableTokenBucket();
		} else {
			this.calculateTimeWindow();
			calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
		}
		const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
		this.updateTokenBucketRate(newRate);
	}
	getCurrentTimeInSeconds() {
		return Date.now() / 1e3;
	}
	async acquireTokenBucket(amount) {
		if (!this.enabled) return;
		this.refillTokenBucket();
		while (amount > this.availableTokens) {
			const delay = (amount - this.availableTokens) / this.fillRate * 1e3;
			await new Promise((resolve) => DefaultRateLimiter.setTimeoutFn(resolve, delay));
			this.refillTokenBucket();
		}
		this.availableTokens = this.availableTokens - amount;
	}
	refillTokenBucket() {
		const timestamp = this.getCurrentTimeInSeconds();
		if (!this.lastTimestamp) {
			this.lastTimestamp = timestamp;
			return;
		}
		const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
		this.availableTokens = Math.min(this.maxCapacity, this.availableTokens + fillAmount);
		this.lastTimestamp = timestamp;
	}
	calculateTimeWindow() {
		this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
	}
	cubicThrottle(rateToUse) {
		return this.getPrecise(rateToUse * this.beta);
	}
	cubicSuccess(timestamp) {
		return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
	}
	enableTokenBucket() {
		this.enabled = true;
	}
	updateTokenBucketRate(newRate) {
		this.refillTokenBucket();
		this.fillRate = Math.max(newRate, this.minFillRate);
		this.maxCapacity = Math.max(newRate, this.minCapacity);
		this.availableTokens = Math.min(this.availableTokens, this.maxCapacity);
	}
	updateMeasuredRate() {
		const t = this.getCurrentTimeInSeconds();
		const timeBucket = Math.floor(t * 2) / 2;
		this.requestCount++;
		if (timeBucket > this.lastTxRateBucket) {
			const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
			this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
			this.requestCount = 0;
			this.lastTxRateBucket = timeBucket;
		}
	}
	getPrecise(num) {
		return parseFloat(num.toFixed(8));
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/retries-2026-config.js
var Retry = class Retry {
	static v2026 = typeof process !== "undefined" && process.env?.SMITHY_NEW_RETRIES_2026 === "true";
	static delay() {
		return Retry.v2026 ? 50 : 100;
	}
	static throttlingDelay() {
		return Retry.v2026 ? 1e3 : 500;
	}
	static cost() {
		return Retry.v2026 ? 14 : 5;
	}
	static throttlingCost() {
		return Retry.v2026 ? 5 : 10;
	}
	static modifiedCostType() {
		return Retry.v2026 ? "THROTTLING" : "TRANSIENT";
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRetryBackoffStrategy.js
var DefaultRetryBackoffStrategy = class {
	x = Retry.delay();
	computeNextBackoffDelay(i) {
		const t_i = Math.random() * Math.min(this.x * 2 ** i, MAXIMUM_RETRY_DELAY);
		return Math.floor(t_i);
	}
	setDelayBase(delay) {
		this.x = delay;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/DefaultRetryToken.js
var DefaultRetryToken = class {
	delay;
	count;
	cost;
	longPoll;
	$retryLog = { acquisitionDelay: 0 };
	constructor(delay, count, cost, longPoll) {
		this.delay = delay;
		this.count = count;
		this.cost = cost;
		this.longPoll = longPoll;
	}
	getRetryCount() {
		return this.count;
	}
	getRetryDelay() {
		return Math.min(MAXIMUM_RETRY_DELAY, this.delay);
	}
	getRetryCost() {
		return this.cost;
	}
	isLongPoll() {
		return this.longPoll;
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/config.js
var RETRY_MODES;
(function(RETRY_MODES) {
	RETRY_MODES["STANDARD"] = "standard";
	RETRY_MODES["ADAPTIVE"] = "adaptive";
})(RETRY_MODES || (RETRY_MODES = {}));
var DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/StandardRetryStrategy.js
var refusal = {
	incompatible: 1,
	attempts: 2,
	capacity: 3
};
var StandardRetryStrategy = class {
	mode = RETRY_MODES.STANDARD;
	retryBackoffStrategy;
	capacity = 500;
	maxAttemptsProvider;
	baseDelay;
	constructor(arg1) {
		if (typeof arg1 === "number") this.maxAttemptsProvider = async () => arg1;
		else if (typeof arg1 === "function") this.maxAttemptsProvider = arg1;
		else if (arg1 && typeof arg1 === "object") {
			this.maxAttemptsProvider = async () => arg1.maxAttempts;
			this.baseDelay = arg1.baseDelay;
			this.retryBackoffStrategy = arg1.backoff;
		}
		this.maxAttemptsProvider ??= async () => 3;
		this.baseDelay ??= Retry.delay();
		this.retryBackoffStrategy ??= new DefaultRetryBackoffStrategy();
	}
	async acquireInitialRetryToken(retryTokenScope) {
		return new DefaultRetryToken(Retry.delay(), 0, void 0, Retry.v2026 && retryTokenScope.includes(":longpoll"));
	}
	async refreshRetryTokenForRetry(token, errorInfo) {
		const maxAttempts = await this.getMaxAttempts();
		const retryCode = this.retryCode(token, errorInfo, maxAttempts);
		const shouldRetry = retryCode === 0;
		const isLongPoll = token.isLongPoll?.();
		if (shouldRetry || isLongPoll) {
			const errorType = errorInfo.errorType;
			this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? Retry.throttlingDelay() : this.baseDelay);
			const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
			let retryDelay = delayFromErrorType;
			if (errorInfo.retryAfterHint instanceof Date) retryDelay = Math.max(delayFromErrorType, Math.min(errorInfo.retryAfterHint.getTime() - Date.now(), delayFromErrorType + 5e3));
			if (!shouldRetry) {
				const longPollBackoff = Retry.v2026 && retryCode === refusal.capacity && isLongPoll ? retryDelay : 0;
				if (longPollBackoff > 0) await new Promise((r) => setTimeout(r, longPollBackoff));
			} else {
				const capacityCost = this.getCapacityCost(errorType);
				this.capacity -= capacityCost;
				const nextToken = new DefaultRetryToken(0, token.getRetryCount() + 1, capacityCost, token.isLongPoll?.() ?? false);
				await new Promise((r) => setTimeout(r, retryDelay));
				nextToken.$retryLog.acquisitionDelay = retryDelay;
				return nextToken;
			}
		}
		throw new Error("No retry token available");
	}
	recordSuccess(token) {
		this.capacity = Math.min(500, this.capacity + (token.getRetryCost() ?? 1));
	}
	getCapacity() {
		return this.capacity;
	}
	async maxAttempts() {
		return this.maxAttemptsProvider();
	}
	async getMaxAttempts() {
		try {
			return await this.maxAttemptsProvider();
		} catch (ignored) {
			console.warn(`Max attempts provider could not resolve. Using default of 3`);
			return 3;
		}
	}
	retryCode(tokenToRenew, errorInfo, maxAttempts) {
		const attempts = tokenToRenew.getRetryCount() + 1;
		const retryableStatus = this.isRetryableError(errorInfo.errorType) ? 0 : refusal.incompatible;
		const attemptStatus = attempts < maxAttempts ? 0 : refusal.attempts;
		const capacityStatus = this.capacity >= this.getCapacityCost(errorInfo.errorType) ? 0 : refusal.capacity;
		return retryableStatus || attemptStatus || capacityStatus;
	}
	getCapacityCost(errorType) {
		return errorType === Retry.modifiedCostType() ? Retry.throttlingCost() : Retry.cost();
	}
	isRetryableError(errorType) {
		return errorType === "THROTTLING" || errorType === "TRANSIENT";
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/AdaptiveRetryStrategy.js
var AdaptiveRetryStrategy = class {
	mode = RETRY_MODES.ADAPTIVE;
	rateLimiter;
	standardRetryStrategy;
	constructor(maxAttemptsProvider, options) {
		const { rateLimiter } = options ?? {};
		this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
		this.standardRetryStrategy = options ? new StandardRetryStrategy({
			maxAttempts: typeof maxAttemptsProvider === "number" ? maxAttemptsProvider : 3,
			...options
		}) : new StandardRetryStrategy(maxAttemptsProvider);
	}
	async acquireInitialRetryToken(retryTokenScope) {
		const token = await this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
		await this.rateLimiter.getSendToken();
		return token;
	}
	async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
		this.rateLimiter.updateClientSendingRate(errorInfo);
		const token = await this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
		await this.rateLimiter.getSendToken();
		return token;
	}
	recordSuccess(token) {
		this.rateLimiter.updateClientSendingRate({});
		this.standardRetryStrategy.recordSuccess(token);
	}
	async maxAttemptsProvider() {
		return this.standardRetryStrategy.maxAttempts();
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/configurations.js
var ENV_MAX_ATTEMPTS = "AWS_MAX_ATTEMPTS";
var CONFIG_MAX_ATTEMPTS = "max_attempts";
var NODE_MAX_ATTEMPT_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => {
		const value = env[ENV_MAX_ATTEMPTS];
		if (!value) return void 0;
		const maxAttempt = parseInt(value);
		if (Number.isNaN(maxAttempt)) throw new Error(`Environment variable ${ENV_MAX_ATTEMPTS} mast be a number, got "${value}"`);
		return maxAttempt;
	},
	configFileSelector: (profile) => {
		const value = profile[CONFIG_MAX_ATTEMPTS];
		if (!value) return void 0;
		const maxAttempt = parseInt(value);
		if (Number.isNaN(maxAttempt)) throw new Error(`Shared config file entry ${CONFIG_MAX_ATTEMPTS} mast be a number, got "${value}"`);
		return maxAttempt;
	},
	default: 3
};
var resolveRetryConfig = (input, defaults) => {
	const { retryStrategy, retryMode } = input;
	const { defaultMaxAttempts = 3, defaultBaseDelay = Retry.delay() } = defaults ?? {};
	const maxAttemptsProvider = normalizeProvider$1(input.maxAttempts ?? defaultMaxAttempts);
	let controller = retryStrategy ? Promise.resolve(retryStrategy) : void 0;
	const getDefault = async () => {
		const maxAttempts = await maxAttemptsProvider();
		if (await normalizeProvider$1(retryMode)() === RETRY_MODES.ADAPTIVE) return new AdaptiveRetryStrategy(maxAttemptsProvider, {
			maxAttempts,
			baseDelay: defaultBaseDelay
		});
		return new StandardRetryStrategy({
			maxAttempts,
			baseDelay: defaultBaseDelay
		});
	};
	return Object.assign(input, {
		maxAttempts: maxAttemptsProvider,
		retryStrategy: () => controller ??= getDefault()
	});
};
var ENV_RETRY_MODE = "AWS_RETRY_MODE";
var CONFIG_RETRY_MODE = "retry_mode";
var NODE_RETRY_MODE_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => env[ENV_RETRY_MODE],
	configFileSelector: (profile) => profile[CONFIG_RETRY_MODE],
	default: DEFAULT_RETRY_MODE
};
var getRetryPlugin = bindGetRetryPlugin(isStreamingPayload);
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/setFeature.js
Retry.v2026 ||= typeof process === "object" && process.env?.AWS_NEW_RETRIES_2026 === "true";
function setFeature(context, feature, value) {
	if (!context.__aws_sdk_context) context.__aws_sdk_context = { features: {} };
	else if (!context.__aws_sdk_context.features) context.__aws_sdk_context.features = {};
	context.__aws_sdk_context.features[feature] = value;
}
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-host-header/hostHeaderMiddleware.js
function resolveHostHeaderConfig(input) {
	return input;
}
var hostHeaderMiddleware = (options) => (next) => async (args) => {
	if (!HttpRequest.isInstance(args.request)) return next(args);
	const { request } = args;
	const { handlerProtocol = "" } = options.requestHandler.metadata || {};
	if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
		delete request.headers["host"];
		request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
	} else if (!request.headers["host"]) {
		let host = request.hostname;
		if (request.port != null) host += `:${request.port}`;
		request.headers["host"] = host;
	}
	return next(args);
};
var hostHeaderMiddlewareOptions = {
	name: "hostHeaderMiddleware",
	step: "build",
	priority: "low",
	tags: ["HOST"],
	override: true
};
var getHostHeaderPlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-logger/loggerMiddleware.js
var loggerMiddleware = () => (next, context) => async (args) => {
	try {
		const response = await next(args);
		const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
		const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
		const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
		const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
		const { $metadata, ...outputWithoutMetadata } = response.output;
		logger?.info?.({
			clientName,
			commandName,
			input: inputFilterSensitiveLog(args.input),
			output: outputFilterSensitiveLog(outputWithoutMetadata),
			metadata: $metadata
		});
		return response;
	} catch (error) {
		const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
		const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
		const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
		logger?.error?.({
			clientName,
			commandName,
			input: inputFilterSensitiveLog(args.input),
			error,
			metadata: error.$metadata
		});
		throw error;
	}
};
var loggerMiddlewareOptions = {
	name: "loggerMiddleware",
	tags: ["LOGGER"],
	step: "initialize",
	override: true
};
var getLoggerPlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/configuration.js
var recursionDetectionMiddlewareOptions = {
	step: "build",
	tags: ["RECURSION_DETECTION", "TRACE_CONTEXT_PROPAGATION"],
	name: "recursionDetectionMiddleware",
	override: true,
	priority: "low"
};
//#endregion
//#region node_modules/.pnpm/@aws+lambda-invoke-store@0.3.0/node_modules/@aws/lambda-invoke-store/dist-es/invoke-store.js
var PROTECTED_KEYS = {
	REQUEST_ID: Symbol.for("_AWS_LAMBDA_REQUEST_ID"),
	X_RAY_TRACE_ID: Symbol.for("_AWS_LAMBDA_X_RAY_TRACE_ID"),
	TENANT_ID: Symbol.for("_AWS_LAMBDA_TENANT_ID"),
	TRACEPARENT: Symbol.for("_AWS_LAMBDA_TRACEPARENT"),
	TRACESTATE: Symbol.for("_AWS_LAMBDA_TRACESTATE"),
	BAGGAGE: Symbol.for("_AWS_LAMBDA_BAGGAGE")
};
var NO_GLOBAL_AWS_LAMBDA = ["true", "1"].includes(process.env?.AWS_LAMBDA_NODEJS_NO_GLOBAL_AWSLAMBDA ?? "");
if (!NO_GLOBAL_AWS_LAMBDA) globalThis.awslambda = globalThis.awslambda || {};
var InvokeStoreBase = class {
	static PROTECTED_KEYS = PROTECTED_KEYS;
	isProtectedKey(key) {
		return Object.values(PROTECTED_KEYS).includes(key);
	}
	getRequestId() {
		return this.get(PROTECTED_KEYS.REQUEST_ID) ?? "-";
	}
	getXRayTraceId() {
		return this.get(PROTECTED_KEYS.X_RAY_TRACE_ID);
	}
	getTenantId() {
		return this.get(PROTECTED_KEYS.TENANT_ID);
	}
	getTraceparent() {
		return this.get(PROTECTED_KEYS.TRACEPARENT);
	}
	getTracestate() {
		return this.get(PROTECTED_KEYS.TRACESTATE);
	}
	getBaggage() {
		return this.get(PROTECTED_KEYS.BAGGAGE);
	}
};
var InvokeStoreSingle = class extends InvokeStoreBase {
	currentContext;
	getContext() {
		return this.currentContext;
	}
	hasContext() {
		return this.currentContext !== void 0;
	}
	get(key) {
		return this.currentContext?.[key];
	}
	set(key, value) {
		if (this.isProtectedKey(key)) throw new Error(`Cannot modify protected Lambda context field: ${String(key)}`);
		this.currentContext = this.currentContext || {};
		this.currentContext[key] = value;
	}
	run(context, fn) {
		this.currentContext = context;
		return fn();
	}
};
var InvokeStoreMulti = class InvokeStoreMulti extends InvokeStoreBase {
	als;
	static async create() {
		const instance = new InvokeStoreMulti();
		instance.als = new (await (import("node:async_hooks"))).AsyncLocalStorage();
		return instance;
	}
	getContext() {
		return this.als.getStore();
	}
	hasContext() {
		return this.als.getStore() !== void 0;
	}
	get(key) {
		return this.als.getStore()?.[key];
	}
	set(key, value) {
		if (this.isProtectedKey(key)) throw new Error(`Cannot modify protected Lambda context field: ${String(key)}`);
		const store = this.als.getStore();
		if (!store) throw new Error("No context available");
		store[key] = value;
	}
	run(context, fn) {
		return this.als.run(context, fn);
	}
};
var InvokeStore;
(function(InvokeStore) {
	let instance = null;
	async function getInstanceAsync(forceInvokeStoreMulti) {
		if (!instance) instance = (async () => {
			const newInstance = forceInvokeStoreMulti === true || "AWS_LAMBDA_MAX_CONCURRENCY" in process.env ? await InvokeStoreMulti.create() : new InvokeStoreSingle();
			if (!NO_GLOBAL_AWS_LAMBDA && globalThis.awslambda?.InvokeStore) return globalThis.awslambda.InvokeStore;
			else if (!NO_GLOBAL_AWS_LAMBDA && globalThis.awslambda) {
				globalThis.awslambda.InvokeStore = newInstance;
				return newInstance;
			} else return newInstance;
		})();
		return instance;
	}
	InvokeStore.getInstanceAsync = getInstanceAsync;
	InvokeStore._testing = process.env.AWS_LAMBDA_BENCHMARK_MODE === "1" ? { reset: () => {
		instance = null;
		if (globalThis.awslambda?.InvokeStore) delete globalThis.awslambda.InvokeStore;
		globalThis.awslambda = { InvokeStore: void 0 };
	} } : void 0;
})(InvokeStore || (InvokeStore = {}));
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/recursionDetectionMiddleware.js
var AWS_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
var _X_AMZN_TRACE_ID = "_X_AMZN_TRACE_ID";
var X_AMZN_TRACE_ID = "X-Amzn-Trace-Id";
var TRACEPARENT = "traceparent";
var TRACESTATE = "tracestate";
var BAGGAGE = "baggage";
var recursionDetectionMiddleware = () => (next) => async (args) => {
	const { request } = args;
	if (!HttpRequest.isInstance(request)) return next(args);
	let invokeStore;
	{
		const traceIdHeader = Object.keys(request.headers ?? {}).find((h) => h.toLowerCase() === X_AMZN_TRACE_ID.toLowerCase()) ?? X_AMZN_TRACE_ID;
		if (!request.headers.hasOwnProperty(traceIdHeader)) {
			const functionName = process.env[AWS_LAMBDA_FUNCTION_NAME];
			const traceIdFromEnv = process.env[_X_AMZN_TRACE_ID];
			invokeStore ??= await InvokeStore.getInstanceAsync();
			const traceId = invokeStore?.getXRayTraceId() ?? traceIdFromEnv;
			const nonEmptyString = (str) => typeof str === "string" && str.length > 0;
			if (nonEmptyString(functionName) && nonEmptyString(traceId)) request.headers[X_AMZN_TRACE_ID] = traceId;
		}
	}
	sanitizeTraceHeaders(request.headers);
	if (!request.headers[TRACEPARENT]) {
		const traceparent = (invokeStore ??= await InvokeStore.getInstanceAsync())?.getTraceparent?.();
		if (traceparent) {
			request.headers[TRACEPARENT] = traceparent;
			const tracestate = invokeStore?.getTracestate?.();
			if (tracestate) request.headers[TRACESTATE] = tracestate;
			const baggage = invokeStore?.getBaggage?.();
			if (baggage) request.headers[BAGGAGE] = baggage;
		}
	}
	return next(args);
};
function sanitizeTraceHeaders(headers) {
	for (const header of Object.keys(headers)) {
		const lower = header.toLowerCase();
		if (header !== lower && (lower === TRACEPARENT || lower === TRACESTATE || lower === BAGGAGE)) {
			headers[lower] = headers[header];
			delete headers[header];
		}
	}
}
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/getRecursionDetectionPlugin.js
var getRecursionDetectionPlugin = (options) => ({ applyToStack: (clientStack) => {
	clientStack.add(recursionDetectionMiddleware(), recursionDetectionMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/resolveAuthOptions.js
var resolveAuthOptions = (candidateAuthOptions, authSchemePreference) => {
	if (!authSchemePreference || authSchemePreference.length === 0) return candidateAuthOptions;
	const preferredAuthOptions = [];
	for (const preferredSchemeName of authSchemePreference) for (const candidateAuthOption of candidateAuthOptions) if (candidateAuthOption.schemeId.split("#")[1] === preferredSchemeName) preferredAuthOptions.push(candidateAuthOption);
	for (const candidateAuthOption of candidateAuthOptions) if (!preferredAuthOptions.find(({ schemeId }) => schemeId === candidateAuthOption.schemeId)) preferredAuthOptions.push(candidateAuthOption);
	return preferredAuthOptions;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js
function convertHttpAuthSchemesToMap(httpAuthSchemes) {
	const map = /* @__PURE__ */ new Map();
	for (const scheme of httpAuthSchemes) map.set(scheme.schemeId, scheme);
	return map;
}
var httpAuthSchemeMiddleware = (config, mwOptions) => (next, context) => async (args) => {
	const resolvedOptions = resolveAuthOptions(config.httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config, context, args.input)), config.authSchemePreference ? await config.authSchemePreference() : []);
	const authSchemes = convertHttpAuthSchemesToMap(config.httpAuthSchemes);
	const smithyContext = getSmithyContext(context);
	const failureReasons = [];
	for (const option of resolvedOptions) {
		const scheme = authSchemes.get(option.schemeId);
		if (!scheme) {
			failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
			continue;
		}
		const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config));
		if (!identityProvider) {
			failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
			continue;
		}
		const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config, context) || {};
		option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
		option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
		smithyContext.selectedHttpAuthScheme = {
			httpAuthOption: option,
			identity: await identityProvider(option.identityProperties),
			signer: scheme.signer
		};
		break;
	}
	if (!smithyContext.selectedHttpAuthScheme) throw new Error(failureReasons.join("\n"));
	return next(args);
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js
var httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
	step: "serialize",
	tags: ["HTTP_AUTH_SCHEME"],
	name: "httpAuthSchemeMiddleware",
	override: true,
	relation: "before",
	toMiddleware: "endpointV2Middleware"
};
var getHttpAuthSchemeEndpointRuleSetPlugin = (config, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({ applyToStack: (clientStack) => {
	clientStack.addRelativeTo(httpAuthSchemeMiddleware(config, {
		httpAuthSchemeParametersProvider,
		identityProviderConfigProvider
	}), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/httpSigningMiddleware.js
var defaultErrorHandler = (signingProperties) => (error) => {
	throw error;
};
var defaultSuccessHandler = (httpResponse, signingProperties) => {};
var httpSigningMiddleware = (config) => (next, context) => async (args) => {
	if (!HttpRequest.isInstance(args.request)) return next(args);
	const scheme = getSmithyContext(context).selectedHttpAuthScheme;
	if (!scheme) throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
	const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
	const output = await next({
		...args,
		request: await signer.sign(args.request, identity, signingProperties)
	}).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
	(signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
	return output;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/getHttpSigningMiddleware.js
var httpSigningMiddlewareOptions = {
	step: "finalizeRequest",
	tags: ["HTTP_SIGNING"],
	name: "httpSigningMiddleware",
	aliases: [
		"apiKeyMiddleware",
		"tokenMiddleware",
		"awsAuthMiddleware"
	],
	override: true,
	relation: "after",
	toMiddleware: "retryMiddleware"
};
var getHttpSigningPlugin = (config) => ({ applyToStack: (clientStack) => {
	clientStack.addRelativeTo(httpSigningMiddleware(config), httpSigningMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/normalizeProvider.js
var normalizeProvider = (input) => {
	if (typeof input === "function") return input;
	const promisified = Promise.resolve(input);
	return () => promisified;
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/DefaultIdentityProviderConfig.js
var DefaultIdentityProviderConfig = class {
	authSchemes = /* @__PURE__ */ new Map();
	constructor(config) {
		for (const key in config) {
			const value = config[key];
			if (value !== void 0) this.authSchemes.set(key, value);
		}
	}
	getIdentityProvider(schemeId) {
		return this.authSchemes.get(schemeId);
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/memoizeIdentityProvider.js
var createIsIdentityExpiredFunction = (expirationMs) => function isIdentityExpired(identity) {
	return doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
};
var isIdentityExpired = createIsIdentityExpiredFunction(3e5);
var doesIdentityRequireRefresh = (identity) => identity.expiration !== void 0;
var memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
	if (provider === void 0) return;
	const normalizedProvider = typeof provider !== "function" ? async () => Promise.resolve(provider) : provider;
	let resolved;
	let pending;
	let hasResult;
	let isConstant = false;
	const coalesceProvider = async (options) => {
		if (!pending) pending = normalizedProvider(options);
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
		if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider(options);
		return resolved;
	};
	return async (options) => {
		if (!hasResult || options?.forceRefresh) resolved = await coalesceProvider(options);
		if (isConstant) return resolved;
		if (!requiresRefresh(resolved)) {
			isConstant = true;
			return resolved;
		}
		if (isExpired(resolved)) {
			await coalesceProvider(options);
			return resolved;
		}
		return resolved;
	};
};
function isValidUserAgentAppId(appId) {
	if (appId === void 0) return true;
	return typeof appId === "string" && appId.length <= 50;
}
function resolveUserAgentConfig(input) {
	const normalizedAppIdProvider = normalizeProvider(input.userAgentAppId ?? void 0);
	const { customUserAgent } = input;
	return Object.assign(input, {
		customUserAgent: typeof customUserAgent === "string" ? [[customUserAgent]] : customUserAgent,
		userAgentAppId: async () => {
			const appId = await normalizedAppIdProvider();
			if (!isValidUserAgentAppId(appId)) {
				const logger = input.logger?.constructor?.name === "NoOpLogger" || !input.logger ? console : input.logger;
				if (typeof appId !== "string") logger?.warn("userAgentAppId must be a string or undefined.");
				else if (appId.length > 50) logger?.warn("The provided userAgentAppId exceeds the maximum length of 50 characters.");
			}
			return appId;
		}
	});
}
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/partition.js
var selectedPartitionsInfo = {
	"partitions": [
		{
			"id": "aws",
			"outputs": {
				"dnsSuffix": "amazonaws.com",
				"dualStackDnsSuffix": "api.aws",
				"implicitGlobalRegion": "us-east-1",
				"name": "aws",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^(us|eu|ap|sa|ca|me|af|il|mx)\\-\\w+\\-\\d+$",
			"regions": {
				"af-south-1": { "description": "Africa (Cape Town)" },
				"ap-east-1": { "description": "Asia Pacific (Hong Kong)" },
				"ap-east-2": { "description": "Asia Pacific (Taipei)" },
				"ap-northeast-1": { "description": "Asia Pacific (Tokyo)" },
				"ap-northeast-2": { "description": "Asia Pacific (Seoul)" },
				"ap-northeast-3": { "description": "Asia Pacific (Osaka)" },
				"ap-south-1": { "description": "Asia Pacific (Mumbai)" },
				"ap-south-2": { "description": "Asia Pacific (Hyderabad)" },
				"ap-southeast-1": { "description": "Asia Pacific (Singapore)" },
				"ap-southeast-2": { "description": "Asia Pacific (Sydney)" },
				"ap-southeast-3": { "description": "Asia Pacific (Jakarta)" },
				"ap-southeast-4": { "description": "Asia Pacific (Melbourne)" },
				"ap-southeast-5": { "description": "Asia Pacific (Malaysia)" },
				"ap-southeast-6": { "description": "Asia Pacific (New Zealand)" },
				"ap-southeast-7": { "description": "Asia Pacific (Thailand)" },
				"aws-global": { "description": "aws global region" },
				"ca-central-1": { "description": "Canada (Central)" },
				"ca-west-1": { "description": "Canada West (Calgary)" },
				"eu-central-1": { "description": "Europe (Frankfurt)" },
				"eu-central-2": { "description": "Europe (Zurich)" },
				"eu-north-1": { "description": "Europe (Stockholm)" },
				"eu-south-1": { "description": "Europe (Milan)" },
				"eu-south-2": { "description": "Europe (Spain)" },
				"eu-west-1": { "description": "Europe (Ireland)" },
				"eu-west-2": { "description": "Europe (London)" },
				"eu-west-3": { "description": "Europe (Paris)" },
				"il-central-1": { "description": "Israel (Tel Aviv)" },
				"me-central-1": { "description": "Middle East (UAE)" },
				"me-south-1": { "description": "Middle East (Bahrain)" },
				"mx-central-1": { "description": "Mexico (Central)" },
				"sa-east-1": { "description": "South America (Sao Paulo)" },
				"us-east-1": { "description": "US East (N. Virginia)" },
				"us-east-2": { "description": "US East (Ohio)" },
				"us-west-1": { "description": "US West (N. California)" },
				"us-west-2": { "description": "US West (Oregon)" }
			}
		},
		{
			"id": "aws-cn",
			"outputs": {
				"dnsSuffix": "amazonaws.com.cn",
				"dualStackDnsSuffix": "api.amazonwebservices.com.cn",
				"implicitGlobalRegion": "cn-northwest-1",
				"name": "aws-cn",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^cn\\-\\w+\\-\\d+$",
			"regions": {
				"aws-cn-global": { "description": "aws-cn global region" },
				"cn-north-1": { "description": "China (Beijing)" },
				"cn-northwest-1": { "description": "China (Ningxia)" }
			}
		},
		{
			"id": "aws-eusc",
			"outputs": {
				"dnsSuffix": "amazonaws.eu",
				"dualStackDnsSuffix": "api.amazonwebservices.eu",
				"implicitGlobalRegion": "eusc-de-east-1",
				"name": "aws-eusc",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^eusc\\-(de)\\-\\w+\\-\\d+$",
			"regions": { "eusc-de-east-1": { "description": "AWS European Sovereign Cloud (Germany)" } }
		},
		{
			"id": "aws-iso",
			"outputs": {
				"dnsSuffix": "c2s.ic.gov",
				"dualStackDnsSuffix": "api.aws.ic.gov",
				"implicitGlobalRegion": "us-iso-east-1",
				"name": "aws-iso",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^us\\-iso\\-\\w+\\-\\d+$",
			"regions": {
				"aws-iso-global": { "description": "aws-iso global region" },
				"us-iso-east-1": { "description": "US ISO East" },
				"us-iso-west-1": { "description": "US ISO WEST" }
			}
		},
		{
			"id": "aws-iso-b",
			"outputs": {
				"dnsSuffix": "sc2s.sgov.gov",
				"dualStackDnsSuffix": "api.aws.scloud",
				"implicitGlobalRegion": "us-isob-east-1",
				"name": "aws-iso-b",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^us\\-isob\\-\\w+\\-\\d+$",
			"regions": {
				"aws-iso-b-global": { "description": "aws-iso-b global region" },
				"us-isob-east-1": { "description": "US ISOB East (Ohio)" },
				"us-isob-west-1": { "description": "US ISOB West" }
			}
		},
		{
			"id": "aws-iso-e",
			"outputs": {
				"dnsSuffix": "cloud.adc-e.uk",
				"dualStackDnsSuffix": "api.cloud-aws.adc-e.uk",
				"implicitGlobalRegion": "eu-isoe-west-1",
				"name": "aws-iso-e",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^eu\\-isoe\\-\\w+\\-\\d+$",
			"regions": {
				"aws-iso-e-global": { "description": "aws-iso-e global region" },
				"eu-isoe-west-1": { "description": "EU ISOE West" }
			}
		},
		{
			"id": "aws-iso-f",
			"outputs": {
				"dnsSuffix": "csp.hci.ic.gov",
				"dualStackDnsSuffix": "api.aws.hci.ic.gov",
				"implicitGlobalRegion": "us-isof-south-1",
				"name": "aws-iso-f",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^us\\-isof\\-\\w+\\-\\d+$",
			"regions": {
				"aws-iso-f-global": { "description": "aws-iso-f global region" },
				"us-isof-east-1": { "description": "US ISOF EAST" },
				"us-isof-south-1": { "description": "US ISOF SOUTH" }
			}
		},
		{
			"id": "aws-us-gov",
			"outputs": {
				"dnsSuffix": "amazonaws.com",
				"dualStackDnsSuffix": "api.aws",
				"implicitGlobalRegion": "us-gov-west-1",
				"name": "aws-us-gov",
				"supportsDualStack": true,
				"supportsFIPS": true
			},
			"regionRegex": "^us\\-gov\\-\\w+\\-\\d+$",
			"regions": {
				"aws-us-gov-global": { "description": "aws-us-gov global region" },
				"us-gov-east-1": { "description": "AWS GovCloud (US-East)" },
				"us-gov-west-1": { "description": "AWS GovCloud (US-West)" }
			}
		}
	],
	"version": "1.1"
};
var selectedUserAgentPrefix = "";
var partition = (value) => {
	const { partitions } = selectedPartitionsInfo;
	for (const partition of partitions) {
		const { regions, outputs } = partition;
		for (const [region, regionData] of Object.entries(regions)) if (region === value) return {
			...outputs,
			...regionData
		};
	}
	for (const partition of partitions) {
		const { regionRegex, outputs } = partition;
		if (new RegExp(regionRegex).test(value)) return { ...outputs };
	}
	const DEFAULT_PARTITION = partitions.find((partition) => partition.id === "aws");
	if (!DEFAULT_PARTITION) throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
	return { ...DEFAULT_PARTITION.outputs };
};
var getUserAgentPrefix = () => selectedUserAgentPrefix;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/check-features.js
var ACCOUNT_ID_ENDPOINT_REGEX = /\d{12}\.ddb/;
async function checkFeatures(context, config, args) {
	if (args.request?.headers?.["smithy-protocol"] === "rpc-v2-cbor") setFeature(context, "PROTOCOL_RPC_V2_CBOR", "M");
	if (typeof config.retryStrategy === "function") {
		const retryStrategy = await config.retryStrategy();
		if (typeof retryStrategy.mode === "string") switch (retryStrategy.mode) {
			case RETRY_MODES.ADAPTIVE:
				setFeature(context, "RETRY_MODE_ADAPTIVE", "F");
				break;
			case RETRY_MODES.STANDARD:
				setFeature(context, "RETRY_MODE_STANDARD", "E");
				break;
		}
	}
	if (typeof config.accountIdEndpointMode === "function") {
		const endpointV2 = context.endpointV2;
		if (String(endpointV2?.url?.hostname).match(ACCOUNT_ID_ENDPOINT_REGEX)) setFeature(context, "ACCOUNT_ID_ENDPOINT", "O");
		switch (await config.accountIdEndpointMode?.()) {
			case "disabled":
				setFeature(context, "ACCOUNT_ID_MODE_DISABLED", "Q");
				break;
			case "preferred":
				setFeature(context, "ACCOUNT_ID_MODE_PREFERRED", "P");
				break;
			case "required":
				setFeature(context, "ACCOUNT_ID_MODE_REQUIRED", "R");
				break;
		}
	}
	const identity = context.__smithy_context?.selectedHttpAuthScheme?.identity;
	if (identity?.$source) {
		const credentials = identity;
		if (credentials.accountId) setFeature(context, "RESOLVED_ACCOUNT_ID", "T");
		for (const [key, value] of Object.entries(credentials.$source ?? {})) setFeature(context, key, value);
	}
}
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/constants.js
var USER_AGENT = "user-agent";
var X_AMZ_USER_AGENT = "x-amz-user-agent";
var UA_NAME_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w]/g;
var UA_VALUE_ESCAPE_REGEX = /[^!$%&'*+\-.^_`|~\w#]/g;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/encode-features.js
var BYTE_LIMIT = 1024;
function encodeFeatures(features) {
	let buffer = "";
	for (const key in features) {
		const val = features[key];
		if (buffer.length + val.length + 1 <= BYTE_LIMIT) {
			if (buffer.length) buffer += "," + val;
			else buffer += val;
			continue;
		}
		break;
	}
	return buffer;
}
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/user-agent-middleware.js
var userAgentMiddleware = (options) => (next, context) => async (args) => {
	const { request } = args;
	if (!HttpRequest.isInstance(request)) return next(args);
	const { headers } = request;
	const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
	const defaultUserAgent = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
	await checkFeatures(context, options, args);
	const awsContext = context;
	defaultUserAgent.push(`m/${encodeFeatures(Object.assign({}, context.__smithy_context?.features, awsContext.__aws_sdk_context?.features))}`);
	const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
	const appId = await options.userAgentAppId();
	if (appId) defaultUserAgent.push(escapeUserAgent([`app`, `${appId}`]));
	const prefix = getUserAgentPrefix();
	const sdkUserAgentValue = (prefix ? [prefix] : []).concat([
		...defaultUserAgent,
		...userAgent,
		...customUserAgent
	]).join(" ");
	const normalUAValue = [...defaultUserAgent.filter((section) => section.startsWith("aws-sdk-")), ...customUserAgent].join(" ");
	if (options.runtime !== "browser") {
		if (normalUAValue) headers[X_AMZ_USER_AGENT] = headers["x-amz-user-agent"] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
		headers[USER_AGENT] = sdkUserAgentValue;
	} else headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
	return next({
		...args,
		request
	});
};
var escapeUserAgent = (userAgentPair) => {
	const name = userAgentPair[0].split("/").map((part) => part.replace(UA_NAME_ESCAPE_REGEX, "-")).join("/");
	const version = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, "-");
	const prefixSeparatorIndex = name.indexOf("/");
	const prefix = name.substring(0, prefixSeparatorIndex);
	let uaName = name.substring(prefixSeparatorIndex + 1);
	if (prefix === "api") uaName = uaName.toLowerCase();
	return [
		prefix,
		uaName,
		version
	].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
		switch (index) {
			case 0: return item;
			case 1: return `${acc}/${item}`;
			default: return `${acc}#${item}`;
		}
	}, "");
};
var getUserAgentMiddlewareOptions = {
	name: "getUserAgentMiddleware",
	step: "build",
	priority: "low",
	tags: ["SET_USER_AGENT", "USER_AGENT"],
	override: true
};
var getUserAgentPlugin = (config) => ({ applyToStack: (clientStack) => {
	clientStack.add(userAgentMiddleware(config), getUserAgentMiddlewareOptions);
} });
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/getRuntimeUserAgentPair.js
var getRuntimeUserAgentPair = () => {
	for (const runtime of [
		"deno",
		"bun",
		"llrt"
	]) if (versions[runtime]) return [`md/${runtime}`, versions[runtime]];
	return ["md/nodejs", versions.node];
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/crt-availability.js
var crtAvailability = { isCrtAvailable: false };
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/is-crt-available.js
var isCrtAvailable = () => {
	if (crtAvailability.isCrtAvailable) return ["md/crt-avail"];
	return null;
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/defaultUserAgent.js
var createDefaultUserAgentProvider = ({ serviceId, clientVersion }) => {
	const runtimeUserAgentPair = getRuntimeUserAgentPair();
	return async (config) => {
		const sections = [
			["aws-sdk-js", clientVersion],
			["ua", "2.1"],
			[`os/${platform()}`, release()],
			["lang/js"],
			runtimeUserAgentPair
		];
		const crtAvailable = isCrtAvailable();
		if (crtAvailable) sections.push(crtAvailable);
		if (serviceId) sections.push([`api/${serviceId}`, clientVersion]);
		if (env.AWS_EXECUTION_ENV) sections.push([`exec-env/${env.AWS_EXECUTION_ENV}`]);
		const appId = await config?.userAgentAppId?.();
		return appId ? [...sections, [`app/${appId}`]] : [...sections];
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/nodeAppIdConfigOptions.js
var UA_APP_ID_ENV_NAME = "AWS_SDK_UA_APP_ID";
var UA_APP_ID_INI_NAME_DEPRECATED = "sdk-ua-app-id";
var NODE_APP_ID_CONFIG_OPTIONS = {
	environmentVariableSelector: (env) => env[UA_APP_ID_ENV_NAME],
	configFileSelector: (profile) => profile["sdk_ua_app_id"] ?? profile[UA_APP_ID_INI_NAME_DEPRECATED],
	default: void 0
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/isVirtualHostableS3Bucket.js
var isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
	if (allowSubDomains) {
		for (const label of value.split(".")) if (!isVirtualHostableS3Bucket(label)) return false;
		return true;
	}
	if (!isValidHostLabel(value)) return false;
	if (value.length < 3 || value.length > 63) return false;
	if (value !== value.toLowerCase()) return false;
	if (isIpAddress(value)) return false;
	return true;
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/lib/aws/parseArn.js
var ARN_DELIMITER = ":";
var RESOURCE_DELIMITER = "/";
var parseArn = (value) => {
	const segments = value.split(ARN_DELIMITER);
	if (segments.length < 6) return null;
	const [arn, partition, service, region, accountId, ...resourcePath] = segments;
	if (arn !== "arn" || partition === "" || service === "" || resourcePath.join(ARN_DELIMITER) === "") return null;
	return {
		partition,
		service,
		region,
		accountId,
		resourceId: resourcePath.map((resource) => resource.split(RESOURCE_DELIMITER)).flat()
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/aws.js
var awsEndpointFunctions = {
	isVirtualHostableS3Bucket,
	parseArn,
	partition
};
customEndpointFunctions.aws = awsEndpointFunctions;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/extensions.js
var getAwsRegionExtensionConfiguration = (runtimeConfig) => {
	return {
		setRegion(region) {
			runtimeConfig.region = region;
		},
		region() {
			return runtimeConfig.region;
		}
	};
};
var resolveAwsRegionExtensionConfiguration = (awsRegionExtensionConfiguration) => {
	return { region: awsRegionExtensionConfiguration.region() };
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256Js.js
var BLOCK = 64;
var DIGEST_LENGTH = 32;
var MAX_HASHABLE_LENGTH = 2 ** 53 - 1;
var Sha256Js = class Sha256Js {
	digestLength = DIGEST_LENGTH;
	state = Int32Array.from(INIT);
	w;
	buffer = /* @__PURE__ */ new Uint8Array(64);
	bufferLength = 0;
	bytesHashed = 0;
	finished = false;
	inner;
	outer;
	constructor(secret) {
		if (secret) {
			const key = Sha256Js.normalizeKey(secret);
			this.inner = new Sha256Js();
			this.outer = new Sha256Js();
			const { inner, outer } = this;
			const pad = new Uint8Array(BLOCK * 2);
			for (let i = 0; i < BLOCK; ++i) {
				pad[i] = 54 ^ key[i];
				pad[i + BLOCK] = 92 ^ key[i];
			}
			inner.update(pad.subarray(0, BLOCK));
			outer.update(pad.subarray(BLOCK));
		}
	}
	update(data) {
		if (this.finished) throw new Error("Attempted to update an already finished HMAC.");
		if (this.inner) {
			this.inner.update(data);
			return;
		}
		const chunk = toUint8Array(data);
		let position = 0;
		let { byteLength } = chunk;
		this.bytesHashed += byteLength;
		if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) throw new Error("Cannot hash more than 2^53 - 1 bits");
		while (byteLength > 0) {
			this.buffer[this.bufferLength++] = chunk[position++];
			byteLength--;
			if (this.bufferLength === BLOCK) {
				this.hashBuffer();
				this.bufferLength = 0;
			}
		}
	}
	async digest() {
		const { inner, outer } = this;
		if (inner && outer) {
			if (this.finished) throw new Error("Attempted to digest an already finished HMAC.");
			this.finished = true;
			const innerDigest = inner.digestSync();
			outer.update(innerDigest);
			return outer.digestSync();
		}
		return this.digestSync();
	}
	reset() {
		this.state = Int32Array.from(INIT);
		this.buffer = /* @__PURE__ */ new Uint8Array(64);
		this.bufferLength = 0;
		this.bytesHashed = 0;
	}
	digestSync() {
		const state = this.state.slice();
		const buffer = this.buffer.slice();
		let bufferLength = this.bufferLength;
		const bitsHashed = this.bytesHashed * 8;
		const bufferView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		bufferView.setUint8(bufferLength++, 128);
		if ((bufferLength - 1) % BLOCK >= BLOCK - 8) {
			for (let i = bufferLength; i < BLOCK; ++i) bufferView.setUint8(i, 0);
			this.hashBufferWith(state, buffer);
			bufferLength = 0;
		}
		for (let i = bufferLength; i < BLOCK - 8; ++i) bufferView.setUint8(i, 0);
		bufferView.setUint32(BLOCK - 8, Math.floor(bitsHashed / 4294967296), false);
		bufferView.setUint32(BLOCK - 4, bitsHashed, false);
		this.hashBufferWith(state, buffer);
		const out = new Uint8Array(DIGEST_LENGTH);
		for (let i = 0; i < 8; ++i) {
			out[i * 4] = state[i] >>> 24 & 255;
			out[i * 4 + 1] = state[i] >>> 16 & 255;
			out[i * 4 + 2] = state[i] >>> 8 & 255;
			out[i * 4 + 3] = state[i] >>> 0 & 255;
		}
		return out;
	}
	static normalizeKey(secret) {
		const key = toUint8Array(secret);
		if (key.byteLength > BLOCK) {
			const h = new Sha256Js();
			h.update(key);
			const out = h.digestSync();
			const padded = new Uint8Array(BLOCK);
			padded.set(out);
			return padded;
		}
		if (key.byteLength < BLOCK) {
			const padded = new Uint8Array(BLOCK);
			padded.set(key);
			return padded;
		}
		return key;
	}
	hashBuffer() {
		this.hashBufferWith(this.state, this.buffer);
	}
	hashBufferWith(state, buffer) {
		const w = this.w ??= /* @__PURE__ */ new Int32Array(64);
		let s0 = state[0], s1 = state[1], s2 = state[2], s3 = state[3], s4 = state[4], s5 = state[5], s6 = state[6], s7 = state[7];
		for (let i = 0; i < BLOCK; ++i) {
			if (i < 16) w[i] = (buffer[i * 4] & 255) << 24 | (buffer[i * 4 + 1] & 255) << 16 | (buffer[i * 4 + 2] & 255) << 8 | buffer[i * 4 + 3] & 255;
			else {
				let u = w[i - 2];
				const t1 = (u >>> 17 | u << 15) ^ (u >>> 19 | u << 13) ^ u >>> 10;
				u = w[i - 15];
				const t2 = (u >>> 7 | u << 25) ^ (u >>> 18 | u << 14) ^ u >>> 3;
				w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
			}
			const t1 = (((s4 >>> 6 | s4 << 26) ^ (s4 >>> 11 | s4 << 21) ^ (s4 >>> 25 | s4 << 7)) + (s4 & s5 ^ ~s4 & s6) | 0) + (s7 + (K[i] + w[i] | 0) | 0) | 0;
			const t2 = ((s0 >>> 2 | s0 << 30) ^ (s0 >>> 13 | s0 << 19) ^ (s0 >>> 22 | s0 << 10)) + (s0 & s1 ^ s0 & s2 ^ s1 & s2) | 0;
			s7 = s6;
			s6 = s5;
			s5 = s4;
			s4 = s3 + t1 | 0;
			s3 = s2;
			s2 = s1;
			s1 = s0;
			s0 = t1 + t2 | 0;
		}
		state[0] += s0;
		state[1] += s1;
		state[2] += s2;
		state[3] += s3;
		state[4] += s4;
		state[5] += s5;
		state[6] += s6;
		state[7] += s7;
	}
};
var INIT = new Int32Array([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]);
var K = new Int32Array([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]);
var Sha256Node = (() => {
	try {
		createHash("sha256");
		return true;
	} catch {
		return false;
	}
})() ? buildNativeClass() : Sha256Js;
function buildNativeClass() {
	return class Sha256Node {
		digestLength = 32;
		secret;
		hash;
		isHmac;
		finished = false;
		constructor(secret) {
			this.secret = secret;
			this.isHmac = !!secret;
			this.hash = this.createHash();
		}
		update(data) {
			if (this.finished) throw new Error("Attempted to update an already finished hash.");
			this.hash.update(data);
		}
		async digest() {
			let buf;
			if (this.isHmac) {
				this.finished = true;
				buf = this.hash.digest();
			} else buf = this.hash.copy().digest();
			return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
		}
		reset() {
			this.hash = this.createHash();
			this.finished = false;
		}
		createHash() {
			return this.secret ? createHmac("sha256", toBuffer(this.secret)) : createHash("sha256");
		}
	};
}
function toBuffer(data) {
	if (typeof data === "string") return data;
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	return Buffer.from(data);
}
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js
var HeaderFormatter = class {
	format(headers) {
		const chunks = [];
		for (const headerName of Object.keys(headers)) {
			const bytes = fromUtf8(headerName);
			chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
		}
		const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
		let position = 0;
		for (const chunk of chunks) {
			out.set(chunk, position);
			position += chunk.byteLength;
		}
		return out;
	}
	formatHeaderValue(header) {
		switch (header.type) {
			case "boolean": return Uint8Array.from([header.value ? HEADER_VALUE_TYPE.boolTrue : HEADER_VALUE_TYPE.boolFalse]);
			case "byte": return Uint8Array.from([HEADER_VALUE_TYPE.byte, header.value]);
			case "short":
				const shortView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(3));
				shortView.setUint8(0, HEADER_VALUE_TYPE.short);
				shortView.setInt16(1, header.value, false);
				return new Uint8Array(shortView.buffer);
			case "integer":
				const intView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(5));
				intView.setUint8(0, HEADER_VALUE_TYPE.integer);
				intView.setInt32(1, header.value, false);
				return new Uint8Array(intView.buffer);
			case "long":
				const longBytes = /* @__PURE__ */ new Uint8Array(9);
				longBytes[0] = HEADER_VALUE_TYPE.long;
				longBytes.set(header.value.bytes, 1);
				return longBytes;
			case "binary":
				const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
				binView.setUint8(0, HEADER_VALUE_TYPE.byteArray);
				binView.setUint16(1, header.value.byteLength, false);
				const binBytes = new Uint8Array(binView.buffer);
				binBytes.set(header.value, 3);
				return binBytes;
			case "string":
				const utf8Bytes = fromUtf8(header.value);
				const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
				strView.setUint8(0, HEADER_VALUE_TYPE.string);
				strView.setUint16(1, utf8Bytes.byteLength, false);
				const strBytes = new Uint8Array(strView.buffer);
				strBytes.set(utf8Bytes, 3);
				return strBytes;
			case "timestamp":
				const tsBytes = /* @__PURE__ */ new Uint8Array(9);
				tsBytes[0] = HEADER_VALUE_TYPE.timestamp;
				tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
				return tsBytes;
			case "uuid":
				if (!UUID_PATTERN.test(header.value)) throw new Error(`Invalid UUID received: ${header.value}`);
				const uuidBytes = /* @__PURE__ */ new Uint8Array(17);
				uuidBytes[0] = HEADER_VALUE_TYPE.uuid;
				uuidBytes.set(fromHex(header.value.replace(/-/g, "")), 1);
				return uuidBytes;
		}
	}
};
var HEADER_VALUE_TYPE;
(function(HEADER_VALUE_TYPE) {
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolTrue"] = 0] = "boolTrue";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["boolFalse"] = 1] = "boolFalse";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byte"] = 2] = "byte";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["short"] = 3] = "short";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["integer"] = 4] = "integer";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["long"] = 5] = "long";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["byteArray"] = 6] = "byteArray";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["string"] = 7] = "string";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["timestamp"] = 8] = "timestamp";
	HEADER_VALUE_TYPE[HEADER_VALUE_TYPE["uuid"] = 9] = "uuid";
})(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
var UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
var Int64 = class Int64 {
	bytes;
	constructor(bytes) {
		this.bytes = bytes;
		if (bytes.byteLength !== 8) throw new Error("Int64 buffers must be exactly 8 bytes");
	}
	static fromNumber(number) {
		if (number > 0x8000000000000000 || number < -0x8000000000000000) throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
		const bytes = /* @__PURE__ */ new Uint8Array(8);
		for (let i = 7, remaining = Math.abs(Math.round(number)); i > -1 && remaining > 0; i--, remaining /= 256) bytes[i] = remaining;
		if (number < 0) negate(bytes);
		return new Int64(bytes);
	}
	valueOf() {
		const bytes = this.bytes.slice(0);
		const negative = bytes[0] & 128;
		if (negative) negate(bytes);
		return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
	}
	toString() {
		return String(this.valueOf());
	}
};
function negate(bytes) {
	for (let i = 0; i < 8; i++) bytes[i] ^= 255;
	for (let i = 7; i > -1; i--) {
		bytes[i]++;
		if (bytes[i] !== 0) break;
	}
}
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/constants.js
var ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
var CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
var AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
var SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
var EXPIRES_QUERY_PARAM = "X-Amz-Expires";
var SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
var TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
var AUTH_HEADER = "authorization";
var AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
var GENERATED_HEADERS = [
	AUTH_HEADER,
	AMZ_DATE_HEADER,
	"date"
];
SIGNATURE_QUERY_PARAM.toLowerCase();
var SHA256_HEADER = "x-amz-content-sha256";
var TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
var ALWAYS_UNSIGNABLE_HEADERS = {
	authorization: true,
	"cache-control": true,
	connection: true,
	expect: true,
	from: true,
	"keep-alive": true,
	"max-forwards": true,
	pragma: true,
	referer: true,
	te: true,
	trailer: true,
	"transfer-encoding": true,
	upgrade: true,
	"user-agent": true,
	"x-amzn-trace-id": true
};
var PROXY_HEADER_PATTERN = /^proxy-/;
var SEC_HEADER_PATTERN = /^sec-/;
var ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
var EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
var KEY_TYPE_IDENTIFIER = "aws4_request";
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
var getCanonicalQuery = ({ query = {} }) => {
	const keys = [];
	const serialized = {};
	for (const key of Object.keys(query)) {
		if (key.toLowerCase() === "x-amz-signature") continue;
		const encodedKey = escapeUri(key);
		keys.push(encodedKey);
		const value = query[key];
		if (typeof value === "string") serialized[encodedKey] = `${encodedKey}=${escapeUri(value)}`;
		else if (Array.isArray(value)) serialized[encodedKey] = value.slice(0).reduce((encoded, value) => encoded.concat([`${encodedKey}=${escapeUri(value)}`]), []).sort().join("&");
	}
	return keys.sort().map((key) => serialized[key]).filter((serialized) => serialized).join("&");
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/utilDate.js
var iso8601 = (time) => toDate(time).toISOString().replace(/\.\d{3}Z$/, "Z");
var toDate = (time) => {
	if (typeof time === "number") return /* @__PURE__ */ new Date(time * 1e3);
	if (typeof time === "string") {
		if (Number(time)) return /* @__PURE__ */ new Date(Number(time) * 1e3);
		return new Date(time);
	}
	return time;
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/SignatureV4Base.js
var SignatureV4Base = class {
	service;
	regionProvider;
	credentialProvider;
	sha256;
	uriEscapePath;
	applyChecksum;
	constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
		this.service = service;
		this.sha256 = sha256;
		this.uriEscapePath = uriEscapePath;
		this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
		this.regionProvider = normalizeProvider$1(region);
		this.credentialProvider = normalizeProvider$1(credentials);
	}
	createCanonicalRequest(request, canonicalHeaders, payloadHash) {
		const sortedHeaders = Object.keys(canonicalHeaders).sort();
		return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
	}
	async createStringToSign(longDate, credentialScope, canonicalRequest, algorithmIdentifier) {
		const hash = new this.sha256();
		hash.update(toUint8Array(canonicalRequest));
		return `${algorithmIdentifier}
${longDate}
${credentialScope}
${toHex(await hash.digest())}`;
	}
	getCanonicalPath({ path }) {
		if (this.uriEscapePath) {
			const normalizedPathSegments = [];
			for (const pathSegment of path.split("/")) {
				if (pathSegment?.length === 0) continue;
				if (pathSegment === ".") continue;
				if (pathSegment === "..") normalizedPathSegments.pop();
				else normalizedPathSegments.push(pathSegment);
			}
			return escapeUri(`${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`).replace(/%2F/g, "/");
		}
		return path;
	}
	validateResolvedCredentials(credentials) {
		if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") throw new Error("Resolved credential object is not valid");
	}
	formatDate(now) {
		const longDate = iso8601(now).replace(/[-:]/g, "");
		return {
			longDate,
			shortDate: longDate.slice(0, 8)
		};
	}
	getCanonicalHeaderList(headers) {
		return Object.keys(headers).sort().join(";");
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js
var signingKeyCache = {};
var cacheQueue = [];
var createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
var getSigningKey = async (sha256Constructor, credentials, shortDate, region, service) => {
	const cacheKey = `${shortDate}:${region}:${service}:${toHex(await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId))}:${credentials.sessionToken}`;
	if (cacheKey in signingKeyCache) return signingKeyCache[cacheKey];
	cacheQueue.push(cacheKey);
	while (cacheQueue.length > 50) delete signingKeyCache[cacheQueue.shift()];
	let key = `AWS4${credentials.secretAccessKey}`;
	for (const signable of [
		shortDate,
		region,
		service,
		KEY_TYPE_IDENTIFIER
	]) key = await hmac(sha256Constructor, key, signable);
	return signingKeyCache[cacheKey] = key;
};
var hmac = (ctor, secret, data) => {
	const hash = new ctor(secret);
	hash.update(toUint8Array(data));
	return hash.digest();
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js
var getCanonicalHeaders = ({ headers }, unsignableHeaders, signableHeaders) => {
	const canonical = {};
	for (const headerName of Object.keys(headers).sort()) {
		if (headers[headerName] == void 0) continue;
		const canonicalHeaderName = headerName.toLowerCase();
		if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
			if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) continue;
		}
		canonical[canonicalHeaderName] = headers[headerName].trim().replace(/\s+/g, " ");
	}
	return canonical;
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js
var getPayloadHash = async ({ headers, body }, hashConstructor) => {
	for (const headerName of Object.keys(headers)) if (headerName.toLowerCase() === "x-amz-content-sha256") return headers[headerName];
	if (body == void 0) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
	else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
		const hashCtor = new hashConstructor();
		hashCtor.update(toUint8Array(body));
		return toHex(await hashCtor.digest());
	}
	return UNSIGNED_PAYLOAD;
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/headerUtil.js
var hasHeader = (soughtHeader, headers) => {
	soughtHeader = soughtHeader.toLowerCase();
	for (const headerName of Object.keys(headers)) if (soughtHeader === headerName.toLowerCase()) return true;
	return false;
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js
var moveHeadersToQuery = (request, options = {}) => {
	const { headers, query = {} } = HttpRequest.clone(request);
	for (const name of Object.keys(headers)) {
		const lname = name.toLowerCase();
		if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname) || options.hoistableHeaders?.has(lname)) {
			query[name] = headers[name];
			delete headers[name];
		}
	}
	return {
		...request,
		headers,
		query
	};
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/prepareRequest.js
var prepareRequest = (request) => {
	request = HttpRequest.clone(request);
	for (const headerName of Object.keys(request.headers)) if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) delete request.headers[headerName];
	return request;
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
var SignatureV4 = class extends SignatureV4Base {
	headerFormatter = new HeaderFormatter();
	constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
		super({
			applyChecksum,
			credentials,
			region,
			service,
			sha256,
			uriEscapePath
		});
	}
	async presign(originalRequest, options = {}) {
		const { signingDate = /* @__PURE__ */ new Date(), expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, hoistableHeaders, signingRegion, signingService } = options;
		const credentials = await this.credentialProvider();
		this.validateResolvedCredentials(credentials);
		const region = signingRegion ?? await this.regionProvider();
		const { longDate, shortDate } = this.formatDate(signingDate);
		if (expiresIn > 604800) return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
		const scope = createScope(shortDate, region, signingService ?? this.service);
		const request = moveHeadersToQuery(prepareRequest(originalRequest), {
			unhoistableHeaders,
			hoistableHeaders
		});
		if (credentials.sessionToken) request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
		request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
		request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
		request.query[AMZ_DATE_QUERY_PARAM] = longDate;
		request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
		const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
		request.query[SIGNED_HEADERS_QUERY_PARAM] = this.getCanonicalHeaderList(canonicalHeaders);
		request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
		return request;
	}
	async sign(toSign, options) {
		if (typeof toSign === "string") return this.signString(toSign, options);
		else if (toSign.headers && toSign.payload) return this.signEvent(toSign, options);
		else if (toSign.message) return this.signMessage(toSign, options);
		else return this.signRequest(toSign, options);
	}
	async signEvent({ headers, payload }, { signingDate = /* @__PURE__ */ new Date(), priorSignature, signingRegion, signingService, eventStreamCredentials }) {
		const region = signingRegion ?? await this.regionProvider();
		const { shortDate, longDate } = this.formatDate(signingDate);
		const scope = createScope(shortDate, region, signingService ?? this.service);
		const hashedPayload = await getPayloadHash({
			headers: {},
			body: payload
		}, this.sha256);
		const hash = new this.sha256();
		hash.update(headers);
		const stringToSign = [
			EVENT_ALGORITHM_IDENTIFIER,
			longDate,
			scope,
			priorSignature,
			toHex(await hash.digest()),
			hashedPayload
		].join("\n");
		return this.signString(stringToSign, {
			signingDate,
			signingRegion: region,
			signingService,
			eventStreamCredentials
		});
	}
	async signMessage(signableMessage, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials }) {
		return this.signEvent({
			headers: this.headerFormatter.format(signableMessage.message.headers),
			payload: signableMessage.message.body
		}, {
			signingDate,
			signingRegion,
			signingService,
			priorSignature: signableMessage.priorSignature,
			eventStreamCredentials
		}).then((signature) => {
			return {
				message: signableMessage.message,
				signature
			};
		});
	}
	async signString(stringToSign, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService, eventStreamCredentials } = {}) {
		const credentials = eventStreamCredentials ?? await this.credentialProvider();
		this.validateResolvedCredentials(credentials);
		const region = signingRegion ?? await this.regionProvider();
		const { shortDate } = this.formatDate(signingDate);
		const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
		hash.update(toUint8Array(stringToSign));
		return toHex(await hash.digest());
	}
	async signRequest(requestToSign, { signingDate = /* @__PURE__ */ new Date(), signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
		const credentials = await this.credentialProvider();
		this.validateResolvedCredentials(credentials);
		const region = signingRegion ?? await this.regionProvider();
		const request = prepareRequest(requestToSign);
		const { longDate, shortDate } = this.formatDate(signingDate);
		const scope = createScope(shortDate, region, signingService ?? this.service);
		request.headers[AMZ_DATE_HEADER] = longDate;
		if (credentials.sessionToken) request.headers[TOKEN_HEADER] = credentials.sessionToken;
		const payloadHash = await getPayloadHash(request, this.sha256);
		if (!hasHeader("x-amz-content-sha256", request.headers) && this.applyChecksum) request.headers[SHA256_HEADER] = payloadHash;
		const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
		const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
		request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${this.getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
		return request;
	}
	async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
		const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest, ALGORITHM_IDENTIFIER);
		const hash = new this.sha256(await keyPromise);
		hash.update(toUint8Array(stringToSign));
		return toHex(await hash.digest());
	}
	getSigningKey(credentials, region, shortDate, service) {
		return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/protocols/ProtocolLib.js
var ProtocolLib = class {
	queryCompat;
	errorRegistry;
	constructor(queryCompat = false) {
		this.queryCompat = queryCompat;
	}
	resolveRestContentType(defaultContentType, inputSchema) {
		const members = inputSchema.getMemberSchemas();
		const httpPayloadMember = Object.values(members).find((m) => {
			return !!m.getMergedTraits().httpPayload;
		});
		if (httpPayloadMember) {
			const mediaType = httpPayloadMember.getMergedTraits().mediaType;
			if (mediaType) return mediaType;
			else if (httpPayloadMember.isStringSchema()) return "text/plain";
			else if (httpPayloadMember.isBlobSchema()) return "application/octet-stream";
			else return defaultContentType;
		} else if (!inputSchema.isUnitSchema()) {
			if (Object.values(members).find((m) => {
				const { httpQuery, httpQueryParams, httpHeader, httpLabel, httpPrefixHeaders } = m.getMergedTraits();
				return !httpQuery && !httpQueryParams && !httpHeader && !httpLabel && httpPrefixHeaders === void 0;
			})) return defaultContentType;
		}
	}
	async getErrorSchemaOrThrowBaseException(errorIdentifier, defaultNamespace, response, dataObject, metadata, getErrorSchema) {
		let errorName = errorIdentifier;
		if (errorIdentifier.includes("#")) [, errorName] = errorIdentifier.split("#");
		const errorMetadata = {
			$metadata: metadata,
			$fault: response.statusCode < 500 ? "client" : "server"
		};
		if (!this.errorRegistry) throw new Error("@aws-sdk/core/protocols - error handler not initialized.");
		try {
			return {
				errorSchema: getErrorSchema?.(this.errorRegistry, errorName) ?? this.errorRegistry.getSchema(errorIdentifier),
				errorMetadata
			};
		} catch (e) {
			dataObject.message = dataObject.message ?? dataObject.Message ?? "UnknownError";
			const synthetic = this.errorRegistry;
			const baseExceptionSchema = synthetic.getBaseException();
			if (baseExceptionSchema) {
				const ErrorCtor = synthetic.getErrorCtor(baseExceptionSchema) ?? Error;
				throw this.decorateServiceException(Object.assign(new ErrorCtor({ name: errorName }), errorMetadata), dataObject);
			}
			const d = dataObject;
			const message = d?.message ?? d?.Message ?? d?.Error?.Message ?? d?.Error?.message;
			throw this.decorateServiceException(Object.assign(new Error(message), { name: errorName }, errorMetadata), dataObject);
		}
	}
	compose(composite, errorIdentifier, defaultNamespace) {
		let namespace = defaultNamespace;
		if (errorIdentifier.includes("#")) [namespace] = errorIdentifier.split("#");
		const staticRegistry = TypeRegistry.for(namespace);
		const defaultSyntheticRegistry = TypeRegistry.for("smithy.ts.sdk.synthetic." + defaultNamespace);
		composite.copyFrom(staticRegistry);
		composite.copyFrom(defaultSyntheticRegistry);
		this.errorRegistry = composite;
	}
	decorateServiceException(exception, additions = {}) {
		if (this.queryCompat) {
			const msg = exception.Message ?? additions.Message;
			const error = decorateServiceException(exception, additions);
			if (msg) error.message = msg;
			const errorObj = error.Error ?? {};
			errorObj.Type = error.Error?.Type;
			errorObj.Code = error.Error?.Code;
			errorObj.Message = error.Error?.message ?? error.Error?.Message ?? msg;
			error.Error = errorObj;
			const reqId = error.$metadata.requestId;
			if (reqId) error.RequestId = reqId;
			return error;
		}
		return decorateServiceException(exception, additions);
	}
	setQueryCompatError(output, response) {
		const queryErrorHeader = response.headers?.["x-amzn-query-error"];
		if (output !== void 0 && queryErrorHeader != null) {
			const [Code, Type] = queryErrorHeader.split(";");
			const keys = Object.keys(output);
			const Error = {
				Code,
				Type
			};
			output.Code = Code;
			output.Type = Type;
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				Error[k === "message" ? "Message" : k] = output[k];
			}
			delete Error.__type;
			output.Error = Error;
		}
	}
	queryCompatOutput(queryCompatErrorData, errorData) {
		if (queryCompatErrorData.Error) errorData.Error = queryCompatErrorData.Error;
		if (queryCompatErrorData.Type) errorData.Type = queryCompatErrorData.Type;
		if (queryCompatErrorData.Code) errorData.Code = queryCompatErrorData.Code;
	}
	findQueryCompatibleError(registry, errorName) {
		try {
			return registry.getSchema(errorName);
		} catch (e) {
			return registry.find((schema) => NormalizedSchema.of(schema).getMergedTraits().awsQueryError?.[0] === errorName);
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/protocols/ConfigurableSerdeContext.js
var SerdeContextConfig = class {
	serdeContext;
	setSerdeContext(serdeContext) {
		this.serdeContext = serdeContext;
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/protocols/UnionSerde.js
var UnionSerde = class {
	from;
	to;
	keys;
	constructor(from, to) {
		this.from = from;
		this.to = to;
		const keys = Object.keys(this.from);
		const set = new Set(keys);
		set.delete("__type");
		this.keys = set;
	}
	mark(key) {
		this.keys.delete(key);
	}
	hasUnknown() {
		return this.keys.size === 1 && Object.keys(this.to).length === 0;
	}
	writeUnknown() {
		if (this.hasUnknown()) {
			const k = this.keys.values().next().value;
			const v = this.from[k];
			this.to.$unknown = [k, v];
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getDateHeader.js
var getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getSkewCorrectedDate.js
var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/isClockSkewed.js
var isClockSkewed = (clockTime, systemClockOffset) => Math.abs(getSkewCorrectedDate(systemClockOffset).getTime() - clockTime) >= 3e5;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getUpdatedSystemClockOffset.js
var getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset) => {
	const clockTimeInMs = Date.parse(clockTime);
	if (isClockSkewed(clockTimeInMs, currentSystemClockOffset)) return clockTimeInMs - Date.now();
	return currentSystemClockOffset;
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js
var throwSigningPropertyError = (name, property) => {
	if (!property) throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
	return property;
};
var validateSigningProperties = async (signingProperties) => {
	const context = throwSigningPropertyError("context", signingProperties.context);
	const config = throwSigningPropertyError("config", signingProperties.config);
	const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
	return {
		config,
		signer: await throwSigningPropertyError("signer", config.signer)(authScheme),
		signingRegion: signingProperties?.signingRegion,
		signingRegionSet: signingProperties?.signingRegionSet,
		signingName: signingProperties?.signingName
	};
};
var AwsSdkSigV4Signer = class {
	async sign(httpRequest, identity, signingProperties) {
		if (!HttpRequest.isInstance(httpRequest)) throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
		const validatedProps = await validateSigningProperties(signingProperties);
		const { config, signer } = validatedProps;
		let { signingRegion, signingName } = validatedProps;
		const handlerExecutionContext = signingProperties.context;
		if (handlerExecutionContext?.authSchemes?.length ?? false) {
			const [first, second] = handlerExecutionContext.authSchemes;
			if (first?.name === "sigv4a" && second?.name === "sigv4") {
				signingRegion = second?.signingRegion ?? signingRegion;
				signingName = second?.signingName ?? signingName;
			}
		}
		signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
		return await signer.sign(httpRequest, {
			signingDate: getSkewCorrectedDate(config.systemClockOffset),
			signingRegion,
			signingService: signingName
		});
	}
	errorHandler(signingProperties) {
		return (error) => {
			const errorException = error;
			const serverTime = errorException.ServerTime ?? getDateHeader(errorException.$response);
			if (serverTime) {
				const config = throwSigningPropertyError("config", signingProperties.config);
				const preRequestOffset = signingProperties._preRequestSystemClockOffset;
				const newOffset = getUpdatedSystemClockOffset(serverTime, config.systemClockOffset);
				if ((newOffset !== config.systemClockOffset || preRequestOffset !== void 0 && preRequestOffset !== newOffset) && errorException.$metadata) {
					config.systemClockOffset = newOffset;
					errorException.$metadata.clockSkewCorrected = true;
				}
			}
			throw error;
		};
	}
	successHandler(httpResponse, signingProperties) {
		const dateHeader = getDateHeader(httpResponse);
		if (dateHeader) {
			const config = throwSigningPropertyError("config", signingProperties.config);
			config.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config.systemClockOffset);
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getArrayForCommaSeparatedString.js
var getArrayForCommaSeparatedString = (str) => typeof str === "string" && str.length > 0 ? str.split(",").map((item) => item.trim()) : [];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getBearerTokenEnvKey.js
var getBearerTokenEnvKey = (signingName) => `AWS_BEARER_TOKEN_${signingName.replace(/[\s-]/g, "_").toUpperCase()}`;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/NODE_AUTH_SCHEME_PREFERENCE_OPTIONS.js
var NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY = "AWS_AUTH_SCHEME_PREFERENCE";
var NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY = "auth_scheme_preference";
var NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = {
	environmentVariableSelector: (env, options) => {
		if (options?.signingName) {
			if (getBearerTokenEnvKey(options.signingName) in env) return ["httpBearerAuth"];
		}
		if (!(NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY in env)) return void 0;
		return getArrayForCommaSeparatedString(env[NODE_AUTH_SCHEME_PREFERENCE_ENV_KEY]);
	},
	configFileSelector: (profile) => {
		if (!(NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY in profile)) return void 0;
		return getArrayForCommaSeparatedString(profile[NODE_AUTH_SCHEME_PREFERENCE_CONFIG_KEY]);
	},
	default: []
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js
var resolveAwsSdkSigV4Config = (config) => {
	let inputCredentials = config.credentials;
	let isUserSupplied = !!config.credentials;
	let resolvedCredentials = void 0;
	Object.defineProperty(config, "credentials", {
		set(credentials) {
			if (credentials && credentials !== inputCredentials && credentials !== resolvedCredentials) isUserSupplied = true;
			inputCredentials = credentials;
			const boundProvider = bindCallerConfig(config, normalizeCredentialProvider(config, {
				credentials: inputCredentials,
				credentialDefaultProvider: config.credentialDefaultProvider
			}));
			if (isUserSupplied && !boundProvider.attributed) {
				const isCredentialObject = typeof inputCredentials === "object" && inputCredentials !== null;
				resolvedCredentials = async (options) => {
					const attributedCreds = await boundProvider(options);
					if (isCredentialObject && (!attributedCreds.$source || Object.keys(attributedCreds.$source).length === 0)) return setCredentialFeature(attributedCreds, "CREDENTIALS_CODE", "e");
					return attributedCreds;
				};
				resolvedCredentials.memoized = boundProvider.memoized;
				resolvedCredentials.configBound = boundProvider.configBound;
				resolvedCredentials.attributed = true;
			} else resolvedCredentials = boundProvider;
		},
		get() {
			return resolvedCredentials;
		},
		enumerable: true,
		configurable: true
	});
	config.credentials = inputCredentials;
	const { signingEscapePath = true, systemClockOffset = config.systemClockOffset || 0, sha256 } = config;
	let signer;
	if (config.signer) signer = normalizeProvider(config.signer);
	else if (config.regionInfoProvider) signer = () => normalizeProvider(config.region)().then(async (region) => [await config.regionInfoProvider(region, {
		useFipsEndpoint: await config.useFipsEndpoint(),
		useDualstackEndpoint: await config.useDualstackEndpoint()
	}) || {}, region]).then(([regionInfo, region]) => {
		const { signingRegion, signingService } = regionInfo;
		config.signingRegion = config.signingRegion || signingRegion || region;
		config.signingName = config.signingName || signingService || config.serviceId;
		const params = {
			...config,
			credentials: config.credentials,
			region: config.signingRegion,
			service: config.signingName,
			sha256,
			uriEscapePath: signingEscapePath
		};
		return new (config.signerConstructor || SignatureV4)(params);
	});
	else signer = async (authScheme) => {
		authScheme = Object.assign({}, {
			name: "sigv4",
			signingName: config.signingName || config.defaultSigningName,
			signingRegion: await normalizeProvider(config.region)(),
			properties: {}
		}, authScheme);
		const signingRegion = authScheme.signingRegion;
		const signingService = authScheme.signingName;
		config.signingRegion = config.signingRegion || signingRegion;
		config.signingName = config.signingName || signingService || config.serviceId;
		const params = {
			...config,
			credentials: config.credentials,
			region: config.signingRegion,
			service: config.signingName,
			sha256,
			uriEscapePath: signingEscapePath
		};
		return new (config.signerConstructor || SignatureV4)(params);
	};
	return Object.assign(config, {
		systemClockOffset,
		signingEscapePath,
		signer
	});
};
function normalizeCredentialProvider(config, { credentials, credentialDefaultProvider }) {
	let credentialsProvider;
	if (credentials) if (!credentials?.memoized) credentialsProvider = memoizeIdentityProvider(credentials, isIdentityExpired, doesIdentityRequireRefresh);
	else credentialsProvider = credentials;
	else if (credentialDefaultProvider) credentialsProvider = normalizeProvider(credentialDefaultProvider(Object.assign({}, config, { parentClientConfig: config })));
	else credentialsProvider = async () => {
		throw new Error("@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.");
	};
	credentialsProvider.memoized = true;
	return credentialsProvider;
}
function bindCallerConfig(config, credentialsProvider) {
	if (credentialsProvider.configBound) return credentialsProvider;
	const fn = async (options) => credentialsProvider({
		...options,
		callerClientConfig: config
	});
	fn.memoized = credentialsProvider.memoized;
	fn.configBound = true;
	return fn;
}
//#endregion
export { NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS as $, NODE_RETRY_MODE_CONFIG_OPTIONS as A, extendedEncodeURIComponent as B, getRecursionDetectionPlugin as C, setFeature as D, resolveHostHeaderConfig as E, resolveHttpHandlerRuntimeConfig as F, customEndpointFunctions as G, getEndpointPlugin as H, FromStringShapeDeserializer as I, resolveParams as J, EndpointCache as K, determineTimestampFormat as L, DEFAULT_RETRY_MODE as M, getContentLengthPlugin as N, getRetryPlugin as O, getHttpHandlerExtensionConfiguration as P, NODE_REGION_CONFIG_OPTIONS as Q, HttpProtocol as R, getHttpAuthSchemeEndpointRuleSetPlugin as S, getHostHeaderPlugin as T, resolveEndpointConfig as U, collectBody as V, decideEndpoint as W, resolveRegionConfig as X, resolveDefaultsModeConfig as Y, NODE_REGION_CONFIG_FILE_OPTIONS as Z, resolveUserAgentConfig as _, normalizeProvider$1 as _t, getSkewCorrectedDate as a, getDefaultExtensionConfiguration as at, getHttpSigningPlugin as b, ProtocolLib as c, loadConfigsForDefaultMode as ct, getAwsRegionExtensionConfiguration as d, TypeRegistry as dt, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS as et, resolveAwsRegionExtensionConfiguration as f, NormalizedSchema as ft, getUserAgentPlugin as g, Client as gt, createDefaultUserAgentProvider as h, deref as ht, validateSigningProperties as i, NoOpLogger as it, resolveRetryConfig as j, NODE_MAX_ATTEMPT_CONFIG_OPTIONS as k, SignatureV4 as l, ServiceException as lt, NODE_APP_ID_CONFIG_OPTIONS as m, getSchemaSerdePlugin as mt, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS as n, booleanSelector as nt, UnionSerde as o, resolveDefaultRuntimeConfig as ot, awsEndpointFunctions as p, translateTraits as pt, BinaryDecisionDiagram as q, AwsSdkSigV4Signer as r, makeBuilder as rt, SerdeContextConfig as s, emitWarningIfUnsupportedVersion as st, resolveAwsSdkSigV4Config as t, SelectorType as tt, Sha256Node as u, Command as ut, DefaultIdentityProviderConfig as v, getSmithyContext as vt, getLoggerPlugin as w, httpSigningMiddlewareOptions as x, normalizeProvider as y, emitWarningIfUnsupportedVersion$1 as yt, SerdeContext as z };
