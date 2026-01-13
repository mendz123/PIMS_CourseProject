# Types

Thư mục này chứa TypeScript type definitions.

## Cấu trúc đề xuất:
```
types/
├── auth.ts         # LoginRequest, LoginResponse, User
├── class.ts        # Class, CreateClass, UpdateClass
├── group.ts        # Group, GroupMember
├── project.ts      # Project, ProjectStatus
├── assessment.ts   # Assessment, AssessmentScore
└── api.ts          # ApiResponse<T>, PaginatedResponse<T>
```

## Ví dụ api.ts:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface User {
  userId: number;
  email: string;
  fullName?: string;
  roleName?: string;
}
```
