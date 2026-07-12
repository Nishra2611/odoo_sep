/**
 * Minimal fallback Zod validation middleware, matching the shape assumed
 * in ASSUMPTIONS.md: `validate(schema)` validating `{ body, query, params }`.
 *
 * DELETE THIS FILE if your project already has
 * `src/middleware/validate.middleware.ts` and repoint the imports in
 * `src/routes/oauth.routes.ts` and `src/routes/location.routes.ts` at it.
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}
