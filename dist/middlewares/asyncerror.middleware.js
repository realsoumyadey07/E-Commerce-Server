"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsyncError = void 0;
const CatchAsyncError = (theFuc) => (req, res, next) => {
    Promise.resolve(theFuc(req, res, next)).catch(next);
};
exports.CatchAsyncError = CatchAsyncError;
