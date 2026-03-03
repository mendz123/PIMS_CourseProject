using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using PIMS_BE.DTOs;

namespace PIMS_BE.Configurations;

/// <summary>
/// Centralize JWT Bearer event handlers (401, 403 responses).
/// Registered in Program.cs via options.Events = JwtBearerEventHandler.Create()
/// </summary>
public static class JwtBearerEventHandler
{
    public static JwtBearerEvents Create() => new()
    {
        // Read token from cookie if not present in Authorization header
        OnMessageReceived = context =>
        {
            if (string.IsNullOrEmpty(context.Token))
                context.Token = context.Request.Cookies["access_token"];

            return Task.CompletedTask;
        },

        // 401 — Not logged in / token missing or invalid
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode  = 401;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.Unauthorized(
                "Unauthorized: missing or invalid token");

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response, JsonOptions));
        },

        // 403 — Logged in but insufficient role/permissions
        OnForbidden = async context =>
        {
            context.Response.StatusCode  = 403;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.Forbidden(
                "Forbidden: you do not have permission to access this resource");

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response, JsonOptions));
        }
    };

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
}
