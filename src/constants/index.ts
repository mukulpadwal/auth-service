export const Roles = {
    CUSTOMER: "customer",
    ADMIN: "admin",
    MANAGER: "manager",
} as const;

export const CookieOptions = {
    domain: "localhost",
    sameSite: "strict",
    httpOnly: true,
} as const;
