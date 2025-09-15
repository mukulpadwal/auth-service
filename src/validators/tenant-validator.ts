import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        errorMessage: "Tenant Name is required.",
        notEmpty: true,
        trim: true,
        isLength: {
            options: { max: 100 },
            errorMessage:
                "Tenant Name length should not be more than 100 chars!",
        },
    },
    address: {
        errorMessage: "Tenant Address is required",
        notEmpty: true,
        trim: true,
        isLength: {
            options: { max: 255 },
            errorMessage:
                "Tenant Address length should not be more than 255 chars!",
        },
    },
});
