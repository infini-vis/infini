import { Pool as postgresPool, types } from "pg";
import { Logger } from "../utils";
// types.setTypeParser(1114, (stringValue) => {
//   return stringValue;
// });

type DBParams = {
  host: string;
  user: string;
  password: string;
  port: number;
  database: string;
};

export const postgresPoolCreator = (
  dbParams: DBParams,
  poolCreator = postgresPool
) => {
  const pool = new poolCreator({
    user: dbParams.user,
    host: dbParams.host,
    database: dbParams.database,
    password: dbParams.password,
    port: dbParams.port,
  });

  return pool;
};

const _poolCreatorMap = { postgres: postgresPoolCreator };

const getPoolCreator = (type: string, poolCreator?: Function) => {
  if (!_poolCreatorMap[type]) {
    return null;
  }
  return poolCreator ? poolCreator : _poolCreatorMap[type];
};

// database middleware
// basically we add a db method on the ctx object
// then return next() as middleware
export default function dbMixin(ctx) {
  ctx.db = {
    client: null,

    _createPool: function _createPool(
      type: string,
      dbParams: DBParams,
      poolCreator?: Function
    ) {
      const pc = getPoolCreator(type, poolCreator);
      if (typeof pc === "function") {
        // create a pool
        const pool = pc(dbParams);

        // error event
        pool.on("error", (err) => {
          ctx.throw(503, err);
          return;
        });

        return pool;
      } else {
        return null;
      }
    },

    // set database client
    setClient: async function setClient(
      type: string,
      dbParams: DBParams,
      poolCreator?: Function
    ) {
      // create a pool
      const pool = this._createPool(type, dbParams, poolCreator);

      if (!pool) {
        ctx.throw(503, "Unsupported database type");
      }

      // store the connection
      Logger(`create new db client ${JSON.stringify(dbParams)}`);
      // store the client
      this.client = pool;
      // return the pool
      return pool;
    },

    getClient: function getClient() {
      const client = this.client;
      if (!client) {
        ctx.throw(503, "no connection found");
      }
      return client;
    },

    query: async function query(sql: string) {
      if (!this.client) {
        ctx.throw(503, "no connection found");
        return;
      }
      const result = await this.client
        .query(sql)
        .then((res) => {
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
