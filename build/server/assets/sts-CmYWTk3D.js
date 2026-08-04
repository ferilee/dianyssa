import { $ as NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, A as NODE_RETRY_MODE_CONFIG_OPTIONS, B as extendedEncodeURIComponent, C as getRecursionDetectionPlugin, E as resolveHostHeaderConfig, F as resolveHttpHandlerRuntimeConfig, G as customEndpointFunctions, H as getEndpointPlugin, J as resolveParams, K as EndpointCache, L as determineTimestampFormat, M as DEFAULT_RETRY_MODE, N as getContentLengthPlugin, O as getRetryPlugin, P as getHttpHandlerExtensionConfiguration, Q as NODE_REGION_CONFIG_OPTIONS, R as HttpProtocol, S as getHttpAuthSchemeEndpointRuleSetPlugin, T as getHostHeaderPlugin, U as resolveEndpointConfig, V as collectBody, W as decideEndpoint, X as resolveRegionConfig, Y as resolveDefaultsModeConfig, Z as NODE_REGION_CONFIG_FILE_OPTIONS, _ as resolveUserAgentConfig, _t as normalizeProvider, at as getDefaultExtensionConfiguration, b as getHttpSigningPlugin, c as ProtocolLib, ct as loadConfigsForDefaultMode, d as getAwsRegionExtensionConfiguration, dt as TypeRegistry, et as NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, f as resolveAwsRegionExtensionConfiguration, ft as NormalizedSchema, g as getUserAgentPlugin, gt as Client, h as createDefaultUserAgentProvider, ht as deref, it as NoOpLogger, j as resolveRetryConfig, k as NODE_MAX_ATTEMPT_CONFIG_OPTIONS, lt as ServiceException, m as NODE_APP_ID_CONFIG_OPTIONS, mt as getSchemaSerdePlugin, n as NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, ot as resolveDefaultRuntimeConfig, p as awsEndpointFunctions, q as BinaryDecisionDiagram, r as AwsSdkSigV4Signer, rt as makeBuilder, s as SerdeContextConfig, st as emitWarningIfUnsupportedVersion, t as resolveAwsSdkSigV4Config, u as Sha256Node, v as DefaultIdentityProviderConfig, vt as getSmithyContext, w as getLoggerPlugin, yt as emitWarningIfUnsupportedVersion$1 } from "./resolveAwsSdkSigV4Config-D4g-ozje.js";
import { t as setCredentialFeature } from "./setCredentialFeature-B8gFd5oe.js";
import { t as HttpRequest } from "./httpRequest-MsxXbvEi.js";
import { t as NodeHttpHandler } from "./node-http-handler-ESuki7Pk.js";
import { r as parseUrl, t as loadConfig } from "./configLoader-BF4DGsON.js";
import { a as SignatureV4MultiRegion, i as XmlShapeDeserializer, n as resolveAwsSdkSigV4AConfig, r as AwsSdkSigV4ASigner, t as NODE_SIGV4A_CONFIG_OPTIONS } from "./resolveAwsSdkSigV4AConfig-c2d3O6iO.js";
import { D as toBase64, E as toUtf8, O as fromUtf8, a as streamCollector, k as fromBase64, n as generateIdempotencyToken, p as NumericValue, u as calculateBodyLength, x as dateToUtcString } from "./serde-DSMreXns.js";
import { n as NoAuthSigner, t as package_default } from "./package-DpJkjC9P.js";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/RpcProtocol.js
var RpcProtocol = class extends HttpProtocol {
	async serializeRequest(operationSchema, _input, context) {
		const serializer = this.serializer;
		const query = {};
		const headers = {};
		const endpoint = await context.endpoint();
		const ns = NormalizedSchema.of(operationSchema?.input);
		const schema = ns.getSchema();
		let payload;
		const input = _input && typeof _input === "object" ? _input : {};
		const request = new HttpRequest({
			protocol: "",
			hostname: "",
			port: void 0,
			path: "/",
			fragment: void 0,
			query,
			headers,
			body: void 0
		});
		if (endpoint) {
			this.updateServiceEndpoint(request, endpoint);
			this.setHostPrefix(request, operationSchema, input);
		}
		if (input) {
			const eventStreamMember = ns.getEventStreamMember();
			if (eventStreamMember) {
				if (input[eventStreamMember]) {
					const initialRequest = {};
					for (const [memberName, memberSchema] of ns.structIterator()) if (memberName !== eventStreamMember && input[memberName]) {
						serializer.write(memberSchema, input[memberName]);
						initialRequest[memberName] = serializer.flush();
					}
					payload = await this.serializeEventStream({
						eventStream: input[eventStreamMember],
						requestSchema: ns,
						initialRequest
					});
				}
			} else {
				serializer.write(schema, input);
				payload = serializer.flush();
			}
		}
		request.headers = Object.assign(request.headers, headers);
		request.query = query;
		request.body = payload;
		request.method = "POST";
		return request;
	}
	async deserializeResponse(operationSchema, context, response) {
		const deserializer = this.deserializer;
		const ns = NormalizedSchema.of(operationSchema.output);
		const dataObject = {};
		if (response.statusCode >= 300) {
			const bytes = await collectBody(response.body, context);
			if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(15, bytes));
			await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
			throw new Error("@smithy/core/protocols - RPC Protocol error handler failed to throw.");
		}
		for (const header in response.headers) {
			const value = response.headers[header];
			delete response.headers[header];
			response.headers[header.toLowerCase()] = value;
		}
		const eventStreamMember = ns.getEventStreamMember();
		if (eventStreamMember) dataObject[eventStreamMember] = await this.deserializeEventStream({
			response,
			responseSchema: ns,
			initialResponseContainer: dataObject
		});
		else {
			const bytes = await collectBody(response.body, context);
			if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(ns, bytes));
		}
		dataObject.$metadata = this.deserializeMetadata(response);
		return dataObject;
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/stsRegionDefaultResolver.js
function stsRegionDefaultResolver(loaderConfig = {}) {
	return loadConfig({
		...NODE_REGION_CONFIG_OPTIONS,
		async default() {
			if (!warning.silence) console.warn("@aws-sdk - WARN - default STS region of us-east-1 used. See @aws-sdk/credential-providers README and set a region explicitly.");
			return "us-east-1";
		}
	}, {
		...NODE_REGION_CONFIG_FILE_OPTIONS,
		...loaderConfig
	});
}
var warning = { silence: false };
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/protocols/query/QueryShapeSerializer.js
var QueryShapeSerializer = class extends SerdeContextConfig {
	settings;
	buffer;
	constructor(settings) {
		super();
		this.settings = settings;
	}
	write(schema, value, prefix = "") {
		if (this.buffer === void 0) this.buffer = "";
		const ns = NormalizedSchema.of(schema);
		if (prefix && !prefix.endsWith(".")) prefix += ".";
		if (ns.isBlobSchema()) {
			if (typeof value === "string" || value instanceof Uint8Array) {
				this.writeKey(prefix);
				this.writeValue((this.serdeContext?.base64Encoder ?? toBase64)(value));
			}
		} else if (ns.isBooleanSchema() || ns.isNumericSchema() || ns.isStringSchema()) {
			if (value != null) {
				this.writeKey(prefix);
				this.writeValue(String(value));
			} else if (ns.isIdempotencyToken()) {
				this.writeKey(prefix);
				this.writeValue(generateIdempotencyToken());
			}
		} else if (ns.isBigIntegerSchema()) {
			if (value != null) {
				this.writeKey(prefix);
				this.writeValue(String(value));
			}
		} else if (ns.isBigDecimalSchema()) {
			if (value != null) {
				this.writeKey(prefix);
				this.writeValue(value instanceof NumericValue ? value.string : String(value));
			}
		} else if (ns.isTimestampSchema()) {
			if (value instanceof Date) {
				this.writeKey(prefix);
				switch (determineTimestampFormat(ns, this.settings)) {
					case 5:
						this.writeValue(value.toISOString().replace(".000Z", "Z"));
						break;
					case 6:
						this.writeValue(dateToUtcString(value));
						break;
					case 7:
						this.writeValue(String(value.getTime() / 1e3));
						break;
				}
			}
		} else if (ns.isDocumentSchema()) if (Array.isArray(value)) this.write(79, value, prefix);
		else if (value instanceof Date) this.write(4, value, prefix);
		else if (value instanceof Uint8Array) this.write(21, value, prefix);
		else if (value && typeof value === "object") this.write(143, value, prefix);
		else {
			this.writeKey(prefix);
			this.writeValue(String(value));
		}
		else if (ns.isListSchema()) {
			if (Array.isArray(value)) if (value.length === 0) {
				if (this.settings.serializeEmptyLists) {
					this.writeKey(prefix);
					this.writeValue("");
				}
			} else {
				const member = ns.getValueSchema();
				const flat = this.settings.flattenLists || ns.getMergedTraits().xmlFlattened;
				let i = 1;
				for (const item of value) {
					if (item == null) continue;
					const traits = member.getMergedTraits();
					const suffix = this.getKey("member", traits.xmlName, traits.ec2QueryName);
					const key = flat ? `${prefix}${i}` : `${prefix}${suffix}.${i}`;
					this.write(member, item, key);
					++i;
				}
			}
		} else if (ns.isMapSchema()) {
			if (value && typeof value === "object") {
				const keySchema = ns.getKeySchema();
				const memberSchema = ns.getValueSchema();
				const flat = ns.getMergedTraits().xmlFlattened;
				let i = 1;
				for (const k in value) {
					const v = value[k];
					if (v == null) continue;
					const keyTraits = keySchema.getMergedTraits();
					const keySuffix = this.getKey("key", keyTraits.xmlName, keyTraits.ec2QueryName);
					const key = flat ? `${prefix}${i}.${keySuffix}` : `${prefix}entry.${i}.${keySuffix}`;
					const valTraits = memberSchema.getMergedTraits();
					const valueSuffix = this.getKey("value", valTraits.xmlName, valTraits.ec2QueryName);
					const valueKey = flat ? `${prefix}${i}.${valueSuffix}` : `${prefix}entry.${i}.${valueSuffix}`;
					this.write(keySchema, k, key);
					this.write(memberSchema, v, valueKey);
					++i;
				}
			}
		} else if (ns.isStructSchema()) {
			if (value && typeof value === "object") {
				let didWriteMember = false;
				for (const [memberName, member] of ns.structIterator()) {
					if (value[memberName] == null && !member.isIdempotencyToken()) continue;
					const traits = member.getMergedTraits();
					const suffix = this.getKey(memberName, traits.xmlName, traits.ec2QueryName, "struct");
					const key = `${prefix}${suffix}`;
					this.write(member, value[memberName], key);
					didWriteMember = true;
				}
				if (!didWriteMember && ns.isUnionSchema()) {
					const { $unknown } = value;
					if (Array.isArray($unknown)) {
						const [k, v] = $unknown;
						const key = `${prefix}${k}`;
						this.write(15, v, key);
					}
				}
			}
		} else if (ns.isUnitSchema()) {} else throw new Error(`@aws-sdk/core/protocols - QuerySerializer unrecognized schema type ${ns.getName(true)}`);
	}
	flush() {
		if (this.buffer === void 0) throw new Error("@aws-sdk/core/protocols - QuerySerializer cannot flush with nothing written to buffer.");
		const str = this.buffer;
		delete this.buffer;
		return str;
	}
	getKey(memberName, xmlName, ec2QueryName, keySource) {
		const { ec2, capitalizeKeys } = this.settings;
		if (ec2 && ec2QueryName) return ec2QueryName;
		const key = xmlName ?? memberName;
		if (capitalizeKeys && keySource === "struct") return key[0].toUpperCase() + key.slice(1);
		return key;
	}
	writeKey(key) {
		if (key.endsWith(".")) key = key.slice(0, key.length - 1);
		this.buffer += `&${extendedEncodeURIComponent(key)}=`;
	}
	writeValue(value) {
		this.buffer += extendedEncodeURIComponent(value);
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/protocols/query/AwsQueryProtocol.js
var AwsQueryProtocol = class extends RpcProtocol {
	options;
	serializer;
	deserializer;
	mixin = new ProtocolLib();
	constructor(options) {
		super({
			defaultNamespace: options.defaultNamespace,
			errorTypeRegistries: options.errorTypeRegistries
		});
		this.options = options;
		const settings = {
			timestampFormat: {
				useTrait: true,
				default: 5
			},
			httpBindings: false,
			xmlNamespace: options.xmlNamespace,
			serviceNamespace: options.defaultNamespace,
			serializeEmptyLists: true
		};
		this.serializer = new QueryShapeSerializer(settings);
		this.deserializer = new XmlShapeDeserializer(settings);
	}
	getShapeId() {
		return "aws.protocols#awsQuery";
	}
	setSerdeContext(serdeContext) {
		this.serializer.setSerdeContext(serdeContext);
		this.deserializer.setSerdeContext(serdeContext);
	}
	getPayloadCodec() {
		throw new Error("AWSQuery protocol has no payload codec.");
	}
	async serializeRequest(operationSchema, input, context) {
		const request = await super.serializeRequest(operationSchema, input, context);
		if (!request.path.endsWith("/")) request.path += "/";
		request.headers["content-type"] = "application/x-www-form-urlencoded";
		if (deref(operationSchema.input) === "unit" || !request.body) request.body = "";
		request.body = `Action=${operationSchema.name.split("#")[1] ?? operationSchema.name}&Version=${this.options.version}` + request.body;
		if (request.body.endsWith("&")) request.body = request.body.slice(-1);
		return request;
	}
	async deserializeResponse(operationSchema, context, response) {
		const deserializer = this.deserializer;
		const ns = NormalizedSchema.of(operationSchema.output);
		const dataObject = {};
		if (response.statusCode >= 300) {
			const bytes = await collectBody(response.body, context);
			if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(15, bytes));
			await this.handleError(operationSchema, context, response, dataObject, this.deserializeMetadata(response));
		}
		for (const header in response.headers) {
			const value = response.headers[header];
			delete response.headers[header];
			response.headers[header.toLowerCase()] = value;
		}
		const shortName = operationSchema.name.split("#")[1] ?? operationSchema.name;
		const awsQueryResultKey = ns.isStructSchema() && this.useNestedResult() ? shortName + "Result" : void 0;
		const bytes = await collectBody(response.body, context);
		if (bytes.byteLength > 0) Object.assign(dataObject, await deserializer.read(ns, bytes, awsQueryResultKey));
		dataObject.$metadata = this.deserializeMetadata(response);
		return dataObject;
	}
	useNestedResult() {
		return true;
	}
	async handleError(operationSchema, context, response, dataObject, metadata) {
		const errorIdentifier = this.loadQueryErrorCode(response, dataObject) ?? "Unknown";
		this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
		const errorData = this.loadQueryError(dataObject) ?? {};
		const message = this.loadQueryErrorMessage(dataObject);
		errorData.message = message;
		errorData.Error = {
			Type: errorData.Type,
			Code: errorData.Code,
			Message: message
		};
		const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, errorData, metadata, this.mixin.findQueryCompatibleError);
		const ns = NormalizedSchema.of(errorSchema);
		const exception = new ((this.compositeErrorRegistry.getErrorCtor(errorSchema)) ?? Error)({});
		const output = {
			Type: errorData.Error.Type,
			Code: errorData.Error.Code,
			Error: errorData.Error
		};
		for (const [name, member] of ns.structIterator()) {
			const target = member.getMergedTraits().xmlName ?? name;
			const value = errorData[target] ?? dataObject[target];
			output[name] = this.deserializer.readSchema(member, value);
		}
		throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
			$fault: ns.getMergedTraits().error,
			message
		}, output), dataObject);
	}
	loadQueryErrorCode(output, data) {
		const code = (data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error)?.Code;
		if (code !== void 0) return code;
		if (output.statusCode == 404) return "NotFound";
	}
	loadQueryError(data) {
		return data.Errors?.[0]?.Error ?? data.Errors?.Error ?? data.Error;
	}
	loadQueryErrorMessage(data) {
		const errorData = this.loadQueryError(data);
		return errorData?.message ?? errorData?.Message ?? data.message ?? data.Message ?? "Unknown";
	}
	getDefaultContentType() {
		return "application/x-www-form-urlencoded";
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/bdd.js
var q = "ref";
var a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "stringEquals", g = "getAttr", h = "us-east-1", i = "sigv4", j = "sts", k = "https://sts.{Region}.{PartitionResult#dnsSuffix}", l = { [q]: "Endpoint" }, m = { [q]: "Region" }, n = { [q]: d }, o = {}, p = [m];
var _data = {
	conditions: [
		[c, [l]],
		[c, p],
		[
			"aws.partition",
			p,
			d
		],
		[e, [{ [q]: "UseFIPS" }, b]],
		[e, [{ [q]: "UseDualStack" }, b]],
		[f, [m, "aws-global"]],
		[e, [{ [q]: "UseGlobalEndpoint" }, b]],
		[f, [m, "eu-central-1"]],
		[e, [{
			fn: g,
			argv: [n, "supportsDualStack"]
		}, b]],
		[e, [{
			fn: g,
			argv: [n, "supportsFIPS"]
		}, b]],
		[f, [m, "ap-south-1"]],
		[f, [m, "eu-north-1"]],
		[f, [m, "eu-west-1"]],
		[f, [m, "eu-west-2"]],
		[f, [m, "eu-west-3"]],
		[f, [m, "sa-east-1"]],
		[f, [m, h]],
		[f, [m, "us-east-2"]],
		[f, [m, "us-west-2"]],
		[f, [m, "us-west-1"]],
		[f, [m, "ca-central-1"]],
		[f, [m, "ap-southeast-1"]],
		[f, [m, "ap-northeast-1"]],
		[f, [m, "ap-southeast-2"]],
		[f, [{
			fn: g,
			argv: [n, "name"]
		}, "aws-us-gov"]]
	],
	results: [
		[a],
		["https://sts.amazonaws.com", { authSchemes: [{
			name: i,
			signingName: j,
			signingRegion: h
		}] }],
		[k, { authSchemes: [{
			name: i,
			signingName: j,
			signingRegion: "{Region}"
		}] }],
		[a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
		[a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
		[l, o],
		["https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
		[a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
		["https://sts.{Region}.amazonaws.com", o],
		["https://sts-fips.{Region}.{PartitionResult#dnsSuffix}", o],
		[a, "FIPS is enabled but this partition does not support FIPS"],
		["https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
		[a, "DualStack is enabled but this partition does not support DualStack"],
		[k, o],
		[a, "Invalid Configuration: Missing Region"]
	]
};
var root = 2;
var nodes = new Int32Array([
	-1,
	1,
	-1,
	0,
	30,
	3,
	1,
	4,
	100000014,
	2,
	5,
	100000014,
	3,
	25,
	6,
	4,
	24,
	7,
	5,
	100000001,
	8,
	6,
	9,
	100000013,
	7,
	100000001,
	10,
	10,
	100000001,
	11,
	11,
	100000001,
	12,
	12,
	100000001,
	13,
	13,
	100000001,
	14,
	14,
	100000001,
	15,
	15,
	100000001,
	16,
	16,
	100000001,
	17,
	17,
	100000001,
	18,
	18,
	100000001,
	19,
	19,
	100000001,
	20,
	20,
	100000001,
	21,
	21,
	100000001,
	22,
	22,
	100000001,
	23,
	23,
	100000001,
	100000002,
	8,
	100000011,
	100000012,
	4,
	28,
	26,
	9,
	27,
	100000010,
	24,
	100000008,
	100000009,
	8,
	29,
	100000007,
	9,
	100000006,
	100000007,
	3,
	100000003,
	31,
	4,
	100000004,
	100000005
]);
var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/endpointResolver.js
var cache = new EndpointCache({
	size: 50,
	params: [
		"Endpoint",
		"Region",
		"UseDualStack",
		"UseFIPS",
		"UseGlobalEndpoint"
	]
});
var defaultEndpointResolver = (endpointParams, context = {}) => {
	return cache.get(endpointParams, () => decideEndpoint(bdd, {
		endpointParams,
		logger: context.logger
	}));
};
customEndpointFunctions.aws = awsEndpointFunctions;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/auth/httpAuthSchemeProvider.js
var createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
	if (!input) throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
	const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
	const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
	if (!instructionsFn) throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
	const endpointParameters = await resolveParams(input, { getEndpointParameterInstructions: instructionsFn }, config);
	return Object.assign(defaultParameters, endpointParameters);
};
var _defaultSTSHttpAuthSchemeParametersProvider = async (config, context, input) => {
	return {
		operation: getSmithyContext(context).operation,
		region: await normalizeProvider(config.region)() || (() => {
			throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
		})()
	};
};
var defaultSTSHttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultSTSHttpAuthSchemeParametersProvider);
function createAwsAuthSigv4HttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "sts",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4a",
		signingProperties: {
			name: "sts",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
	return { schemeId: "smithy.api#noAuth" };
}
var createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
	const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
		const authSchemes = defaultEndpointResolver(authParameters).properties?.authSchemes;
		if (!authSchemes) return defaultHttpAuthSchemeResolver(authParameters);
		const options = [];
		for (const scheme of authSchemes) {
			const { name: resolvedName, properties = {}, ...rest } = scheme;
			const name = resolvedName.toLowerCase();
			if (resolvedName !== name) console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
			let schemeId;
			if (name === "sigv4a") {
				schemeId = "aws.auth#sigv4a";
				const sigv4Present = authSchemes.find((s) => {
					const name = s.name.toLowerCase();
					return name !== "sigv4a" && name.startsWith("sigv4");
				});
				if (SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) continue;
			} else if (name.startsWith("sigv4")) schemeId = "aws.auth#sigv4";
			else throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
			const createOption = createHttpAuthOptionFunctions[schemeId];
			if (!createOption) throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
			const option = createOption(authParameters);
			option.schemeId = schemeId;
			option.signingProperties = {
				...option.signingProperties || {},
				...rest,
				...properties
			};
			options.push(option);
		}
		return options;
	};
	return endpointRuleSetHttpAuthSchemeProvider;
};
var _defaultSTSHttpAuthSchemeProvider = (authParameters) => {
	const options = [];
	switch (authParameters.operation) {
		case "AssumeRoleWithWebIdentity":
			options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
			options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
			break;
		default:
			options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
			options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
	}
	return options;
};
var defaultSTSHttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultSTSHttpAuthSchemeProvider, {
	"aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
	"aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption,
	"smithy.api#noAuth": createSmithyApiNoAuthHttpAuthOption
});
var resolveHttpAuthSchemeConfig = (config) => {
	const config_1 = resolveAwsSdkSigV4AConfig(resolveAwsSdkSigV4Config(config));
	return Object.assign(config_1, { authSchemePreference: normalizeProvider(config.authSchemePreference ?? []) });
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
	return Object.assign(options, {
		useDualstackEndpoint: options.useDualstackEndpoint ?? false,
		useFipsEndpoint: options.useFipsEndpoint ?? false,
		useGlobalEndpoint: options.useGlobalEndpoint ?? false,
		defaultSigningName: "sts"
	});
};
var commonParams = {
	UseGlobalEndpoint: {
		type: "builtInParams",
		name: "useGlobalEndpoint"
	},
	UseFIPS: {
		type: "builtInParams",
		name: "useFipsEndpoint"
	},
	Endpoint: {
		type: "builtInParams",
		name: "endpoint"
	},
	Region: {
		type: "builtInParams",
		name: "region"
	},
	UseDualStack: {
		type: "builtInParams",
		name: "useDualstackEndpoint"
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/STSServiceException.js
var STSServiceException = class STSServiceException extends ServiceException {
	constructor(options) {
		super(options);
		Object.setPrototypeOf(this, STSServiceException.prototype);
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/errors.js
var ExpiredTokenException = class ExpiredTokenException extends STSServiceException {
	name = "ExpiredTokenException";
	$fault = "client";
	constructor(opts) {
		super({
			name: "ExpiredTokenException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ExpiredTokenException.prototype);
	}
};
var MalformedPolicyDocumentException = class MalformedPolicyDocumentException extends STSServiceException {
	name = "MalformedPolicyDocumentException";
	$fault = "client";
	constructor(opts) {
		super({
			name: "MalformedPolicyDocumentException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, MalformedPolicyDocumentException.prototype);
	}
};
var PackedPolicyTooLargeException = class PackedPolicyTooLargeException extends STSServiceException {
	name = "PackedPolicyTooLargeException";
	$fault = "client";
	constructor(opts) {
		super({
			name: "PackedPolicyTooLargeException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, PackedPolicyTooLargeException.prototype);
	}
};
var RegionDisabledException = class RegionDisabledException extends STSServiceException {
	name = "RegionDisabledException";
	$fault = "client";
	constructor(opts) {
		super({
			name: "RegionDisabledException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, RegionDisabledException.prototype);
	}
};
var IDPRejectedClaimException = class IDPRejectedClaimException extends STSServiceException {
	name = "IDPRejectedClaimException";
	$fault = "client";
	constructor(opts) {
		super({
			name: "IDPRejectedClaimException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, IDPRejectedClaimException.prototype);
	}
};
var InvalidIdentityTokenException = class InvalidIdentityTokenException extends STSServiceException {
	name = "InvalidIdentityTokenException";
	$fault = "client";
	constructor(opts) {
		super({
			name: "InvalidIdentityTokenException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidIdentityTokenException.prototype);
	}
};
var IDPCommunicationErrorException = class IDPCommunicationErrorException extends STSServiceException {
	name = "IDPCommunicationErrorException";
	$fault = "client";
	$retryable = {};
	constructor(opts) {
		super({
			name: "IDPCommunicationErrorException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, IDPCommunicationErrorException.prototype);
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/schemas/schemas_0.js
var _A = "Arn";
var _AKI = "AccessKeyId";
var _AR = "AssumeRole";
var _ARI = "AssumedRoleId";
var _ARR = "AssumeRoleRequest";
var _ARRs = "AssumeRoleResponse";
var _ARU = "AssumedRoleUser";
var _ARWWI = "AssumeRoleWithWebIdentity";
var _ARWWIR = "AssumeRoleWithWebIdentityRequest";
var _ARWWIRs = "AssumeRoleWithWebIdentityResponse";
var _Au = "Audience";
var _C = "Credentials";
var _CA = "ContextAssertion";
var _DS = "DurationSeconds";
var _E = "Expiration";
var _EI = "ExternalId";
var _ETE = "ExpiredTokenException";
var _IDPCEE = "IDPCommunicationErrorException";
var _IDPRCE = "IDPRejectedClaimException";
var _IITE = "InvalidIdentityTokenException";
var _K = "Key";
var _MPDE = "MalformedPolicyDocumentException";
var _P = "Policy";
var _PA = "PolicyArns";
var _PAr = "ProviderArn";
var _PC = "ProvidedContexts";
var _PCLT = "ProvidedContextsListType";
var _PCr = "ProvidedContext";
var _PDT = "PolicyDescriptorType";
var _PI = "ProviderId";
var _PPS = "PackedPolicySize";
var _PPTLE = "PackedPolicyTooLargeException";
var _Pr = "Provider";
var _RA = "RoleArn";
var _RDE = "RegionDisabledException";
var _RSN = "RoleSessionName";
var _SAK = "SecretAccessKey";
var _SFWIT = "SubjectFromWebIdentityToken";
var _SI = "SourceIdentity";
var _SN = "SerialNumber";
var _ST = "SessionToken";
var _T = "Tags";
var _TC = "TokenCode";
var _TTK = "TransitiveTagKeys";
var _Ta = "Tag";
var _V = "Value";
var _WIT = "WebIdentityToken";
var _a = "arn";
var _aKST = "accessKeySecretType";
var _aQE = "awsQueryError";
var _c = "client";
var _cTT = "clientTokenType";
var _e = "error";
var _hE = "httpError";
var _m = "message";
var _pDLT = "policyDescriptorListType";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.sts";
var _tLT = "tagListType";
var n0 = "com.amazonaws.sts";
var _s_registry = TypeRegistry.for(_s);
var STSServiceException$ = [
	-3,
	_s,
	"STSServiceException",
	0,
	[],
	[]
];
_s_registry.registerError(STSServiceException$, STSServiceException);
var n0_registry = TypeRegistry.for(n0);
var ExpiredTokenException$ = [
	-3,
	n0,
	_ETE,
	{
		[_aQE]: [`ExpiredTokenException`, 400],
		[_e]: _c,
		[_hE]: 400
	},
	[_m],
	[0]
];
n0_registry.registerError(ExpiredTokenException$, ExpiredTokenException);
var IDPCommunicationErrorException$ = [
	-3,
	n0,
	_IDPCEE,
	{
		[_aQE]: [`IDPCommunicationError`, 400],
		[_e]: _c,
		[_hE]: 400
	},
	[_m],
	[0]
];
n0_registry.registerError(IDPCommunicationErrorException$, IDPCommunicationErrorException);
var IDPRejectedClaimException$ = [
	-3,
	n0,
	_IDPRCE,
	{
		[_aQE]: [`IDPRejectedClaim`, 403],
		[_e]: _c,
		[_hE]: 403
	},
	[_m],
	[0]
];
n0_registry.registerError(IDPRejectedClaimException$, IDPRejectedClaimException);
var InvalidIdentityTokenException$ = [
	-3,
	n0,
	_IITE,
	{
		[_aQE]: [`InvalidIdentityToken`, 400],
		[_e]: _c,
		[_hE]: 400
	},
	[_m],
	[0]
];
n0_registry.registerError(InvalidIdentityTokenException$, InvalidIdentityTokenException);
var MalformedPolicyDocumentException$ = [
	-3,
	n0,
	_MPDE,
	{
		[_aQE]: [`MalformedPolicyDocument`, 400],
		[_e]: _c,
		[_hE]: 400
	},
	[_m],
	[0]
];
n0_registry.registerError(MalformedPolicyDocumentException$, MalformedPolicyDocumentException);
var PackedPolicyTooLargeException$ = [
	-3,
	n0,
	_PPTLE,
	{
		[_aQE]: [`PackedPolicyTooLarge`, 400],
		[_e]: _c,
		[_hE]: 400
	},
	[_m],
	[0]
];
n0_registry.registerError(PackedPolicyTooLargeException$, PackedPolicyTooLargeException);
var RegionDisabledException$ = [
	-3,
	n0,
	_RDE,
	{
		[_aQE]: [`RegionDisabledException`, 403],
		[_e]: _c,
		[_hE]: 403
	},
	[_m],
	[0]
];
n0_registry.registerError(RegionDisabledException$, RegionDisabledException);
var errorTypeRegistries = [_s_registry, n0_registry];
var accessKeySecretType = [
	0,
	n0,
	_aKST,
	8,
	0
];
var clientTokenType = [
	0,
	n0,
	_cTT,
	8,
	0
];
var AssumedRoleUser$ = [
	3,
	n0,
	_ARU,
	0,
	[_ARI, _A],
	[0, 0],
	2
];
var AssumeRoleRequest$ = [
	3,
	n0,
	_ARR,
	0,
	[
		_RA,
		_RSN,
		_PA,
		_P,
		_DS,
		_T,
		_TTK,
		_EI,
		_SN,
		_TC,
		_SI,
		_PC
	],
	[
		0,
		0,
		() => policyDescriptorListType,
		0,
		1,
		() => tagListType,
		64,
		0,
		0,
		0,
		0,
		() => ProvidedContextsListType
	],
	2
];
var AssumeRoleResponse$ = [
	3,
	n0,
	_ARRs,
	0,
	[
		_C,
		_ARU,
		_PPS,
		_SI
	],
	[
		[() => Credentials$, 0],
		() => AssumedRoleUser$,
		1,
		0
	]
];
var AssumeRoleWithWebIdentityRequest$ = [
	3,
	n0,
	_ARWWIR,
	0,
	[
		_RA,
		_RSN,
		_WIT,
		_PI,
		_PA,
		_P,
		_DS
	],
	[
		0,
		0,
		[() => clientTokenType, 0],
		0,
		() => policyDescriptorListType,
		0,
		1
	],
	3
];
var AssumeRoleWithWebIdentityResponse$ = [
	3,
	n0,
	_ARWWIRs,
	0,
	[
		_C,
		_SFWIT,
		_ARU,
		_PPS,
		_Pr,
		_Au,
		_SI
	],
	[
		[() => Credentials$, 0],
		0,
		() => AssumedRoleUser$,
		1,
		0,
		0,
		0
	]
];
var Credentials$ = [
	3,
	n0,
	_C,
	0,
	[
		_AKI,
		_SAK,
		_ST,
		_E
	],
	[
		0,
		[() => accessKeySecretType, 0],
		0,
		4
	],
	4
];
var PolicyDescriptorType$ = [
	3,
	n0,
	_PDT,
	0,
	[_a],
	[0]
];
var ProvidedContext$ = [
	3,
	n0,
	_PCr,
	0,
	[_PAr, _CA],
	[0, 0]
];
var Tag$ = [
	3,
	n0,
	_Ta,
	0,
	[_K, _V],
	[0, 0],
	2
];
var policyDescriptorListType = [
	1,
	n0,
	_pDLT,
	0,
	() => PolicyDescriptorType$
];
var ProvidedContextsListType = [
	1,
	n0,
	_PCLT,
	0,
	() => ProvidedContext$
];
var tagListType = [
	1,
	n0,
	_tLT,
	0,
	() => Tag$
];
var AssumeRole$ = [
	9,
	n0,
	_AR,
	0,
	() => AssumeRoleRequest$,
	() => AssumeRoleResponse$
];
var AssumeRoleWithWebIdentity$ = [
	9,
	n0,
	_ARWWI,
	0,
	() => AssumeRoleWithWebIdentityRequest$,
	() => AssumeRoleWithWebIdentityResponse$
];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeConfig.shared.js
var getRuntimeConfig$1 = (config) => {
	return {
		apiVersion: "2011-06-15",
		base64Decoder: config?.base64Decoder ?? fromBase64,
		base64Encoder: config?.base64Encoder ?? toBase64,
		disableHostPrefix: config?.disableHostPrefix ?? false,
		endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
		extensions: config?.extensions ?? [],
		httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSTSHttpAuthSchemeProvider,
		httpAuthSchemes: config?.httpAuthSchemes ?? [
			{
				schemeId: "aws.auth#sigv4",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
				signer: new AwsSdkSigV4Signer()
			},
			{
				schemeId: "aws.auth#sigv4a",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
				signer: new AwsSdkSigV4ASigner()
			},
			{
				schemeId: "smithy.api#noAuth",
				identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
				signer: new NoAuthSigner()
			}
		],
		logger: config?.logger ?? new NoOpLogger(),
		protocol: config?.protocol ?? AwsQueryProtocol,
		protocolSettings: config?.protocolSettings ?? {
			defaultNamespace: "com.amazonaws.sts",
			errorTypeRegistries,
			xmlNamespace: "https://sts.amazonaws.com/doc/2011-06-15/",
			version: "2011-06-15",
			serviceTarget: "AWSSecurityTokenServiceV20110615"
		},
		serviceId: config?.serviceId ?? "STS",
		sha256: config?.sha256 ?? Sha256Node,
		signerConstructor: config?.signerConstructor ?? SignatureV4MultiRegion,
		urlParser: config?.urlParser ?? parseUrl,
		utf8Decoder: config?.utf8Decoder ?? fromUtf8,
		utf8Encoder: config?.utf8Encoder ?? toUtf8
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeConfig.js
var getRuntimeConfig = (config) => {
	emitWarningIfUnsupportedVersion(process.version);
	const defaultsMode = resolveDefaultsModeConfig(config);
	const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
	const clientSharedValues = getRuntimeConfig$1(config);
	emitWarningIfUnsupportedVersion$1(process.version);
	const loaderConfig = {
		profile: config?.profile,
		logger: clientSharedValues.logger
	};
	return {
		...clientSharedValues,
		...config,
		runtime: "node",
		defaultsMode,
		authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
		bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
		defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({
			serviceId: clientSharedValues.serviceId,
			clientVersion: package_default.version
		}),
		httpAuthSchemes: config?.httpAuthSchemes ?? [
			{
				schemeId: "aws.auth#sigv4",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4") || (async (idProps) => await config.credentialDefaultProvider(idProps?.__config || {})()),
				signer: new AwsSdkSigV4Signer()
			},
			{
				schemeId: "aws.auth#sigv4a",
				identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
				signer: new AwsSdkSigV4ASigner()
			},
			{
				schemeId: "smithy.api#noAuth",
				identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
				signer: new NoAuthSigner()
			}
		],
		maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
		region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, {
			...NODE_REGION_CONFIG_FILE_OPTIONS,
			...loaderConfig
		}),
		requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
		retryMode: config?.retryMode ?? loadConfig({
			...NODE_RETRY_MODE_CONFIG_OPTIONS,
			default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE
		}, config),
		sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? loadConfig(NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
		streamCollector: config?.streamCollector ?? streamCollector,
		useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
	const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
	let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
	let _credentials = runtimeConfig.credentials;
	return {
		setHttpAuthScheme(httpAuthScheme) {
			const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
			if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
			else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
		},
		httpAuthSchemes() {
			return _httpAuthSchemes;
		},
		setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
			_httpAuthSchemeProvider = httpAuthSchemeProvider;
		},
		httpAuthSchemeProvider() {
			return _httpAuthSchemeProvider;
		},
		setCredentials(credentials) {
			_credentials = credentials;
		},
		credentials() {
			return _credentials;
		}
	};
};
var resolveHttpAuthRuntimeConfig = (config) => {
	return {
		httpAuthSchemes: config.httpAuthSchemes(),
		httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
		credentials: config.credentials()
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
	const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
	extensions.forEach((extension) => extension.configure(extensionConfiguration));
	return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/STSClient.js
var STSClient = class extends Client {
	config;
	constructor(...[configuration]) {
		const _config_0 = getRuntimeConfig(configuration || {});
		super(_config_0);
		this.initConfig = _config_0;
		const _config_8 = resolveRuntimeExtensions(resolveHttpAuthSchemeConfig(resolveEndpointConfig(resolveHostHeaderConfig(resolveRegionConfig(resolveRetryConfig(resolveUserAgentConfig(resolveClientEndpointParameters(_config_0))))))), configuration?.extensions || []);
		this.config = _config_8;
		this.middlewareStack.use(getSchemaSerdePlugin(this.config));
		this.middlewareStack.use(getUserAgentPlugin(this.config));
		this.middlewareStack.use(getRetryPlugin(this.config));
		this.middlewareStack.use(getContentLengthPlugin(this.config));
		this.middlewareStack.use(getHostHeaderPlugin(this.config));
		this.middlewareStack.use(getLoggerPlugin(this.config));
		this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
		this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
			httpAuthSchemeParametersProvider: defaultSTSHttpAuthSchemeParametersProvider,
			identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
				"aws.auth#sigv4": config.credentials,
				"aws.auth#sigv4a": config.credentials
			})
		}));
		this.middlewareStack.use(getHttpSigningPlugin(this.config));
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commandBuilder.js
var command = makeBuilder(commonParams, "AWSSecurityTokenServiceV20110615", "STSClient", getEndpointPlugin);
var _ep0 = {};
var _mw0 = (Command, cs, config, o) => [];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/AssumeRoleCommand.js
var AssumeRoleCommand = class extends command(_ep0, _mw0, "AssumeRole", AssumeRole$) {};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/AssumeRoleWithWebIdentityCommand.js
var AssumeRoleWithWebIdentityCommand = class extends command(_ep0, _mw0, "AssumeRoleWithWebIdentity", AssumeRoleWithWebIdentity$) {};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/defaultStsRoleAssumers.js
var getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
	if (typeof assumedRoleUser?.Arn === "string") {
		const arnComponents = assumedRoleUser.Arn.split(":");
		if (arnComponents.length > 4 && arnComponents[4] !== "") return arnComponents[4];
	}
};
var resolveRegion = async (_region, _parentRegion, credentialProviderLogger, loaderConfig = {}) => {
	const region = typeof _region === "function" ? await _region() : _region;
	const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
	let stsDefaultRegion = "";
	const resolvedRegion = region ?? parentRegion ?? (stsDefaultRegion = await stsRegionDefaultResolver(loaderConfig)());
	credentialProviderLogger?.debug?.("@aws-sdk/client-sts::resolveRegion", "accepting first of:", `${region} (credential provider clientConfig)`, `${parentRegion} (contextual client)`, `${stsDefaultRegion} (STS default: AWS_REGION, profile region, or us-east-1)`);
	return resolvedRegion;
};
var getDefaultRoleAssumer$1 = (stsOptions, STSClient) => {
	let stsClient;
	let closureSourceCreds;
	return async (sourceCreds, params) => {
		closureSourceCreds = sourceCreds;
		if (!stsClient) {
			const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
			const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
				logger,
				profile
			});
			const isCompatibleRequestHandler = !isH2(requestHandler);
			stsClient = new STSClient({
				...stsOptions,
				userAgentAppId,
				profile,
				credentialDefaultProvider: () => async () => closureSourceCreds,
				region: resolvedRegion,
				requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
				logger
			});
		}
		const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
		if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
		const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
		const credentials = {
			accessKeyId: Credentials.AccessKeyId,
			secretAccessKey: Credentials.SecretAccessKey,
			sessionToken: Credentials.SessionToken,
			expiration: Credentials.Expiration,
			...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
			...accountId && { accountId }
		};
		setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
		return credentials;
	};
};
var getDefaultRoleAssumerWithWebIdentity$1 = (stsOptions, STSClient) => {
	let stsClient;
	return async (params) => {
		if (!stsClient) {
			const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
			const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
				logger,
				profile
			});
			const isCompatibleRequestHandler = !isH2(requestHandler);
			stsClient = new STSClient({
				...stsOptions,
				userAgentAppId,
				profile,
				region: resolvedRegion,
				requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
				logger
			});
		}
		const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
		if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
		const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
		const credentials = {
			accessKeyId: Credentials.AccessKeyId,
			secretAccessKey: Credentials.SecretAccessKey,
			sessionToken: Credentials.SessionToken,
			expiration: Credentials.Expiration,
			...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
			...accountId && { accountId }
		};
		if (accountId) setCredentialFeature(credentials, "RESOLVED_ACCOUNT_ID", "T");
		setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
		return credentials;
	};
};
var isH2 = (requestHandler) => {
	return requestHandler?.metadata?.handlerProtocol === "h2";
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/defaultRoleAssumers.js
var getCustomizableStsClientCtor = (baseCtor, customizations) => {
	if (!customizations) return baseCtor;
	else return class CustomizableSTSClient extends baseCtor {
		constructor(config) {
			super(config);
			for (const customization of customizations) this.middlewareStack.use(customization);
		}
	};
};
var getDefaultRoleAssumer = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumer$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
var getDefaultRoleAssumerWithWebIdentity = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumerWithWebIdentity$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
//#endregion
export { getDefaultRoleAssumer, getDefaultRoleAssumerWithWebIdentity };
