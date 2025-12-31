import type { StringValue } from 'ms';

export interface JwtConfig {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: number | StringValue;
    refreshTokenExpiry: number | StringValue;
}

const jwtConfig: JwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    accessTokenExpiry: (process.env.JWT_ACCESS_EXPIRY as StringValue) || '15m',
    refreshTokenExpiry: (process.env.JWT_REFRESH_EXPIRY as StringValue) || '7d',
};

export default jwtConfig;