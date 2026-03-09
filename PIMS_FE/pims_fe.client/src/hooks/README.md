# Custom Hooks

Thư mục này chứa custom React hooks.

## Cấu trúc đề xuất:
```
hooks/
├── useAuth.ts          # Authentication state
├── useLocalStorage.ts  # localStorage wrapper
├── useFetch.ts         # Generic data fetching
└── useDebounce.ts      # Debounce input
```

## Ví dụ useAuth.ts:
```typescript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return { user, isAuthenticated, setUser };
};
```
