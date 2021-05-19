import { config } from "dotenv";
config();

export namespace Configurations {
	export const DatabaseConfigurations = {
		host: process.env.DATABASE_HOST,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
	};

	export const AuthorizationConfigurations = {
		private_key: process.env.AUTHORIZATION_PRIVATE_KEY,
		token_life: parseInt(process.env.AUTHORIZATION_TOKEN_LIFE ?? "0") * 60 * 60 * 1000, // Converting Hours to Milliseconds
	};

	export const RedisServerConfiguration = {
		host: process.env.REDIS_SERVER_HOST!,
		port: parseInt(process.env.REDIS_SERVER_PORT!)
	}

	export const HTTPServerConfigurations = {
		env: process.env.HTTP_SERVER_ENV,
		host: process.env.HTTP_SERVER_HOST,
		port: process.env.HTTP_SERVER_PORT,
		sslEnabled: process.env.HTTP_SERVER_SSLENABLED == "true",
	};

	export const WSServerConfigurations = {
		env: process.env.SOCKET_SERVER_ENV,
		host: process.env.SOCKET_SERVER_HOST,
		port: process.env.SOCKET_SERVER_PORT,
		sslEnabled: process.env.SOCKET_SERVER_SSLENABLED == "true",
	};

	export const EmailServerConfigurations = {
		config: {
			host: process.env.EMAIL_SERVER_CONFIG_HOST,
			port: process.env.EMAIL_SERVER_CONFIG_PORT,
			secure: process.env.EMAIL_SERVER_CONFIG_SECURE, // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_SERVER_CONFIG_AUTH_USER,
				pass: process.env.EMAIL_SERVER_CONFIG_AUTH_PASSWORD,
			},
		},
		from: {
			name: process.env.EMAIL_SERVER_CONFIG_FROM_NAME,
			email: process.env.EMAIL_SERVER_CONFIG_FROM_EMAIL,
		},
	};

	export const ErrorReportingConfigurations = {
		email: process.env.ERROR_REPORTING_EMAIL,
	};
}
