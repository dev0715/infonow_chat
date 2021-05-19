import { Configuration, ConfigurationValidator } from './types';
import { Rules,  RequiredConfigurations } from './rules';
import chalk from 'chalk';


function parseEnvVariable(
	key: Configuration,
	success = `* Successfully parsed ${key.name} as ${key.type}`,
	error = `* ${key.name} is not defined in .env`
) {
	let envVariable = process.env[key.name];
	if (!envVariable) throw new Error(error);
	
	let rule = Rules.find(x=>x.type == key.type);
	if (rule) {
		if (!rule.pattern.test(envVariable)) {
			throw new Error(`${key.name} should be a ${key.type}.`);
		}
	}
    

	console.log(chalk.green(success));
}

export function verifyDotEnv() {
	console.log(chalk.green('----------------------------------------'));
	console.log(chalk.green('|    Parsing Environment variables     |'));
	console.log(chalk.green('----------------------------------------'));

	//! --------------------------------- !//
	//! -    VERIFYING CONFIGURATIONS   - !//
	//! --------------------------------- !//
	for (var envVar of RequiredConfigurations) {
		parseEnvVariable(envVar);
	}

	console.log(chalk.green('----------------------------------------'));
	console.log(chalk.green('|  Done Parsing Environment variables  |'));
	console.log(chalk.green('----------------------------------------'));
}
