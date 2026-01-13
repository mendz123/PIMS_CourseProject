# Context

Thư mục này chứa React Context providers.

## Cấu trúc đề xuất:
```
context/
├── AuthContext.tsx     # User authentication state
└── ThemeContext.tsx    # Theme/Dark mode (optional)
```

## Sử dụng trong App.tsx:
```tsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>{/* routes */}</Router>
    </AuthProvider>
  );
}
```
