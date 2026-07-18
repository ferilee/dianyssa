import { W as isConfig, _ as extractTablesRelationalConfig, g as createTableRelationsHelpers, pt as DefaultLogger } from "./cache-DwtHELNC.js";
import { a as PgDialect } from "./session-OGJ4Tvug.js";
//#region __vite-optional-peer-dep:postgres:drizzle-orm
var __vite_optional_peer_dep_postgres_drizzle_orm_default = {};
throw new Error(`Could not resolve "postgres" imported by "drizzle-orm". Is it installed?`);
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
	if (typeof params[0] === "string") return construct(__vite_optional_peer_dep_postgres_drizzle_orm_default(params[0]), params[1]);
	if (isConfig(params[0])) {
		const { connection, client, ...drizzleConfig } = params[0];
		if (client) return construct(client, drizzleConfig);
		if (typeof connection === "object" && connection.url !== void 0) {
			const { url, ...config } = connection;
			return construct(__vite_optional_peer_dep_postgres_drizzle_orm_default(url, config), drizzleConfig);
		}
		return construct(__vite_optional_peer_dep_postgres_drizzle_orm_default(connection), drizzleConfig);
	}
	return construct(params[0], params[1]);
}
//#endregion
export { PostgresJsDatabase, PostgresJsPreparedQuery, PostgresJsSession, PostgresJsTransaction, drizzle };
var PostgresJsPreparedQuery, PostgresJsSession, PostgresJsTransaction, PostgresJsDatabase;
