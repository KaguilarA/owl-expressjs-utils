export interface QueryOptions {
  populate?: string | string[] | Record<string, any> | Record<string, any>[];
  limit?: number;
  skip?: number;
  page?: number;
  pageSize?: number;
}