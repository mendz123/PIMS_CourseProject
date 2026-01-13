# DTOs (Data Transfer Objects)

Thư mục này chứa các DTO classes để transfer data giữa API và client.

## Cấu trúc đề xuất:
```
DTOs/
├── Auth/
│   └── AuthDtos.cs         # LoginRequestDto, LoginResponseDto, RegisterRequestDto
├── User/
│   └── UserDtos.cs         # UserDto, CreateUserDto, UpdateUserDto
├── Class/
│   └── ClassDtos.cs        # ClassDto, CreateClassDto, UpdateClassDto
├── Group/
│   └── GroupDtos.cs        # GroupDto, CreateGroupDto
├── Project/
│   └── ProjectDtos.cs      # ProjectDto, CreateProjectDto
├── Assessment/
│   └── AssessmentDtos.cs   # AssessmentDto, CreateAssessmentDto
└── ApiResponse.cs          # Base response wrapper
```

## Quy tắc:
- Mỗi entity có 1 folder riêng
- Mỗi folder chứa: `EntityDto`, `CreateEntityDto`, `UpdateEntityDto`
- Không expose trực tiếp Models ra API, luôn dùng DTOs
