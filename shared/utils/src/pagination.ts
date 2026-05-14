import { IPaginationMeta, IPaginationQuery } from '@realestate/types';

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: IPaginationQuery): PaginationOptions {
  const page = Math.max(1, parseInt(String(query.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 20), 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): IPaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function buildOrderClause(
  sortBy?: string,
  sortOrder?: 'ASC' | 'DESC',
  allowedFields: string[] = [],
): string {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return 'ORDER BY created_at DESC';
  }

  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  return `ORDER BY ${sortBy} ${order}`;
}
