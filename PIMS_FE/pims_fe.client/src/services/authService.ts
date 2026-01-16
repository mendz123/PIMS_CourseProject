import api from './api';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface UserInfo {
    userId: number;
    email: string;
    fullName?: string;
    role?: string;
}

export interface LoginResponse {
    user: UserInfo;
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

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
