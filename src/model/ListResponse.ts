export interface ListResponse<T> {
  items: Array<T>;
  lastEvaluatedKey?: Record<string, unknown>;
  count: number;
  scannedCount: number;
}
