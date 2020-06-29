import "reflect-metadata";
import * as Koa from "koa";
import * as Router from "koa-router";
import * as logger from "koa-logger";
import * as json from "koa-json";
import * as jwt from "koa-jwt";
import * as bodyParser from "koa-bodyparser";
import * as helmet from "koa-helmet";
import * as routerCreators from "./routers";
import * as middlewares from "./middlewares";
import * as events from "./events";
import * as mixins from "./mixins";
import * as cors from "@koa/cors";
import { port, secret } from "./configs/server.config";
import { Logger } from "./utils";

// create new koa instance
const app = new Koa();
// create router instance
const router = new Router();
// public path regexp
const publicPath = /^\/login/;

// load all mixins exported from src/mixins/index.ts
Object.keys(mixins).forEach((ctx) => {
  const mixin = mixins[ctx];
  mixin(app.context);
});

// load all event handlers exported from src/events/index.ts
Object.keys(events).forEach((eventKey) => {
  const event = events[eventKey];
  app.on(eventKey, event);
});

// load all middlewares exported from src/middlewares/index.ts
Object.keys(middlewares).forEach((mKey) => {
  const middleware = middlewares[mKey];
  app.use(middleware);
});

// load system Middlewares
app.use(cors());
app.use(helmet());
app.use(json());
app.use(logger((str) => Logger(str)));
app.use(bodyParser());
app.use(jwt({ secret }).unless({ path: [publicPath] }));

// load all router creators exported from src/routers/index.ts
// a router creator is basically a function
// that add route method for the passed in router object
Object.keys(routerCreators).forEach((routeKey) => {
  const create = routerCreators[routeKey];
  create(router);
});

// load Routes, it should be the last middleware to load
app.use(router.routes()).use(router.allowedMethods());

// Successful response:
// {
//   "status": "success",
//   "code": 200,
//   "data": {
//     // Application-specific data would go here.
//   },
//   "message": null
// }
// error message response is in events/error.ts
app.use((ctx) => {
  if (ctx.status === 200) {
    ctx.body = {
      status: "success",
      code: 200,
      data: ctx.body,
      message: null,
    };
  }
});

// listening to port
export const server: any = app.listen(port, async () => {
  const defaultDB = {
    type: "postgres",
    host: process.env.INFINI_HOST || "localhost",
    username: process.env.INFINI_USER || "postgres",
    password: process.env.INFINI_PWD || "docker",
    port: process.env.INFINI_PORT || 5432,
    database: process.env.INFINI_DB || "postgres",
  };
  const { id } = await app.context.db.setupClient(defaultDB);
  Logger(`inifini api server started at ${port}`);
  Logger(`Connected to database: ${id}`);
});
