import { Request, Response, NextFunction } from "express";
import { Roles } from "../constants/index.js";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";

type Role = (typeof Roles)[keyof typeof Roles];

const canAccess = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role as Role;

        if (!allowedRoles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                "You don't have permission to access this route."
            );
            next(error);
            return;
        }

        next();
    };
};

export default canAccess;
