using System.Net;
using System.Text.Json;
using PIMS_BE.DTOs;

namespace PIMS_BE.Middlewares;

/// <summary>
/// Global exception handling middleware
/// Catches all unhandled exceptions and returns a standardized API response
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        var statusCode = exception switch
        {
            ArgumentNullException => (int)HttpStatusCode.BadRequest,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var response = new ApiResponse<object>
        {
            Success = false,
            StatusCode = statusCode,
            Message = GetUserFriendlyMessage(statusCode, exception),
            Errors = _env.IsDevelopment() 
                ? new List<string> { exception.Message, exception.StackTrace ?? "" }
                : null
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, options);
        await context.Response.WriteAsync(json);
    }

    private static string GetUserFriendlyMessage(int statusCode, Exception exception)
    {
        return statusCode switch
        {
            400 => exception.Message,
            401 => "Unauthorized access",
            403 => "Access forbidden",
            404 => "Resource not found",
            _ => "An unexpected error occurred. Please try again later."
        };
    }
}

/// <summary>
/// Extension method to register the middleware
/// </summary>
public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
