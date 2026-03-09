# Middlewares

Thư mục này chứa custom middlewares.

## Cấu trúc đề xuất:
```
Middlewares/
├── ExceptionMiddleware.cs    # Global exception handling
└── JwtMiddleware.cs          # JWT token validation
```

## Sử dụng trong Program.cs:
```csharp
app.UseMiddleware<ExceptionMiddleware>();
```
