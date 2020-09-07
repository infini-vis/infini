import { Context, Next } from "koa";
import { Logger } from "../utils";

// async middleware
// catch any errors, then emmit error event
// in the index.ts, we will handle all error message
export default async function errorMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit("error", err, ctx);
    Logger("server error", JSON.stringify(err));
  }
}
