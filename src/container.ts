import { InjectionToken, container } from "tsyringe";
import { createMiddleware } from "hono/factory";
import { Context, Next } from "hono";

type Injector = {
  Variables: {
    resolve: <T>(token: InjectionToken) => T;
  };
};

export const injectionMiddleware = createMiddleware<Injector>(
  async (c: Context, next: Next) => {
    const routeContainer = container.createChildContainer();
    c.set("resolve", (token: InjectionToken) => routeContainer.resolve(token));

    await next();
  },
);

declare module "hono" {
  interface ContextVariableMap {
    resolve: <T>(token: InjectionToken) => T;
  }
}
