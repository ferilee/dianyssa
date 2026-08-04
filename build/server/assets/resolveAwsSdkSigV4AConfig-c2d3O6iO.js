import { I as FromStringShapeDeserializer, a as getSkewCorrectedDate, ft as NormalizedSchema, i as validateSigningProperties, l as SignatureV4, o as UnionSerde, r as AwsSdkSigV4Signer, s as SerdeContextConfig, y as normalizeProvider } from "./resolveAwsSdkSigV4Config-D4g-ozje.js";
import { t as HttpRequest } from "./httpRequest-MsxXbvEi.js";
import { E as toUtf8 } from "./serde-DSMreXns.js";
import { n as ProviderError } from "./CredentialsProviderError-uKEwU1di.js";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/get-value-from-text-node.js
var getValueFromTextNode = (obj) => {
	const textNodeName = "#text";
	for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key][textNodeName] !== void 0) obj[key] = obj[key][textNodeName];
	else if (typeof obj[key] === "object" && obj[key] !== null) obj[key] = getValueFromTextNode(obj[key]);
	return obj;
};
//#endregion
//#region node_modules/.pnpm/@smithy+signature-v4@5.6.6/node_modules/@smithy/signature-v4/dist-es/signature-v4a-container.js
var signatureV4aContainer = { SignatureV4a: null };
//#endregion
//#region node_modules/.pnpm/@aws-sdk+signature-v4-multi-region@3.996.41/node_modules/@aws-sdk/signature-v4-multi-region/dist-es/signature-v4-crt-container.js
var signatureV4CrtContainer = { CrtSignerV4: null };
//#endregion
//#region node_modules/.pnpm/@aws-sdk+signature-v4-multi-region@3.996.41/node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4SignWithCredentials.js
var SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
var SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();
var SignatureV4SignWithCredentials = class extends SignatureV4 {
	async signWithCredentials(requestToSign, credentials, options) {
		const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
		requestToSign.headers[SESSION_TOKEN_HEADER] = credentials.sessionToken;
		const privateAccess = this;
		setSingleOverride(privateAccess, credentialsWithoutSessionToken);
		return privateAccess.signRequest(requestToSign, options ?? {});
	}
	async presignWithCredentials(requestToSign, credentials, options) {
		const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
		delete requestToSign.headers[SESSION_TOKEN_HEADER];
		requestToSign.headers[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
		requestToSign.query = requestToSign.query ?? {};
		requestToSign.query[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
		setSingleOverride(this, credentialsWithoutSessionToken);
		return this.presign(requestToSign, options);
	}
};
function getCredentialsWithoutSessionToken(credentials) {
	return {
		accessKeyId: credentials.accessKeyId,
		secretAccessKey: credentials.secretAccessKey,
		expiration: credentials.expiration
	};
}
function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
	const currentCredentialProvider = privateAccess.credentialProvider;
	privateAccess.credentialProvider = () => {
		privateAccess.credentialProvider = currentCredentialProvider;
		return Promise.resolve(credentialsWithoutSessionToken);
	};
}
//#endregion
//#region node_modules/.pnpm/@aws-sdk+signature-v4-multi-region@3.996.41/node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js
var SignatureV4MultiRegion = class {
	sigv4aSigner;
	sigv4Signer;
	signerOptions;
	static sigv4aDependency() {
		if (typeof signatureV4CrtContainer.CrtSignerV4 === "function") return "crt";
		else if (typeof signatureV4aContainer.SignatureV4a === "function") return "js";
		return "none";
	}
	constructor(options) {
		this.sigv4Signer = new SignatureV4SignWithCredentials(options);
		this.signerOptions = options;
	}
	async sign(requestToSign, options = {}) {
		if (options.signingRegion === "*") return this.getSigv4aSigner().sign(requestToSign, options);
		return this.sigv4Signer.sign(requestToSign, options);
	}
	async signWithCredentials(requestToSign, credentials, options = {}) {
		if (options.signingRegion === "*") {
			const signer = this.getSigv4aSigner();
			const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
			if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.signWithCredentials(requestToSign, credentials, options);
			else throw new Error("signWithCredentials with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
		}
		return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
	}
	async presign(originalRequest, options = {}) {
		if (options.signingRegion === "*") {
			const signer = this.getSigv4aSigner();
			const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
			if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.presign(originalRequest, options);
			else throw new Error("presign with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
		}
		return this.sigv4Signer.presign(originalRequest, options);
	}
	async presignWithCredentials(originalRequest, credentials, options = {}) {
		if (options.signingRegion === "*") throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
		return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
	}
	getSigv4aSigner() {
		if (!this.sigv4aSigner) {
			const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
			const JsSigV4aSigner = signatureV4aContainer.SignatureV4a;
			if (this.signerOptions.runtime === "node") {
				if (!CrtSignerV4 && !JsSigV4aSigner) throw new Error("Neither CRT nor JS SigV4a implementation is available. Please load either @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
				if (CrtSignerV4 && typeof CrtSignerV4 === "function") this.sigv4aSigner = new CrtSignerV4({
					...this.signerOptions,
					signingAlgorithm: 1
				});
				else if (JsSigV4aSigner && typeof JsSigV4aSigner === "function") this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
				else throw new Error("Available SigV4a implementation is not a valid constructor. Please ensure you've properly imported @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a.For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			} else {
				if (!JsSigV4aSigner || typeof JsSigV4aSigner !== "function") throw new Error("JS SigV4a implementation is not available or not a valid constructor. Please check whether you have installed the @aws-sdk/signature-v4a package explicitly. The CRT implementation is not available for browsers. You must also register the package by calling [require('@aws-sdk/signature-v4a');] or an ESM equivalent such as [import '@aws-sdk/signature-v4a';]. For more information please go to https://github.com/aws/aws-sdk-js-v3#using-javascript-non-crt-implementation-of-sigv4a");
				this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
			}
		}
		return this.sigv4aSigner;
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+xml-builder@3.972.36/node_modules/@aws-sdk/xml-builder/dist-es/xml-parser.js
function parseXML(xml) {
	return new AwsXmlParser(xml).parse();
}
var AwsXmlParser = class AwsXmlParser {
	x;
	i = 0;
	z;
	constructor(x) {
		this.x = x;
		this.x = x.replace(/\r\n?/g, "\n");
		this.z = this.x.length;
	}
	parse() {
		const p = this;
		const { z } = p;
		while (p.i < z) {
			p.trim();
			if (p.i >= z) break;
			if (p.isNext("<?")) {
				p.readTo("?>");
				p.trim();
			} else if (p.isNext("<!--")) {
				p.readTo("-->");
				p.trim();
			} else if (p.isNext("<!DOCTYPE", false)) {
				p.skipDoctype();
				p.trim();
			} else if (p.x[p.i] === "<") {
				const root = p.parseTag();
				return { [root.tag]: root.value };
			} else throw new Error("@aws-sdk XML parse error: unexpected content.");
		}
		throw new Error("@aws-sdk XML parse error: no root element.");
	}
	isNext(s, caseSensitive = true) {
		const p = this;
		if (caseSensitive) return p.x.startsWith(s, p.i);
		return p.x.toLowerCase().startsWith(s.toLowerCase(), p.i);
	}
	readTo(stop) {
		const p = this;
		const _i = p.x.indexOf(stop, p.i);
		if (_i === -1) throw new Error(`@aws-sdk XML parse error: expected "${stop}" not found.`);
		const result = p.x.slice(p.i, _i);
		p.i = _i + stop.length;
		return result;
	}
	trim() {
		const p = this;
		while (p.i < p.z && " 	\r\n".includes(p.x[p.i])) ++p.i;
	}
	readAttrValue() {
		const p = this;
		const quote = p.x[p.i];
		++p.i;
		let value = "";
		while (p.i < p.z && p.x[p.i] !== quote) value += p.x[p.i++];
		++p.i;
		return p.decodeEntities(value);
	}
	parseTag() {
		const p = this;
		++p.i;
		let tag = "";
		while (p.i < p.z && !" 	\r\n>/".includes(p.x[p.i])) tag += p.x[p.i++];
		let hasAttrs = false;
		const attrs = Object.create(null);
		while (p.i < p.z) {
			p.trim();
			if (">/".includes(p.x[p.i])) break;
			let name = "";
			while (p.i < p.z && !"= 	\r\n>/?".includes(p.x[p.i])) name += p.x[p.i++];
			p.trim();
			if (p.x[p.i] !== "=") break;
			++p.i;
			p.trim();
			attrs[name] = p.readAttrValue();
			hasAttrs = true;
		}
		if (p.i >= p.z) throw new Error("@aws-sdk XML parse error: unexpected end of input.");
		if (p.x[p.i] === "/") {
			++p.i;
			if (p.i >= p.z || p.x[p.i] !== ">") throw new Error("@aws-sdk XML parse error: expected > at the end of self-closing tag.");
			++p.i;
			Object.setPrototypeOf(attrs, Object.prototype);
			return {
				tag,
				value: hasAttrs ? attrs : ""
			};
		}
		if (p.x[p.i] !== ">") throw new Error("@aws-sdk XML parse error: expected > at the end of opening tag.");
		++p.i;
		const textParts = [];
		const childTags = [];
		let hasElementChild = false;
		while (p.i < p.z) {
			if (p.isNext("</")) break;
			if (p.x[p.i] === "<") if (p.isNext("<!--")) p.readTo("-->");
			else if (p.isNext("<![CDATA[")) {
				p.i += 9;
				textParts.push(p.readTo("]]>"));
			} else if (p.isNext("<?")) p.readTo("?>");
			else {
				hasElementChild = true;
				childTags.push(p.parseTag());
			}
			else {
				let text = "";
				while (p.i < p.z && p.x[p.i] !== "<") text += p.x[p.i++];
				textParts.push(p.decodeEntities(text));
			}
		}
		if (!p.isNext("</")) throw new Error(`@aws-sdk XML parse error: missing closing tag </${tag}>.`);
		p.i += 2;
		const closeTag = p.readTo(">").trim();
		if (closeTag !== tag) throw new Error(`@aws-sdk XML parse error: mismatched tags <${tag}> and </${closeTag}>.`);
		if (!hasAttrs && textParts.length === 0 && !hasElementChild) return {
			tag,
			value: ""
		};
		if (!hasAttrs && !hasElementChild) {
			const text = textParts.length === 1 ? textParts[0] : textParts.join("");
			if (text.trim() === "" && text.includes("\n")) return {
				tag,
				value: ""
			};
			return {
				tag,
				value: text
			};
		}
		const obj = Object.create(null);
		for (const text of textParts) {
			if (text.trim() === "" && text.includes("\n")) continue;
			obj["#text"] = "#text" in obj ? obj["#text"] + text : text;
		}
		for (const child of childTags) if (child.tag in obj) if (Array.isArray(obj[child.tag])) obj[child.tag].push(child.value);
		else obj[child.tag] = [obj[child.tag], child.value];
		else obj[child.tag] = child.value;
		for (const [k, v] of Object.entries(attrs)) obj[k] = v;
		Object.setPrototypeOf(obj, Object.prototype);
		return {
			tag,
			value: obj
		};
	}
	static ENTITIES = {
		amp: "&",
		lt: "<",
		gt: ">",
		quot: "\"",
		apos: "'"
	};
	skipDoctype() {
		const p = this;
		p.i += 9;
		let depth = 0;
		while (p.i < p.z) {
			const c = p.x[p.i];
			if (c === "[") ++depth;
			else if (c === "]") --depth;
			else if (c === ">" && depth === 0) {
				++p.i;
				return;
			}
			++p.i;
		}
		throw new Error("@aws-sdk XML parse error: unclosed DOCTYPE.");
	}
	decodeEntities(s) {
		return s.replace(/&(?:#x([0-9a-fA-F]{1,6})|#(\d{1,7})|([a-zA-Z][a-zA-Z0-9]{0,30}));/g, (_, hex, dec, named) => {
			if (hex) return String.fromCharCode(parseInt(hex, 16));
			if (dec) return String.fromCharCode(parseInt(dec, 10));
			return AwsXmlParser.ENTITIES[named] ?? "";
		});
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/XmlShapeDeserializer.js
var XmlShapeDeserializer = class extends SerdeContextConfig {
	settings;
	stringDeserializer;
	constructor(settings) {
		super();
		this.settings = settings;
		this.stringDeserializer = new FromStringShapeDeserializer(settings);
	}
	setSerdeContext(serdeContext) {
		this.serdeContext = serdeContext;
		this.stringDeserializer.setSerdeContext(serdeContext);
	}
	read(schema, bytes, key) {
		const ns = NormalizedSchema.of(schema);
		const memberSchemas = ns.getMemberSchemas();
		if (ns.isStructSchema() && ns.isMemberSchema() && !!Object.values(memberSchemas).find((memberNs) => {
			return !!memberNs.getMemberTraits().eventPayload;
		})) {
			const output = {};
			const memberName = Object.keys(memberSchemas)[0];
			if (memberSchemas[memberName].isBlobSchema()) output[memberName] = bytes;
			else output[memberName] = this.read(memberSchemas[memberName], bytes);
			return output;
		}
		const xmlString = (this.serdeContext?.utf8Encoder ?? toUtf8)(bytes);
		const parsedObject = this.parseXml(xmlString);
		return this.readSchema(schema, key ? parsedObject[key] : parsedObject);
	}
	readSchema(_schema, value) {
		const ns = NormalizedSchema.of(_schema);
		if (ns.isUnitSchema()) return;
		const traits = ns.getMergedTraits();
		if (ns.isListSchema() && !Array.isArray(value)) return this.readSchema(ns, [value]);
		if (value == null) return value;
		if (typeof value === "object") {
			const flat = !!traits.xmlFlattened;
			if (ns.isListSchema()) {
				const listValue = ns.getValueSchema();
				const buffer = [];
				const sourceKey = listValue.getMergedTraits().xmlName ?? "member";
				const source = flat ? value : (value[0] ?? value)[sourceKey];
				if (source == null) return buffer;
				const sourceArray = Array.isArray(source) ? source : [source];
				for (const v of sourceArray) buffer.push(this.readSchema(listValue, v));
				return buffer;
			}
			const buffer = {};
			if (ns.isMapSchema()) {
				const keyNs = ns.getKeySchema();
				const memberNs = ns.getValueSchema();
				let entries;
				if (flat) entries = Array.isArray(value) ? value : [value];
				else entries = Array.isArray(value.entry) ? value.entry : [value.entry];
				const keyProperty = keyNs.getMergedTraits().xmlName ?? "key";
				const valueProperty = memberNs.getMergedTraits().xmlName ?? "value";
				for (const entry of entries) {
					const key = entry[keyProperty];
					const value = entry[valueProperty];
					buffer[key] = this.readSchema(memberNs, value);
				}
				return buffer;
			}
			if (ns.isStructSchema()) {
				const union = ns.isUnionSchema();
				let unionSerde;
				if (union) unionSerde = new UnionSerde(value, buffer);
				for (const [memberName, memberSchema] of ns.structIterator()) {
					const memberTraits = memberSchema.getMergedTraits();
					const xmlObjectKey = !memberTraits.httpPayload ? memberSchema.getMemberTraits().xmlName ?? memberName : memberTraits.xmlName ?? memberSchema.getName();
					if (union) unionSerde.mark(xmlObjectKey);
					if (value[xmlObjectKey] != null) buffer[memberName] = this.readSchema(memberSchema, value[xmlObjectKey]);
				}
				if (union) unionSerde.writeUnknown();
				return buffer;
			}
			if (ns.isDocumentSchema()) return value;
			throw new Error(`@aws-sdk/core/protocols - xml deserializer unhandled schema type for ${ns.getName(true)}`);
		}
		if (ns.isListSchema()) return [];
		if (ns.isMapSchema() || ns.isStructSchema()) return {};
		return this.stringDeserializer.read(ns, value);
	}
	parseXml(xml) {
		if (xml.length) {
			let parsedObj;
			try {
				parsedObj = parseXML(xml);
			} catch (e) {
				if (e && typeof e === "object") Object.defineProperty(e, "$responseBodyText", { value: xml });
				throw e;
			}
			const textNodeName = "#text";
			const key = Object.keys(parsedObj)[0];
			const parsedObjToReturn = parsedObj[key];
			if (parsedObjToReturn[textNodeName]) {
				parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
				delete parsedObjToReturn[textNodeName];
			}
			return getValueFromTextNode(parsedObjToReturn);
		}
		return {};
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4ASigner.js
var AwsSdkSigV4ASigner = class extends AwsSdkSigV4Signer {
	async sign(httpRequest, identity, signingProperties) {
		if (!HttpRequest.isInstance(httpRequest)) throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
		const { config, signer, signingRegion, signingRegionSet, signingName } = await validateSigningProperties(signingProperties);
		const multiRegionOverride = (await config.sigv4aSigningRegionSet?.() ?? signingRegionSet ?? [signingRegion]).join(",");
		signingProperties._preRequestSystemClockOffset = config.systemClockOffset;
		return await signer.sign(httpRequest, {
			signingDate: getSkewCorrectedDate(config.systemClockOffset),
			signingRegion: multiRegionOverride,
			signingService: signingName
		});
	}
};
//#endregion
//#region node_modules/.pnpm/@aws-sdk+core@3.975.3/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4AConfig.js
var resolveAwsSdkSigV4AConfig = (config) => {
	config.sigv4aSigningRegionSet = normalizeProvider(config.sigv4aSigningRegionSet);
	return config;
};
var NODE_SIGV4A_CONFIG_OPTIONS = {
	environmentVariableSelector(env) {
		if (env.AWS_SIGV4A_SIGNING_REGION_SET) return env.AWS_SIGV4A_SIGNING_REGION_SET.split(",").map((_) => _.trim());
		throw new ProviderError("AWS_SIGV4A_SIGNING_REGION_SET not set in env.", { tryNextLink: true });
	},
	configFileSelector(profile) {
		if (profile.sigv4a_signing_region_set) return (profile.sigv4a_signing_region_set ?? "").split(",").map((_) => _.trim());
		throw new ProviderError("sigv4a_signing_region_set not set in profile.", { tryNextLink: true });
	},
	default: void 0
};
//#endregion
export { SignatureV4MultiRegion as a, XmlShapeDeserializer as i, resolveAwsSdkSigV4AConfig as n, AwsSdkSigV4ASigner as r, NODE_SIGV4A_CONFIG_OPTIONS as t };
