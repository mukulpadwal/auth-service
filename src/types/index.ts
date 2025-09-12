import type { Request } from "express";
import { Jwt } from "jsonwebtoken";

export interface UserData {
    firstName: string;
    lastName: string;
    password: string;
    age: number;
    email: string;
}

export interface UserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id: string;
    };
}

export type AuthCookies = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload extends Jwt {
    id: string;
}
