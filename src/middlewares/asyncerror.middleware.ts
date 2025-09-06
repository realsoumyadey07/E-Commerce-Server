import { NextFunction, Request, Response } from "express";

export const CatchAsyncError = (theFuc: any)=> (req: Request, res: Response, next: NextFunction)=> {
    Promise.resolve(theFuc(req, res, next)).catch(next);
}