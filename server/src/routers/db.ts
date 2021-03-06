import { IsNotEmpty, IsArray, ValidateNested, IsString } from "class-validator";
import {
  getTableDetail,
  getAllTables,
  getAllTablesDetail,
} from "../services/query";
import { Type } from "class-transformer";

// request type
class TableDetail {
  @IsString()
  @IsNotEmpty({
    message: "The property id can not be empty",
  })
  readonly id;
  @IsString()
  @IsNotEmpty({
    message: "The property name can not be empty",
  })
  readonly name;
}

// request type
class AllTables {
  @IsString()
  @IsNotEmpty({
    message: "The property id can not be empty",
  })
  readonly id;
}

class Tables {
  @IsString()
  @IsNotEmpty({
    message: "The property id can not be empty",
  })
  readonly id;

  @IsArray({ message: "The property tables must be an array" })
  readonly tables: string[];
}

// request type
class SingleQueryReq {
  @IsString()
  @IsNotEmpty({
    message: "The property id can not be empty",
  })
  readonly id;

  @IsNotEmpty({
    message: "The property sql can not be empty",
  })
  readonly sql;

  readonly type;
  readonly timestamp;
}

class MultipleQueryBody {
  @ValidateNested({ each: true })
  @Type(() => SingleQueryReq)
  @IsArray({ message: "The query must be an array" })
  @IsNotEmpty({
    message: "The property query can not be empty",
  })
  readonly query: SingleQueryReq[];
}

export default function query(router) {
  router.post("/db/table/detail", async (ctx, next) => {
    // validator Request body Type
    await ctx.validate(TableDetail);

    const { name } = ctx.request.body;
    const client = ctx.db.getClient();

    ctx.body = await getTableDetail(client, name);
    await next();
  });

  // get all tables
  router.post("/db/tables", async (ctx, next) => {
    // validator Request body Type
    await ctx.validate(AllTables);

    const client = ctx.db.getClient();

    ctx.body = await getAllTables(client);
    await next();
  });

  // get all tables and details
  router.post("/db/tables/detail", async (ctx, next) => {
    // validator Request body Type
    await ctx.validate(Tables);

    const { tables } = ctx.request.body;
    const client = ctx.db.getClient();

    ctx.body = await getAllTablesDetail(client, tables);
    await next();
  });

  // nomral query
  router.post("/db/query", async (ctx, next) => {
    // validator Request body Type
    await ctx.validate(MultipleQueryBody);

    const { query } = ctx.request.body;

    let result = [];

    for (let i = 0; i < query.length; i++) {
      let { sql, id, timestamp = Date.now() } = query[i];
      let err = false;
      let _res = await ctx.db.query(sql);

      result.push({
        id,
        sql,
        timestamp,
        result: err ? [] : _res && _res.rows,
        err: !!err,
      });
    }

    ctx.body = result;
    await next();
  });

  return router;
}
