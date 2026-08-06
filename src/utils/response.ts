import { ApiResponse } from '../types/common';
import { CREATOR } from '../constants/version';

export function buildResponse<T = any>(
    success: boolean,
    data: T | null = null,
    message: string | null = null,
    metadata: any = {}
): ApiResponse<T | null> {
    return {
        success,
        creator: CREATOR,
        data,
        metadata,
        message,
    };
}

export function handleError(error: any, context: string): ApiResponse<null> {
    const message = error.response
        ? `HTTP ${error.response.status}: Failed to ${context}`
        : `Failed to ${context}: ${error.message}`;
    return buildResponse(false, null, message);
}
