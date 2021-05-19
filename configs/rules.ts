import { Configuration, ConfigurationValidator } from "./types";

const NUMBER_REGEX = new RegExp(/^[0-9]+$/);
const BOOL_REGEX = new RegExp(/^false|true$/);
const EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
const ENCRYPTION_KEY_REGEX = new RegExp(/^.{256}$/);
const STRING_REGEX = new RegExp(/^.*$/);

export const Rules: ConfigurationValidator[] = [
	{ type: 'string', pattern: STRING_REGEX },
	{ type: 'number', pattern: NUMBER_REGEX },
	{ type: 'boolean', pattern: BOOL_REGEX },
	{ type: 'email', pattern: EMAIL_REGEX },
	{ type: 'encryption_key', pattern: ENCRYPTION_KEY_REGEX },
];

export const RequiredConfigurations: Configuration[] = [
	{
		"name": "DATABASE_HOST",
		"type": "string"
	},
	{
		"name": "DATABASE_USER",
		"type": "string"
	},
	{
		"name": "DATABASE_PASSWORD",
		"type": "string"
	},
	{
		"name": "DATABASE_NAME",
		"type": "string"
	},
	{
		"name": "AUTHORIZATION_PRIVATE_KEY",
		"type": "encryption_key"
	},
	{
		"name": "AUTHORIZATION_TOKEN_LIFE",
		"type": "number"
	},
	{
		"name": "HTTP_SERVER_ENV",
		"type": "string"
	},
	{
		"name": "HTTP_SERVER_HOST",
		"type": "string"
	},
	{
		"name": "HTTP_SERVER_PORT",
		"type": "number"
	},
	{
		"name": "HTTP_SERVER_SSLENABLED",
		"type": "boolean"
	},
	{
		"name": "SOCKET_SERVER_ENV",
		"type": "string"
	},
	{
		"name": "SOCKET_SERVER_HOST",
		"type": "string"
	},
	{
		"name": "SOCKET_SERVER_PORT",
		"type": "number"
	},
	{
		"name": "SOCKET_SERVER_SSLENABLED",
		"type": "boolean"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_HOST",
		"type": "string"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_PORT",
		"type": "number"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_SECURE",
		"type": "boolean"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_AUTH_USER",
		"type": "string"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_AUTH_PASSWORD",
		"type": "string"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_FROM_NAME",
		"type": "string"
	},
	{
		"name": "EMAIL_SERVER_CONFIG_FROM_EMAIL",
		"type": "email"
	},
	{
		"name": "ERROR_REPORTING_EMAIL",
		"type": "email"
	},
	{
		"name": "REDIS_SERVER_HOST",
		"type": "string"
	},
	{
		"name": "REDIS_SERVER_PORT",
		"type": "number"
	}
]
