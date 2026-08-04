import { $ as NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, A as NODE_RETRY_MODE_CONFIG_OPTIONS, C as getRecursionDetectionPlugin, E as resolveHostHeaderConfig, F as resolveHttpHandlerRuntimeConfig, G as customEndpointFunctions, H as getEndpointPlugin, K as EndpointCache, M as DEFAULT_RETRY_MODE, N as getContentLengthPlugin, O as getRetryPlugin, P as getHttpHandlerExtensionConfiguration, Q as NODE_REGION_CONFIG_OPTIONS, S as getHttpAuthSchemeEndpointRuleSetPlugin, T as getHostHeaderPlugin, U as resolveEndpointConfig, W as decideEndpoint, X as resolveRegionConfig, Y as resolveDefaultsModeConfig, Z as NODE_REGION_CONFIG_FILE_OPTIONS, _ as resolveUserAgentConfig, _t as normalizeProvider, at as getDefaultExtensionConfiguration, b as getHttpSigningPlugin, ct as loadConfigsForDefaultMode, d as getAwsRegionExtensionConfiguration, dt as TypeRegistry, et as NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, f as resolveAwsRegionExtensionConfiguration, g as getUserAgentPlugin, gt as Client, h as createDefaultUserAgentProvider, it as NoOpLogger, j as resolveRetryConfig, k as NODE_MAX_ATTEMPT_CONFIG_OPTIONS, lt as ServiceException, m as NODE_APP_ID_CONFIG_OPTIONS, mt as getSchemaSerdePlugin, n as NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, ot as resolveDefaultRuntimeConfig, p as awsEndpointFunctions, q as BinaryDecisionDiagram, r as AwsSdkSigV4Signer, rt as makeBuilder, st as emitWarningIfUnsupportedVersion, t as resolveAwsSdkSigV4Config, u as Sha256Node, v as DefaultIdentityProviderConfig, vt as getSmithyContext, w as getLoggerPlugin, yt as emitWarningIfUnsupportedVersion$1 } from "./resolveAwsSdkSigV4Config-D4g-ozje.js";
import { t as NodeHttpHandler } from "./node-http-handler-ESuki7Pk.js";
import { r as parseUrl, t as loadConfig } from "./configLoader-BF4DGsON.js";
import { D as toBase64, E as toUtf8, O as fromUtf8, a as streamCollector, k as fromBase64, u as calculateBodyLength } from "./serde-DSMreXns.js";
import { n as NoAuthSigner, t as package_default } from "./package-DpJkjC9P.js";
import { t as AwsRestJsonProtocol } from "./AwsRestJsonProtocol-Dv8IHvsm.js";
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/auth/httpAuthSchemeProvider.js
var defaultSigninHttpAuthSchemeParametersProvider = async (config, context, input) => {
	return {
		operation: getSmithyContext(context).operation,
		region: await normalizeProvider(config.region)() || (() => {
			throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
		})()
	};
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "signin",
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
var defaultSigninHttpAuthSchemeProvider = (authParameters) => {
	const options = [];
	switch (authParameters.operation) {
		case "CreateOAuth2Token":
			options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
			break;
		default: options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
	}
	return options;
};
var resolveHttpAuthSchemeConfig = (config) => {
	const config_0 = resolveAwsSdkSigV4Config(config);
	return Object.assign(config_0, { authSchemePreference: normalizeProvider(config.authSchemePreference ?? []) });
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
	return Object.assign(options, {
		useDualstackEndpoint: options.useDualstackEndpoint ?? false,
		useFipsEndpoint: options.useFipsEndpoint ?? false,
		defaultSigningName: "signin"
	});
};
var commonParams = {
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/endpoint/bdd.js
var s = "ref";
var a = -1, b = false, c = true, d = "isSet", e = "booleanEquals", f = "coalesce", g = "PartitionResult", h = "stringEquals", i = "getAttr", j = "https://signin.{Region}.{PartitionResult#dualStackDnsSuffix}", k = { [s]: "Endpoint" }, l = {
	"fn": i,
	"argv": [{ [s]: g }, "name"]
}, m = { [s]: "Region" }, n = { [s]: g }, o = { "authSchemes": [{
	"name": "sigv4",
	"signingName": "signin",
	"signingRegion": "{Region}"
}] }, p = {}, q = [m];
var _data = {
	conditions: [
		[d, q],
		[e, [{
			fn: f,
			argv: [{ [s]: "IsControlPlane" }, b]
		}, c]],
		[d, [k]],
		[
			"aws.partition",
			q,
			g
		],
		[e, [{ [s]: "UseFIPS" }, c]],
		[h, [l, "aws"]],
		[e, [{
			fn: f,
			argv: [{ [s]: "IsOAuthEndpoint" }, b]
		}, c]],
		[e, [{ [s]: "UseDualStack" }, c]],
		[h, [l, "aws-cn"]],
		[h, [m, "us-gov-west-1"]],
		[h, [l, "aws-us-gov"]],
		[e, [{
			fn: i,
			argv: [n, "supportsFIPS"]
		}, c]],
		[h, [l, "aws-iso"]],
		[h, [l, "aws-iso-b"]],
		[h, [l, "aws-iso-f"]],
		[h, [l, "aws-iso-e"]],
		[h, [l, "aws-eusc"]],
		[e, [{
			fn: i,
			argv: [n, "supportsDualStack"]
		}, c]]
	],
	results: [
		[a],
		["https://signin.{Region}.api.aws", o],
		["https://signin.{Region}.api.amazonwebservices.com.cn", o],
		[j, o],
		[a, "FIPS endpoints are not supported for OAuth operations. Disable FIPS or use a non-OAuth operation."],
		["https://{Region}.oauth.signin.aws", o],
		["https://{Region}.signin.aws.amazon.com", p],
		["https://{Region}.signin.amazonaws.cn", p],
		["https://{Region}.signin.amazonaws-us-gov.com", p],
		["https://{Region}.signin.c2shome.ic.gov", p],
		["https://{Region}.signin.sc2shome.sgov.gov", p],
		["https://{Region}.signin.csphome.hci.ic.gov", p],
		["https://{Region}.signin.csphome.adc-e.uk", p],
		["https://{Region}.signin.amazonaws-eusc.eu", p],
		["https://signin-fips.amazonaws-us-gov.com", p],
		["https://{Region}.signin-fips.amazonaws-us-gov.com", p],
		["https://{Region}.signin.{PartitionResult#dnsSuffix}", p],
		[a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
		[a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
		[k, p],
		["https://signin-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", p],
		[a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
		["https://signin-fips.{Region}.{PartitionResult#dnsSuffix}", p],
		[a, "FIPS is enabled but this partition does not support FIPS"],
		[j, p],
		[a, "DualStack is enabled but this partition does not support DualStack"],
		["https://signin.{Region}.{PartitionResult#dnsSuffix}", p],
		[a, "Invalid Configuration: Missing Region"]
	]
};
var root = 2;
var nodes = new Int32Array([
	-1,
	1,
	-1,
	0,
	6,
	3,
	2,
	36,
	4,
	4,
	5,
	100000027,
	6,
	100000004,
	100000027,
	1,
	29,
	7,
	2,
	36,
	8,
	3,
	9,
	31,
	4,
	22,
	10,
	5,
	19,
	11,
	7,
	21,
	12,
	8,
	100000007,
	13,
	10,
	100000008,
	14,
	12,
	100000009,
	15,
	13,
	100000010,
	16,
	14,
	100000011,
	17,
	15,
	100000012,
	18,
	16,
	100000013,
	100000016,
	6,
	100000005,
	20,
	7,
	21,
	100000006,
	17,
	100000024,
	100000025,
	6,
	100000004,
	23,
	7,
	27,
	24,
	9,
	100000014,
	25,
	10,
	100000015,
	26,
	11,
	100000022,
	100000023,
	11,
	28,
	100000021,
	17,
	100000020,
	100000021,
	2,
	35,
	30,
	3,
	39,
	31,
	4,
	32,
	100000027,
	6,
	100000004,
	33,
	7,
	100000027,
	34,
	9,
	100000014,
	100000027,
	3,
	39,
	36,
	4,
	38,
	37,
	7,
	100000018,
	100000019,
	6,
	100000004,
	100000017,
	5,
	100000001,
	40,
	8,
	100000002,
	100000003
]);
var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/endpoint/endpointResolver.js
var cache = new EndpointCache({
	size: 50,
	params: [
		"Endpoint",
		"IsControlPlane",
		"IsOAuthEndpoint",
		"Region",
		"UseDualStack",
		"UseFIPS"
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/models/SigninServiceException.js
var SigninServiceException = class SigninServiceException extends ServiceException {
	constructor(options) {
		super(options);
		Object.setPrototypeOf(this, SigninServiceException.prototype);
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/models/errors.js
var AccessDeniedException = class AccessDeniedException extends SigninServiceException {
	name = "AccessDeniedException";
	$fault = "client";
	error;
	constructor(opts) {
		super({
			name: "AccessDeniedException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AccessDeniedException.prototype);
		this.error = opts.error;
	}
};
var InternalServerException = class InternalServerException extends SigninServiceException {
	name = "InternalServerException";
	$fault = "server";
	error;
	constructor(opts) {
		super({
			name: "InternalServerException",
			$fault: "server",
			...opts
		});
		Object.setPrototypeOf(this, InternalServerException.prototype);
		this.error = opts.error;
	}
};
var TooManyRequestsError = class TooManyRequestsError extends SigninServiceException {
	name = "TooManyRequestsError";
	$fault = "client";
	error;
	constructor(opts) {
		super({
			name: "TooManyRequestsError",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, TooManyRequestsError.prototype);
		this.error = opts.error;
	}
};
var ValidationException = class ValidationException extends SigninServiceException {
	name = "ValidationException";
	$fault = "client";
	error;
	constructor(opts) {
		super({
			name: "ValidationException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ValidationException.prototype);
		this.error = opts.error;
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/schemas/schemas_0.js
var _ADE = "AccessDeniedException";
var _AT = "AccessToken";
var _COAT = "CreateOAuth2Token";
var _COATR = "CreateOAuth2TokenRequest";
var _COATRB = "CreateOAuth2TokenRequestBody";
var _COATRBr = "CreateOAuth2TokenResponseBody";
var _COATRr = "CreateOAuth2TokenResponse";
var _ISE = "InternalServerException";
var _RT = "RefreshToken";
var _TMRE = "TooManyRequestsError";
var _VE = "ValidationException";
var _aKI = "accessKeyId";
var _aT = "accessToken";
var _c = "client";
var _cI = "clientId";
var _cV = "codeVerifier";
var _co = "code";
var _e = "error";
var _eI = "expiresIn";
var _gT = "grantType";
var _h = "http";
var _hE = "httpError";
var _iT = "idToken";
var _jN = "jsonName";
var _m = "message";
var _rT = "refreshToken";
var _rU = "redirectUri";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.signin";
var _sAK = "secretAccessKey";
var _sT = "sessionToken";
var _se = "server";
var _tI = "tokenInput";
var _tO = "tokenOutput";
var _tT = "tokenType";
var n0 = "com.amazonaws.signin";
var _s_registry = TypeRegistry.for(_s);
var SigninServiceException$ = [
	-3,
	_s,
	"SigninServiceException",
	0,
	[],
	[]
];
_s_registry.registerError(SigninServiceException$, SigninServiceException);
var n0_registry = TypeRegistry.for(n0);
var AccessDeniedException$ = [
	-3,
	n0,
	_ADE,
	{ [_e]: _c },
	[_e, _m],
	[0, 0],
	2
];
n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
var InternalServerException$ = [
	-3,
	n0,
	_ISE,
	{
		[_e]: _se,
		[_hE]: 500
	},
	[_e, _m],
	[0, 0],
	2
];
n0_registry.registerError(InternalServerException$, InternalServerException);
var TooManyRequestsError$ = [
	-3,
	n0,
	_TMRE,
	{
		[_e]: _c,
		[_hE]: 429
	},
	[_e, _m],
	[0, 0],
	2
];
n0_registry.registerError(TooManyRequestsError$, TooManyRequestsError);
var ValidationException$ = [
	-3,
	n0,
	_VE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _m],
	[0, 0],
	2
];
n0_registry.registerError(ValidationException$, ValidationException);
var errorTypeRegistries = [_s_registry, n0_registry];
var RefreshToken = [
	0,
	n0,
	_RT,
	8,
	0
];
var AccessToken$ = [
	3,
	n0,
	_AT,
	8,
	[
		_aKI,
		_sAK,
		_sT
	],
	[
		[0, { [_jN]: _aKI }],
		[0, { [_jN]: _sAK }],
		[0, { [_jN]: _sT }]
	],
	3
];
var CreateOAuth2TokenRequest$ = [
	3,
	n0,
	_COATR,
	0,
	[_tI],
	[[() => CreateOAuth2TokenRequestBody$, 16]],
	1
];
var CreateOAuth2TokenRequestBody$ = [
	3,
	n0,
	_COATRB,
	0,
	[
		_cI,
		_gT,
		_co,
		_rU,
		_cV,
		_rT
	],
	[
		[0, { [_jN]: _cI }],
		[0, { [_jN]: _gT }],
		0,
		[0, { [_jN]: _rU }],
		[0, { [_jN]: _cV }],
		[() => RefreshToken, { [_jN]: _rT }]
	],
	2
];
var CreateOAuth2TokenResponse$ = [
	3,
	n0,
	_COATRr,
	0,
	[_tO],
	[[() => CreateOAuth2TokenResponseBody$, 16]],
	1
];
var CreateOAuth2TokenResponseBody$ = [
	3,
	n0,
	_COATRBr,
	0,
	[
		_aT,
		_tT,
		_eI,
		_rT,
		_iT
	],
	[
		[() => AccessToken$, { [_jN]: _aT }],
		[0, { [_jN]: _tT }],
		[1, { [_jN]: _eI }],
		[() => RefreshToken, { [_jN]: _rT }],
		[0, { [_jN]: _iT }]
	],
	4
];
var CreateOAuth2Token$ = [
	9,
	n0,
	_COAT,
	{ [_h]: [
		"POST",
		"/v1/token",
		200
	] },
	() => CreateOAuth2TokenRequest$,
	() => CreateOAuth2TokenResponse$
];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/runtimeConfig.shared.js
var getRuntimeConfig$1 = (config) => {
	return {
		apiVersion: "2023-01-01",
		base64Decoder: config?.base64Decoder ?? fromBase64,
		base64Encoder: config?.base64Encoder ?? toBase64,
		disableHostPrefix: config?.disableHostPrefix ?? false,
		endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
		extensions: config?.extensions ?? [],
		httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSigninHttpAuthSchemeProvider,
		httpAuthSchemes: config?.httpAuthSchemes ?? [{
			schemeId: "aws.auth#sigv4",
			identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
			signer: new AwsSdkSigV4Signer()
		}, {
			schemeId: "smithy.api#noAuth",
			identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
			signer: new NoAuthSigner()
		}],
		logger: config?.logger ?? new NoOpLogger(),
		protocol: config?.protocol ?? AwsRestJsonProtocol,
		protocolSettings: config?.protocolSettings ?? {
			defaultNamespace: "com.amazonaws.signin",
			errorTypeRegistries,
			version: "2023-01-01",
			serviceTarget: "Signin"
		},
		serviceId: config?.serviceId ?? "Signin",
		sha256: config?.sha256 ?? Sha256Node,
		urlParser: config?.urlParser ?? parseUrl,
		utf8Decoder: config?.utf8Decoder ?? fromUtf8,
		utf8Encoder: config?.utf8Encoder ?? toUtf8
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/runtimeConfig.js
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
		streamCollector: config?.streamCollector ?? streamCollector,
		useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
		userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/auth/httpAuthExtensionConfiguration.js
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
	const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
	extensions.forEach((extension) => extension.configure(extensionConfiguration));
	return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/SigninClient.js
var SigninClient = class extends Client {
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
			httpAuthSchemeParametersProvider: defaultSigninHttpAuthSchemeParametersProvider,
			identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({ "aws.auth#sigv4": config.credentials })
		}));
		this.middlewareStack.use(getHttpSigningPlugin(this.config));
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/commandBuilder.js
var command = makeBuilder(commonParams, "Signin", "SigninClient", getEndpointPlugin);
var _ep0 = { IsControlPlane: {
	type: "staticContextParams",
	value: false
} };
var _mw0 = (Command, cs, config, o) => [];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/commands/CreateOAuth2TokenCommand.js
var CreateOAuth2TokenCommand = class extends command(_ep0, _mw0, "CreateOAuth2Token", CreateOAuth2Token$) {};
//#endregion
export { CreateOAuth2TokenCommand, SigninClient };
