//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
function setCredentialFeature(credentials, feature, value) {
	if (!credentials.$source) credentials.$source = {};
	credentials.$source[feature] = value;
	return credentials;
}
//#endregion
export { setCredentialFeature as t };
