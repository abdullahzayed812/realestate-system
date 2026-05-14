import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@realestate/errors';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: Joi.ObjectSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const details: Record<string, string[]> = {};

      error.details.forEach((detail) => {
        const key = detail.path.join('.');
        if (!details[key]) details[key] = [];
        details[key].push(detail.message);
      });

      throw new ValidationError('Validation failed', details);
    }

    req[part] = value;
    next();
  };
}
