import { Response } from 'express';
import { IApiResponse, IPaginatedResponse, IPaginationMeta } from '@realestate/types';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    code = 'ERROR',
    details?: unknown,
  ): Response {
    const response: IApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
    if (details) {
      response.errors = details as Record<string, string[]>;
    }
    return res.status(statusCode).json({ ...response, code });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    meta: IPaginationMeta,
    message = 'Success',
  ): Response {
    const response: IApiResponse<IPaginatedResponse<T>> = {
      success: true,
      message,
      data: { data, meta },
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
  }
}
