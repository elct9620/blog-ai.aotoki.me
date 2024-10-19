import { DependencyContainer, InjectionToken, container } from "tsyringe";
import { createMiddleware } from "hono/factory";
import { Context, MiddlewareHandler, Next } from "hono";

type Injector = {
  Variables: {
    resolve: <T>(token: InjectionToken<T>) => T;
  };
};

type InjectionHandler = (
  ctx: Context,
  container: DependencyContainer,
) => Promise<void>;
export const injectionMiddleware = (handler: InjectionHandler) =>
  createMiddleware<Injector>(async (c: Context, next: Next) => {
    const routeContainer = container.createChildContainer();
    await handler(c, routeContainer);
    c.set("resolve", <T>(token: InjectionToken<T>) =>
      routeContainer.resolve(token),
    );

    await next();
  });

declare module "hono" {
  interface ContextVariableMap {
    resolve: <T>(token: InjectionToken<T>) => T;
  }
}
