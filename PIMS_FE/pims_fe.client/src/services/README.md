# Services (API Calls)

Thư mục này chứa các API service functions.

## Cấu trúc đề xuất:
```
services/
├── api.ts              # Axios instance với base config
├── authService.ts      # login, register, logout
├── userService.ts      # getUsers, getUserById, etc.
├── classService.ts     # getClasses, createClass, etc.
├── groupService.ts     # getGroups, createGroup, etc.
└── projectService.ts   # getProjects, createProject, etc.
```

## Ví dụ api.ts:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5172/api',
});

// Interceptor để thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```
