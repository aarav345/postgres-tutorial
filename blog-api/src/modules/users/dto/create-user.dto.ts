import type { Role } from '../../../generated/prisma';

export interface CreateUserDto {
    email: string;
    username: string;
    password: string;
    role: Role;
}
