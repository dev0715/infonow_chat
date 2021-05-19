import * as redis from "redis";
import { RedisClient } from "redis";

export class Redis {
	client: RedisClient;

	static redisInstance: Redis;

	private constructor() {
		let refClient = redis.createClient();
		refClient.on("error", function (error: any) {
			console.error("Redis Server Error:", error);
		});

		refClient.flushdb(function (err: any, succeeded: any) {
			console.log("Redis Server Flush DB:", succeeded);
		});

		this.client = refClient;
	}

	static getInstance() {
		if (!Redis.redisInstance) {
			Redis.redisInstance = new Redis();
		}
		return this.redisInstance.client;
	}
}
