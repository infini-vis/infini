import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

// request type
class DB {
  @IsString()
  @IsNotEmpty({
    message: 'The property type can not be empty, please use postgres or other database type',
  })
  readonly type;

  @IsString()
  @IsNotEmpty({
    message: 'The property host can not be empty',
  })
  readonly host;

  @IsString()
  @IsNotEmpty({
    message: 'The property username can not be empty',
  })
  readonly username;

  @IsString()
  @IsNotEmpty({
    message: 'The property password can not be empty',
  })
  readonly password;

  @IsNumber()
  @IsNotEmpty({
    message: 'The property port can not be empty',
  })
  readonly port;

  @IsString()
  @IsNotEmpty({
    message: 'The property database can not be empty',
  })
  readonly database;
}

export default function config(router) {
  // get last db
  router.get('/config/db', async (ctx, next) => {
    ctx.body = ctx.db.getLastConfig();
    await next();
  });

  // get config db
  router.get('/config/db/:id', async (ctx, next) => {
    if (ctx.db.configs.has(ctx.params.id)) {
      ctx.body = ctx.db.configs.get(ctx.params.id);
    } else {
      ctx.throw(404);
    }
    await next();
  });

  // update config db
  router.post('/config/db', async (ctx, next) => {
    // validator Request body Type
    await ctx.validate(DB);
    const dbParams = ctx.request.body;

    // get db client
    const {id} = await ctx.db.setupClient(dbParams);
    ctx.body = {id};
    await next();
  });

  return router;
}
