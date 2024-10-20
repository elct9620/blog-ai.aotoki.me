import {
  DependencyContainer,
  InjectionToken,
  container,
  instanceCachingFactory,
} from "tsyringe";
import { createMiddleware } from "hono/factory";
import { Context, MiddlewareHandler, Next } from "hono";
import "./langchain";

declare module "hono" {
  interface ContextVariableMap {
    resolve: <T>(token: InjectionToken<T>) => T;
  }
}

export type Provider = (ctx: Context, container: DependencyContainer) => void;
export const dependencyInjection = (
  ...providers: Provider[]
): MiddlewareHandler =>
  createMiddleware(async (c, next) => {
    const childContainer = container.createChildContainer();
    providers.forEach((provider) => provider(c, childContainer));
    c.set("resolve", <T>(token: InjectionToken<T>) =>
      childContainer.resolve(token),
    );

    await next();
  });
