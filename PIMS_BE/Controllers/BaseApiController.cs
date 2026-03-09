using Microsoft.AspNetCore.Mvc;
using PIMS_BE.DTOs;

namespace PIMS_BE.Controllers
{
    /// <summary>
    /// Base controller - TẤT CẢ controllers phải kế thừa từ class này
    /// Cung cấp các helper methods để trả về response đúng format
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        // === SUCCESS RESPONSES ===

        /// <summary>
        /// Trả về 200 OK với data
        /// </summary>
        protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string message = "Success")
        {
            return Ok(ApiResponse<T>.Ok(data, message));
        }

        /// <summary>
        /// Trả về 201 Created với data
        /// </summary>
        protected ActionResult<ApiResponse<T>> CreatedResponse<T>(T data, string message = "Created successfully")
        {
            return StatusCode(201, ApiResponse<T>.Created(data, message));
        }

        /// <summary>
        /// Trả về 200 OK với paginated data
        /// </summary>
        protected ActionResult<ApiResponse<PaginatedResponse<T>>> OkPaginated<T>(
            List<T> items,
            int totalCount,
            int pageNumber,
            int pageSize,
            string message = "Success")
        {
            var paginatedData = new PaginatedResponse<T>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PaginatedResponse<T>>.Ok(paginatedData, message));
        }

        // === ERROR RESPONSES ===

        /// <summary>
        /// Trả về 400 Bad Request
        /// </summary>
        protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message, List<string>? errors = null)
        {
            return BadRequest(ApiResponse<T>.BadRequest(message, errors));
        }

        /// <summary>
        /// Trả về 401 Unauthorized
        /// </summary>
        protected ActionResult<ApiResponse<T>> UnauthorizedResponse<T>(string message = "Unauthorized")
        {
            return Unauthorized(ApiResponse<T>.Unauthorized(message));
        }

        /// <summary>
        /// Trả về 403 Forbidden
        /// </summary>
        protected ActionResult<ApiResponse<T>> ForbiddenResponse<T>(string message = "Access denied")
        {
            return StatusCode(403, ApiResponse<T>.Forbidden(message));
        }

        /// <summary>
        /// Trả về 404 Not Found
        /// </summary>
        protected ActionResult<ApiResponse<T>> NotFoundResponse<T>(string message = "Resource not found")
        {
            return NotFound(ApiResponse<T>.NotFound(message));
        }

        /// <summary>
        /// Trả về 500 Internal Server Error
        /// </summary>
        protected ActionResult<ApiResponse<T>> InternalErrorResponse<T>(string message = "Internal server error")
        {
            return StatusCode(500, ApiResponse<T>.InternalError(message));
        }
    }
}
