import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (
    user: number,
    secret: string,
    expiresIn: string,
): string => {
    const payload = {
        id: user.toString(),
    };
    const options: SignOptions = {
        expiresIn: expiresIn as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, secret, options);
};