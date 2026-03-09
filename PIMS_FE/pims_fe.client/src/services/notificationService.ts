import api from "./api";
import type { ApiResponse } from "../types/assessment.types";
import type { NotificationDto } from "../types/notification.types";

export const notificationService = {
  getMyNotifications: async (unreadOnly?: boolean) => {
    const response = await api.get<ApiResponse<NotificationDto[]>>(
      "/api/notification",
      { params: unreadOnly ? { unreadOnly: true } : undefined },
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<number>>(
      "/api/notification/unread-count",
    );
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.put<ApiResponse<NotificationDto>>(
      `/api/notification/${id}/read`,
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put<ApiResponse<number>>(
      "/api/notification/read-all",
    );
    return response.data;
  },
};
