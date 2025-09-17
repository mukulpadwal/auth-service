import { checkSchema } from "express-validator";
import { IUserRequest } from "../types/index.js";

export default checkSchema({
    firstName: {
        errorMessage: "First name is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Last name is required!",
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: "Role is required!",
        notEmpty: true,
        trim: true,
    },
    email: {
        isEmail: {
            errorMessage: "Invalid email!",
        },
        notEmpty: true,
        errorMessage: "Email is required!",
        trim: true,
    },
    tenantId: {
        errorMessage: "Tenant id is required!",
        trim: true,
        custom: {
            options: (value: string, { req }) => {
                const role = (req as IUserRequest).body.role;
                if (role === "ADMIN") {
                    return true;
                } else {
                    return !!value;
                }
            },
        },
    },
});
