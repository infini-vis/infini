import dbMixin from "./db";

describe("db mixin", () => {
  let ctx: any;

  beforeEach(() => {
    ctx = {
      throw: jest.fn(() => {}),
    };
    dbMixin(ctx);
  });

  test("should mixins ctx object as expected", () => {
    expect(ctx).toContainKey("db");
    expect(ctx.db).toContainKey("client");
    expect(ctx.db).toContainKey("query");
    expect(ctx.db).toContainKey("getClient");
    expect(ctx.db).toContainKey("setClient");
    expect(ctx.db).toContainKey("_createPool");
  });

  test("setClient/getClient", async () => {
    const p = {
      on: jest.fn(),
    };
    const poolCreator = jest.fn(() => p);
    const dbParams = {
      host: process.env.INFINI_HOST || "localhost",
      user: process.env.INFINI_USER || "postgres",
      password: process.env.INFINI_PWD || "docker",
      port: process.env.INFINI_PORT || 5432,
      database: process.env.INFINI_DB || "postgres",
    };
    const poolCreated = await ctx.db.setClient(
      "postgres",
      dbParams,
      poolCreator
    );
    expect(poolCreator).toBeCalled();
    expect(ctx.db.getClient()).toBe(poolCreated);
  });

  test("setClient with wrong type of database", async () => {
    const p = {
      on: jest.fn(),
    };
    const poolCreator = jest.fn(() => p);
    const dbParams = {};
    await ctx.db.setClient("abc", dbParams, poolCreator);
    expect(ctx.throw).toBeCalledWith(503, "Unsupported database type");
    expect(ctx.db.getClient()).toBe(null);
  });

  test("query without client", async () => {
    const p = {
      on: jest.fn(),
    };
    const poolCreator = jest.fn(() => p);
    const dbParams = {
      host: process.env.INFINI_HOST || "localhost",
      user: process.env.INFINI_USER || "postgres",
      password: process.env.INFINI_PWD || "docker",
      port: process.env.INFINI_PORT || 5432,
      database: process.env.INFINI_DB || "postgres",
    };
    await ctx.db.setClient("ac", dbParams, poolCreator);
    expect(ctx.throw).toBeCalledWith(503, "Unsupported database type");
    await ctx.db.query("select * from nyc_taxi");
    expect(ctx.throw).toBeCalledWith(503, "no connection found");
  });

  test("query with client", async () => {
    const p = {
      on: jest.fn(),
      query: jest.fn((a) => Promise.resolve(a)),
    };
    const poolCreator = jest.fn(() => p);
    const dbParams = {
      host: process.env.INFINI_HOST || "localhost",
      user: process.env.INFINI_USER || "postgres",
      password: process.env.INFINI_PWD || "docker",
      port: process.env.INFINI_PORT || 5432,
      database: process.env.INFINI_DB || "postgres",
    };
    await ctx.db.setClient("postgres", dbParams, poolCreator);
    const res = await ctx.db.query("select * from nyc_taxi");
    expect(res).toEqual("select * from nyc_taxi");
  });

  test("query with client then connection error happened", async () => {
    ctx = {
      throw: jest.fn(() => {}),
    };
    dbMixin(ctx);
    const p = {
      on: jest.fn((event, fn) => {
        fn("1");
      }),
      query: jest.fn((a) => Promise.resolve(a)),
    };
    const poolCreator = jest.fn(() => p);
    const dbParams = {
      host: process.env.INFINI_HOST || "localhost",
      user: process.env.INFINI_USER || "postgres",
      password: process.env.INFINI_PWD || "docker",
      port: process.env.INFINI_PORT || 5432,
      database: process.env.INFINI_DB || "postgres",
    };
    const mockFn = jest.fn((err) => {
      return err;
    });
    await ctx.db.setClient("postgres", dbParams, poolCreator);
    p.on("error", mockFn);
    expect(mockFn).toBeCalledWith("1");
  });

  test("query with client then the client has error", async () => {
    ctx = {
      throw: jest.fn(() => {}),
    };
    dbMixin(ctx);
    const e = 'error';
    const p = {
      on: jest.fn((event, fn) => {
        fn("1");
      }),
      query: jest.fn((sql) => {
        return new Promise((resolve, reject) => {
          throw e;
        });
      }),
    };
    const poolCreator = jest.fn(() => p);
    const dbParams = {
      host: process.env.INFINI_HOST || "localhost",
      user: process.env.INFINI_USER || "postgres",
      password: process.env.INFINI_PWD || "docker",
      port: process.env.INFINI_PORT || 5432,
      database: process.env.INFINI_DB || "postgres",
    };
    process.env.NODE_ENV = "initial";

    await ctx.db.setClient("postgres", dbParams, poolCreator);
    const sql = "SELECT * from postgres";
    let a: any = console.log;
    a = jest.fn();
    console.log = a;
    await ctx.db.query(sql);
    expect(a.mock.calls[0][1]).toBe(`Query: error ${sql} ${JSON.stringify(e)}`);
  });
});
