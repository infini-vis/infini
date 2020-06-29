import * as crypto from 'crypto';
import {Pool as postgresPool, types} from 'pg';
import {Logger} from '../utils';
types.setTypeParser(1114, stringValue => {
  return stringValue;
});

const _postgresPoolCreator = dbParams => {
  const pool = new postgresPool({
    user: dbParams.username,
    host: dbParams.host,
    database: dbParams.database,
    password: dbParams.password,
    port: dbParams.port,
  });

  return pool;
};

const _poolCreatorMap = {
  postgres: _postgresPoolCreator,
};

// database middleware
// basically we add a db method on the ctx object
// then return next() as middleware
export default function dbMixin(ctx) {
  ctx.db = {
    configs: new Map(),
    pools: new Map(),
    lastClientId: '',

    hash: function(dbId: string): string {
      return crypto
        .createHash('md5')
        .update(dbId)
        .digest('hex');
    },

    set: function(dbParams) {
      const {type, host, username, password, database, port} = dbParams;
      const dbId = [type, host, username, database, password, port].join('/*/');
      console.log('hash', dbId);
      const hash = ctx.db.hash(dbId);

      Logger(`set up db config ${type}: ${host} u:${username} p:${port}`);

      // update run time db params
      ctx.db.configs.set(hash, {id: hash, ...dbParams});
      return hash;
    },

    getLastConfig: function() {
      return ctx.db.configs.get(ctx.db.lastClientId);
    },

    // get database client
    setupClient: async function setupClient(dbParams) {
      const poolCreator = _poolCreatorMap[dbParams.type];
      const hash = ctx.db.set(dbParams);

      // if we have set the client, return the client
      if (ctx.db.pools.has(hash)) {
        Logger(`return cached db client ${hash}`);
        ctx.db.lastClientId = hash;
        return {id: hash, client: ctx.db.pools.get(hash)};
      }

      // otherwise create a new pool
      if (typeof poolCreator === 'function') {
        // create a pool
        const pool = poolCreator(dbParams);

        // error event
        pool.on('error', err => {
          Logger('Unexpected error on idle client', err);
        });

        // store the connection
        ctx.db.set(dbParams);
        ctx.db.pools.set(hash, pool);
        Logger(`create new db client ${JSON.stringify(dbParams)}`);
        ctx.db.lastClientId = hash;
        // return the pool
        return {id: hash, client: pool};
      }
      // avoid error
      return () => {};
    },

    getDbClient: function getDbClient(id) {
      const client = ctx.db.pools.get(id);
      if (!client) {
        ctx.throw(503, 'database not configured');
      }
      return client;
    },

    query: async function(sql: string, dbClient) {
      const result = await dbClient
        .query(sql)
        .then(res => {
          const {rows} = res;
          const key0 = Object.keys(rows[0])[0];
          const buffer = rows[0][key0];
          const isImageBuffer = Buffer.isBuffer(buffer);
          if (isImageBuffer) {
            res.rows = [`data:image/png;base64,` + buffer.toString('base64')];
          }
          return res || {};
        })
        .catch((e: any) => {
          Logger(`Query: error ${sql} ${JSON.stringify(e)}`);
        });
      Logger(`Query: ${sql}`);
      return result;
    },
  };

  return ctx;
}
