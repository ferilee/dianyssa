import { $ as NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, A as NODE_RETRY_MODE_CONFIG_OPTIONS, C as getRecursionDetectionPlugin, E as resolveHostHeaderConfig, F as resolveHttpHandlerRuntimeConfig, G as customEndpointFunctions, H as getEndpointPlugin, K as EndpointCache, M as DEFAULT_RETRY_MODE, N as getContentLengthPlugin, O as getRetryPlugin, P as getHttpHandlerExtensionConfiguration, Q as NODE_REGION_CONFIG_OPTIONS, S as getHttpAuthSchemeEndpointRuleSetPlugin, T as getHostHeaderPlugin, U as resolveEndpointConfig, W as decideEndpoint, X as resolveRegionConfig, Y as resolveDefaultsModeConfig, Z as NODE_REGION_CONFIG_FILE_OPTIONS, _ as resolveUserAgentConfig, _t as normalizeProvider, at as getDefaultExtensionConfiguration, b as getHttpSigningPlugin, ct as loadConfigsForDefaultMode, d as getAwsRegionExtensionConfiguration, dt as TypeRegistry, et as NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, f as resolveAwsRegionExtensionConfiguration, g as getUserAgentPlugin, gt as Client, h as createDefaultUserAgentProvider, it as NoOpLogger, j as resolveRetryConfig, k as NODE_MAX_ATTEMPT_CONFIG_OPTIONS, lt as ServiceException, m as NODE_APP_ID_CONFIG_OPTIONS, mt as getSchemaSerdePlugin, n as NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, ot as resolveDefaultRuntimeConfig, p as awsEndpointFunctions, q as BinaryDecisionDiagram, r as AwsSdkSigV4Signer, rt as makeBuilder, st as emitWarningIfUnsupportedVersion, t as resolveAwsSdkSigV4Config, u as Sha256Node, v as DefaultIdentityProviderConfig, vt as getSmithyContext, w as getLoggerPlugin, yt as emitWarningIfUnsupportedVersion$1 } from "./resolveAwsSdkSigV4Config-D4g-ozje.js";
import { t as NodeHttpHandler } from "./node-http-handler-ESuki7Pk.js";
import { r as parseUrl, t as loadConfig } from "./configLoader-BF4DGsON.js";
import { D as toBase64, E as toUtf8, O as fromUtf8, a as streamCollector, k as fromBase64, u as calculateBodyLength } from "./serde-DSMreXns.js";
import { n as NoAuthSigner, t as package_default } from "./package-DpJkjC9P.js";
import { t as AwsRestJsonProtocol } from "./AwsRestJsonProtocol-Dv8IHvsm.js";
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/auth/httpAuthSchemeProvider.js
var defaultSSOOIDCHttpAuthSchemeParametersProvider = async (config, context, input) => {
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
			name: "sso-oauth",
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
var defaultSSOOIDCHttpAuthSchemeProvider = (authParameters) => {
	const options = [];
	switch (authParameters.operation) {
		case "CreateToken":
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/EndpointParameters.js
var resolveClientEndpointParameters = (options) => {
	return Object.assign(options, {
		useDualstackEndpoint: options.useDualstackEndpoint ?? false,
		useFipsEndpoint: options.useFipsEndpoint ?? false,
		defaultSigningName: "sso-oauth"
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/bdd.js
var k = "ref";
var a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "getAttr", g = { [k]: "Endpoint" }, h = { [k]: d }, i = {}, j = [{ [k]: "Region" }];
var _data = {
	conditions: [
		[c, [g]],
		[c, j],
		[
			"aws.partition",
			j,
			d
		],
		[e, [{ [k]: "UseFIPS" }, b]],
		[e, [{ [k]: "UseDualStack" }, b]],
		[e, [{
			fn: f,
			argv: [h, "supportsDualStack"]
		}, b]],
		[e, [{
			fn: f,
			argv: [h, "supportsFIPS"]
		}, b]],
		["stringEquals", [{
			fn: f,
			argv: [h, "name"]
		}, "aws-us-gov"]]
	],
	results: [
		[a],
		[a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
		[a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
		[g, i],
		["https://oidc-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
		[a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
		["https://oidc.{Region}.amazonaws.com", i],
		["https://oidc-fips.{Region}.{PartitionResult#dnsSuffix}", i],
		[a, "FIPS is enabled but this partition does not support FIPS"],
		["https://oidc.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
		[a, "DualStack is enabled but this partition does not support DualStack"],
		["https://oidc.{Region}.{PartitionResult#dnsSuffix}", i],
		[a, "Invalid Configuration: Missing Region"]
	]
};
var root = 2;
var nodes = new Int32Array([
	-1,
	1,
	-1,
	0,
	13,
	3,
	1,
	4,
	100000012,
	2,
	5,
	100000012,
	3,
	8,
	6,
	4,
	7,
	100000011,
	5,
	100000009,
	100000010,
	4,
	11,
	9,
	6,
	10,
	100000008,
	7,
	100000006,
	100000007,
	5,
	12,
	100000005,
	6,
	100000004,
	100000005,
	3,
	100000001,
	14,
	4,
	100000002,
	100000003
]);
var bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/endpointResolver.js
var cache = new EndpointCache({
	size: 50,
	params: [
		"Endpoint",
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/SSOOIDCServiceException.js
var SSOOIDCServiceException = class SSOOIDCServiceException extends ServiceException {
	constructor(options) {
		super(options);
		Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/errors.js
var AccessDeniedException = class AccessDeniedException extends SSOOIDCServiceException {
	name = "AccessDeniedException";
	$fault = "client";
	error;
	reason;
	error_description;
	constructor(opts) {
		super({
			name: "AccessDeniedException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AccessDeniedException.prototype);
		this.error = opts.error;
		this.reason = opts.reason;
		this.error_description = opts.error_description;
	}
};
var AuthorizationPendingException = class AuthorizationPendingException extends SSOOIDCServiceException {
	name = "AuthorizationPendingException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "AuthorizationPendingException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var ExpiredTokenException = class ExpiredTokenException extends SSOOIDCServiceException {
	name = "ExpiredTokenException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "ExpiredTokenException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, ExpiredTokenException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var InternalServerException = class InternalServerException extends SSOOIDCServiceException {
	name = "InternalServerException";
	$fault = "server";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "InternalServerException",
			$fault: "server",
			...opts
		});
		Object.setPrototypeOf(this, InternalServerException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var InvalidClientException = class InvalidClientException extends SSOOIDCServiceException {
	name = "InvalidClientException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "InvalidClientException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidClientException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var InvalidGrantException = class InvalidGrantException extends SSOOIDCServiceException {
	name = "InvalidGrantException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "InvalidGrantException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidGrantException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var InvalidRequestException = class InvalidRequestException extends SSOOIDCServiceException {
	name = "InvalidRequestException";
	$fault = "client";
	error;
	reason;
	error_description;
	constructor(opts) {
		super({
			name: "InvalidRequestException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidRequestException.prototype);
		this.error = opts.error;
		this.reason = opts.reason;
		this.error_description = opts.error_description;
	}
};
var InvalidScopeException = class InvalidScopeException extends SSOOIDCServiceException {
	name = "InvalidScopeException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "InvalidScopeException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, InvalidScopeException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var SlowDownException = class SlowDownException extends SSOOIDCServiceException {
	name = "SlowDownException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "SlowDownException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, SlowDownException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var UnauthorizedClientException = class UnauthorizedClientException extends SSOOIDCServiceException {
	name = "UnauthorizedClientException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "UnauthorizedClientException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, UnauthorizedClientException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
var UnsupportedGrantTypeException = class UnsupportedGrantTypeException extends SSOOIDCServiceException {
	name = "UnsupportedGrantTypeException";
	$fault = "client";
	error;
	error_description;
	constructor(opts) {
		super({
			name: "UnsupportedGrantTypeException",
			$fault: "client",
			...opts
		});
		Object.setPrototypeOf(this, UnsupportedGrantTypeException.prototype);
		this.error = opts.error;
		this.error_description = opts.error_description;
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/schemas/schemas_0.js
var _ADE = "AccessDeniedException";
var _APE = "AuthorizationPendingException";
var _AT = "AccessToken";
var _CS = "ClientSecret";
var _CT = "CreateToken";
var _CTR = "CreateTokenRequest";
var _CTRr = "CreateTokenResponse";
var _CV = "CodeVerifier";
var _ETE = "ExpiredTokenException";
var _ICE = "InvalidClientException";
var _IGE = "InvalidGrantException";
var _IRE = "InvalidRequestException";
var _ISE = "InternalServerException";
var _ISEn = "InvalidScopeException";
var _IT = "IdToken";
var _RT = "RefreshToken";
var _SDE = "SlowDownException";
var _UCE = "UnauthorizedClientException";
var _UGTE = "UnsupportedGrantTypeException";
var _aT = "accessToken";
var _c = "client";
var _cI = "clientId";
var _cS = "clientSecret";
var _cV = "codeVerifier";
var _co = "code";
var _dC = "deviceCode";
var _e = "error";
var _eI = "expiresIn";
var _ed = "error_description";
var _gT = "grantType";
var _h = "http";
var _hE = "httpError";
var _iT = "idToken";
var _r = "reason";
var _rT = "refreshToken";
var _rU = "redirectUri";
var _s = "smithy.ts.sdk.synthetic.com.amazonaws.ssooidc";
var _sc = "scope";
var _se = "server";
var _tT = "tokenType";
var n0 = "com.amazonaws.ssooidc";
var _s_registry = TypeRegistry.for(_s);
var SSOOIDCServiceException$ = [
	-3,
	_s,
	"SSOOIDCServiceException",
	0,
	[],
	[]
];
_s_registry.registerError(SSOOIDCServiceException$, SSOOIDCServiceException);
var n0_registry = TypeRegistry.for(n0);
var AccessDeniedException$ = [
	-3,
	n0,
	_ADE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[
		_e,
		_r,
		_ed
	],
	[
		0,
		0,
		0
	]
];
n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
var AuthorizationPendingException$ = [
	-3,
	n0,
	_APE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(AuthorizationPendingException$, AuthorizationPendingException);
var ExpiredTokenException$ = [
	-3,
	n0,
	_ETE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(ExpiredTokenException$, ExpiredTokenException);
var InternalServerException$ = [
	-3,
	n0,
	_ISE,
	{
		[_e]: _se,
		[_hE]: 500
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(InternalServerException$, InternalServerException);
var InvalidClientException$ = [
	-3,
	n0,
	_ICE,
	{
		[_e]: _c,
		[_hE]: 401
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(InvalidClientException$, InvalidClientException);
var InvalidGrantException$ = [
	-3,
	n0,
	_IGE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(InvalidGrantException$, InvalidGrantException);
var InvalidRequestException$ = [
	-3,
	n0,
	_IRE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[
		_e,
		_r,
		_ed
	],
	[
		0,
		0,
		0
	]
];
n0_registry.registerError(InvalidRequestException$, InvalidRequestException);
var InvalidScopeException$ = [
	-3,
	n0,
	_ISEn,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(InvalidScopeException$, InvalidScopeException);
var SlowDownException$ = [
	-3,
	n0,
	_SDE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(SlowDownException$, SlowDownException);
var UnauthorizedClientException$ = [
	-3,
	n0,
	_UCE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(UnauthorizedClientException$, UnauthorizedClientException);
var UnsupportedGrantTypeException$ = [
	-3,
	n0,
	_UGTE,
	{
		[_e]: _c,
		[_hE]: 400
	},
	[_e, _ed],
	[0, 0]
];
n0_registry.registerError(UnsupportedGrantTypeException$, UnsupportedGrantTypeException);
var errorTypeRegistries = [_s_registry, n0_registry];
var AccessToken = [
	0,
	n0,
	_AT,
	8,
	0
];
var ClientSecret = [
	0,
	n0,
	_CS,
	8,
	0
];
var CodeVerifier = [
	0,
	n0,
	_CV,
	8,
	0
];
var IdToken = [
	0,
	n0,
	_IT,
	8,
	0
];
var RefreshToken = [
	0,
	n0,
	_RT,
	8,
	0
];
var CreateTokenRequest$ = [
	3,
	n0,
	_CTR,
	0,
	[
		_cI,
		_cS,
		_gT,
		_dC,
		_co,
		_rT,
		_sc,
		_rU,
		_cV
	],
	[
		0,
		[() => ClientSecret, 0],
		0,
		0,
		0,
		[() => RefreshToken, 0],
		64,
		0,
		[() => CodeVerifier, 0]
	],
	3
];
var CreateTokenResponse$ = [
	3,
	n0,
	_CTRr,
	0,
	[
		_aT,
		_tT,
		_eI,
		_rT,
		_iT
	],
	[
		[() => AccessToken, 0],
		0,
		1,
		[() => RefreshToken, 0],
		[() => IdToken, 0]
	]
];
var CreateToken$ = [
	9,
	n0,
	_CT,
	{ [_h]: [
		"POST",
		"/token",
		200
	] },
	() => CreateTokenRequest$,
	() => CreateTokenResponse$
];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeConfig.shared.js
var getRuntimeConfig$1 = (config) => {
	return {
		apiVersion: "2019-06-10",
		base64Decoder: config?.base64Decoder ?? fromBase64,
		base64Encoder: config?.base64Encoder ?? toBase64,
		disableHostPrefix: config?.disableHostPrefix ?? false,
		endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
		extensions: config?.extensions ?? [],
		httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSSOOIDCHttpAuthSchemeProvider,
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
			defaultNamespace: "com.amazonaws.ssooidc",
			errorTypeRegistries,
			version: "2019-06-10",
			serviceTarget: "AWSSSOOIDCService"
		},
		serviceId: config?.serviceId ?? "SSO OIDC",
		sha256: config?.sha256 ?? Sha256Node,
		urlParser: config?.urlParser ?? parseUrl,
		utf8Decoder: config?.utf8Decoder ?? fromUtf8,
		utf8Encoder: config?.utf8Encoder ?? toUtf8
	};
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeConfig.js
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/auth/httpAuthExtensionConfiguration.js
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
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeExtensions.js
var resolveRuntimeExtensions = (runtimeConfig, extensions) => {
	const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
	extensions.forEach((extension) => extension.configure(extensionConfiguration));
	return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/SSOOIDCClient.js
var SSOOIDCClient = class extends Client {
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
			httpAuthSchemeParametersProvider: defaultSSOOIDCHttpAuthSchemeParametersProvider,
			identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({ "aws.auth#sigv4": config.credentials })
		}));
		this.middlewareStack.use(getHttpSigningPlugin(this.config));
	}
	destroy() {
		super.destroy();
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commandBuilder.js
var command = makeBuilder(commonParams, "AWSSSOOIDCService", "SSOOIDCClient", getEndpointPlugin);
var _ep0 = {};
var _mw0 = (Command, cs, config, o) => [];
//#endregion
//#region node_modules/.pnpm/@aws-sdk+nested-clients@3.997.33/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commands/CreateTokenCommand.js
var CreateTokenCommand = class extends command(_ep0, _mw0, "CreateToken", CreateToken$) {};
//#endregion
export { CreateTokenCommand, SSOOIDCClient };
