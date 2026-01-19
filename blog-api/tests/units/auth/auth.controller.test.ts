import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import AuthService from '../../../src/modules/auth/auth.service';
import { RefreshTokenService } from '../../../src/modules/auth/token.service';
import { TestHelpers } from '../../helpers/test-helpers';
import { MESSAGES } from '../../../src/common/constants/messages.constant';

// Mock the services
vi.mock('../../../src/modules/auth/auth.service');
vi.mock('../../../src/modules/auth/token.service');
vi.mock('../../../src/common/middlewares/auth.middleware', () => ({
    authenticate: (req: any, _res: any, next: any) => {
        req.user = { userId: 1, role: 'USER' };
        next();
    },
}));

describe('AuthController', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
        const registerData = {
            email: 'newuser@example.com',
            username: 'newuser',
            password: 'Password123!',
        };

        const mockUser = TestHelpers.mockUser({
            email: registerData.email,
            username: registerData.username,
        });

        vi.mocked(AuthService.register).mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(registerData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(MESSAGES.AUTH.REGISTER_SUCCESS);
        expect(AuthService.register).toHaveBeenCalledWith(registerData);
        });

        it('should return 400 for invalid registration data', async () => {
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({
            email: 'invalid-email',
            password: '123',
            });

        expect(response.status).toBe(400);
        });

        it('should return 400 for missing required fields', async () => {
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({
            email: 'test@example.com',
            });

        expect(response.status).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login user successfully', async () => {
        const loginData = {
            email: 'test@example.com',
            password: 'Password123!',
        };

        const mockUser = TestHelpers.mockUser();
        const mockResponse = {
            user: mockUser,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        };

        vi.mocked(AuthService.login).mockResolvedValue(mockResponse);

        const response = await request(app)
            .post('/api/v1/auth/login')
            .send(loginData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(MESSAGES.AUTH.LOGIN_SUCCESS);
        expect(response.body.data.accessToken).toBe('access-token');
        expect(response.body.data.user).toEqual(mockUser);
        
        // Check if refresh token cookie is set
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        if (Array.isArray(cookies)) {
            expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);            
        }
        });

        it('should return 400 for invalid credentials format', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
            email: 'invalid-email',
            password: 'short',
            });

        expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/auth/refresh', () => {
        it('should refresh tokens successfully', async () => {
        const mockUser = TestHelpers.mockUser();
        const mockResponse = {
            user: mockUser,
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
        };

        vi.mocked(AuthService.refreshTokens).mockResolvedValue(mockResponse);

        const response = await request(app)
            .get('/api/v1/auth/refresh')
            .set('Cookie', ['refreshToken=old-refresh-token']);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(MESSAGES.AUTH.REFRESH_SUCCESS);
        expect(response.body.data.accessToken).toBe('new-access-token');
        
        // Check if new refresh token cookie is set
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        });

        it('should return 401 if refresh token is missing', async () => {
        const response = await request(app).get('/api/v1/auth/refresh');

        expect(response.status).toBe(401);
        });

        it('should clear cookie on refresh error', async () => {
        vi.mocked(AuthService.refreshTokens).mockRejectedValue(
            new Error('Invalid refresh token')
        );

        const response = await request(app)
            .get('/api/v1/auth/refresh')
            .set('Cookie', ['refreshToken=invalid-token']);

        expect(response.status).toBe(500);
        
        // Check if cookie is cleared
        const cookies = response.headers['set-cookie'];
        if (cookies && Array.isArray(cookies)) {
            expect(
            cookies.some((cookie: string) => 
                cookie.includes('refreshToken=') && cookie.includes('Max-Age=0')
            )
            ).toBe(true);
        }
        });
    });

    describe('GET /api/v1/auth/logout', () => {
        it('should logout user successfully', async () => {
        vi.mocked(AuthService.logout).mockResolvedValue(undefined);

        const response = await request(app)
            .get('/api/v1/auth/logout')
            .set('Cookie', ['refreshToken=test-token']);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(MESSAGES.AUTH.LOGOUT_SUCCESS);
        expect(AuthService.logout).toHaveBeenCalledWith('test-token');
        
        // Check if cookie is cleared
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        });

        it('should logout even without refresh token', async () => {
        const response = await request(app).get('/api/v1/auth/logout');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(MESSAGES.AUTH.LOGOUT_SUCCESS);
        });
    });

    describe('POST /api/v1/auth/logout-all', () => {
        it('should logout from all devices', async () => {
        vi.mocked(AuthService.logoutAll).mockResolvedValue(undefined);

        const token = TestHelpers.generateToken(1, 'USER');
        const response = await request(app)
            .post('/api/v1/auth/logout-all')
            .set(TestHelpers.authHeader(token));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(MESSAGES.AUTH.LOGOUT_ALL_SUCCESS);
        expect(AuthService.logoutAll).toHaveBeenCalledWith(1);
        });

        it('should return 401 if not authenticated', async () => {
        const response = await request(app).post('/api/v1/auth/logout-all');

        expect(response.status).toBe(401);
        });
    });

    describe('GET /api/v1/auth/sessions', () => {
        it('should get active sessions', async () => {
        const mockSessions = [
            {
                id: 'rt_1',
                family: 'family-1',
                userAgent: 'Chrome on Windows',
                ipAddress: '127.0.0.1',
                createdAt: new Date(),
                expiresAt: new Date(),
            },
        ];

        vi.mocked(RefreshTokenService.getUserSessions).mockResolvedValue(mockSessions);

        const token = TestHelpers.generateToken(1, 'USER');
        const response = await request(app)
            .get('/api/v1/auth/sessions')
            .set(TestHelpers.authHeader(token));

        expect(response.status).toBe(200);
        expect(response.body.data.sessions).toEqual(mockSessions);
        expect(RefreshTokenService.getUserSessions).toHaveBeenCalledWith(1);
        });
    });

    describe('DELETE /api/v1/auth/sessions/:family', () => {
        it('should revoke specific session', async () => {
        vi.mocked(RefreshTokenService.revokeSession).mockResolvedValue(undefined);

        const token = TestHelpers.generateToken(1, 'USER');
        const response = await request(app)
            .delete('/api/v1/auth/sessions/family-123')
            .set(TestHelpers.authHeader(token));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Session revoked successfully');
        expect(RefreshTokenService.revokeSession).toHaveBeenCalledWith(1, 'family-123');
        });
    });
});