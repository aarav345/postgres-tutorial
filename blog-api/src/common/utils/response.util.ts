import type { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '../types/api-response.interface';
import type { PaginationMeta } from '../types/pagination.interface';

export class ResponseUtil {
    static success<T>(
        res: Response,
        data: T | null = null,
        message: string = 'Success',
        statusCode: number = 200
    ): Response<ApiResponse<T>> {
        return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
        });
    }

    static error(
        res: Response,
        message: string = 'Error',
        statusCode: number = 500,
        errors: any = null
    ): Response<ApiResponse> {
        return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString(),
        });
    }

    static paginated<T>(
        res: Response,
        data: T,
        pagination: PaginationMeta,
        message: string = 'Success'
    ): Response<PaginatedResponse<T>> {
        return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
        },
        timestamp: new Date().toISOString(),
        });
    }
}

