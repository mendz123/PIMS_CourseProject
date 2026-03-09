namespace PIMS_BE.Exceptions;

/// <summary>
/// Custom exception for authentication-related errors.
/// Used to provide specific error types for better error handling in controllers and middleware.
/// </summary>
public class AuthenticationException : Exception
{
    /// <summary>
    /// The type of authentication error that occurred
    /// </summary>
    public AuthErrorType ErrorType { get; }
    
    public AuthenticationException(string message, AuthErrorType errorType) : base(message)
    {
        ErrorType = errorType;
    }
}

/// <summary>
/// Enumeration of authentication error types.
/// Each type maps to a specific HTTP status code in the middleware.
/// </summary>
public enum AuthErrorType
{
    /// <summary>User not found - returns 404 Not Found</summary>
    UserNotFound,
    
    /// <summary>Invalid password - returns 401 Unauthorized</summary>
    InvalidPassword,
    
    /// <summary>Email not verified - returns 403 Forbidden</summary>
    EmailNotVerified,
    
    /// <summary>Account is banned - returns 403 Forbidden</summary>
    AccountBanned
}
