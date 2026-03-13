// API types — request and response type definitions

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};
