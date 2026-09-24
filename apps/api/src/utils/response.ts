import type { Response } from "express";

export function successResponse(
  res: Response,
  status: number,
  data: any,
  message: string = "Success",
) {
  return res.status(status).json({ success: true, data, message });
}

export function errorResponse(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}
