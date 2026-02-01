import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import UsersService from '../../../src/modules/user/users.service';
import AuthService from '../../../src/modules/auth/auth.service';
import { TestHelpers } from '../../helpers/test-helpers';
import { MESSAGES } from '../../../src/common/constants/messages.constant';

// Mock the services
vi.mock('../../../src/modules/users/users.service');
vi.mock('../../../src/modules/auth/auth.service');
// vi.mock('../../../src/common/middlewares/auth.middleware', () => ({
//     authenticate: (req: any, _res: any, next: any) => {
//         req.user = { userId: 1, role: 'USER' };
//         next();
//     },
// }));

// vi.mock('../../../src/common/middlewares/roles.middleware', () => ({
//     authorize: () => (req: any, _res: any, next: any) => {
//         req.user = { userId: 1, role: 'ADMIN' };
//         next();
//     },
// }));

describe('UsersController', () => {
    let token: string;
    let adminToken: string;

    beforeAll(() => {
        token = TestHelpers.generateToken(1, 'USER');
        adminToken = TestHelpers.generateToken(2, 'ADMIN');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/users/me', () => {
        it('should return current user profile', async () => {
            const mockUser = TestHelpers.mockUser();
            const sanitizedUser = { ...mockUser, password: undefined };

            vi.mocked(UsersService.findById).mockResolvedValue(mockUser);
            vi.mocked(UsersService.sanitizeUser).mockReturnValue(sanitizedUser);

            const response = await request(app)
                .get('/api/v1/users/me')
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Profile fetched successfully');
            expect(response.body.data).toMatchObject({
                id: sanitizedUser.id,
                email: sanitizedUser.email,
                username: sanitizedUser.username,
                role: sanitizedUser.role,
            });

            expect(UsersService.findById).toHaveBeenCalledWith(1);
        });

        it('should return 401 if not authenticated', async () => {
                const response = await request(app).get('/api/v1/users/me');

                expect(response.status).toBe(401);
        });
    });

    describe('GET /api/v1/users', () => {
        it('should return paginated list of users (admin only)', async () => {
            const mockUsers = [
                TestHelpers.mockUser({ id: 1 }),
                TestHelpers.mockUser({ id: 2, email: 'user2@example.com' }),
            ];

            const mockResult = {
                users: mockUsers,
                total: 2,
                page: 1,
                limit: 10,
            };

            vi.mocked(UsersService.findAll).mockResolvedValue(mockResult);

            const response = await request(app)
                .get('/api/v1/users')
                .query({ page: 1, limit: 10 })
                .set(TestHelpers.authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            response.body.data.forEach((user: any, index: number) => {
                expect(user).toMatchObject({
                    id: mockUsers[index].id,
                    email: mockUsers[index].email,
                    username: mockUsers[index].username,
                    role: mockUsers[index].role,
                })
            })
            expect(response.body.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            });
        });

        it('should filter users by role', async () => {
        const mockResult = {
            users: [TestHelpers.mockAdmin()],
            total: 1,
            page: 1,
            limit: 10,
        };

        vi.mocked(UsersService.findAll).mockResolvedValue(mockResult);

        const response = await request(app)
            .get('/api/v1/users')
            .query({ role: 'ADMIN' })
            .set(TestHelpers.authHeader(adminToken));

        expect(response.status).toBe(200);
        expect(UsersService.findAll).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'ADMIN' })
        );
        });

        it('should search users by term', async () => {
        const mockResult = {
            users: [TestHelpers.mockUser()],
            total: 1,
            page: 1,
            limit: 10,
        };

        vi.mocked(UsersService.findAll).mockResolvedValue(mockResult);

        const response = await request(app)
            .get('/api/v1/users')
            .query({ search: 'test' })
            .set(TestHelpers.authHeader(adminToken));

        expect(response.status).toBe(200);
        expect(UsersService.findAll).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'test' })
        );
        });
    });

    describe('GET /api/v1/users/:id', () => {
        it('should return user by id', async () => {
            const mockUser = TestHelpers.mockUser({ id: 5 });
            const sanitizedUser = { ...mockUser, password: undefined };

            vi.mocked(UsersService.findById).mockResolvedValue(mockUser);
            vi.mocked(UsersService.sanitizeUser).mockReturnValue(sanitizedUser);

            const response = await request(app)
                .get('/api/v1/users/5')
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({
                id: sanitizedUser.id,
                email: sanitizedUser.email,
                username: sanitizedUser.username,
                role: sanitizedUser.role,
            });
            expect(UsersService.findById).toHaveBeenCalledWith(5);
            });

            it('should return 400 for invalid id format', async () => {
            const response = await request(app)
                .get('/api/v1/users/invalid')
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/users/username/:username', () => {
        it('should return user by username', async () => {
            const mockUser = TestHelpers.mockUser({ username: 'johndoe' });
            const sanitizedUser = { ...mockUser, password: undefined };

            vi.mocked(UsersService.findByUsername).mockResolvedValue(mockUser);
            vi.mocked(UsersService.sanitizeUser).mockReturnValue(sanitizedUser);

            const response = await request(app).get('/api/v1/users/username/johndoe');

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({
                id: sanitizedUser.id,
                email: sanitizedUser.email,
                username: sanitizedUser.username,
                role: sanitizedUser.role,
            });
            expect(UsersService.findByUsername).toHaveBeenCalledWith('johndoe');
        });

        it('should return 404 if user not found', async () => {
            vi.mocked(UsersService.findByUsername).mockResolvedValue(null);

            const response = await request(app).get('/api/v1/users/username/notfound');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe(MESSAGES.USER.NOT_FOUND);
        });
    });

    describe('PUT /api/v1/users/:id', () => {
        it('should update user successfully', async () => {
            const updateData = { username: 'UpdatedName' };
            const updatedUser = TestHelpers.mockUser({ ...updateData });
            const sanitizedUser = { ...updatedUser, password: undefined };

            vi.mocked(UsersService.update).mockResolvedValue(updatedUser);
            vi.mocked(UsersService.sanitizeUser).mockReturnValue(sanitizedUser);

            const response = await request(app)
                .put('/api/v1/users/1')
                .send(updateData)
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(MESSAGES.USER.UPDATED);
            expect(response.body.data).toMatchObject({
                id: sanitizedUser.id,
                email: sanitizedUser.email,
                username: sanitizedUser.username,
                role: sanitizedUser.role,
            });
            expect(UsersService.update).toHaveBeenCalledWith(1, updateData, 1, 'USER');
        });

        it('should return 400 for invalid update data', async () => {
            const response = await request(app)
                .put('/api/v1/users/1')
                .send({ email: 'invalid-email' })
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/v1/users/:id/password', () => {
        it('should change password successfully', async () => {
            const mockUser = TestHelpers.mockUser();
            const passwordData = {
                currentPassword: 'oldPass123',
                newPassword: 'newPass123',
                confirmPassword: 'newPass123',
            };

            vi.mocked(UsersService.changePassword).mockResolvedValue(mockUser);
            vi.mocked(AuthService.logoutAll).mockResolvedValue(undefined);

            const response = await request(app)
                .put('/api/v1/users/1/password')
                .send(passwordData)
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(MESSAGES.USER.PASSWORD_CHANGED);
            expect(UsersService.changePassword).toHaveBeenCalledWith(
                1,
                'oldPass123',
                'newPass123',
                1
            );
            expect(AuthService.logoutAll).toHaveBeenCalledWith(1);
        });

        it('should return 400 for weak password', async () => {
            const response = await request(app)
                .put('/api/v1/users/1/password')
                    .send({
                    currentPassword: 'oldPass123',
                    newPassword: '123',
                    confirmPassword: '123',
                })
                .set(TestHelpers.authHeader(token));

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('should delete user successfully (admin only)', async () => {

            const mockUser = TestHelpers.mockUser();

            vi.mocked(UsersService.delete).mockResolvedValue(mockUser);

            const response = await request(app)
                .delete('/api/v1/users/5')
                .set(TestHelpers.authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.message).toBe(MESSAGES.USER.DELETED);
            expect(UsersService.delete).toHaveBeenCalledWith(5, 'ADMIN');
        });
    });
});