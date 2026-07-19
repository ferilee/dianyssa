import { G as mapResultRow, Q as fillPlaceholders, W as isConfig, _ as extractTablesRelationalConfig, g as createTableRelationsHelpers, ht as entityKind, mt as NoopLogger, pt as DefaultLogger, t as NoopCache, tt as tracer } from "./cache-BPuYUtol.js";
import { a as PgDialect, i as PgDatabase, n as PgSession, r as PgTransaction, t as PgPreparedQuery } from "./session-BFV0YCOy.js";
import { t as src_default } from "./src-BwMurMV_.js";
//#region node_modules/.pnpm/drizzle-orm@0.45.2_@libsql+client@0.15.15_@neondatabase+serverless@1.1.0_@opentelemetry_b5d52d0b5f492bb170b2aed8fa0db5ab/node_modules/drizzle-orm/postgres-js/session.js
var PostgresJsPreparedQuery = class extends PgPreparedQuery {
	constructor(client, queryString, params, logger, cache, queryMetadata, cacheConfig, fields, _isResponseInArrayMode, customResultMapper) {
		super({
			sql: queryString,
			params
		}, cache, queryMetadata, cacheConfig);
		this.client = client;
		this.queryString = queryString;
		this.params = params;
		this.logger = logger;
		this.fields = fields;
		this._isResponseInArrayMode = _isResponseInArrayMode;
		this.customResultMapper = customResultMapper;
	}
	static [entityKind] = "PostgresJsPreparedQuery";
	async execute(placeholderValues = {}) {
		return tracer.startActiveSpan("drizzle.execute", async (span) => {
			const params = fillPlaceholders(this.params, placeholderValues);
			span?.setAttributes({
				"drizzle.query.text": this.queryString,
				"drizzle.query.params": JSON.stringify(params)
			});
			this.logger.logQuery(this.queryString, params);
			const { fields, queryString: query, client, joinsNotNullableMap, customResultMapper } = this;
			if (!fields && !customResultMapper) return tracer.startActiveSpan("drizzle.driver.execute", () => {
				return this.queryWithCache(query, params, async () => {
					return await client.unsafe(query, params);
				});
			});
			const rows = await tracer.startActiveSpan("drizzle.driver.execute", () => {
				span?.setAttributes({
					"drizzle.query.text": query,
					"drizzle.query.params": JSON.stringify(params)
				});
				return this.queryWithCache(query, params, async () => {
					return await client.unsafe(query, params).values();
				});
			});
			return tracer.startActiveSpan("drizzle.mapResponse", () => {
				return customResultMapper ? customResultMapper(rows) : rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
			});
		});
	}
	all(placeholderValues = {}) {
		return tracer.startActiveSpan("drizzle.execute", async (span) => {
			const params = fillPlaceholders(this.params, placeholderValues);
			span?.setAttributes({
				"drizzle.query.text": this.queryString,
				"drizzle.query.params": JSON.stringify(params)
			});
			this.logger.logQuery(this.queryString, params);
			return tracer.startActiveSpan("drizzle.driver.execute", () => {
				span?.setAttributes({
					"drizzle.query.text": this.queryString,
					"drizzle.query.params": JSON.stringify(params)
				});
				return this.queryWithCache(this.queryString, params, async () => {
					return this.client.unsafe(this.queryString, params);
				});
			});
		});
	}
	/** @internal */
	isResponseInArrayMode() {
		return this._isResponseInArrayMode;
	}
};
var PostgresJsSession = class PostgresJsSession extends PgSession {
	constructor(client, dialect, schema, options = {}) {
		super(dialect);
		this.client = client;
		this.schema = schema;
		this.options = options;
		this.logger = options.logger ?? new NoopLogger();
		this.cache = options.cache ?? new NoopCache();
	}
	static [entityKind] = "PostgresJsSession";
	logger;
	cache;
	prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
		return new PostgresJsPreparedQuery(this.client, query.sql, query.params, this.logger, this.cache, queryMetadata, cacheConfig, fields, isResponseInArrayMode, customResultMapper);
	}
	query(query, params) {
		this.logger.logQuery(query, params);
		return this.client.unsafe(query, params).values();
	}
	queryObjects(query, params) {
		return this.client.unsafe(query, params);
	}
	transaction(transaction, config) {
		return this.client.begin(async (client) => {
			const session = new PostgresJsSession(client, this.dialect, this.schema, this.options);
			const tx = new PostgresJsTransaction(this.dialect, session, this.schema);
			if (config) await tx.setTransaction(config);
			return transaction(tx);
		});
	}
};
var PostgresJsTransaction = class PostgresJsTransaction extends PgTransaction {
	constructor(dialect, session, schema, nestedIndex = 0) {
		super(dialect, session, schema, nestedIndex);
		this.session = session;
	}
	static [entityKind] = "PostgresJsTransaction";
	transaction(transaction) {
		return this.session.client.savepoint((client) => {
			const session = new PostgresJsSession(client, this.dialect, this.schema, this.session.options);
			return transaction(new PostgresJsTransaction(this.dialect, session, this.schema));
		});
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2_@libsql+client@0.15.15_@neondatabase+serverless@1.1.0_@opentelemetry_b5d52d0b5f492bb170b2aed8fa0db5ab/node_modules/drizzle-orm/postgres-js/driver.js
var PostgresJsDatabase = class extends PgDatabase {
	static [entityKind] = "PostgresJsDatabase";
};
function construct(client, config = {}) {
	const transparentParser = (val) => val;
	for (const type of [
		"1184",
		"1082",
		"1083",
		"1114",
		"1182",
		"1185",
		"1115",
		"1231"
	]) {
		client.options.parsers[type] = transparentParser;
		client.options.serializers[type] = transparentParser;
	}
	client.options.serializers["114"] = transparentParser;
	client.options.serializers["3802"] = transparentParser;
	const dialect = new PgDialect({ casing: config.casing });
	let logger;
	if (config.logger === true) logger = new DefaultLogger();
	else if (config.logger !== false) logger = config.logger;
	let schema;
	if (config.schema) {
		const tablesConfig = extractTablesRelationalConfig(config.schema, createTableRelationsHelpers);
		schema = {
			fullSchema: config.schema,
			schema: tablesConfig.tables,
			tableNamesMap: tablesConfig.tableNamesMap
		};
	}
	const db = new PostgresJsDatabase(dialect, new PostgresJsSession(client, dialect, schema, {
		logger,
		cache: config.cache
	}), schema);
	db.$client = client;
	db.$cache = config.cache;
	if (db.$cache) db.$cache["invalidate"] = config.cache?.onMutate;
	return db;
}
function drizzle(...params) {
	if (typeof params[0] === "string") return construct(src_default(params[0]), params[1]);
	if (isConfig(params[0])) {
		const { connection, client, ...drizzleConfig } = params[0];
		if (client) return construct(client, drizzleConfig);
		if (typeof connection === "object" && connection.url !== void 0) {
			const { url, ...config } = connection;
			return construct(src_default(url, config), drizzleConfig);
		}
		return construct(src_default(connection), drizzleConfig);
	}
	return construct(params[0], params[1]);
}
((drizzle2) => {
	function mock(config) {
		return construct({ options: {
			parsers: {},
			serializers: {}
		} }, config);
	}
	drizzle2.mock = mock;
})(drizzle || (drizzle = {}));
//#endregion
export { PostgresJsDatabase, PostgresJsPreparedQuery, PostgresJsSession, PostgresJsTransaction, drizzle };
