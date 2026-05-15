import { handleGlobalError } from "../src/app";

describe("Global Error Handling", () => {
  it("should map unexpected errors to INTERNAL_ERROR envelope", () => {
    const err = new Error("boom");

    const res = {
      statusCode: 0,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      }
    };

    handleGlobalError(err, {} as any, res as any, () => undefined);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      code: "INTERNAL_ERROR",
      message: "Unexpected error",
      details: {
        name: "Error",
        message: "boom"
      }
    });
    expect((res.body as any).details.stack).toBeUndefined();
  });
});
