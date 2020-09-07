/*
Error request:

{
  "status": "error",
  "code": 400,
  "data": null,
  "message": "Error xyz has occurred"
}
*/
type EventError = {
  status: number;
  message: string;
}
export default function error(err: EventError, ctx) {
  // do nothing but format ctx.body for output
  ctx.body = {
    status: 'error',
    statusCode: err.status,
    code: err.status,
    data: null,
    message: err.message,
  };
}
