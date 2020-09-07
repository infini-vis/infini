import errorMiddleware from "./error";

describe("test error middleware", () => {
  test("should respond as expected", async () => {
    const ctx: any = { body: 1 };
    const next: any = jest.fn(() => {
      expect(ctx.body).toBe(1);
      ctx.body += "next body";
    });

    errorMiddleware(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
  test("should respond as expected when error happend", async () => {
    const ctx: any = {
      body: {},
      app: {
        emit: jest.fn(() => {}),
      },
    };
    const next: any = jest.fn(() => {
      expect(ctx.body).toStrictEqual({});
      throw new Error("test error");
    });

    errorMiddleware(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.app.emit).toHaveBeenCalledTimes(1);
    expect(ctx.status).toEqual(500);
    expect(ctx.body).toBe("test error");
  });
  test("should respond as expected when error happend with status", async () => {
    const ctx: any = {
      body: {},
      app: {
        emit: jest.fn(() => {}),
      },
      throw: ({ status, message }) => {
        ctx.status = status;
        ctx.body = message;
      },
    };
    let a: any = console.log;
    a = jest.fn();
    console.log = a;
    const err = { status: 503, message: "no connection found" };
    const next: any = jest.fn(() => {
      expect(ctx.body).toStrictEqual({});
      throw err;
    });
    process.env.NODE_ENV = "initial";
    errorMiddleware(ctx, next);

    expect(a.mock.calls[0][1]).toBe("server error");
    expect(a.mock.calls[0][2]).toBe(JSON.stringify(err));

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.status).toEqual(503);
    expect(ctx.body).toBe("no connection found");
  });
});
