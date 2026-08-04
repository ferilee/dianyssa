//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js
var ProviderError = class ProviderError extends Error {
	name = "ProviderError";
	tryNextLink;
	constructor(message, options = true) {
		let logger;
		let tryNextLink = true;
		if (typeof options === "boolean") {
			logger = void 0;
			tryNextLink = options;
		} else if (options != null && typeof options === "object") {
			logger = options.logger;
			tryNextLink = options.tryNextLink ?? true;
		}
		super(message);
		this.tryNextLink = tryNextLink;
		Object.setPrototypeOf(this, ProviderError.prototype);
		logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
	}
	static from(error, options = true) {
		return Object.assign(new this(error.message, options), error);
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js
var CredentialsProviderError = class CredentialsProviderError extends ProviderError {
	name = "CredentialsProviderError";
	constructor(message, options = true) {
		super(message, options);
		Object.setPrototypeOf(this, CredentialsProviderError.prototype);
	}
};
//#endregion
export { ProviderError as n, CredentialsProviderError as t };
