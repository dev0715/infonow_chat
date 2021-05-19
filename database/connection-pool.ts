import { createPool, Pool, PoolConnection } from "promise-mysql";
import Configurations from "../configs";

export class ConnectionPool {
	private static Pool?: Pool = undefined;

	static async init() {
		ConnectionPool.Pool = await createPool(Configurations!.DatabaseConfigurations);
	}

	static isPoolInitialized() {
		return !!ConnectionPool.Pool;
	}

	static async getConnection(): Promise<PoolConnection> {
		if (!ConnectionPool.isPoolInitialized()) throw new Error("Database pool must be initialized");
		return ConnectionPool.Pool!.getConnection();
	}
}
