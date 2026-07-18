import { $ as sql, G as mapResultRow, Q as fillPlaceholders, W as isConfig, _ as extractTablesRelationalConfig, g as createTableRelationsHelpers, ht as entityKind, mt as NoopLogger, pt as DefaultLogger, t as NoopCache } from "./cache-DwtHELNC.js";
import { a as PgDialect, i as PgDatabase, n as PgSession, r as PgTransaction, t as PgPreparedQuery } from "./session-OGJ4Tvug.js";
import { n as ce, r as export_types, t as Mn } from "./serverless-skz0BDJt.js";
//#region node_modules/.pnpm/drizzle-orm@0.45.2_@libsql+client@0.15.15_@neondatabase+serverless@1.1.0_@opentelemetry_c5561ff4a6ac9389e27710f83e53db58/node_modules/drizzle-orm/neon-serverless/session.js
var NeonPreparedQuery = class extends PgPreparedQuery {
	constructor(client, queryString, params, logger, cache, queryMetadata, cacheConfig, fields, name, _isResponseInArrayMode, customResultMapper) {
		super({
			sql: queryString,
			params
		}, cache, queryMetadata, cacheConfig);
		this.client = client;
		this.params = params;
		this.logger = logger;
		this.fields = fields;
		this._isResponseInArrayMode = _isResponseInArrayMode;
		this.customResultMapper = customResultMapper;
		this.rawQueryConfig = {
			name,
			text: queryString,
			types: { getTypeParser: (typeId, format) => {
				if (typeId === export_types.builtins.TIMESTAMPTZ) return (val) => val;
				if (typeId === export_types.builtins.TIMESTAMP) return (val) => val;
				if (typeId === export_types.builtins.DATE) return (val) => val;
				if (typeId === export_types.builtins.INTERVAL) return (val) => val;
				if (typeId === 1231) return (val) => val;
				if (typeId === 1115) return (val) => val;
				if (typeId === 1185) return (val) => val;
				if (typeId === 1187) return (val) => val;
				if (typeId === 1182) return (val) => val;
				return export_types.getTypeParser(typeId, format);
			} }
		};
		this.queryConfig = {
			name,
			text: queryString,
			rowMode: "array",
			types: { getTypeParser: (typeId, format) => {
				if (typeId === export_types.builtins.TIMESTAMPTZ) return (val) => val;
				if (typeId === export_types.builtins.TIMESTAMP) return (val) => val;
				if (typeId === export_types.builtins.DATE) return (val) => val;
				if (typeId === export_types.builtins.INTERVAL) return (val) => val;
				if (typeId === 1231) return (val) => val;
				if (typeId === 1115) return (val) => val;
				if (typeId === 1185) return (val) => val;
				if (typeId === 1187) return (val) => val;
				if (typeId === 1182) return (val) => val;
				return export_types.getTypeParser(typeId, format);
			} }
		};
	}
	static [entityKind] = "NeonPreparedQuery";
	rawQueryConfig;
	queryConfig;
	async execute(placeholderValues = {}) {
		const params = fillPlaceholders(this.params, placeholderValues);
		this.logger.logQuery(this.rawQueryConfig.text, params);
		const { fields, client, rawQueryConfig: rawQuery, queryConfig: query, joinsNotNullableMap, customResultMapper } = this;
		if (!fields && !customResultMapper) return await this.queryWithCache(rawQuery.text, params, async () => {
			return await client.query(rawQuery, params);
		});
		const result = await this.queryWithCache(query.text, params, async () => {
			return await client.query(query, params);
		});
		return customResultMapper ? customResultMapper(result.rows) : result.rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
	}
	all(placeholderValues = {}) {
		const params = fillPlaceholders(this.params, placeholderValues);
		this.logger.logQuery(this.rawQueryConfig.text, params);
		return this.queryWithCache(this.rawQueryConfig.text, params, async () => {
			return await this.client.query(this.rawQueryConfig, params);
		}).then((result) => result.rows);
	}
	values(placeholderValues = {}) {
		const params = fillPlaceholders(this.params, placeholderValues);
		this.logger.logQuery(this.rawQueryConfig.text, params);
		return this.queryWithCache(this.queryConfig.text, params, async () => {
			return await this.client.query(this.queryConfig, params);
		}).then((result) => result.rows);
	}
	/** @internal */
	isResponseInArrayMode() {
		return this._isResponseInArrayMode;
	}
};
var NeonSession = class NeonSession extends PgSession {
	constructor(client, dialect, schema, options = {}) {
		super(dialect);
		this.client = client;
		this.schema = schema;
		this.options = options;
		this.logger = options.logger ?? new NoopLogger();
		this.cache = options.cache ?? new NoopCache();
	}
	static [entityKind] = "NeonSession";
	logger;
	cache;
	prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
		return new NeonPreparedQuery(this.client, query.sql, query.params, this.logger, this.cache, queryMetadata, cacheConfig, fields, name, isResponseInArrayMode, customResultMapper);
	}
	async query(query, params) {
		this.logger.logQuery(query, params);
		return await this.client.query({
			rowMode: "array",
			text: query,
			values: params
		});
	}
	async queryObjects(query, params) {
		return this.client.query(query, params);
	}
	async count(sql2) {
		const res = await this.execute(sql2);
		return Number(res["rows"][0]["count"]);
	}
	async transaction(transaction, config = {}) {
		const session = this.client instanceof Mn ? new NeonSession(await this.client.connect(), this.dialect, this.schema, this.options) : this;
		const tx = new NeonTransaction(this.dialect, session, this.schema);
		await tx.execute(sql`begin ${tx.getTransactionConfigSQL(config)}`);
		try {
			const result = await transaction(tx);
			await tx.execute(sql`commit`);
			return result;
		} catch (error) {
			await tx.execute(sql`rollback`);
			throw error;
		} finally {
			if (this.client instanceof Mn) session.client.release();
		}
	}
};
var NeonTransaction = class NeonTransaction extends PgTransaction {
	static [entityKind] = "NeonTransaction";
	async transaction(transaction) {
		const savepointName = `sp${this.nestedIndex + 1}`;
		const tx = new NeonTransaction(this.dialect, this.session, this.schema, this.nestedIndex + 1);
		await tx.execute(sql.raw(`savepoint ${savepointName}`));
		try {
			const result = await transaction(tx);
			await tx.execute(sql.raw(`release savepoint ${savepointName}`));
			return result;
		} catch (e) {
			await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
			throw e;
		}
	}
};
//#endregion
//#region node_modules/.pnpm/drizzle-orm@0.45.2_@libsql+client@0.15.15_@neondatabase+serverless@1.1.0_@opentelemetry_c5561ff4a6ac9389e27710f83e53db58/node_modules/drizzle-orm/neon-serverless/driver.js
var NeonDriver = class {
	constructor(client, dialect, options = {}) {
		this.client = client;
		this.dialect = dialect;
		this.options = options;
	}
	static [entityKind] = "NeonDriver";
	createSession(schema) {
		return new NeonSession(this.client, this.dialect, schema, {
			logger: this.options.logger,
			cache: this.options.cache
		});
	}
};
var NeonDatabase = class extends PgDatabase {
	static [entityKind] = "NeonServerlessDatabase";
};
function construct(client, config = {}) {
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
	const db = new NeonDatabase(dialect, new NeonDriver(client, dialect, {
		logger,
		cache: config.cache
	}).createSession(schema), schema);
	db.$client = client;
	db.$cache = config.cache;
	if (db.$cache) db.$cache["invalidate"] = config.cache?.onMutate;
	return db;
}
function drizzle(...params) {
	if (typeof params[0] === "string") return construct(new Mn({ connectionString: params[0] }), params[1]);
	if (isConfig(params[0])) {
		const { connection, client, ws, ...drizzleConfig } = params[0];
		if (ws) ce.webSocketConstructor = ws;
		if (client) return construct(client, drizzleConfig);
		return construct(typeof connection === "string" ? new Mn({ connectionString: connection }) : new Mn(connection), drizzleConfig);
	}
	return construct(params[0], params[1]);
}
((drizzle2) => {
	function mock(config) {
		return construct({}, config);
	}
	drizzle2.mock = mock;
})(drizzle || (drizzle = {}));
//#endregion
export { NeonDatabase, NeonDriver, NeonPreparedQuery, NeonSession, NeonTransaction, drizzle };
