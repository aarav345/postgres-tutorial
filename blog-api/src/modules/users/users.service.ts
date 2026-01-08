import UsersRepository from './users.repository';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { MESSAGES } from '../../common/constants/messages.constant';
import type { User, Prisma, Role } from '../../generated/prisma';
import { NotFoundError, ForbiddenError, AppError } from '../../common/errors/app.error';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { QueryUserDto } from './dto/query-user.dto';
import type { PaginationResult } from '../../common/types/pagination.interface';
import type { FindAllResult } from '@/modules/users/interfaces/find-all-user.interface';

export class UsersService {
    async create(data: CreateUserDto): Promise<User> {
        return UsersRepository.create(data);
    }

    async findById(id: number): Promise<User> {
        const user = await UsersRepository.findById(id);
        if (!user) {
        throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return UsersRepository.findByEmail(email);
    }

    async findByUsername(username: string): Promise<User | null> {
        return UsersRepository.findByUsername(username);
    }

    async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        return UsersRepository.findByEmailOrUsername(email, username);
    }

    async findAll(query: QueryUserDto & PaginationResult): Promise<FindAllResult> {
        const { skip, take, page, limit, role, search } = query;
        
        const where: Prisma.UserWhereInput = {};
        
        if (role) {
            where.role = role;
        }
        
        if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
        ];
        }

        const [users, total] = await Promise.all([
            UsersRepository.findAll({ skip, take, where }),
            UsersRepository.count(where),
        ]);

        return { users, total, page, limit };
    }

    async update(
        id: number,
        data: UpdateUserDto,
        requestingUserId: number,
        requestingUserRole: Role
    ): Promise<User> {
        const user = await this.findById(id);

        // Authorization check
        if (requestingUserRole !== 'ADMIN' && user.id !== requestingUserId) {
        throw new ForbiddenError(MESSAGES.AUTH.FORBIDDEN);
        }

        // Don't allow changing role unless admin
        if (data.role && requestingUserRole !== 'ADMIN') {
        delete data.role;
        }

        return UsersRepository.update(id, data);
    }

    async changePassword(
        id: number,
        currentPassword: string,
        newPassword: string,
        requestingUserId: number
    ): Promise<User> {
        const user = await UsersRepository.findById(id);
        
        if (!user) {
        throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
        }

        // Only the user themselves can change their password
        if (user.id !== requestingUserId) {
        throw new ForbiddenError(MESSAGES.AUTH.FORBIDDEN);
        }

        // Verify current password
        const isPasswordValid = await BcryptUtil.compare(currentPassword, user.password);
        if (!isPasswordValid) {
        throw new AppError(MESSAGES.USER.INVALID_PASSWORD, 400);
        }

        // Hash new password
        const hashedPassword = await BcryptUtil.hash(newPassword);

        return UsersRepository.update(id, { password: hashedPassword });
    }

    async delete(id: number, requestingUserRole: Role): Promise<User> {
        if (requestingUserRole !== 'ADMIN') {
        throw new ForbiddenError(MESSAGES.AUTH.FORBIDDEN);
        }

        await this.findById(id);
        return UsersRepository.delete(id);
    }

    sanitizeUser(user: User): Omit<User, 'password'> {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
}

export default new UsersService();
