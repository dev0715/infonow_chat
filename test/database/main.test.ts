
// suppress Logs 
// console.log = () => { }

import { ConnectionPool } from '../../database/connection-pool';
import { expect, should } from 'chai';


describe('SQL Connection Pool', async () => {

    it('Pool is set after initialization', async () => {
        await ConnectionPool.init();
        let isPoolInitialized = ConnectionPool.isPoolInitialized()
        expect(isPoolInitialized, 'Pool is set after initialization').to.eql(true);
    });

    it('Connection Acquired', async () => {
        let connection = await ConnectionPool.getConnection();
        should().exist(connection, "Connection can be acquired from Pool")
        await connection.release();
    });

    it('Query executing successfully', async () => {
        let connection = await ConnectionPool.getConnection();
        let results = await connection.query("SELECT 1+1 as `solution`");
        await connection.release();
        expect(results[0].solution, "Query executing successfully").to.equal(2);
    });
});
