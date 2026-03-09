# Controllers

Thư mục này chứa API Controllers.

## Cấu trúc đề xuất:
```
Controllers/
├── AuthController.cs       # POST /api/auth/login, /api/auth/register
├── UsersController.cs      # CRUD /api/users
├── ClassesController.cs    # CRUD /api/classes
├── GroupsController.cs     # CRUD /api/groups
├── ProjectsController.cs   # CRUD /api/projects
├── AssessmentsController.cs# CRUD /api/assessments
└── SemestersController.cs  # GET /api/semesters
```

## Quy tắc:
- Controller inject Services qua constructor
- Dùng `[ApiController]` và `[Route("api/[controller]")]`
- Response wrapper sử dụng `ApiResponse<T>`
- Thêm `[Authorize]` cho các endpoint cần authentication
- Xóa file `WeatherForecastController.cs` (demo code)
