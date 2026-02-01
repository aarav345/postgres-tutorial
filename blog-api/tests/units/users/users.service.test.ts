import { describe, it, expect, vi, afterEach } from 'vitest';
import UsersService from '../../../src/modules/user/users.service';
import UsersRepository from '../../../src/modules/user/users.repository';
import { BcryptUtil } from '../../../src/common/utils/bcrypt.util';
import { AppError, ForbiddenError, NotFoundError } from '../../../src/common/errors/app.error';
import { TestHelpers } from '../../helpers/test-helpers';
import { MESSAGES } from '../../../src/common/constants/messages.constant';
import { Role } from '../../../src/generated/prisma';

// Mock dependencies
vi.mock('../../../src/modules/users/users.repository');
vi.mock('../../../src/common/utils/bcrypt.util');

describe('UsersService', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('findById', () => {
        it('should return user by id', async () => {
            const mockUser = TestHelpers.mockUser({ id: 1 });
            vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);

            const result = await UsersService.findById(1);

            expect(result).toEqual(mockUser);
            expect(UsersRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw error if user not found', async () => {
            vi.mocked(UsersRepository.findById).mockResolvedValue(null);

            await expect(UsersService.findById(999)).rejects.toThrow(
                new NotFoundError(MESSAGES.USER.NOT_FOUND)
            );
        });
    });

    describe('findByUsername', () => {
        it('should return user by username', async () => {
            const mockUser = TestHelpers.mockUser({ username: 'testuser' });
            vi.mocked(UsersRepository.findByUsername).mockResolvedValue(mockUser);

            const result = await UsersService.findByUsername('testuser');

            expect(result).toEqual(mockUser);
            expect(UsersRepository.findByUsername).toHaveBeenCalledWith('testuser');
        });

        it('should return null if user not found', async () => {
            vi.mocked(UsersRepository.findByUsername).mockResolvedValue(null);

            const result = await UsersService.findByUsername('notfound');

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const mockUsersWithCount = [ TestHelpers.mockUserWithCount({ id: 1, email: 'user1@example.com' }), TestHelpers.mockUserWithCount({ id: 2, email: 'user2@example.com' }) ];

            vi.mocked(UsersRepository.findAll).mockResolvedValue(mockUsersWithCount);
            vi.mocked(UsersRepository.count).mockResolvedValue(mockUsersWithCount.length);


            const result = await UsersService.findAll({
                skip: 0,
                take: 10,
                page: 1,
                limit: 10,
            });

            expect(result.users).toEqual(mockUsersWithCount);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });

        it('should filter by role', async () => {
            const mockAdmins = [TestHelpers.mockAdminWithCount()];

            vi.mocked(UsersRepository.findAll).mockResolvedValue(mockAdmins);
            vi.mocked(UsersRepository.count).mockResolvedValue(mockAdmins.length);

            await UsersService.findAll({
                skip: 0,
                take: 10,
                role: 'ADMIN',
                page: 1,
                limit: 10,
            });

            expect(UsersRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        role: 'ADMIN'
                    }),
                    skip: 0,
                    take: 10
                })
            );
        });


        it('should search users', async () => {
            const mockUsers = [TestHelpers.mockUserWithCount({ username: 'searchtest' })];

            vi.mocked(UsersRepository.findAll).mockResolvedValue(mockUsers);

            await UsersService.findAll({
                skip: 0,
                take: 10,
                search: 'search',
                page: 1,
                limit: 10,
            });

            expect(UsersRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({
                                email: expect.objectContaining({
                                    contains: 'search',
                                }),
                            }),
                            expect.objectContaining({
                                username: expect.objectContaining({
                                    contains: 'search',
                                }),
                            }),
                        ])
                    })
                })
            );
        });
    });

    describe('update', () => {
        it('should update user successfully', async () => {
            const mockUser = TestHelpers.mockUser({ id: 1 });
            const updateData = { username: 'Updated' };
            const updatedUser = { ...mockUser, ...updateData };

            vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);
            vi.mocked(UsersRepository.update).mockResolvedValue(updatedUser);

            const result = await UsersService.update(1, updateData, 1, 'USER');

            expect(result).toEqual(updatedUser);
            expect(UsersRepository.update).toHaveBeenCalledWith(1, updateData);
        });

        it('should allow admin to update any user', async () => {
            const mockUser = TestHelpers.mockUser({ id: 5 });
            const updateData = { username: 'AdminUpdated' };

            vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);
            vi.mocked(UsersRepository.update).mockResolvedValue({
                ...mockUser,
                ...updateData,
            });

            await UsersService.update(5, updateData, 1, 'ADMIN');

            expect(UsersRepository.update).toHaveBeenCalled();
        });

        it('should prevent non-admin from updating other users', async () => {
            const updateData = { username: 'Hacker' };

            await expect(
                UsersService.update(999, updateData, 1, 'USER')
            ).rejects.toThrow(AppError);
        });

        it('should prevent role change by non-admin', async () => {
            const mockUser = TestHelpers.mockUser({ id: 1 });
            const updateData = { role: 'ADMIN' as Role, username: 'NonAdmin' };

            vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);

            await expect(
                UsersService.update(1, updateData, 1, 'USER')
            ).rejects.toThrow(MESSAGES.AUTH.FORBIDDEN);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const mockUser = {
                ...TestHelpers.mockUser({ id: 1 }),
                password: 'hashed-old-password',
            };

            vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);
            vi.mocked(BcryptUtil.compare).mockResolvedValue(true);
            vi.mocked(BcryptUtil.hash).mockResolvedValue('hashed-new-password');
            vi.mocked(UsersRepository.update).mockResolvedValue({
                ...mockUser,
                password: 'hashed-new-password',
            });

            await UsersService.changePassword(1, 'oldPassword', 'newPassword', 1);

            expect(BcryptUtil.compare).toHaveBeenCalledWith(
                'oldPassword',
                'hashed-old-password'
            );
            expect(BcryptUtil.hash).toHaveBeenCalledWith('newPassword');

            // Updated expectation to match the actual call
            expect(UsersRepository.update).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    password: 'hashed-new-password',
                    passwordChangedAt: expect.any(Date),
                })
            );
        });



        it('should throw error for incorrect current password', async () => {
            const mockUser = {
                ...TestHelpers.mockUser({ id: 1 }),
                password: 'hashed-password',
            };

            vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);
            vi.mocked(BcryptUtil.compare).mockResolvedValue(false);

            await expect(
                UsersService.changePassword(1, 'wrongPassword', 'newPassword', 1)
            ).rejects.toThrow(new AppError(MESSAGES.USER.INVALID_PASSWORD, 400));
            });

            it('should prevent non-owner from changing password', async () => {
            await expect(
                UsersService.changePassword(999, 'oldPass', 'newPass', 1)
            ).rejects.toThrow(AppError);
        });
    });

    describe('delete', () => {
            it('should delete user (admin only)', async () => {
                const mockUser = TestHelpers.mockUser({ id: 5, email: 'a@b.com' });

                vi.mocked(UsersRepository.findById).mockResolvedValue(mockUser);
                vi.mocked(UsersRepository.delete).mockResolvedValue(mockUser);

                await UsersService.delete(5, 'ADMIN');

                expect(UsersRepository.delete).toHaveBeenCalledWith(5);
            });

            it('should prevent non-admin from deleting users', async () => {
                await expect(UsersService.delete(5, 'USER')).rejects.toThrow(
                    new ForbiddenError(MESSAGES.AUTH.FORBIDDEN)
                );
            });

            it('should throw error if user not found', async () => {
                vi.mocked(UsersRepository.findById).mockResolvedValue(null);

                await expect(UsersService.delete(999, 'ADMIN')).rejects.toThrow(
                    new NotFoundError(MESSAGES.USER.NOT_FOUND)
                );
            }
        );
    });

    describe('sanitizeUser', () => {
        it('should remove password from user object', () => {
        const mockUser: any = {
            ...TestHelpers.mockUser(),
            password: 'hashed-password',
        };

        const result = UsersService.sanitizeUser(mockUser);

        expect(result).not.toHaveProperty('password');
        expect(result.email).toBe(mockUser.email);
        expect(result.username).toBe(mockUser.username);
        });
    });
});