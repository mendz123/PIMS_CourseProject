# Exceptions

Thư mục này chứa custom exceptions cho ứng dụng.

## Cấu trúc:
```
Exceptions/
├── AuthenticationException.cs  # Authentication-related errors
├── ValidationException.cs      # Input validation errors (future)
└── BusinessException.cs        # Business logic errors (future)
```

## Cách sử dụng:
```csharp
// Throw exception với error type cụ thể
throw new AuthenticationException(
    "User not found", 
    AuthErrorType.UserNotFound
);
```

## Xử lý trong Middleware:
Exceptions được xử lý bởi `ExceptionHandlingMiddleware` trong folder Middlewares.
