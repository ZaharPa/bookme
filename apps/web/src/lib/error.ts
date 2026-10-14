export type FieldIssue = {
  path: (string | number)[];
  message: string;
};

export class ApiError extends Error {
  status: number;
  details?: FieldIssue[];

  constructor(status: number, message: string, details?: FieldIssue[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function fieldError(
  details: FieldIssue[] | undefined,
  field: string,
): string | undefined {
  const error = details?.find((issue) => issue.path[0] === field);
  return error?.message;
}
