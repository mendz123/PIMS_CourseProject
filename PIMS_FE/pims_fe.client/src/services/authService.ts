import api from './api';
import type {
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    ApiResponse,
    UserInfo
} from '../types';

// Auth Service Functions
export const authService = {
    /**
     * Login with email and password
     */
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
        return response.data;
    },

    /**
     * Register new account
     */
    register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/register', data);
        return response.data;
    },

    /**
     * Logout
     */
    logout: async (): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>('/api/auth/logout');
        return response.data;
    },

    /**
     * Get current user info
     */
    getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
        const response = await api.get<ApiResponse<UserInfo>>('/api/auth/me');
        return response.data;
    },

    /**
     * Refresh token
     */
    refreshToken: async (): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/refresh');
        return response.data;
    },
};

export default authService;
