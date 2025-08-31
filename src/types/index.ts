import type { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    password: string;
    age: number;
    email: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}
