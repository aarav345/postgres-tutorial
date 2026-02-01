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

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);

            vi.mocked(findByIdSpy).mockResolvedValue(mockUser);

            const result = await UsersService.findById(1);

            expect(result).toEqual(mockUser);
            expect(findByIdSpy).toHaveBeenCalledWith(1);
        });

        it('should throw error if user not found', async () => {

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(null);
            vi.mocked(findByIdSpy).mockResolvedValue(null);

            await expect(UsersService.findById(999)).rejects.toThrow(
                new NotFoundError(MESSAGES.USER.NOT_FOUND)
            );
        });
    });

    describe('findByUsername', () => {
        it('should return user by username', async () => {
            const mockUser = TestHelpers.mockUser({ username: 'testuser' });

            const findByUsernameSpy = vi.spyOn(UsersRepository, 'findByUsername').mockResolvedValue(mockUser);
            vi.mocked(findByUsernameSpy).mockResolvedValue(mockUser);

            const result = await UsersService.findByUsername('testuser');

            expect(result).toEqual(mockUser);
            expect(findByUsernameSpy).toHaveBeenCalledWith('testuser');
        });

        it('should return null if user not found', async () => {

            const findByUsernameSpy = vi.spyOn(UsersRepository, 'findByUsername').mockResolvedValue(null);

            vi.mocked(findByUsernameSpy).mockResolvedValue(null);

            const result = await UsersService.findByUsername('notfound');

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const mockUsersWithCount = [ TestHelpers.mockUserWithCount({ id: 1, email: 'user1@example.com' }), TestHelpers.mockUserWithCount({ id: 2, email: 'user2@example.com' }) ];

            const findAllSpy = vi.spyOn(UsersRepository, 'findAll').mockResolvedValue(mockUsersWithCount);
            const countSpy = vi.spyOn(UsersRepository, 'count').mockResolvedValue(mockUsersWithCount.length);

            vi.mocked(findAllSpy).mockResolvedValue(mockUsersWithCount);
            vi.mocked(countSpy).mockResolvedValue(mockUsersWithCount.length);


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

            const findAllSpy = vi.spyOn(UsersRepository, 'findAll').mockResolvedValue(mockAdmins);
            const countSpy = vi.spyOn(UsersRepository, 'count').mockResolvedValue(mockAdmins.length);

            vi.mocked(findAllSpy).mockResolvedValue(mockAdmins);
            vi.mocked(countSpy).mockResolvedValue(mockAdmins.length);

            await UsersService.findAll({
                skip: 0,
                take: 10,
                role: 'ADMIN',
                page: 1,
                limit: 10,
            });

            expect(findAllSpy).toHaveBeenCalledWith(
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

            const findAllSpy = vi.spyOn(UsersRepository, 'findAll').mockResolvedValue(mockUsers);

            vi.mocked(findAllSpy).mockResolvedValue(mockUsers);

            await UsersService.findAll({
                skip: 0,
                take: 10,
                search: 'search',
                page: 1,
                limit: 10,
            });

            expect(findAllSpy).toHaveBeenCalledWith(
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

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);
            const updateSpy = vi.spyOn(UsersRepository, 'update').mockResolvedValue(updatedUser);

            vi.mocked(findByIdSpy).mockResolvedValue(mockUser);
            vi.mocked(updateSpy).mockResolvedValue(updatedUser);

            const result = await UsersService.update(1, updateData, 1, 'USER');

            expect(result).toEqual(updatedUser);
            expect(updateSpy).toHaveBeenCalledWith(1, updateData);
        });

        it('should allow admin to update any user', async () => {
            const mockUser = TestHelpers.mockUser({ id: 5 });
            const updateData = { username: 'AdminUpdated' };

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);
            const updateSpy = vi.spyOn(UsersRepository, 'update').mockResolvedValue({
                ...mockUser,
                ...updateData,
            })


            vi.mocked(findByIdSpy).mockResolvedValue(mockUser);
            vi.mocked(updateSpy).mockResolvedValue({
                ...mockUser,
                ...updateData,
            });

            await UsersService.update(5, updateData, 1, 'ADMIN');

            expect(updateSpy).toHaveBeenCalled();
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

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);

            vi.mocked(findByIdSpy).mockResolvedValue(mockUser);

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

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);
            const updateSpy = vi.spyOn(UsersRepository, 'update').mockResolvedValue({
                ...mockUser,
                password: 'hashed-new-password',
            })

            vi.mocked(findByIdSpy).mockResolvedValue(mockUser);
            vi.mocked(BcryptUtil.compare).mockResolvedValue(true);
            vi.mocked(BcryptUtil.hash).mockResolvedValue('hashed-new-password');
            vi.mocked(updateSpy).mockResolvedValue({
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
            expect(updateSpy).toHaveBeenCalledWith(
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

            const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);

            vi.mocked(findByIdSpy).mockResolvedValue(mockUser);
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

                const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(mockUser);
                const deleteSpy = vi.spyOn(UsersRepository, 'delete').mockResolvedValue(mockUser);

                vi.mocked(findByIdSpy).mockResolvedValue(mockUser);
                vi.mocked(deleteSpy).mockResolvedValue(mockUser);

                await UsersService.delete(5, 'ADMIN');

                expect(deleteSpy).toHaveBeenCalledWith(5);
            });

            it('should prevent non-admin from deleting users', async () => {
                await expect(UsersService.delete(5, 'USER')).rejects.toThrow(
                    new ForbiddenError(MESSAGES.AUTH.FORBIDDEN)
                );
            });

            it('should throw error if user not found', async () => {

                const findByIdSpy = vi.spyOn(UsersRepository, 'findById').mockResolvedValue(null);
                vi.mocked(findByIdSpy).mockResolvedValue(null);

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