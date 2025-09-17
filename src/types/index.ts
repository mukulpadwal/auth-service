import type { Request } from "express";
import { Jwt } from "jsonwebtoken";
import { Roles } from "../constants/index.js";

export type UserRole = keyof typeof Roles;

export interface IUserData {
    firstName: string;
    lastName: string;
    password: string;
    age: number;
    email: string;
    role: UserRole;
    tenantId?: number;
}

export interface ITenantData {
    name: string;
    address: string;
}

export interface IUserRequest extends Request {
    body: IUserData;
}

export interface IUpdateUserRequest extends Request {
    body: Omit<IUserData, "password">;
}

export interface IAuthRequest extends Request {
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

export interface ITenantQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
}

export interface IUserQueryParams {
    q: string;
    role: UserRole;
    perPage: number;
    currentPage: number;
}
