import type { Request } from "express";
import { Jwt } from "jsonwebtoken";

export interface IUserData {
    firstName: string;
    lastName: string;
    password: string;
    age: number;
    email: string;
}

export interface ITenantData {
    name: string;
    address: string;
}

export interface UserRequest extends Request {
    body: IUserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id: string;
    };
}

export interface TenantRequest extends Request {
    body: ITenantData;
}

export type AuthCookies = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload extends Jwt {
    id: string;
}
