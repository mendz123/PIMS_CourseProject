# Services Layer

Thư mục này chứa business logic của ứng dụng.

## Cấu trúc đề xuất:
```
Services/
├── Interfaces/
│   ├── IUserService.cs
│   ├── IClassService.cs
│   ├── IGroupService.cs
│   ├── IProjectService.cs
│   ├── IAssessmentService.cs
│   └── IAuthService.cs
├── UserService.cs
├── ClassService.cs
├── GroupService.cs
├── ProjectService.cs
├── AssessmentService.cs
└── AuthService.cs
```

## Quy tắc:
- Mỗi entity có 1 interface và 1 implementation
- Interface đặt trong folder `Interfaces/`
- Services inject `PimsProjectContext` qua constructor
- Services return DTOs, không return Models trực tiếp
- Đăng ký services trong `Program.cs`:
  ```csharp
  builder.Services.AddScoped<IUserService, UserService>();
  ```
