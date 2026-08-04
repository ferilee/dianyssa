import { t as setCredentialFeature } from "./setCredentialFeature-B8gFd5oe.js";
import { a as getProfileName, n as parseIni, o as IniSectionType, r as getConfigFilepath } from "./loadSharedConfigFiles-C3UoXJA4.js";
import { n as ProviderError, t as CredentialsProviderError } from "./CredentialsProviderError-uKEwU1di.js";
import { n as readFile } from "./readFile-DxxtKEBW.js";
import { r as getSSOTokenFilepath, t as getSSOTokenFromFile } from "./getSSOTokenFromFile-BTl5SS1W.js";
import { t as parseKnownFiles } from "./parseKnownFiles-DPijFZ9G.js";
import { promises } from "node:fs";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/property-provider/TokenProviderError.js
var TokenProviderError = class TokenProviderError extends ProviderError {
	name = "TokenProviderError";
	constructor(message, options = true) {
		super(message, options);
		Object.setPrototypeOf(this, TokenProviderError.prototype);
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getSsoSessionData.js
var getSsoSessionData = (data) => Object.entries(data).filter(([key]) => key.startsWith(IniSectionType.SSO_SESSION + ".")).reduce((acc, [key, value]) => ({
	...acc,
	[key.substring(key.indexOf(".") + 1)]: value
}), {});
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSsoSessionData.js
var swallowError = () => ({});
var loadSsoSessionData = async (init = {}) => readFile(init.configFilepath ?? getConfigFilepath()).then(parseIni).then(getSsoSessionData).catch(swallowError);
//#endregion
//#region node_modules/.pnpm/@aws-sdk+credential-provider-sso@3.973.3/node_modules/@aws-sdk/credential-provider-sso/dist-es/isSsoProfile.js
var isSsoProfile = (arg) => arg && (typeof arg.sso_start_url === "string" || typeof arg.sso_account_id === "string" || typeof arg.sso_session === "string" || typeof arg.sso_region === "string" || typeof arg.sso_role_name === "string");
var REFRESH_MESSAGE = `To refresh this SSO session run 'aws sso login' with the corresponding profile.`;
//#endregion
//#region node_modules/.pnpm/@aws-sdk+token-providers@3.1088.0/node_modules/@aws-sdk/token-providers/dist-es/getSsoOidcClient.js
var getSsoOidcClient = async (ssoRegion, init = {}, callerClientConfig) => {
	const { SSOOIDCClient } = await import("./sso-oidc-SDbQ5vdT.js");
	const coalesce = (prop) => init.clientConfig?.[prop] ?? init.parentClientConfig?.[prop] ?? callerClientConfig?.[prop];
	return new SSOOIDCClient(Object.assign({}, init.clientConfig ?? {}, {
		region: ssoRegion ?? init.clientConfig?.region,
		logger: coalesce("logger"),
		userAgentAppId: coalesce("userAgentAppId")
	}));
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+token-providers@3.1088.0/node_modules/@aws-sdk/token-providers/dist-es/getNewSsoOidcToken.js
var getNewSsoOidcToken = async (ssoToken, ssoRegion, init = {}, callerClientConfig) => {
	const { CreateTokenCommand } = await import("./sso-oidc-SDbQ5vdT.js");
	return (await getSsoOidcClient(ssoRegion, init, callerClientConfig)).send(new CreateTokenCommand({
		clientId: ssoToken.clientId,
		clientSecret: ssoToken.clientSecret,
		refreshToken: ssoToken.refreshToken,
		grantType: "refresh_token"
	}));
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+token-providers@3.1088.0/node_modules/@aws-sdk/token-providers/dist-es/validateTokenExpiry.js
var validateTokenExpiry = (token) => {
	if (token.expiration && token.expiration.getTime() < Date.now()) throw new TokenProviderError(`Token is expired. ${REFRESH_MESSAGE}`, false);
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+token-providers@3.1088.0/node_modules/@aws-sdk/token-providers/dist-es/validateTokenKey.js
var validateTokenKey = (key, value, forRefresh = false) => {
	if (typeof value === "undefined") throw new TokenProviderError(`Value not present for '${key}' in SSO Token${forRefresh ? ". Cannot refresh" : ""}. ${REFRESH_MESSAGE}`, false);
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+token-providers@3.1088.0/node_modules/@aws-sdk/token-providers/dist-es/writeSSOTokenToFile.js
var { writeFile } = promises;
var writeSSOTokenToFile = (id, ssoToken) => {
	return writeFile(getSSOTokenFilepath(id), JSON.stringify(ssoToken, null, 2));
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+token-providers@3.1088.0/node_modules/@aws-sdk/token-providers/dist-es/fromSso.js
var lastRefreshAttemptTime = /* @__PURE__ */ new Date(0);
var fromSso = (init = {}) => async ({ callerClientConfig } = {}) => {
	init.logger?.debug("@aws-sdk/token-providers - fromSso");
	const profiles = await parseKnownFiles(init);
	const profileName = getProfileName({ profile: init.profile ?? callerClientConfig?.profile });
	const profile = profiles[profileName];
	if (!profile) throw new TokenProviderError(`Profile '${profileName}' could not be found in shared credentials file.`, false);
	else if (!profile["sso_session"]) throw new TokenProviderError(`Profile '${profileName}' is missing required property 'sso_session'.`);
	const ssoSessionName = profile["sso_session"];
	const ssoSession = (await loadSsoSessionData(init))[ssoSessionName];
	if (!ssoSession) throw new TokenProviderError(`Sso session '${ssoSessionName}' could not be found in shared credentials file.`, false);
	for (const ssoSessionRequiredKey of ["sso_start_url", "sso_region"]) if (!ssoSession[ssoSessionRequiredKey]) throw new TokenProviderError(`Sso session '${ssoSessionName}' is missing required property '${ssoSessionRequiredKey}'.`, false);
	ssoSession["sso_start_url"];
	const ssoRegion = ssoSession["sso_region"];
	let ssoToken;
	try {
		ssoToken = await getSSOTokenFromFile(ssoSessionName);
	} catch (e) {
		throw new TokenProviderError(`The SSO session token associated with profile=${profileName} was not found or is invalid. ${REFRESH_MESSAGE}`, false);
	}
	validateTokenKey("accessToken", ssoToken.accessToken);
	validateTokenKey("expiresAt", ssoToken.expiresAt);
	const { accessToken, expiresAt } = ssoToken;
	const existingToken = {
		token: accessToken,
		expiration: new Date(expiresAt)
	};
	if (existingToken.expiration.getTime() - Date.now() > 3e5) return existingToken;
	if (Date.now() - lastRefreshAttemptTime.getTime() < 30 * 1e3) {
		validateTokenExpiry(existingToken);
		return existingToken;
	}
	validateTokenKey("clientId", ssoToken.clientId, true);
	validateTokenKey("clientSecret", ssoToken.clientSecret, true);
	validateTokenKey("refreshToken", ssoToken.refreshToken, true);
	try {
		lastRefreshAttemptTime.setTime(Date.now());
		const newSsoOidcToken = await getNewSsoOidcToken(ssoToken, ssoRegion, init, callerClientConfig);
		validateTokenKey("accessToken", newSsoOidcToken.accessToken);
		validateTokenKey("expiresIn", newSsoOidcToken.expiresIn);
		const newTokenExpiration = new Date(Date.now() + newSsoOidcToken.expiresIn * 1e3);
		try {
			await writeSSOTokenToFile(ssoSessionName, {
				...ssoToken,
				accessToken: newSsoOidcToken.accessToken,
				expiresAt: newTokenExpiration.toISOString(),
				refreshToken: newSsoOidcToken.refreshToken
			});
		} catch (error) {}
		return {
			token: newSsoOidcToken.accessToken,
			expiration: newTokenExpiration
		};
	} catch (error) {
		validateTokenExpiry(existingToken);
		return existingToken;
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+credential-provider-sso@3.973.3/node_modules/@aws-sdk/credential-provider-sso/dist-es/resolveSSOCredentials.js
var SHOULD_FAIL_CREDENTIAL_CHAIN = false;
var resolveSSOCredentials = async ({ ssoStartUrl, ssoSession, ssoAccountId, ssoRegion, ssoRoleName, ssoClient, clientConfig, parentClientConfig, callerClientConfig, profile, filepath, configFilepath, ignoreCache, logger }) => {
	let token;
	const refreshMessage = `To refresh this SSO session run aws sso login with the corresponding profile.`;
	if (ssoSession) try {
		const _token = await fromSso({
			profile,
			filepath,
			configFilepath,
			ignoreCache,
			clientConfig,
			parentClientConfig,
			logger
		})({ callerClientConfig });
		token = {
			accessToken: _token.token,
			expiresAt: new Date(_token.expiration).toISOString()
		};
	} catch (e) {
		throw new CredentialsProviderError(e.message, {
			tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
			logger
		});
	}
	else try {
		token = await getSSOTokenFromFile(ssoStartUrl);
	} catch (e) {
		throw new CredentialsProviderError(`The SSO session associated with this profile is invalid. ${refreshMessage}`, {
			tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
			logger
		});
	}
	if (new Date(token.expiresAt).getTime() - Date.now() <= 0) throw new CredentialsProviderError(`The SSO session associated with this profile has expired. ${refreshMessage}`, {
		tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
		logger
	});
	const { accessToken } = token;
	const { SSOClient, GetRoleCredentialsCommand } = await import("./loadSso-D9lzIV-c.js");
	const sso = ssoClient || new SSOClient(Object.assign({}, clientConfig ?? {}, {
		logger: clientConfig?.logger ?? callerClientConfig?.logger ?? parentClientConfig?.logger,
		region: clientConfig?.region ?? ssoRegion,
		userAgentAppId: clientConfig?.userAgentAppId ?? callerClientConfig?.userAgentAppId ?? parentClientConfig?.userAgentAppId
	}));
	let ssoResp;
	try {
		ssoResp = await sso.send(new GetRoleCredentialsCommand({
			accountId: ssoAccountId,
			roleName: ssoRoleName,
			accessToken
		}));
	} catch (e) {
		throw new CredentialsProviderError(e, {
			tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
			logger
		});
	}
	const { roleCredentials: { accessKeyId, secretAccessKey, sessionToken, expiration, credentialScope, accountId } = {} } = ssoResp;
	if (!accessKeyId || !secretAccessKey || !sessionToken || !expiration) throw new CredentialsProviderError("SSO returns an invalid temporary credential.", {
		tryNextLink: SHOULD_FAIL_CREDENTIAL_CHAIN,
		logger
	});
	const credentials = {
		accessKeyId,
		secretAccessKey,
		sessionToken,
		expiration: new Date(expiration),
		...credentialScope && { credentialScope },
		...accountId && { accountId }
	};
	if (ssoSession) setCredentialFeature(credentials, "CREDENTIALS_SSO", "s");
	else setCredentialFeature(credentials, "CREDENTIALS_SSO_LEGACY", "u");
	return credentials;
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+credential-provider-sso@3.973.3/node_modules/@aws-sdk/credential-provider-sso/dist-es/validateSsoProfile.js
var validateSsoProfile = (profile, logger) => {
	const { sso_start_url, sso_account_id, sso_region, sso_role_name } = profile;
	if (!sso_start_url || !sso_account_id || !sso_region || !sso_role_name) throw new CredentialsProviderError(`Profile is configured with invalid SSO credentials. Required parameters "sso_account_id", "sso_region", "sso_role_name", "sso_start_url". Got ${Object.keys(profile).join(", ")}\nReference: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html`, {
		tryNextLink: false,
		logger
	});
	return profile;
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+credential-provider-sso@3.973.3/node_modules/@aws-sdk/credential-provider-sso/dist-es/fromSSO.js
var fromSSO = (init = {}) => async ({ callerClientConfig } = {}) => {
	init.logger?.debug("@aws-sdk/credential-provider-sso - fromSSO");
	const { ssoStartUrl, ssoAccountId, ssoRegion, ssoRoleName, ssoSession } = init;
	const { ssoClient } = init;
	const profileName = getProfileName({ profile: init.profile ?? callerClientConfig?.profile });
	if (!ssoStartUrl && !ssoAccountId && !ssoRegion && !ssoRoleName && !ssoSession) {
		const profile = (await parseKnownFiles(init))[profileName];
		if (!profile) throw new CredentialsProviderError(`Profile ${profileName} was not found.`, { logger: init.logger });
		if (!isSsoProfile(profile)) throw new CredentialsProviderError(`Profile ${profileName} is not configured with SSO credentials.`, { logger: init.logger });
		if (profile?.sso_session) {
			const session = (await loadSsoSessionData(init))[profile.sso_session];
			const conflictMsg = ` configurations in profile ${profileName} and sso-session ${profile.sso_session}`;
			if (ssoRegion && ssoRegion !== session.sso_region) throw new CredentialsProviderError(`Conflicting SSO region` + conflictMsg, {
				tryNextLink: false,
				logger: init.logger
			});
			if (ssoStartUrl && ssoStartUrl !== session.sso_start_url) throw new CredentialsProviderError(`Conflicting SSO start_url` + conflictMsg, {
				tryNextLink: false,
				logger: init.logger
			});
			profile.sso_region = session.sso_region;
			profile.sso_start_url = session.sso_start_url;
		}
		const { sso_start_url, sso_account_id, sso_region, sso_role_name, sso_session } = validateSsoProfile(profile, init.logger);
		return resolveSSOCredentials({
			ssoStartUrl: sso_start_url,
			ssoSession: sso_session,
			ssoAccountId: sso_account_id,
			ssoRegion: sso_region,
			ssoRoleName: sso_role_name,
			ssoClient,
			clientConfig: init.clientConfig,
			parentClientConfig: init.parentClientConfig,
			callerClientConfig: init.callerClientConfig,
			profile: profileName,
			filepath: init.filepath,
			configFilepath: init.configFilepath,
			ignoreCache: init.ignoreCache,
			logger: init.logger
		});
	} else if (!ssoStartUrl || !ssoAccountId || !ssoRegion || !ssoRoleName) throw new CredentialsProviderError("Incomplete configuration. The fromSSO() argument hash must include \"ssoStartUrl\", \"ssoAccountId\", \"ssoRegion\", \"ssoRoleName\"", {
		tryNextLink: false,
		logger: init.logger
	});
	else return resolveSSOCredentials({
		ssoStartUrl,
		ssoSession,
		ssoAccountId,
		ssoRegion,
		ssoRoleName,
		ssoClient,
		clientConfig: init.clientConfig,
		parentClientConfig: init.parentClientConfig,
		callerClientConfig: init.callerClientConfig,
		profile: profileName,
		filepath: init.filepath,
		configFilepath: init.configFilepath,
		ignoreCache: init.ignoreCache,
		logger: init.logger
	});
};
//#endregion
export { fromSSO };
