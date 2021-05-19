'use strict';

import { verifyDotEnv } from './verify';
import chalk from 'chalk';
import { Configurations } from './config-main';
import dotenv from 'dotenv';
function initConfig() {
    try {
        // Validating DotEnv Variables
        dotenv.config();
        verifyDotEnv();
        return true;
    } catch (error) {
        console.log(chalk.red(error.message));
        console.log(chalk.red('SHUTTING DOWN THE PROCESS'));
        console.log(error);
        return false;
    }
}

// Init Configs
export default (() => {
    if (initConfig()) {
        return Configurations;
    }
})();