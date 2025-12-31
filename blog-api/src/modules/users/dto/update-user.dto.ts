import { Role } from '../../../generated/prisma';

export interface UpdateUserDto {
  email?: string;
  username?: string;
  role?: Role;
}
