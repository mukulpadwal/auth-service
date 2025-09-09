import type { Request } from "express";

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
