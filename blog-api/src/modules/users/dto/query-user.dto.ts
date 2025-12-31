import { Role } from '../../../generated/prisma';

export interface QueryUserDto {
    page?: number;
    limit?: number;
    role?: Role;
    search?: string;
}