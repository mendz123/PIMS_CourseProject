namespace PIMS_BE.DTOs
{
    /// <summary>
    /// Standard API response wrapper - TẤT CẢ API responses phải dùng class này
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // === HELPER METHODS - Dùng các methods này thay vì tạo object thủ công ===

        /// <summary>
        /// Trả về success response với data
        /// </summary>
        public static ApiResponse<T> Ok(T data, string message = "Success")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = 200,
                Message = message,
                Data = data
            };
        }

        /// <summary>
        /// Trả về success response khi tạo mới (201 Created)
        /// </summary>
        public static ApiResponse<T> Created(T data, string message = "Created successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = 201,
                Message = message,
                Data = data
            };
        }

        /// <summary>
        /// Trả về error response - Bad Request (400)
        /// </summary>
        public static ApiResponse<T> BadRequest(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 400,
                Message = message,
                Errors = errors
            };
        }

        /// <summary>
        /// Trả về error response - Unauthorized (401)
        /// </summary>
        public static ApiResponse<T> Unauthorized(string message = "Unauthorized")
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 401,
                Message = message
            };
        }

        /// <summary>
        /// Trả về error response - Forbidden (403)
        /// </summary>
        public static ApiResponse<T> Forbidden(string message = "Access denied")
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 403,
                Message = message
            };
        }

        /// <summary>
        /// Trả về error response - Not Found (404)
        /// </summary>
        public static ApiResponse<T> NotFound(string message = "Resource not found")
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 404,
                Message = message
            };
        }

        /// <summary>
        /// Trả về error response - Internal Server Error (500)
        /// </summary>
        public static ApiResponse<T> InternalError(string message = "Internal server error")
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = 500,
                Message = message
            };
        }
    }

    /// <summary>
    /// Paginated response for list endpoints
    /// </summary>
    public class PaginatedResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }
}
