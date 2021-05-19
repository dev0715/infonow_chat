
// suppress Logs 
console.log = () => { }

import Configs from '../../configs';
import { expect, should } from 'chai';


describe('Configuration Tests', () => {
    it('Configurations are set', () => {
        should().exist(Configs, "Configurations are non-null")
    });

    it('Database user variable is set', () => {
        should().exist(Configs!.DatabaseConfigurations.host, "Database host is set")
    });
});