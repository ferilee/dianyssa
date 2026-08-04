import { Readable } from "node:stream";
import node_https from "node:https";
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js
var HttpResponse = class {
	statusCode;
	reason;
	headers;
	body;
	constructor(options) {
		this.statusCode = options.statusCode;
		this.reason = options.reason;
		this.headers = options.headers || {};
		this.body = options.body;
	}
	static isInstance(response) {
		if (!response) return false;
		const resp = response;
		return typeof resp.statusCode === "number" && typeof resp.headers === "object";
	}
};
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/util-uri-escape/escape-uri.js
var escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
var hexEncode = (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`;
//#endregion
//#region node_modules/.pnpm/@smithy+core@3.29.5/node_modules/@smithy/core/dist-es/submodules/protocols/querystring-builder/buildQueryString.js
function buildQueryString(query) {
	const parts = [];
	for (let key of Object.keys(query).sort()) {
		const value = query[key];
		key = escapeUri(key);
		if (Array.isArray(value)) for (let i = 0, iLen = value.length; i < iLen; i++) parts.push(`${key}=${escapeUri(value[i])}`);
		else {
			let qsEntry = key;
			if (value || typeof value === "string") qsEntry += `=${escapeUri(value)}`;
			parts.push(qsEntry);
		}
	}
	return parts.join("&");
}
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/build-abort-error.js
function buildAbortError(abortSignal) {
	const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : void 0;
	if (reason) {
		if (reason instanceof Error) {
			const abortError = /* @__PURE__ */ new Error("Request aborted");
			abortError.name = "AbortError";
			abortError.cause = reason;
			return abortError;
		}
		const abortError = new Error(String(reason));
		abortError.name = "AbortError";
		return abortError;
	}
	const abortError = /* @__PURE__ */ new Error("Request aborted");
	abortError.name = "AbortError";
	return abortError;
}
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/constants.js
var NODEJS_TIMEOUT_ERROR_CODES = [
	"ECONNRESET",
	"EPIPE",
	"ETIMEDOUT"
];
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/get-transformed-headers.js
var getTransformedHeaders = (headers) => {
	const transformedHeaders = {};
	for (const name in headers) {
		const headerValues = headers[name];
		transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
	}
	return transformedHeaders;
};
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/timing.js
var timing = {
	setTimeout: (cb, ms) => setTimeout(cb, ms),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId)
};
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js
var DEFER_EVENT_LISTENER_TIME$2 = 1e3;
var setConnectionTimeout = (request, reject, timeoutInMs = 0) => {
	if (!timeoutInMs) return -1;
	const registerTimeout = (offset) => {
		const timeoutId = timing.setTimeout(() => {
			request.destroy();
			reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), { name: "TimeoutError" }));
		}, timeoutInMs - offset);
		const doWithSocket = (socket) => {
			if (socket?.connecting) socket.on("connect", () => {
				timing.clearTimeout(timeoutId);
			});
			else timing.clearTimeout(timeoutId);
		};
		if (request.socket) doWithSocket(request.socket);
		else request.on("socket", doWithSocket);
	};
	if (timeoutInMs < 2e3) {
		registerTimeout(0);
		return 0;
	}
	return timing.setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME$2), DEFER_EVENT_LISTENER_TIME$2);
};
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js
var setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger) => {
	if (timeoutInMs) return timing.setTimeout(() => {
		let msg = `@smithy/node-http-handler - [${throwOnRequestTimeout ? "ERROR" : "WARN"}] a request has exceeded the configured ${timeoutInMs} ms requestTimeout.`;
		if (throwOnRequestTimeout) {
			const error = Object.assign(new Error(msg), {
				name: "TimeoutError",
				code: "ETIMEDOUT"
			});
			req.destroy(error);
			reject(error);
		} else {
			msg += ` Init client requestHandler with throwOnRequestTimeout=true to turn this into an error.`;
			logger?.warn?.(msg);
		}
	}, timeoutInMs);
	return -1;
};
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js
var DEFER_EVENT_LISTENER_TIME$1 = 3e3;
var setSocketKeepAlive = (request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME$1) => {
	if (keepAlive !== true) return -1;
	const registerListener = () => {
		if (request.socket) request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
		else request.on("socket", (socket) => {
			socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
		});
	};
	if (deferTimeMs === 0) {
		registerListener();
		return 0;
	}
	return timing.setTimeout(registerListener, deferTimeMs);
};
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js
var DEFER_EVENT_LISTENER_TIME = 3e3;
var setSocketTimeout = (request, reject, timeoutInMs = 0) => {
	const registerTimeout = (offset) => {
		const timeout = timeoutInMs - offset;
		const onTimeout = () => {
			request.destroy();
			reject(Object.assign(/* @__PURE__ */ new Error(`@smithy/node-http-handler - the request socket timed out after ${timeoutInMs} ms of inactivity (configured by client requestHandler).`), { name: "TimeoutError" }));
		};
		if (request.socket) {
			request.socket.setTimeout(timeout, onTimeout);
			request.on("close", () => request.socket?.removeListener("timeout", onTimeout));
		} else request.setTimeout(timeout, onTimeout);
	};
	if (0 < timeoutInMs && timeoutInMs < 6e3) {
		registerTimeout(0);
		return 0;
	}
	return timing.setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
};
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/write-request-body.js
var MIN_WAIT_TIME = 6e3;
async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME, externalAgent = false) {
	const headers = request.headers;
	const expect = headers ? headers.Expect || headers.expect : void 0;
	let timeoutId = -1;
	let sendBody = true;
	if (!externalAgent && expect === "100-continue") sendBody = await Promise.race([new Promise((resolve) => {
		timeoutId = Number(timing.setTimeout(() => resolve(true), Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
	}), new Promise((resolve) => {
		httpRequest.on("continue", () => {
			timing.clearTimeout(timeoutId);
			resolve(true);
		});
		httpRequest.on("response", () => {
			timing.clearTimeout(timeoutId);
			resolve(false);
		});
		httpRequest.on("error", () => {
			timing.clearTimeout(timeoutId);
			resolve(false);
		});
	})]);
	if (sendBody) writeBody(httpRequest, request.body);
}
function writeBody(httpRequest, body) {
	if (body instanceof Readable) {
		body.pipe(httpRequest);
		return;
	}
	if (body) {
		const isBuffer = Buffer.isBuffer(body);
		if (isBuffer || typeof body === "string") {
			if (isBuffer && body.byteLength === 0) httpRequest.end();
			else httpRequest.end(body);
			return;
		}
		const uint8 = body;
		if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
			httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
			return;
		}
		httpRequest.end(Buffer.from(body));
		return;
	}
	httpRequest.end();
}
//#endregion
//#region node_modules/.pnpm/@smithy+node-http-handler@4.9.7/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js
var hAgent = void 0;
var hRequest = void 0;
var NodeHttpHandler = class NodeHttpHandler {
	config;
	configProvider;
	socketWarningTimestamp = 0;
	externalAgent = false;
	metadata = { handlerProtocol: "http/1.1" };
	static create(instanceOrOptions) {
		if (typeof instanceOrOptions?.handle === "function") return instanceOrOptions;
		return new NodeHttpHandler(instanceOrOptions);
	}
	static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
		const { sockets, requests, maxSockets } = agent;
		if (typeof maxSockets !== "number" || maxSockets === Infinity) return socketWarningTimestamp;
		if (Date.now() - 15e3 < socketWarningTimestamp) return socketWarningTimestamp;
		if (sockets && requests) for (const origin in sockets) {
			const socketsInUse = sockets[origin]?.length ?? 0;
			const requestsEnqueued = requests[origin]?.length ?? 0;
			if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
				logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
				return Date.now();
			}
		}
		return socketWarningTimestamp;
	}
	constructor(options) {
		this.configProvider = new Promise((resolve, reject) => {
			if (typeof options === "function") options().then((_options) => {
				resolve(this.resolveDefaultConfig(_options));
			}).catch(reject);
			else resolve(this.resolveDefaultConfig(options));
		});
	}
	destroy() {
		this.config?.httpAgent?.destroy();
		this.config?.httpsAgent?.destroy();
	}
	async handle(request, { abortSignal, requestTimeout } = {}) {
		if (!this.config) this.config = await this.configProvider;
		const config = this.config;
		const isSSL = request.protocol === "https:";
		if (!isSSL && !this.config.httpAgent) this.config.httpAgent = await this.config.httpAgentProvider();
		return new Promise((_resolve, _reject) => {
			let writeRequestBodyPromise = void 0;
			let socketWarningTimeoutId = -1;
			let connectionTimeoutId = -1;
			let requestTimeoutId = -1;
			let socketTimeoutId = -1;
			let keepAliveTimeoutId = -1;
			const clearTimeouts = () => {
				timing.clearTimeout(socketWarningTimeoutId);
				timing.clearTimeout(connectionTimeoutId);
				timing.clearTimeout(requestTimeoutId);
				timing.clearTimeout(socketTimeoutId);
				timing.clearTimeout(keepAliveTimeoutId);
			};
			const resolve = async (arg) => {
				await writeRequestBodyPromise;
				clearTimeouts();
				_resolve(arg);
			};
			const reject = async (arg) => {
				await writeRequestBodyPromise;
				clearTimeouts();
				_reject(arg);
			};
			if (abortSignal?.aborted) {
				reject(buildAbortError(abortSignal));
				return;
			}
			const headers = request.headers;
			const expectContinue = headers ? (headers.Expect ?? headers.expect) === "100-continue" : false;
			let agent = isSSL ? config.httpsAgent : config.httpAgent;
			if (expectContinue && !this.externalAgent) agent = new (isSSL ? node_https.Agent : hAgent)({
				keepAlive: false,
				maxSockets: Infinity
			});
			socketWarningTimeoutId = timing.setTimeout(() => {
				this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, config.logger);
			}, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2e3) + (config.connectionTimeout ?? 1e3));
			const queryString = request.query ? buildQueryString(request.query) : "";
			let auth = void 0;
			if (request.username != null || request.password != null) auth = `${request.username ?? ""}:${request.password ?? ""}`;
			let path = request.path;
			if (queryString) path += `?${queryString}`;
			if (request.fragment) path += `#${request.fragment}`;
			let hostname = request.hostname ?? "";
			if (hostname[0] === "[" && hostname.endsWith("]")) hostname = request.hostname.slice(1, -1);
			else hostname = request.hostname;
			const nodeHttpsOptions = {
				headers: request.headers,
				host: hostname,
				method: request.method,
				path,
				port: request.port,
				agent,
				auth
			};
			const req = (isSSL ? node_https.request : hRequest)(nodeHttpsOptions, (res) => {
				const httpResponse = new HttpResponse({
					statusCode: res.statusCode || -1,
					reason: res.statusMessage,
					headers: getTransformedHeaders(res.headers),
					body: res
				});
				resolve({ response: httpResponse });
			});
			req.on("error", (err) => {
				if (NODEJS_TIMEOUT_ERROR_CODES.includes(err.code)) reject(Object.assign(err, { name: "TimeoutError" }));
				else reject(err);
			});
			if (abortSignal) {
				const onAbort = () => {
					req.destroy();
					const abortError = buildAbortError(abortSignal);
					reject(abortError);
				};
				if (typeof abortSignal.addEventListener === "function") {
					const signal = abortSignal;
					signal.addEventListener("abort", onAbort, { once: true });
					req.once("close", () => signal.removeEventListener("abort", onAbort));
				} else abortSignal.onabort = onAbort;
			}
			const effectiveRequestTimeout = requestTimeout ?? config.requestTimeout;
			connectionTimeoutId = setConnectionTimeout(req, reject, config.connectionTimeout);
			requestTimeoutId = setRequestTimeout(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, config.logger ?? console);
			socketTimeoutId = setSocketTimeout(req, reject, config.socketTimeout);
			const httpAgent = nodeHttpsOptions.agent;
			if (typeof httpAgent === "object" && "keepAlive" in httpAgent) keepAliveTimeoutId = setSocketKeepAlive(req, {
				keepAlive: httpAgent.keepAlive,
				keepAliveMsecs: httpAgent.keepAliveMsecs
			});
			writeRequestBodyPromise = writeRequestBody(req, request, effectiveRequestTimeout, this.externalAgent).catch((e) => {
				clearTimeouts();
				return _reject(e);
			});
		});
	}
	updateHttpClientConfig(key, value) {
		this.config = void 0;
		this.configProvider = this.configProvider.then((config) => {
			return {
				...config,
				[key]: value
			};
		});
	}
	httpHandlerConfigs() {
		return this.config ?? {};
	}
	resolveDefaultConfig(options) {
		const { requestTimeout, connectionTimeout, socketTimeout, socketAcquisitionWarningTimeout, httpAgent, httpsAgent, throwOnRequestTimeout, logger } = options || {};
		const keepAlive = true;
		const maxSockets = 50;
		return {
			connectionTimeout,
			requestTimeout,
			socketTimeout,
			socketAcquisitionWarningTimeout,
			throwOnRequestTimeout,
			httpAgentProvider: async () => {
				const node_http = await import("node:http");
				const { Agent, request } = node_http.default ?? node_http;
				hRequest = request;
				hAgent = Agent;
				if (httpAgent instanceof hAgent || typeof httpAgent?.destroy === "function") {
					this.externalAgent = true;
					return httpAgent;
				}
				return new hAgent({
					keepAlive,
					maxSockets,
					...httpAgent
				});
			},
			httpsAgent: (() => {
				if (httpsAgent instanceof node_https.Agent || typeof httpsAgent?.destroy === "function") {
					this.externalAgent = true;
					return httpsAgent;
				}
				return new node_https.Agent({
					keepAlive,
					maxSockets,
					...httpsAgent
				});
			})(),
			logger
		};
	}
};
//#endregion
export { escapeUri as n, HttpResponse as r, NodeHttpHandler as t };
